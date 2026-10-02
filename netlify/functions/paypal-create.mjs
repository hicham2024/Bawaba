import { getStore } from '@netlify/blobs';

import {PRODUCTS,validEdition,accessToken} from '../lib/payments.mjs';

export default async(req)=>{
  if(req.method!=='POST')return new Response('Method not allowed',{status:405});
  try{
    const {book='almoravides',lang}=await req.json();
    if(!validEdition(book,lang))return Response.json({error:'Invalid book selection'},{status:400});
    const product=PRODUCTS[book];
    if(!product.manualDelivery){const key=`${book}/${lang}.pdf`;const {blobs}=await getStore('ebooks-private').list({prefix:key});if(!blobs.some(blob=>blob.key===key))return Response.json({error:'This edition is not available yet'},{status:409})}
    const {api,token}=await accessToken();
    const base=(process.env.URL||new URL(req.url).origin).replace(/\/$/,'');
    const checkout=book==='almoravides-research'?'acheter-recherche.html':'acheter.html';
    const checkoutUrl=`${base}/${checkout}?book=${encodeURIComponent(book)}&lang=${encodeURIComponent(lang)}`;
    const requestID=crypto.randomUUID();
    const r=await fetch(`${api}/v2/checkout/orders`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','PayPal-Request-Id':requestID},body:JSON.stringify({intent:'CAPTURE',purchase_units:[{custom_id:`${book}:${lang}`,invoice_id:`BAW-${Date.now()}-${requestID.slice(0,8)}`,description:`Bawaba - ${product.title} (${lang})`,amount:{currency_code:product.currency,value:product.price}}],application_context:{shipping_preference:'NO_SHIPPING',return_url:`${checkoutUrl}&payment=approved`,cancel_url:`${checkoutUrl}&payment=cancelled`,user_action:'PAY_NOW'}})});
    const data=await r.json();if(!r.ok)return Response.json({error:'PayPal order creation failed'},{status:502});
    return Response.json({id:data.id,approveUrl:data.links?.find(link=>link.rel==='approve'||link.rel==='payer-action')?.href||null,amount:product.price,currency:product.currency,manualDelivery:product.manualDelivery});
  }catch(e){console.error(e);return Response.json({error:e.message},{status:500})}
};
