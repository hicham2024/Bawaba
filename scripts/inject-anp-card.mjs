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

if (!home.includes('/anp-armee-francaise/')) {
  home = home.replace(/(<section class="gallery"[^>]*>)/, `$1${anpCard}`);
  home = home.replace(/(<div class="gallery"[^>]*>)/, `$1${anpCard}`);
}

const visibleCards = (home.match(/<article class="item"/g) || []).length;
home = home.replace(/(<span class="count" id="resultCount">)\d+ ملفات(<\/span>)/, `$1${visibleCards} ملفات$2`);
await writeFile(homePath, home, "utf8");

await mkdir("dist/client/anp-armee-francaise", { recursive: true });
await cp("public/anp-armee-francaise", "dist/client/anp-armee-francaise", { recursive: true, force: true });

console.log(`ANP article injected. Homepage now contains ${visibleCards} cards.`);
