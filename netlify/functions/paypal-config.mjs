export default async ()=>{
  const clientId=process.env.PAYPAL_CLIENT_ID||'';
  const environment=process.env.PAYPAL_ENV==='live'?'live':'sandbox';
  return Response.json({clientId,environment,configured:Boolean(clientId&&process.env.PAYPAL_CLIENT_SECRET)});
};
