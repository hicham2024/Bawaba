import { getStore } from '@netlify/blobs';

function authorized(req){
  const key=req.headers.get('x-admin-key')||new URL(req.url).searchParams.get('key')||'';
  return Boolean(process.env.WERO_ADMIN_KEY)&&key===process.env.WERO_ADMIN_KEY;
}

export default async (req)=>{
  if(!authorized(req)) return new Response('Forbidden',{status:403});
  const requests=getStore('wero-requests');
  try{
    if(req.method==='GET'){
      const ids=(await requests.get('index',{type:'json'}))||[];
      const items=[];
      for(const id of ids.slice(0,100)){
        const item=await requests.get(`request:${id}`,{type:'json'});
        if(item) items.push(item);
      }
      return Response.json({items});
    }
    if(req.method==='POST'){
      const {id,action}=await req.json();
      if(!id||!['approve','reject'].includes(action)) return Response.json({error:'Requête invalide'},{status:400});
      const item=await requests.get(`request:${id}`,{type:'json'});
      if(!item) return Response.json({error:'Demande introuvable'},{status:404});
      if(action==='reject'){
        const updated={...item,status:'rejected',reviewedAt:Date.now()};
        await requests.setJSON(`request:${id}`,updated);
        return Response.json({ok:true,item:updated});
      }
      if(item.status==='approved'&&item.downloadUrl) return Response.json({ok:true,item});
      const entitlements=getStore('ebook-entitlements');
      const token=crypto.randomUUID()+crypto.randomUUID().replaceAll('-','');
      const expiresAt=Date.now()+7*24*60*60*1000;
      await entitlements.setJSON(token,{book:item.book,lang:item.lang,weroRequestID:id,expiresAt,downloads:0,maxDownloads:5});
      const origin=new URL(req.url).origin;
      const downloadUrl=`${origin}/api/download?token=${encodeURIComponent(token)}`;
      const updated={...item,status:'approved',reviewedAt:Date.now(),expiresAt,downloadUrl,maxDownloads:5};
      await requests.setJSON(`request:${id}`,updated);
      return Response.json({ok:true,item:updated});
    }
    return new Response('Method not allowed',{status:405});
  }catch(e){return Response.json({error:'Erreur serveur'},{status:500});}
};
