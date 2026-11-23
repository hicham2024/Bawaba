// Shared by the static build and middleware for the two historical proxies.
export const origin = 'https://bawaba.eu';
export const fallbackImage = `${origin}/images/bawaba-social.jpg`;
export function text(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}
const escape = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
export function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'))?.[2];
}
export function metadata(html, name) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0]).find(t => attribute(t,'name') === name || attribute(t,'property') === name);
}
export function normalizeOutline(html) {
  let first = true, section = false;
  // Skip scripts and styles: markup strings in application code must stay intact.
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<(h[1-6])\b([^>]*)>([\s\S]*?)<\/\1>/gi, (full, tag, attrs, content) => {
    if (!tag) return full;
    const old = Number(tag[1]);
    if (old === 1 && first) { first = false; return full; }
    if (old === 1) section = true;
    const level = old === 1 ? 2 : section ? Math.min(6,old+1) : old;
    if (level === old) return full;
    const originalClass = attribute(`<x ${attrs}>`, 'class');
    attrs = attrs.replace(/\s*class\s*=\s*(["'])[\s\S]*?\1/i,'');
    return `<h${level}${attrs} class="${escape(`${originalClass || ''} seo-original-h${old}`.trim())}">${content}</h${level}>`;
  });
}
export function enrichHtml(html, path, type = 'Article') {
  const url = new URL(path,origin).href;
  const title = text(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || 'بوابة البحوث التاريخية');
  const description = text(attribute(metadata(html,'description') || '', 'content') || title);
  const lang = html.match(/<html\b[^>]*\blang=["']([^"']+)/i)?.[1] || 'ar';
  const image = attribute(metadata(html,'og:image') || '', 'content') || fallbackImage;
  // Only edit the document head; preserve scripts and editorial body content.
  html = html.replace(/<head\b[^>]*>([\s\S]*?)<\/head>/i, (head, inner) => {
    inner = inner.replace(/<link\b[^>]*>/gi, tag => attribute(tag,'rel') === 'canonical' ? '' : tag);
    let tags = `\n<link rel="canonical" href="${escape(url)}">\n`;
    if (!metadata(inner,'robots')) tags += '<meta name="robots" content="index,follow,max-image-preview:large">\n';
    const metas = {'description':description,'og:type':type === 'Article' ? 'article' : 'website','og:site_name':'بوابة البحوث التاريخية','og:title':title,'og:description':description,'og:url':url,'og:image':image,'og:image:alt':title,'twitter:card':'summary_large_image','twitter:image':image};
    for (const [name,value] of Object.entries(metas)) {
      inner = inner.replace(/<meta\b[^>]*>/gi, tag => attribute(tag,'name') === name || attribute(tag,'property') === name ? '' : tag);
      tags += `<meta ${name.startsWith('og:') ? 'property' : 'name'}="${name}" content="${escape(value)}">\n`;
    }
    const node = {'@type':type,'@id':url+'#page',url,name:title,description,inLanguage:lang,isPartOf:{'@id':origin+'/#website'}};
    if (type === 'Article') Object.assign(node,{headline:title,image:[image],mainEntityOfPage:{'@type':'WebPage','@id':url}});
    const graph = {'@context':'https://schema.org','@graph':[{'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'بوابة البحوث التاريخية'},node]};
    // Do not invent authors, publication dates, review ratings or product offers.
    if (!/type=["']application\/ld\+json["']/i.test(inner)) tags += `<script type="application/ld+json">${JSON.stringify(graph).replace(/</g,'\\u003c')}</script>\n`;
    return `<head>${inner}${tags}</head>`;
  });
  if ((html.match(/<h1\b/gi)||[]).length > 1) {
    html = normalizeOutline(html);
    // Keep original heading styling while correcting semantic levels.
    html = html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi,(full,attrs,css) => `<style${attrs}>${css.replace(/\bh([1-6])\b(?=[^{}]*\{)/g,':is(h$1,.seo-original-h$1)')}</style>`);
  }
  return html;
}
