import { getStore } from '@netlify/blobs';

const filenames={
  idrissides:{ar:'idrissides-marocains-ar.pdf',fr:'idrissides-marocains-fr.pdf',en:'moroccan-idrisids-en.pdf',es:'idrisies-marroquies-es.pdf',nl:'marokkaanse-idrisiden-nl.pdf',it:'idrisidi-marocchini-it.pdf'},
  almoravides:{ar:'almoravides-marocains-ar.pdf',fr:'almoravides-marocains-fr.pdf',en:'moroccan-almoravids-en.pdf',es:'almoravides-marroquies-es.pdf',nl:'marokkaanse-almoraviden-nl.pdf',it:'almoravidi-marocchini-it.pdf'},
  almohades:{ar:'almohades-marocains-ar.pdf',fr:'almohades-marocains-fr.pdf',en:'moroccan-almohads-en.pdf',es:'almohades-marroquies-es.pdf',nl:'marokkaanse-almohaden-nl.pdf',it:'almohadi-marocchini-it.pdf'}
};

export default async (req)=>{
  try{
    const url=new URL(req.url); const token=url.searchParams.get('token');
    if(!token) return new Response('Lien invalide',{status:400});
    const entitlements=getStore('ebook-entitlements');
    const e=await entitlements.get(token,{type:'json'});
    if(!e) return new Response('Lien introuvable ou déjà expiré',{status:404});
    if(Date.now()>e.expiresAt) return new Response('Ce lien de téléchargement a expiré',{status:410});
    if(e.downloads>=e.maxDownloads) return new Response('La limite de téléchargements est atteinte',{status:410});
    const key=`${e.book}/${e.lang}.pdf`;
    const books=getStore('ebooks-private');
    const pdf=await books.get(key,{type:'arrayBuffer'});
    if(!pdf) return new Response('Le livre n’est pas encore disponible',{status:503});
    await entitlements.setJSON(token,{...e,downloads:e.downloads+1});
    const filename=filenames[e.book]?.[e.lang]||'bawaba-book.pdf';
    return new Response(pdf,{status:200,headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${filename}"`,'Cache-Control':'private, no-store'}});
  }catch(e){return new Response('Erreur de téléchargement',{status:500});}
};
