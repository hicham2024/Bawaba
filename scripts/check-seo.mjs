import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';

// Run after npm run build. Check the published output, including post-build copies.
const root = new URL('../dist/client/', import.meta.url);
const home = await readFile(new URL('index.html', root), 'utf8');
for (const [, attributes, code] of home.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
  if (!/\bsrc=|\btype=/i.test(attributes)) new Script(code);
}
const sitemap = await readFile(new URL('sitemap.xml', root), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(new Set(urls).size, urls.length, 'Sitemap URLs must be unique');
const cards = [...home.matchAll(/<article class="result-card"[^>]*>[\s\S]*?<\/article>/g)];
assert.ok(cards.length >= 13, 'The catalogue must exist before JavaScript runs');
for (const [card] of cards) {
  const href = card.match(/<a\b[^>]*href="([^"]+)"/)[1];
  assert.ok(urls.includes(new URL(href, 'https://bawaba.eu').href), `Missing catalogue URL: ${href}`);
  assert.match(card, /data-era="[^"]+"/);
  assert.match(card, /data-topic="[^"]+"/);
}
assert.equal((home.match(/<h1\b/g) || []).length, 1, 'Homepage must have one main heading');
assert.match(home, /\.result-card\[hidden\]\s*\{\s*display:\s*none\s*\}/, 'Filtered cards must stay hidden');

// These two publications are served by existing Netlify proxies, not local files.
const proxied = new Set(['/mourabitoun/', '/lalamaghnia/']);
for (const url of urls) {
  const parsed = new URL(url);
  assert.equal(parsed.origin, 'https://bawaba.eu');
  if (proxied.has(parsed.pathname)) continue;
  const path = parsed.pathname.endsWith('/') ? `${parsed.pathname}index.html`
    : parsed.pathname.endsWith('.html') ? parsed.pathname : `${parsed.pathname}.html`;
  const html = await readFile(new URL(path.slice(1), root), 'utf8');
  assert.ok(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html), `Noindex page in sitemap: ${url}`);
  const canonical = [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/g)];
  assert.equal(canonical.length, 1, `Expected one canonical: ${url}`);
  assert.equal(canonical[0][1], url, `Canonical differs from sitemap: ${url}`);
}
console.log(`SEO checks passed: ${cards.length} static cards, ${urls.length} sitemap URLs, matching local canonicals.`);

// Metadata must be present in the delivered HTML before any browser scripts run.
for (const url of urls) {
 const pathname=new URL(url).pathname;
 if(proxied.has(pathname)) continue;
 const path=pathname.endsWith('/')?`${pathname}index.html`:pathname.endsWith('.html')?pathname:`${pathname}.html`;
 const html=await readFile(new URL(path.slice(1),root),'utf8');
 const count=(html.match(/<h1\b/gi)||[]).length;
 assert.equal(count,1,`One H1 required: ${url}`);
 for(const name of ['description','og:title','og:description','og:url','og:image','twitter:card']) {
  const tag=[...html.matchAll(/<meta\b[^>]*>/gi)].find(([t])=>new RegExp(`(?:name|property)="${name}"`).test(t));
  assert.ok(tag && /content="[^"]+"/.test(tag[0]),`Missing ${name}: ${url}`);
 }
 const blocks=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
 assert.ok(blocks.length,`Missing structured data: ${url}`);
 for(const [,raw] of blocks){
  const data=JSON.parse(raw);assert.equal(data['@context'],'https://schema.org');
  assert.ok((data['@graph'] || [data]).some(n=>n.url===url || n.mainEntityOfPage===url || n.mainEntityOfPage?.['@id']===url),`Schema must describe canonical URL: ${url}`);
 }
 assert.ok(!/<img\b[^>]*src="data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]{16000}/i.test(html),`Large inline image: ${url}`);
}
assert.ok(!urls.some(u=>u.includes('/monazara/')),'Redirects must not be listed in sitemap');
const llms=await readFile(new URL('llms.txt',root),'utf8');
assert.ok(llms.includes('https://bawaba.eu/zellige-marocain/'));
const {enrichHtml,normalizeOutline}=await import('./seo-html.mjs');
const example='<html lang="en"><head><title>A &amp; B</title></head><body><h1>Title</h1><h1 id="chapter">Chapter</h1><h2>Detail</h2><script>const x="<h1>Do not alter</h1>";</script></body></html>';
const enriched=enrichHtml(example,'/example/');
assert.match(enriched,/<h2 id="chapter" class="seo-original-h1">Chapter<\/h2>/);
assert.match(enriched,/<h3 class="seo-original-h2">Detail<\/h3>/);
assert.ok(enriched.includes('const x="<h1>Do not alter</h1>";'),'Application markup strings must be preserved');
assert.equal(normalizeOutline(normalizeOutline(example)),normalizeOutline(example),'Outline transform must be idempotent');
console.log('Metadata, H1, schema, image extraction and proxy transformation checks passed.');
