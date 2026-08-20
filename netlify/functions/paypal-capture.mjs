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
    const {orderID}=await req.json();
    if(!orderID) return Response.json({error:'Missing order ID'},{status:400});
    const token=await accessToken();
    const r=await fetch(`${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','PayPal-Request-Id':`capture-${orderID}`}});
    const data=await r.json();
    if(!r.ok) return Response.json({error:'Payment capture failed',details:data},{status:502});
    const pu=data.purchase_units?.[0];
    const capture=pu?.payments?.captures?.[0];
    const custom=pu?.custom_id||'';
    const [book,lang]=custom.split(':');
    if(data.status!=='COMPLETED'||capture?.status!=='COMPLETED'||capture?.amount?.currency_code!=='EUR'||capture?.amount?.value!=='5.00'||!ALLOWED_BOOKS.includes(book)||!ALLOWED_LANGS.includes(lang)){
      return Response.json({error:'Payment could not be verified'},{status:409});
    }
    const entitlements=getStore('ebook-entitlements');
    const entitlementToken=crypto.randomUUID()+crypto.randomUUID().replaceAll('-','');
    const expiresAt=Date.now()+7*24*60*60*1000;
    await entitlements.setJSON(entitlementToken,{book,lang,orderID,captureID:capture.id,expiresAt,downloads:0,maxDownloads:5});
    return Response.json({status:'COMPLETED',downloadUrl:`/api/download?token=${encodeURIComponent(entitlementToken)}`,expiresAt});
  }catch(e){return Response.json({error:e.message},{status:500});}
};
