import { cp, mkdir, readFile, writeFile } from "node:fs/promises";

const homePath = "dist/client/index.html";
let home = await readFile(homePath, "utf8");

const anpCard = `
<article class="item" data-era="contemporary" data-theme="state colonial figures" data-type="research reference" data-country="algeria france">
  <a class="item-media" href="/anp-armee-francaise/" aria-label="الجيش الوطني الشعبي: سليل جيش التحرير أم سليل جيش فرنسا؟">
    <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Houari%20Boumedi%C3%A8ne%20-%20War%20of%20Independence.jpg" alt="الجيش الوطني الشعبي: سليل جيش التحرير أم سليل جيش فرنسا؟" loading="eager">
  </a>
  <div class="meta">
    <span class="badge badge-new"><span class="material-symbols-rounded" aria-hidden="true">new_releases</span>الجديد</span>
    <span class="badge">ورقة بحثية</span>
    <span class="badge era">1957–1992</span>
  </div>
  <h3>الجيش الوطني الشعبي: سليل جيش التحرير أم سليل جيش فرنسا؟</h3>
  <p class="desc">قراءة موسعة في شهادة عبد الحميد الإبراهيمي حول الوافدين من الجيش الفرنسي ومسار صعودهم إلى وزارة الدفاع والقيادة العسكرية.</p>
  <time class="pub-date" datetime="2026-09-11">نُشر في 11 شتنبر 2026</time>
  <a class="read" href="/anp-armee-francaise/">قراءة الورقة ←</a>
</article>`;

const featuredCss = `
<style id="anpFeaturedStyle">
.anp-featured{display:grid;grid-template-columns:minmax(240px,34%) 1fr;gap:24px;align-items:stretch;margin:0 0 26px;background:linear-gradient(135deg,#0d3a2e,#174b3d);color:#fff;border:2px solid #d8a737;border-radius:24px;overflow:hidden;box-shadow:0 16px 38px rgba(24,38,29,.16)}
.anp-featured-media{min-height:240px;background:#173b34;overflow:hidden}.anp-featured-media img{width:100%;height:100%;object-fit:cover;filter:grayscale(.2) contrast(1.04)}
.anp-featured-body{padding:28px 28px 26px}.anp-featured-kicker{display:inline-flex;background:#d8a737;color:#173126;padding:5px 10px;border-radius:999px;font-size:.68rem;font-weight:900;margin-bottom:12px}.anp-featured h2{margin:0 0 10px;font-size:clamp(1.35rem,2.4vw,2rem);line-height:1.6;color:#fff}.anp-featured p{margin:0 0 16px;color:#e6efe9;font-size:.82rem}.anp-featured a{display:inline-flex;text-decoration:none;background:#fff;color:#0d3a2e;padding:10px 16px;border-radius:10px;font-weight:900;font-size:.8rem}
@media(max-width:780px){.anp-featured{grid-template-columns:1fr}.anp-featured-media{min-height:190px}.anp-featured-body{padding:20px}}
</style>`;

const featuredMarkup = `
<section class="anp-featured" id="anpFeatured" aria-labelledby="anpFeaturedTitle">
  <a class="anp-featured-media" href="/anp-armee-francaise/" aria-label="فتح الورقة البحثية">
    <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Houari%20Boumedi%C3%A8ne%20-%20War%20of%20Independence.jpg" alt="هواري بومدين خلال حرب الاستقلال الجزائرية">
  </a>
  <div class="anp-featured-body">
    <span class="anp-featured-kicker">الجديد • ورقة بحثية</span>
    <h2 id="anpFeaturedTitle">الجيش الوطني الشعبي: سليل جيش التحرير أم سليل جيش فرنسا؟</h2>
    <p>قراءة في شهادة عبد الحميد الإبراهيمي، وخاصة الصفحة 44، حول نحو أربعين من الوافدين من الجيش الفرنسي ومسار ترقيتهم وصعودهم إلى وزارة الدفاع والقيادة العسكرية، مدعومة بشهادات جزائرية ووثائق بحثية.</p>
    <a href="/anp-armee-francaise/">قراءة الورقة البحثية ←</a>
  </div>
</section>`;

if (!home.includes('id="anpFeaturedStyle"')) {
  home = home.replace('</head>', `${featuredCss}</head>`);
}

if (!home.includes('id="anpFeatured"')) {
  home = home.replace('<div class="section-heading">', `${featuredMarkup}<div class="section-heading">`);
}

if (!home.includes('/anp-armee-francaise/')) {
  home = home.replace(/(<section class="gallery"[^>]*>)/, `$1${anpCard}`);
  home = home.replace(/(<div class="gallery"[^>]*>)/, `$1${anpCard}`);
}

const visibleCards = (home.match(/<article class="item"/g) || []).length;
home = home.replace(/(<span class="count" id="resultCount">)\d+ ملفات(<\/span>)/, `$1${visibleCards} ملفات$2`);
await writeFile(homePath, home, "utf8");

await mkdir("dist/client/anp-armee-francaise", { recursive: true });
await cp("public/anp-armee-francaise", "dist/client/anp-armee-francaise", { recursive: true, force: true });

console.log(`ANP featured block ensured. Homepage contains ${visibleCards} cards.`);
