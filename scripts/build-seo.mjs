import {readFile,writeFile,access} from 'node:fs/promises';
import {enrichHtml,origin,text} from './seo-html.mjs';
const root='dist/client';
const proxy = new Set(['/mourabitoun/','/lalamaghnia/']);
let paths = [...(await readFile('public/sitemap.xml','utf8')).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]).pathname);
paths = paths.filter(p=>p!='/zellige-marocain/monazara/');
paths.push('/zellige-marocain/','/zellige-marocain/fr/','/zellige-marocain/en/','/zellige-marocain/es/','/maghreb-political-titles.html','/reponse-pirates-histoire-identite/','/ceuta-melilla/fr/','/ceuta-melilla/en/','/ceuta-melilla/es/');
for (const lang of ['ar','fr','en','es']) paths.push(`/opinions/sahara-2025-2026-analyse-${lang}/`);
paths.push('/opinions/sahara-2797-draft-2026/');
paths = [...new Set(paths)].sort();
const standalone = new Map([['/','/index.html'],['/contact','/contact.html']]);
export const outputPath = p => `${root}${standalone.get(p) || (p.endsWith('/') ? p+'index.html' : p)}`;
const summaries=[];
for (const path of paths) {
 if (proxy.has(path)) continue;
 const file=outputPath(path);
 await access(file);
 let html=await readFile(file,'utf8');
 const type = path==='/' ? 'CollectionPage' : path==='/about/' ? 'AboutPage' : path==='/contact' ? 'ContactPage' : path==='/livres.html'||path==='/opinions/' ? 'CollectionPage' : 'Article';
 html=enrichHtml(html,path,type);
 if (path==='/') {
  // Information-bearing catalogue pictures get the adjacent publication title.
  html=html.replace(/<article class="result-card"[\s\S]*?<\/article>/g,card=>{
   const title=text(card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/)?.[1]||'');
   return card.replace(/alt=""/,`alt="${title.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}"`);
  });
 }
 await writeFile(file,html);
 summaries.push([path,text(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'')]);
}
await writeFile(`${root}/sitemap.xml`,`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(p=>`  <url><loc>${origin}${p}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile(`${root}/llms.txt`,`# بوابة البحوث التاريخية — Bawaba\n\n> أبحاث ووثائق أرشيفية في تاريخ المغرب والمغرب الكبير، بالعربية والفرنسية والإنجليزية والإسبانية.\n\nتتضمن الصفحات مصادرها ومراجعها؛ راجع الوثائق الأصلية عند الاقتباس.\nThis file is an optional guide, not a search-indexing instruction.\n\n## Pages\n${summaries.map(([p,title])=>`- [${title}](${origin}${p})`).join('\n')}\n\n## Sitemap\n- ${origin}/sitemap.xml\n`);
console.log(`SEO metadata, structured data, social images and sitemap: ${paths.length} canonical publications.`);
