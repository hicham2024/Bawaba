import { getStore } from '@netlify/blobs';

const allowedBooks=new Set(['idrissides','almoravides','almohades','marinides']);
const allowedLangs=new Set(['ar','fr','en','es','nl','it']);
const emailRx=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function config(){
  const iban=String(process.env.BANK_TRANSFER_IBAN||'BE13 3770 1431 7439').replace(/\s+/g,' ').trim();
  return {configured:Boolean(iban),accountName:'Ouled Sanhaja',iban,currency:'EUR',amount:'4.99'};
}

function paymentReference(){
  const date=new Date().toISOString().slice(0,10).replaceAll('-','');
  const suffix=crypto.randomUUID().replaceAll('-','').slice(0,6).toUpperCase();
  return `BAW-${date}-${suffix}`;
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
    const order={id,book,lang,email:normalizedEmail,reference,status:'pending',createdAt:Date.now(),amount:bank.amount,currency:bank.currency};
    const store=getStore('bank-transfer-orders');
    await store.setJSON(`order:${id}`,order);
    const index=(await store.get('index',{type:'json'}))||[];
    await store.setJSON('index',[id,...index.filter(value=>value!==id)].slice(0,500));
    return Response.json({ok:true,id,status:'pending',reference,accountName:bank.accountName,iban:bank.iban,amount:bank.amount,currency:bank.currency});
  }catch(error){
    console.error('bank-transfer-request',error);
    return Response.json({error:'Impossible d’enregistrer la demande de virement.'},{status:500});
  }
};
