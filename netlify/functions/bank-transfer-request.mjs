import { getStore } from '@netlify/blobs';

const allowedBooks=new Set(['idrissides','almoravides','almohades','marinides']);
const allowedLangs=new Set(['ar','fr','en','es','nl','it']);
const emailRx=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const titles={
  ar:{idrissides:'الأدارسة المغاربة',almoravides:'المرابطون المغاربة',almohades:'الموحدون المغاربة',marinides:'المرينيون المغاربة'},
  fr:{idrissides:'Les Idrissides du Maroc',almoravides:'Les Almoravides marocains',almohades:'Les Almohades marocains',marinides:'Les Mérinides marocains'},
  en:{idrissides:'The Idrisids of Morocco',almoravides:'The Moroccan Almoravids',almohades:'The Moroccan Almohads',marinides:'The Moroccan Marinids'},
  es:{idrissides:'Los Idrisíes de Marruecos',almoravides:'Los Almorávides marroquíes',almohades:'Los Almohades marroquíes',marinides:'Los meriníes marroquíes'},
  nl:{idrissides:'De Idrisiden van Marokko',almoravides:'De Marokkaanse Almoraviden',almohades:'De Marokkaanse Almohaden',marinides:'De Marokkaanse Meriniden'},
  it:{idrissides:'Gli Idrisidi del Marocco',almoravides:'Gli Almoravidi marocchini',almohades:'Gli Almohadi marocchini',marinides:'I Merinidi marocchini'}
};

const messages={
  fr:{subject:'Instructions de virement',hello:'Bonjour,',intro:'Votre demande de paiement par virement a bien été enregistrée.',holder:'Titulaire',iban:'IBAN',amount:'Montant',reference:'Communication exacte',warning:'Recopiez impérativement cette communication dans votre virement.',delivery:'Après réception et validation du paiement, votre livre PDF vous sera envoyé automatiquement par e-mail.',thanks:'Merci pour votre achat.'},
  en:{subject:'Bank transfer instructions',hello:'Hello,',intro:'Your bank transfer payment request has been registered.',holder:'Account holder',iban:'IBAN',amount:'Amount',reference:'Exact transfer reference',warning:'You must copy this exact reference into your bank transfer.',delivery:'Once the payment is received and confirmed, your PDF book will be emailed to you automatically.',thanks:'Thank you for your purchase.'},
  ar:{subject:'تعليمات التحويل البنكي',hello:'مرحباً،',intro:'تم تسجيل طلب الدفع عبر التحويل البنكي.',holder:'صاحب الحساب',iban:'رقم IBAN',amount:'المبلغ',reference:'المرجع الواجب كتابته',warning:'يجب نسخ هذا المرجع كما هو في بيان التحويل.',delivery:'بعد وصول المبلغ وتأكيده، سيُرسل كتابك بصيغة PDF تلقائياً إلى بريدك الإلكتروني.',thanks:'شكراً لشرائك.'},
  es:{subject:'Instrucciones para la transferencia',hello:'Hola,',intro:'Tu solicitud de pago por transferencia ha sido registrada.',holder:'Titular',iban:'IBAN',amount:'Importe',reference:'Referencia exacta',warning:'Copia obligatoriamente esta referencia exacta en la transferencia.',delivery:'Cuando recibamos y confirmemos el pago, el libro PDF se enviará automáticamente por correo.',thanks:'Gracias por tu compra.'},
  nl:{subject:'Instructies voor bankoverschrijving',hello:'Hallo,',intro:'Uw aanvraag voor betaling via bankoverschrijving is geregistreerd.',holder:'Rekeninghouder',iban:'IBAN',amount:'Bedrag',reference:'Exacte mededeling',warning:'Neem deze mededeling exact over bij de overschrijving.',delivery:'Na ontvangst en bevestiging van de betaling wordt uw PDF-boek automatisch per e-mail verzonden.',thanks:'Bedankt voor uw aankoop.'},
  it:{subject:'Istruzioni per il bonifico',hello:'Buongiorno,',intro:'La richiesta di pagamento tramite bonifico è stata registrata.',holder:'Intestatario',iban:'IBAN',amount:'Importo',reference:'Causale esatta',warning:'Copia obbligatoriamente questa causale esatta nel bonifico.',delivery:'Dopo la ricezione e la conferma del pagamento, il libro PDF verrà inviato automaticamente via e-mail.',thanks:'Grazie per il tuo acquisto.'}
};

function config(){
  const iban=String(process.env.BANK_TRANSFER_IBAN||'BE13 3770 1431 7439').replace(/\s+/g,' ').trim();
  return {configured:Boolean(iban),accountName:'Ouled Sanhaja',iban,currency:'EUR',amount:'4.99'};
}

function paymentReference(){
  const date=new Date().toISOString().slice(0,10).replaceAll('-','');
  const suffix=crypto.randomUUID().replaceAll('-','').slice(0,6).toUpperCase();
  return `BAW-${date}-${suffix}`;
}

