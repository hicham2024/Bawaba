import { getStore } from '@netlify/blobs';

const UPLOAD_SECRET=process.env.EBOOK_UPLOAD_SECRET||process.env.WERO_ADMIN_KEY||'';
const books=['idrissides','almoravides','almohades','marinides'];
const langs=['ar','fr','en','es','nl','it'];
const allowed=new Set(books.flatMap(book=>langs.map(lang=>`${book}/${lang}.pdf`)));
const MAX_PDF_SIZE=50*1024*1024;
const MAX_CHUNK_SIZE=3*1024*1024;

const json=(body,status=200)=>Response.json(body,{status});

export default async (req)=>{
  if(req.method!=='POST') return new Response('Method not allowed',{status:405});
  const url=new URL(req.url);
  if(!UPLOAD_SECRET||url.searchParams.get('secret')!==UPLOAD_SECRET) return new Response('Forbidden',{status:403});
  const key=url.searchParams.get('key')||'';
  if(!allowed.has(key)) return new Response('Invalid key',{status:400});
  const action=url.searchParams.get('action')||'direct';

  if(action==='chunk'){
    const uploadId=url.searchParams.get('uploadId')||'';
    const part=Number(url.searchParams.get('part'));
    const total=Number(url.searchParams.get('total'));
    if(!/^[a-zA-Z0-9-]{8,80}$/.test(uploadId)||!Number.isInteger(part)||!Number.isInteger(total)||part<0||part>=total||total>25) return new Response('Paramètres de segment invalides.',{status:400});
    const chunk=await req.arrayBuffer();
    if(!chunk.byteLength||chunk.byteLength>MAX_CHUNK_SIZE) return new Response('Segment trop volumineux.',{status:413});
    await getStore('ebook-upload-chunks').set(`${uploadId}/${part}`,chunk,{metadata:{key,total,part}});
    return json({ok:true,part,total});
  }

  if(action==='finalize'){
    const uploadId=url.searchParams.get('uploadId')||'';
    const total=Number(url.searchParams.get('total'));
    if(!/^[a-zA-Z0-9-]{8,80}$/.test(uploadId)||!Number.isInteger(total)||total<1||total>25) return new Response('Paramètres de finalisation invalides.',{status:400});
    const chunks=getStore('ebook-upload-chunks');
    const parts=[];let size=0;
    for(let part=0;part<total;part++){
      const chunk=await chunks.get(`${uploadId}/${part}`,{type:'arrayBuffer'});
      if(!chunk) return new Response(`Segment ${part+1}/${total} manquant.`,{status:409});
      size+=chunk.byteLength;
      if(size>MAX_PDF_SIZE) return new Response('Le PDF dépasse la limite de 50 Mo.',{status:413});
      parts.push(new Uint8Array(chunk));
    }
    const pdf=new Uint8Array(size);let offset=0;
    for(const part of parts){pdf.set(part,offset);offset+=part.byteLength}
    if(size<10000||new TextDecoder().decode(pdf.slice(0,5))!=='%PDF-') return new Response('Le fichier assemblé n’est pas un PDF valide.',{status:400});
    await getStore('ebooks-private').set(key,pdf,{metadata:{uploadedAt:Date.now(),contentType:'application/pdf'}});
    await Promise.all(Array.from({length:total},(_,part)=>chunks.delete(`${uploadId}/${part}`)));
    return json({ok:true,key,size});
  }

  return new Response('Utilisez le téléversement segmenté.',{status:400});
};
