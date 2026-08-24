import { getStore } from '@netlify/blobs';

const filenames={
  idrissides:{ar:'idrissides-marocains-ar.pdf',fr:'idrissides-marocains-fr.pdf',en:'moroccan-idrisids-en.pdf',es:'idrisies-marroquies-es.pdf',nl:'marokkaanse-idrisiden-nl.pdf',it:'idrisidi-marocchini-it.pdf'},
  almoravides:{ar:'almoravides-marocains-ar.pdf',fr:'almoravides-marocains-fr.pdf',en:'moroccan-almoravids-en.pdf',es:'almoravides-marroquies-es.pdf',nl:'marokkaanse-almoraviden-nl.pdf',it:'almoravidi-marocchini-it.pdf'},
  almohades:{ar:'almohades-marocains-ar.pdf',fr:'almohades-marocains-fr.pdf',en:'moroccan-almohads-en.pdf',es:'almohades-marroquies-es.pdf',nl:'marokkaanse-almohaden-nl.pdf',it:'almohadi-marocchini-it.pdf'},
  marinides:{ar:'marinides-marocains-ar.pdf',fr:'marinides-marocains-fr.pdf',en:'moroccan-marinids-en.pdf',es:'merinies-marroquies-es.pdf',nl:'marokkaanse-meriniden-nl.pdf',it:'merinidi-marocchini-it.pdf'}
};

const titles={
  ar:{idrissides:'الأدارسة المغاربة',almoravides:'المرابطون المغاربة',almohades:'الموحدون المغاربة',marinides:'المرينيون المغاربة'},
  fr:{idrissides:'Les Idrissides du Maroc',almoravides:'Les Almoravides marocains',almohades:'Les Almohades marocains',marinides:'Les Mérinides marocains'},
  en:{idrissides:'The Idrisids of Morocco',almoravides:'The Moroccan Almoravids',almohades:'The Moroccan Almohads',marinides:'The Moroccan Marinids'},
  es:{idrissides:'Los Idrisíes de Marruecos',almoravides:'Los Almorávides marroquíes',almohades:'Los Almohades marroquíes',marinides:'Los meriníes marroquíes'},
  nl:{idrissides:'De Idrisiden van Marokko',almoravides:'De Marokkaanse Almoraviden',almohades:'De Marokkaanse Almohaden',marinides:'De Marokkaanse Meriniden'},
  it:{idrissides:'Gli Idrisidi del Marocco',almoravides:'Gli Almoravidi marocchini',almohades:'Gli Almohadi marocchini',marinides:'I Merinidi marocchini'}
};

const messages={
  fr:{subject:'Votre livre Bawaba',hello:'Bonjour,',paid:'Votre virement a été validé. Votre livre PDF est joint à cet e-mail.',backup:'Vous pouvez aussi utiliser ce lien privé pendant 7 jours (5 téléchargements maximum) :',thanks:'Merci pour votre achat.'},
  en:{subject:'Your Bawaba book',hello:'Hello,',paid:'Your bank transfer has been confirmed. Your PDF book is attached to this email.',backup:'You can also use this private link for 7 days (maximum 5 downloads):',thanks:'Thank you for your purchase.'},
  ar:{subject:'كتابك من بوابة',hello:'مرحباً،',paid:'تم تأكيد التحويل البنكي. ستجد كتابك بصيغة PDF مرفقاً بهذه الرسالة.',backup:'يمكنك أيضاً استعمال هذا الرابط الخاص خلال 7 أيام (بحد أقصى 5 تحميلات):',thanks:'شكراً لشرائك.'},
  es:{subject:'Tu libro de Bawaba',hello:'Hola,',paid:'Tu transferencia bancaria ha sido confirmada. El libro PDF está adjunto a este correo.',backup:'También puedes usar este enlace privado durante 7 días (máximo 5 descargas):',thanks:'Gracias por tu compra.'},
  nl:{subject:'Uw Bawaba-boek',hello:'Hallo,',paid:'Uw bankoverschrijving is bevestigd. Uw PDF-boek is als bijlage toegevoegd.',backup:'U kunt deze privékoppeling ook 7 dagen gebruiken (maximaal 5 downloads):',thanks:'Bedankt voor uw aankoop.'},
  it:{subject:'Il tuo libro Bawaba',hello:'Buongiorno,',paid:'Il bonifico bancario è stato confermato. Il libro PDF è allegato a questa e-mail.',backup:'Puoi anche usare questo link privato per 7 giorni (massimo 5 download):',thanks:'Grazie per il tuo acquisto.'}
};

