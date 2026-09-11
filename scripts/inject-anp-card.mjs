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
    <p>قراءة في شهادة عبد الحميد الإبراهيمي حول نحو أربعين من الوافدين من الجيش الفرنسي ومسار ترقيتهم وصعودهم إلى وزارة الدفاع والقيادة العسكرية، مدعومة بشهادات جزائرية ووثائق بحثية.</p>
    <a href="/anp-armee-francaise/">قراءة الورقة البحثية ←</a>
  </div>
</section>`;

if (!home.includes('href="/about/"')) {
  home = home.replace('<nav class="nav">', '<nav class="nav"><a href="/about/">عن بوابة</a>');
}

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

await mkdir("dist/client/about", { recursive: true });
await cp("public/about", "dist/client/about", { recursive: true, force: true });

const articlePath = "dist/client/anp-armee-francaise/index.html";
let article = await readFile(articlePath, "utf8");

article = article.replace("ورقة بحثية — المؤسسة العسكرية الجزائرية • 1957–1992", "ورقة بحثية — المؤسسة العسكرية الجزائرية");
article = article.replace('<a href="#page44">ص.44</a>', '<a href="#page44">كلام عبد الحميد الإبراهيمي</a>');
article = article.replace("الصفحة 44: النص الذي يحدد موضوع الورقة", "كلام عبد الحميد الإبراهيمي: النص الذي يحدد موضوع الورقة");
article = article.replace("تتمحور حول الصفحة 44 من شهادة عبد الحميد الإبراهيمي", "تتمحور حول كلام عبد الحميد الإبراهيمي وشهادته");

const oldIntro = `<section class="sec" id="intro"><div class="sh"><span class="n">01</span><h2>مقدمة: ليس السؤال من حارب فرنسا فقط، بل من بنى جهاز الدولة بعد خروجها</h2></div><p class="lead">تقول الرواية الرسمية إن الجيش الوطني الشعبي «سليل جيش التحرير الوطني». غير أن هذه الصيغة، مهما كانت قوتها الرمزية، لا تجيب عن سؤال البنية: من امتلك الخبرة العسكرية الحديثة؟ من أعاد تنظيم جيش الحدود؟ من أنشأ المكاتب التقنية؟ ومن أمسك بعد 1962 بالأمانة العامة لوزارة الدفاع، ومديرية المستخدمين، والطيران، والنقل، والهندسة والمدرعات؟</p><p>هنا تكتسب شهادة عبد الحميد الإبراهيمي أهميتها. فهو لا يتحدث من خارج النظام، بل من رحم الثورة والدولة: مناضل في FLN، عسكري في جيش التحرير، ثم رجل دولة انتهى إلى رئاسة الحكومة بين 1984 و1988. ومن هذا الموقع، لا يكتفي بالقول إن بعض الجزائريين خدموا في الجيش الفرنسي، بل يطلب تتبع <strong>دور وترقية وصعود نحو أربعين شخصاً</strong> انتقلوا من الجيش الفرنسي إلى قيادة FLN في الخارج ثم إلى مواقع حاسمة داخل وزارة الدفاع.</p><div class="focus"><strong>فرضية الورقة:</strong> إذا كان جيش التحرير قد وفر الشرعية الوطنية، فإن تتبع النواة التي ركز عليها الإبراهيمي يطرح احتمال وجود سلالة مؤسساتية موازية: تكوين فرنسي → التحاق بالثورة من الخارج → شرعية جديدة → صعود تقني → سيطرة على مفاصل الجيش الجديد.</div></section>`;

const newIntro = `<section class="sec" id="intro"><div class="sh"><span class="n">01</span><h2>مقدمة</h2></div><p class="lead">تحاول الرواية الرسمية الجزائرية أن تكرّس في الوعي الداخلي صورة الجيش الوطني الشعبي باعتباره الامتداد المباشر لـ«جيش التحرير الوطني». غير أن العودة إلى الوثائق والمراجع والشهادات المتعلقة بمرحلة الاستقلال تكشف واقعاً أكثر تعقيداً.</p><p>فالسؤال الجوهري هو: من كان يمتلك فعلياً الخبرة العسكرية الحديثة؟ من ساهم في إعادة تنظيم جيش الحدود وفق أساليب الجيوش النظامية؟ من أنشأ وأدار المكاتب التقنية؟ ومن تولّى، بعد 1962، مواقع شديدة الحساسية داخل وزارة الدفاع، مثل الأمانة العامة، ومديرية المستخدمين، والطيران، والنقل، والهندسة والمدرعات؟</p><p>تشير شهادات ودراسات متعددة إلى الدور الكبير لضباط الجيش الفرنسي، الذين التحقوا لاحقاً بجيش التحرير أو بمؤسسات الدولة الناشئة. وتمكنوا من احتلال مواقع مركزية داخل المؤسسة العسكرية بعد الاستقلال وبالتالي السيطرة على الحكم.</p><p>وهنا تظهر المفارقة: فبينما جرى تقديم النظام الجديد باعتباره ثمرة مباشرة لثوار الداخل وجيش التحرير، شهدت مرحلة ما بعد الاستقلال إقصاءً واغتيال عدد من قادة الثورة التاريخيين، في مقابل صعود شبكة الضباط سليلي الجيش الفرنسي إلى مواقع النفوذ داخل الجيش والدولة.</p><p>ومن ثم، فإن دراسة تشكل المؤسسة العسكرية الجزائرية بعد 1962 لا يمكن اختزالها في عبارة «سليل جيش التحرير»، بل تستوجب أيضاً البحث في الدور الذي لعبه الضباط القادمون من الجيش الفرنسي في إعادة بناء الجيش النظامي، وفي إدارة مفاصل وزارة الدفاع، وفي تكوين البنية العسكرية والسياسية التي ستطبع النظام الجزائري لعقود لاحقة.</p></section>`;

article = article.replace(oldIntro, newIntro);
await writeFile(articlePath, article, "utf8");

console.log(`ANP featured block, About link and article text ensured. Homepage contains ${visibleCards} cards.`);
