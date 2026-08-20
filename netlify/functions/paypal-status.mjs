import { getStore } from '@netlify/blobs';

const PAYPAL_API='https://api-m.paypal.com';
const ALLOWED_BOOKS=['idrissides','almoravides','almohades','marinides'];
const ALLOWED_LANGS=['ar','fr','en','es','nl','it'];

async function accessToken(){
  if(process.env.PAYPAL_ENV!=='live') throw new Error('Live PayPal is not enabled');
  const id=process.env.PAYPAL_CLIENT_ID,secret=process.env.PAYPAL_CLIENT_SECRET;
  if(!id||!secret) throw new Error('Live PayPal credentials are missing');
  const auth=Buffer.from(`${id}:${secret}`).toString('base64');
  const r=await fetch(`${PAYPAL_API}/v1/oauth2/token`,{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});
  if(!r.ok) throw new Error('Unable to authenticate with live PayPal');
  return (await r.json()).access_token;
}

async function issue(orderID,data){
  const issued=getStore('paypal-entitlements');
  const existing=await issued.get(orderID,{type:'json'});
  if(existing) return existing;
  const pu=data.purchase_units?.[0],capture=pu?.payments?.captures?.find(item=>item.status==='COMPLETED');
  const [book,lang]=(pu?.custom_id||'').split(':');
  if(data.status!=='COMPLETED'||capture?.amount?.currency_code!=='EUR'||capture?.amount?.value!=='4.99'||!ALLOWED_BOOKS.includes(book)||!ALLOWED_LANGS.includes(lang)) throw new Error('Payment could not be verified');
  const entitlementToken=crypto.randomUUID()+crypto.randomUUID().replaceAll('-','');
  const expiresAt=Date.now()+7*24*60*60*1000;
  await getStore('ebook-entitlements').setJSON(entitlementToken,{book,lang,orderID,captureID:capture.id,expiresAt,downloads:0,maxDownloads:5});
  const result={status:'COMPLETED',downloadUrl:`/api/download?token=${encodeURIComponent(entitlementToken)}`,expiresAt};
  await issued.setJSON(orderID,result);
  return result;
}

export default async (req)=>{
  if(req.method!=='GET') return new Response('Method not allowed',{status:405});
  try{
    const orderID=new URL(req.url).searchParams.get('orderID');
    if(!orderID) return Response.json({error:'Missing order ID'},{status:400});
    const issued=await getStore('paypal-entitlements').get(orderID,{type:'json'});
    if(issued) return Response.json(issued);
    const token=await accessToken();
    let r=await fetch(`${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(orderID)}`,{headers:{Authorization:`Bearer ${token}`}});
    let data=await r.json();
    if(!r.ok) return Response.json({error:'Unable to verify PayPal order'},{status:502});
    if(data.status==='APPROVED'){
      r=await fetch(`${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','PayPal-Request-Id':`qr-capture-${orderID}`}});
      data=await r.json();
      if(!r.ok) return Response.json({error:'Payment capture failed'},{status:502});
    }
    if(data.status==='COMPLETED') return Response.json(await issue(orderID,data));
    return Response.json({status:data.status});
  }catch(e){return Response.json({error:e.message},{status:500});}
};
