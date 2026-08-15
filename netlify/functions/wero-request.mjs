import { getStore } from '@netlify/blobs';

const allowedLangs=new Set(['ar','fr','en','es','nl','it']);
const emailRx=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async (req)=>{
  if(req.method!=='POST') return new Response('Method not allowed',{status:405});
  try{
    const {book='almoravides',lang,email,name='',reference=''}=await req.json();
    if(book!=='almoravides'||!allowedLangs.has(lang)) return Response.json({error:'Livre ou langue invalide'},{status:400});
    if(!emailRx.test(String(email||'').trim())) return Response.json({error:'Adresse e-mail invalide'},{status:400});
    const id=crypto.randomUUID();
    const request={id,book,lang,email:String(email).trim().toLowerCase(),name:String(name||'').trim().slice(0,120),reference:String(reference||'').trim().slice(0,160),status:'pending',createdAt:Date.now(),amount:'5.00',currency:'EUR'};
    const store=getStore('wero-requests');
    await store.setJSON(`request:${id}`,request);
    const index=(await store.get('index',{type:'json'}))||[];
    const next=[id,...index.filter(x=>x!==id)].slice(0,500);
    await store.setJSON('index',next);
    return Response.json({ok:true,id,status:'pending'});
  }catch(e){return Response.json({error:'Impossible d’enregistrer la demande'},{status:500});}
};