async function sendInstructions(order,bank){
  const apiKey=process.env.RESEND_API_KEY||'';
  const from=process.env.RESEND_FROM_EMAIL||'';
  if(!apiKey||!from) throw new Error('Resend n’est pas configuré.');
  const copy=messages[order.lang]||messages.fr;
  const bookTitle=titles[order.lang]?.[order.book]||order.book;
  const plain=[copy.hello,'',copy.intro,bookTitle,'',`${copy.holder}: ${bank.accountName}`,`${copy.iban}: ${bank.iban}`,`${copy.amount}: ${bank.amount} ${bank.currency}`,`${copy.reference}: ${order.reference}`,'',copy.warning,'',copy.delivery,'',copy.thanks,'Bawaba — bawaba.eu'].join('\n');
  const html=`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#15231d"><p>${copy.hello}</p><p>${copy.intro}</p><p><strong>${bookTitle}</strong></p><table role="presentation" style="border-collapse:collapse;width:100%;max-width:620px"><tr><td style="padding:7px;border-bottom:1px solid #dfd2bc"><strong>${copy.holder}</strong></td><td style="padding:7px;border-bottom:1px solid #dfd2bc">${bank.accountName}</td></tr><tr><td style="padding:7px;border-bottom:1px solid #dfd2bc"><strong>${copy.iban}</strong></td><td dir="ltr" style="padding:7px;border-bottom:1px solid #dfd2bc">${bank.iban}</td></tr><tr><td style="padding:7px;border-bottom:1px solid #dfd2bc"><strong>${copy.amount}</strong></td><td dir="ltr" style="padding:7px;border-bottom:1px solid #dfd2bc">${bank.amount} ${bank.currency}</td></tr><tr><td style="padding:7px"><strong>${copy.reference}</strong></td><td dir="ltr" style="padding:7px;font-family:monospace;font-weight:700">${order.reference}</td></tr></table><p style="padding:12px;background:#fff7dc;border:1px solid #e3c567;border-radius:8px"><strong>${copy.warning}</strong></p><p>${copy.delivery}</p><p>${copy.thanks}<br><strong>Bawaba</strong> — bawaba.eu</p></div>`;
  const response=await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':`bawaba-transfer-instructions-${order.id}`},
    body:JSON.stringify({from,to:[order.email],subject:`${copy.subject} — ${bookTitle}`,text:plain,html})
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.message||`Erreur Resend (${response.status})`);
  return data.id||null;
}

export default async (req)=>{
  const bank=config();
  if(req.method==='GET') return Response.json({configured:bank.configured,accountName:bank.accountName,currency:bank.currency,amount:bank.amount},{headers:{'Cache-Control':'no-store'}});
  if(req.method!=='POST') return new Response('Method not allowed',{status:405});
  if(!bank.configured) return Response.json({error:'Le paiement par virement n’est pas encore configuré.'},{status:503});
  try{
    const {book='almoravides',lang='fr',email}=await req.json();
    if(!allowedBooks.has(book)||!allowedLangs.has(lang)) return Response.json({error:'Livre ou langue invalide'},{status:400});
    const normalizedEmail=String(email||'').trim().toLowerCase();
    if(!emailRx.test(normalizedEmail)) return Response.json({error:'Adresse e-mail invalide'},{status:400});

    const bookKey=`${book}/${lang}.pdf`;
    const {blobs}=await getStore('ebooks-private').list({prefix:bookKey});
    if(!blobs.some(blob=>blob.key===bookKey)) return Response.json({error:'Ce PDF n’est pas encore disponible.'},{status:503});

    const id=crypto.randomUUID();
    const reference=paymentReference();
    let order={id,book,lang,email:normalizedEmail,reference,status:'pending',createdAt:Date.now(),amount:bank.amount,currency:bank.currency,confirmationEmailStatus:'sending'};
    const store=getStore('bank-transfer-orders');
    await store.setJSON(`order:${id}`,order);
    const index=(await store.get('index',{type:'json'}))||[];
    await store.setJSON('index',[id,...index.filter(value=>value!==id)].slice(0,500));
    let emailSent=false;
    try{
      const confirmationEmailID=await sendInstructions(order,bank);
      order={...order,confirmationEmailStatus:'sent',confirmationEmailSentAt:Date.now(),confirmationEmailID,confirmationEmailError:null};
      emailSent=true;
    }catch(emailError){
      console.error('bank-transfer-instructions-email',emailError);
      order={...order,confirmationEmailStatus:'failed',confirmationEmailError:String(emailError.message||emailError).slice(0,300)};
    }
    await store.setJSON(`order:${id}`,order);
    return Response.json({ok:true,id,status:'pending',reference,accountName:bank.accountName,iban:bank.iban,amount:bank.amount,currency:bank.currency,emailSent});
  }catch(error){
    console.error('bank-transfer-request',error);
    return Response.json({error:'Impossible d’enregistrer la demande de virement.'},{status:500});
  }
};
