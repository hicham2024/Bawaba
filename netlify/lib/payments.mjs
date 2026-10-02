import { getStore } from '@netlify/blobs';
export const PRODUCTS = {
  'almoravides-research': { price:'9.99', currency:'EUR', manualDelivery:true, title:'المرابطون — من الصحراء المغربية إلى بناء إمبراطورية' },
  ...Object.fromEntries(['idrissides','almoravides','almohades','marinides'].map(id => [id,{price:'4.99',currency:'EUR',manualDelivery:false,title:`${id} — livre jeunesse`}]))
};
export const validEdition = (book,lang) => Object.hasOwn(PRODUCTS,book) && ['ar','fr','en','es','nl','it'].includes(lang) && (book !== 'almoravides-research' || lang === 'ar');
export async function accessToken() {
  const sandbox=process.env.PAYPAL_ENV==='sandbox';
  if(!sandbox && process.env.PAYPAL_ENV!=='live') throw new Error('PayPal is not enabled');
  const api=sandbox?'https://api-m.sandbox.paypal.com':'https://api-m.paypal.com';
  const id=sandbox?(process.env.PAYPAL_SANDBOX_CLIENT_ID||process.env.PAYPAL_CLIENT_ID):process.env.PAYPAL_CLIENT_ID;
  const secret=sandbox?(process.env.PAYPAL_SANDBOX_CLIENT_SECRET||process.env.PAYPAL_CLIENT_SECRET):process.env.PAYPAL_CLIENT_SECRET;
  if(!id||!secret) throw new Error('PayPal credentials are missing');
  const r=await fetch(`${api}/v1/oauth2/token`,{method:'POST',headers:{Authorization:`Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});
  if(!r.ok) throw new Error('Unable to authenticate with PayPal');
  return {api,token:(await r.json()).access_token};
}
export function verifyPayment(orderID,data) {
  const pu=data.purchase_units?.[0], captures=pu?.payments?.captures||[];
  const [book,lang,...extra]=(pu?.custom_id||'').split(':');
  if(data.id!==orderID||data.status!=='COMPLETED'||data.purchase_units.length!==1||captures.length!==1||extra.length||!validEdition(book,lang)) throw new Error('Payment could not be verified');
  const capture=captures[0],product=PRODUCTS[book];
  if(capture.status!=='COMPLETED'||!capture.id||capture.amount?.currency_code!==product.currency||capture.amount?.value!==product.price) throw new Error('Payment could not be verified');
  const payer=data.payer||{};
  return {orderID,captureID:capture.id,book,lang,productTitle:product.title,amount:product.price,currency:product.currency,paidAt:Date.parse(capture.create_time)||Date.now(),customerName:[payer.name?.given_name,payer.name?.surname].filter(Boolean).join(' '),customerEmail:payer.email_address||'',orderReference:pu.invoice_id||`BAW-${orderID}`,status:'COMPLETED'};
}
// Persistent outbox: a temporary mail outage must not lose a paid order.
export async function notifyPaidOrder(order, store=getStore) {
  const key=`paid:${order.captureID||order.orderReference}`;
  const outbox=store('payment-notifications',{consistency:'strong'});
  const previous=await outbox.get(key,{type:'json'});
  if(previous?.status==='sent') return 'sent';
  const entry={order,createdAt:previous?.createdAt||Date.now(),attempts:(previous?.attempts||0)+1,status:'pending'};
  await outbox.setJSON(key,entry);
  try {
    const apiKey=process.env.RESEND_API_KEY,from=process.env.RESEND_FROM_EMAIL;
    if(!apiKey||!from) throw new Error('Resend is not configured');
    const lines=[`Produit: ${order.productTitle}`,`Montant: ${order.amount} ${order.currency}`,`Date/heure: ${new Date(order.paidAt).toISOString()}`,`Client: ${order.customerName||'Non fourni'}`,`E-mail client: ${order.customerEmail||'Non fourni'}`,`Transaction: ${order.captureID||'Virement confirmé par administrateur'}`,`Commande: ${order.orderReference}`,`Langue: ${order.lang}`,`Livraison: ${PRODUCTS[order.book]?.manualDelivery?'PDF à envoyer personnellement':'numérique'}`];
    const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':`bawaba-${key}`},body:JSON.stringify({from,to:['oueledsanhaja@gmail.com'],subject:`Paiement confirmé — ${order.productTitle} — ${order.amount} ${order.currency}`,text:lines.join('\n')})});
    if(!r.ok) throw new Error(`Mail provider status ${r.status}`);
    const data=await r.json();
    await outbox.setJSON(key,{...entry,status:'sent',emailID:data.id,sentAt:Date.now()});
    return 'sent';
  } catch(error) {
    await outbox.setJSON(key,{...entry,status:'pending',lastError:String(error.message).slice(0,200)});
    console.error('Payment notification pending',order.orderReference);
    return 'pending';
  }
}
export function customerResult(result) {
  const {order,adminNotificationError,adminNotificationID,...safe}=result;
  return safe;
}
export async function issuePayment(orderID,data,store=getStore) {
  const resultStore=store('paypal-entitlements',{consistency:'strong'});
  const existing=await resultStore.get(orderID,{type:'json'});
  if(existing) {
    if(existing.order && existing.adminNotificationStatus!=='sent') {
      existing.adminNotificationStatus=await notifyPaidOrder(existing.order,store);
      await resultStore.setJSON(orderID,existing);
    }
    return customerResult(existing);
  }
  const order=verifyPayment(orderID,data),product=PRODUCTS[order.book];
  await store('paypal-orders').setJSON(`order:${orderID}`,order);
  let result={status:'COMPLETED',deliveryMode:product.manualDelivery?'manual':'automatic',book:order.book,lang:order.lang,orderReference:order.orderReference,order};
  if(!product.manualDelivery) {
    // Stable token across concurrent capture/status calls, bound to this verified payment.
    const { createHmac }=await import('node:crypto');
    const token=createHmac('sha256',process.env.PAYPAL_CLIENT_SECRET||process.env.PAYPAL_SANDBOX_CLIENT_SECRET).update(`ebook:${orderID}:${order.captureID}`).digest('hex');
    const expiresAt=order.paidAt+7*24*60*60*1000;
    const entitlements=store('ebook-entitlements',{consistency:'strong'});
    if(!await entitlements.get(token,{type:'json'})) await entitlements.setJSON(token,{book:order.book,lang:order.lang,orderID,captureID:order.captureID,expiresAt,downloads:0,maxDownloads:5});
    result={...result,downloadUrl:`/api/download?token=${token}`,readerUrl:`/api/download?token=${token}&mode=inline`,expiresAt};
  }
  // Save delivery before sending email so retries never recreate an entitlement.
  await resultStore.setJSON(orderID,result);
  result.adminNotificationStatus=await notifyPaidOrder(order,store);
  await resultStore.setJSON(orderID,result);
  return customerResult(result);
}
export async function resolvePayment(orderID,captureApproved=false) {
  const existing=await getStore('paypal-entitlements',{consistency:'strong'}).get(orderID,{type:'json'});
  if(existing) return issuePayment(orderID,null);
  const {api,token}=await accessToken();
  const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
  const url=`${api}/v2/checkout/orders/${encodeURIComponent(orderID)}`;
  let r=await fetch(url,{headers}),data=await r.json();
  if(!r.ok) throw new Error('Unable to verify PayPal order');
  if(data.status==='APPROVED' && captureApproved) {
    r=await fetch(`${url}/capture`,{method:'POST',headers:{...headers,'PayPal-Request-Id':`bawaba-capture-${orderID}`}});
    data=await r.json();
    if(!r.ok) { // A concurrent return/poll may already have captured this order.
      r=await fetch(url,{headers});data=await r.json();
      if(!r.ok||data.status!=='COMPLETED') throw new Error('Payment capture failed');
    }
  }
  return data.status==='COMPLETED'?issuePayment(orderID,data):{status:data.status};
}
