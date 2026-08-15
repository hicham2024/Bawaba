import { getStore } from '@netlify/blobs';

const UPLOAD_SECRET='-BZWg7V1Vd8yJZzey3SaOYXr_cp10OssAxqNMm_PdnI';
const allowed=new Set(['almoravides/ar.pdf','almoravides/fr.pdf','almoravides/en.pdf','almoravides/es.pdf','almoravides/nl.pdf','almoravides/it.pdf']);

export default async (req)=>{
  if(req.method!=='POST') return new Response('Method not allowed',{status:405});
  const url=new URL(req.url);
  if(url.searchParams.get('secret')!==UPLOAD_SECRET) return new Response('Forbidden',{status:403});
  const key=url.searchParams.get('key')||'';
  if(!allowed.has(key)) return new Response('Invalid key',{status:400});
  const type=req.headers.get('content-type')||'';
  if(!type.includes('application/pdf')) return new Response('PDF required',{status:415});
  const pdf=await req.arrayBuffer();
  if(pdf.byteLength<10000||pdf.byteLength>25*1024*1024) return new Response('Invalid PDF size',{status:400});
  const store=getStore('ebooks-private');
  await store.set(key,pdf,{metadata:{uploadedAt:Date.now(),contentType:'application/pdf'}});
  return Response.json({ok:true,key,size:pdf.byteLength});
};
