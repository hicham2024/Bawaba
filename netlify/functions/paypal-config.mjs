export default async ()=>{
  const clientId=process.env.PAYPAL_CLIENT_ID||'';
  const secret=process.env.PAYPAL_CLIENT_SECRET||'';
  const live=process.env.PAYPAL_ENV==='live';
  return Response.json({clientId:live?clientId:'',environment:'live',configured:Boolean(live&&clientId&&secret),bancontact:true});
};
