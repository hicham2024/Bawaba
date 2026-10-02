import {resolvePayment} from '../lib/payments.mjs';
export default async req=>{
  if(req.method!=='GET') return new Response('Method not allowed',{status:405});
  const orderID=new URL(req.url).searchParams.get('orderID');
  if(!orderID||!/^[A-Z0-9]{8,40}$/i.test(orderID)) return Response.json({error:'Invalid order ID'},{status:400});
  try{return Response.json(await resolvePayment(orderID,true),{headers:{'Cache-Control':'no-store'}})}
  catch(e){console.error(e);return Response.json({error:'Unable to verify payment. Please retry.'},{status:502});}
};
