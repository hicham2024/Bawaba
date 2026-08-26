import { getStore } from '@netlify/blobs';

const PAYPAL_API='https://api-m.paypal.com';
const ALLOWED_BOOKS=['idrissides','almoravides','almohades','marinides'];
const ALLOWED_LANGS=['ar','fr','en','es','nl','it'];

async function accessToken(){
  if(process.env.PAYPAL_ENV!=='live') throw new Error('Live PayPal is not enabled');
  const id=process.env.PAYPAL_CLIENT_ID, secret=process.env.PAYPAL_CLIENT_SECRET;
  if(!id||!secret) throw new Error('Live PayPal credentials are missing');
  const auth=Buffer.from(`${id}:${secret}`).toString('base64');
  const r=await fetch(`${PAYPAL_API}/v1/oauth2/token`,{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});
  if(!r.ok) throw new Error('Unable to authenticate with live PayPal');
  return (await r.json()).access_token;
}

export default async (req)=>{
  if(req.method!=='POST') return new Response('Method not allowed',{status:405});
  try{
    const {book='almoravides',lang}=await req.json();
    if(!ALLOWED_BOOKS.includes(book)||!ALLOWED_LANGS.includes(lang)) return Response.json({error:'Invalid book selection'},{status:400});
    const key=`${book}/${lang}.pdf`;
    const {blobs}=await getStore('ebooks-private').list({prefix:key});
    if(!blobs.some(blob=>blob.key===key)) return Response.json({error:'This edition is not available yet'},{status:409});
    const token=await accessToken();
    const base=(process.env.URL||new URL(req.url).origin).replace(/\/$/,'');
    const checkoutUrl=`${base}/acheter.html?book=${encodeURIComponent(book)}&lang=${encodeURIComponent(lang)}`;
    const returnUrl=`${checkoutUrl}&payment=approved`;
    const cancelUrl=`${checkoutUrl}&payment=cancelled`;
    const r=await fetch(`${PAYPAL_API}/v2/checkout/orders`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','PayPal-Request-Id':crypto.randomUUID()},body:JSON.stringify({intent:'CAPTURE',purchase_units:[{custom_id:`${book}:${lang}`,description:`Bawaba PDF - ${book} (${lang})`,amount:{currency_code:'EUR',value:'4.99'}}],application_context:{shipping_preference:'NO_SHIPPING',return_url:returnUrl,cancel_url:cancelUrl,user_action:'PAY_NOW'}})});
    const data=await r.json();
    if(!r.ok) return Response.json({error:'PayPal order creation failed',details:data},{status:502});
    return Response.json({id:data.id,approveUrl:data.links?.find(link=>link.rel==='approve'||link.rel==='payer-action')?.href||null});
  }catch(e){return Response.json({error:e.message},{status:500});}
};