function authorized(req){
  const key=req.headers.get('x-admin-key')||new URL(req.url).searchParams.get('key')||'';
  const expected=process.env.BANK_TRANSFER_ADMIN_KEY||process.env.WERO_ADMIN_KEY||'';
  return Boolean(expected)&&key===expected;
}

async function sendPdf(order,downloadUrl,pdf){
  const apiKey=process.env.RESEND_API_KEY||'';
  const from=process.env.RESEND_FROM_EMAIL||'';
  if(!apiKey||!from) throw new Error('Resend n’est pas configuré (RESEND_API_KEY / RESEND_FROM_EMAIL).');
  const copy=messages[order.lang]||messages.fr;
  const bookTitle=titles[order.lang]?.[order.book]||order.book;
  const plain=[copy.hello,'',copy.paid,bookTitle,'',copy.backup,downloadUrl,'',copy.thanks,'Bawaba — bawaba.eu'].join('\n');
  const html=`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#15231d"><p>${copy.hello}</p><p>${copy.paid}</p><p><strong>${bookTitle}</strong></p><p>${copy.backup}<br><a href="${downloadUrl}">${downloadUrl}</a></p><p>${copy.thanks}<br><strong>Bawaba</strong> — bawaba.eu</p></div>`;
  const response=await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':`bawaba-transfer-${order.id}`},
    body:JSON.stringify({from,to:[order.email],subject:`${copy.subject} — ${bookTitle}`,text:plain,html,attachments:[{filename:filenames[order.book]?.[order.lang]||'bawaba-book.pdf',content:Buffer.from(pdf).toString('base64')}]})
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.message||`Erreur Resend (${response.status})`);
  return data.id||null;
}

export default async (req)=>{
  if(!authorized(req)) return new Response('Forbidden',{status:403});
  const orders=getStore('bank-transfer-orders');
  try{
    if(req.method==='GET'){
      const ids=(await orders.get('index',{type:'json'}))||[];
      const items=[];
      for(const id of ids.slice(0,100)){
        const item=await orders.get(`order:${id}`,{type:'json'});
        if(item) items.push(item);
      }
      return Response.json({items});
    }
    if(req.method!=='POST') return new Response('Method not allowed',{status:405});
    const {id,action}=await req.json();
    if(!id||!['approve','reject'].includes(action)) return Response.json({error:'Requête invalide'},{status:400});
    const item=await orders.get(`order:${id}`,{type:'json'});
    if(!item) return Response.json({error:'Virement introuvable'},{status:404});
    if(action==='reject'){
      const updated={...item,status:'rejected',reviewedAt:Date.now()};
      await orders.setJSON(`order:${id}`,updated);
      return Response.json({ok:true,item:updated});
    }
    if(item.status==='sent') return Response.json({ok:true,item});

    const books=getStore('ebooks-private');
    const pdf=await books.get(`${item.book}/${item.lang}.pdf`,{type:'arrayBuffer'});
    if(!pdf) return Response.json({error:'Le PDF demandé est absent.'},{status:503});

    let token=item.downloadToken;
    let expiresAt=item.expiresAt;
    if(!token||!expiresAt||Date.now()>expiresAt){
      token=crypto.randomUUID()+crypto.randomUUID().replaceAll('-','');
      expiresAt=Date.now()+7*24*60*60*1000;
      await getStore('ebook-entitlements').setJSON(token,{book:item.book,lang:item.lang,bankTransferOrderID:id,expiresAt,downloads:0,maxDownloads:5});
    }
    const origin=new URL(req.url).origin;
    const downloadUrl=`${origin}/api/download?token=${encodeURIComponent(token)}`;
    const ready={...item,status:'sending',paidAt:item.paidAt||Date.now(),reviewedAt:Date.now(),downloadToken:token,expiresAt,downloadUrl,maxDownloads:5,emailError:null};
    await orders.setJSON(`order:${id}`,ready);
    try{
      const resendEmailID=await sendPdf(ready,downloadUrl,pdf);
      const sent={...ready,status:'sent',emailSentAt:Date.now(),resendEmailID};
      await orders.setJSON(`order:${id}`,sent);
      return Response.json({ok:true,item:sent});
    }catch(error){
      const failed={...ready,status:'email_failed',emailError:String(error.message||error).slice(0,300)};
      await orders.setJSON(`order:${id}`,failed);
      return Response.json({error:failed.emailError,item:failed},{status:502});
    }
  }catch(error){
    console.error('bank-transfer-admin',error);
    return Response.json({error:'Erreur serveur'},{status:500});
  }
};
