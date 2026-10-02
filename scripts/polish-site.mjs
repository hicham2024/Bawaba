import {readFile,writeFile,readdir} from 'node:fs/promises';
const root='dist/client';
const articles=['cadderdz','degaulle','guerredesables','ifni-sahara','treaties','touat','algerie-coloniale','algerie-ottomane','morocco-iberian-diplomacy','ceuta-melilla','anp-armee-francaise'];
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=`${dir}/${e.name}`;if(e.isDirectory())out.push(...await walk(p));else if(e.name.endsWith('.html'))out.push(p)}return out}
for(const folder of articles) for(const path of await walk(`${root}/${folder}`)){
 let html=await readFile(path,'utf8');
 const lang=html.match(/<html[^>]*lang="([a-z]+)"/)?.[1]||'ar';
 const text={ar:['الرئيسية','الأبحاث','المتجر'],fr:['Accueil','Recherches','Boutique'],en:['Home','Research','Store'],es:['Inicio','Investigaciones','Tienda']}[lang]||['Accueil','Recherches','Boutique'];
 const nav=`<nav class="bawaba-global-nav" aria-label="Bawaba"><a href="/?lang=${lang}">${text[0]}</a><a href="/?lang=${lang}#results">${text[1]}</a><a href="/livres.html?lang=${lang}">${text[2]}</a></nav>`;
 const css='<style>.bawaba-global-nav{position:sticky!important;top:0!important;z-index:999!important;display:flex!important;justify-content:center;gap:8px;background:#0b3b2e!important;color:#fff;border-bottom:3px solid #dba936;padding:5px 12px;min-height:50px}.bawaba-global-nav a{font:700 14px/1.6 Arial,sans-serif;color:#fff!important;text-decoration:none!important;padding:9px 15px;border-radius:6px}.bawaba-global-nav a:hover{background:#165845}.bawaba-global-nav a:focus-visible{outline:3px solid #dba936;outline-offset:0}html{scroll-padding-top:70px}.article-nav{top:50px!important}@media print{.bawaba-global-nav{display:none!important}}</style>';
 if(!html.includes('class="bawaba-global-nav"'))html=html.replace(/<body([^>]*)>/,`<body$1>${nav}`).replace('</head>',css+'</head>');
 if(path===`${root}/ceuta-melilla/index.html`){html=html.replace(nav,nav+'<div style="text-align:center;padding:12px;background:#fffdf8" aria-label="Languages"><a href="/ceuta-melilla/fr/" lang="fr">Français</a> · <a href="/ceuta-melilla/en/" lang="en">English</a> · <a href="/ceuta-melilla/es/" lang="es">Español</a></div>')}
 await writeFile(path,html);
}
console.log('Article navigation and translated Ceuta–Melilla editions published.');
