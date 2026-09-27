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
