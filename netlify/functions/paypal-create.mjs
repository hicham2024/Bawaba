const PAYPAL_API = process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

async function accessToken(){
  const id=process.env.PAYPAL_CLIENT_ID, secret=process.env.PAYPAL_CLIENT_SECRET;
  if(!id||!secret) throw new Error('PayPal is not configured');
  const auth=Buffer.from(`${id}:${secret}`).toString('base64');
  const r=await fetch(`${PAYPAL_API}/v1/oauth2/token`,{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});
  if(!r.ok) throw new Error('Unable to authenticate with PayPal');
  return (await r.json()).access_token;
}

export default async (req)=>{
  if(req.method!=='POST') return new Response('Method not allowed',{status:405});
  try{
    const {book='almoravides',lang}=await req.json();
    const allowed=['ar','fr','en','es','nl','it'];
    if(book!=='almoravides'||!allowed.includes(lang)) return Response.json({error:'Invalid book selection'},{status:400});
    const token=await accessToken();
    const r=await fetch(`${PAYPAL_API}/v2/checkout/orders`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','PayPal-Request-Id':crypto.randomUUID()},body:JSON.stringify({intent:'CAPTURE',purchase_units:[{custom_id:`${book}:${lang}`,description:`Bawaba PDF - ${book} (${lang})`,amount:{currency_code:'EUR',value:'5.00'}}],application_context:{shipping_preference:'NO_SHIPPING'}})});
    const data=await r.json();
    if(!r.ok) return Response.json({error:'PayPal order creation failed',details:data},{status:502});
    return Response.json({id:data.id});
  }catch(e){return Response.json({error:e.message},{status:500});}
};
