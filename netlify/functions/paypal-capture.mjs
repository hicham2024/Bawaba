import {resolvePayment} from '../lib/payments.mjs';
export default async req=>{
  if(req.method!=='POST') return new Response('Method not allowed',{status:405});
  try {
    const {orderID}=await req.json();
    if(typeof orderID!=='string'||!/^[A-Z0-9]{8,40}$/i.test(orderID)) return Response.json({error:'Invalid order ID'},{status:400});
    return Response.json(await resolvePayment(orderID,true),{headers:{'Cache-Control':'no-store'}});
  }catch(e){console.error(e);return Response.json({error:'Unable to confirm payment. Please retry.'},{status:502});}
};
