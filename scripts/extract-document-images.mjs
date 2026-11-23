import {createHash} from 'node:crypto';
import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
const root='dist/client', target=`${root}/assets/documents`;
await mkdir(target,{recursive:true});
let count=0,bytes=0;
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=`${dir}/${e.name}`;if(e.isDirectory())await walk(p);else if(e.name.endsWith('.html'))await processHtml(p)}}
async function processHtml(file){
 let html=await readFile(file,'utf8'), changed=false,seenImage=false;
 const writes=[];
 html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<img\b[^>]*>/gi,tag=>{
  if(!/^<img/i.test(tag))return tag;
  const first=!seenImage;seenImage=true;
  const image=tag.match(/\bsrc=(["'])data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=\s]+)\1/i);
  if(!image || image[3].length<16000)return tag;
  const data=Buffer.from(image[3],'base64');
  const name=createHash('sha256').update(data).digest('hex').slice(0,24)+'.'+(image[2]==='jpeg'?'jpg':image[2]);
  writes.push(writeFile(`${target}/${name}`,data));
  tag=tag.replace(image[0],`src="/assets/documents/${name}"`);
  if(!/\bloading=/.test(tag))tag=tag.replace(/>$/,` loading="${first?'eager':'lazy'}">`);
  if(!/\bdecoding=/.test(tag))tag=tag.replace(/>$/,' decoding="async">');
  if(image[2]==='png' && data.length>24){
   if(!/\bwidth=/.test(tag))tag=tag.replace(/>$/,` width="${data.readUInt32BE(16)}">`);
   if(!/\bheight=/.test(tag))tag=tag.replace(/>$/,` height="${data.readUInt32BE(20)}">`);
  }
  changed=true;count++;bytes+=image[3].length;return tag;
 });
 await Promise.all(writes);
 if(changed)await writeFile(file,html);
}
await walk(root);
console.log(`Externalized ${count} original document images (${Math.round(bytes/1024)} KB removed from HTML); source image bytes preserved.`);
