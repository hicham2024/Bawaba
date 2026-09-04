import { defineConfig } from "vite";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";

const copyStaticDocuments = {
  name: "copy-static-documents",
  async closeBundle() {
    await mkdir("dist/client/guerredesables/assets", { recursive: true });
    await cp("guerredesables/assets", "dist/client/guerredesables/assets", {
      recursive: true
    });

    await mkdir("dist/client/treaties", { recursive: true });
    await cp(
      "treaties/treaties-england-morocco-1755.pdf",
      "dist/client/treaties/treaties-england-morocco-1755.pdf"
    );

    await mkdir("dist/client/assets/cards", { recursive: true });
    await cp("assets/cards", "dist/client/assets/cards", { recursive: true });

    await mkdir("dist/client/morocco-iberian-diplomacy/images", {
      recursive: true
    });
    await cp(
      "morocco-iberian-diplomacy/images",
      "dist/client/morocco-iberian-diplomacy/images",
      { recursive: true }
    );

    const standalonePages = [
      "livres.html",
      "acheter.html",
      "contact.html",
      "merci.html",
      "admin-wero.html",
      "admin-bank-transfer.html",
      "admin-books.html"
    ];
    for (const page of standalonePages) {
      await cp(page, `dist/client/${page}`);
    }

    // Put the newest research article first in the homepage selections carousel.
    const homePath = "dist/client/index.html";
    let home = await readFile(homePath, "utf8");
    const newArticleCard = `
      <article class="item" data-era="modern contemporary" data-theme="borders diplomacy state colonial" data-type="document research reference" data-country="morocco spain">
        <a class="item-media" href="/ceuta-melilla/" aria-label="سبتة ومليلية: تاريخ الثغرين والنزاع السيادي">
          <img src="/assets/cards/ceuta-melilla.svg" alt="سبتة ومليلية: تاريخ الثغرين والنزاع السيادي" loading="eager">
        </a>
        <div class="meta">
          <span class="badge badge-new"><span class="material-symbols-rounded" aria-hidden="true">new_releases</span>الجديد</span>
          <span class="badge">بحث وثائقي</span>
          <span class="badge era">1415–اليوم</span>
        </div>
        <h3>سبتة ومليلية: تاريخ الثغرين والنزاع السيادي</h3>
        <p class="desc">دراسة موثقة في الاحتلال الإيبيري والحصارات المغربية والوضع الإداري الاستثنائي والمعاهدات والمطالبة المغربية المعاصرة.</p>
        <time class="pub-date" datetime="2026-09-04">نُشر في 4 شتنبر 2026</time>
        <a class="read" href="/ceuta-melilla/">قراءة البحث ←</a>
      </article>`;

    if (!home.includes('/ceuta-melilla/')) {
      home = home.replace(/(<section class="gallery"[^>]*>)/, `$1${newArticleCard}`);
      home = home.replace(/(<div class="gallery"[^>]*>)/, `$1${newArticleCard}`);
    }
    home = home.replace(/>10 ملفات</g, ">11 ملفات<");
    await writeFile(homePath, home, "utf8");

    // Ceuta/Melilla presentation layer.
    const ceutaPath = "dist/client/ceuta-melilla/index.html";
    let ceuta = await readFile(ceutaPath, "utf8");

    // Official Ciudad Autónoma de Ceuta image for the main hero.
    ceuta = ceuta.replace(
      /\.cover\{min-height:92vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:70px 24px;color:#fff;background:linear-gradient\(145deg,#123b42,#24565e 62%,#b4863f\)\}/,
      `.cover{min-height:92vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:70px 24px;color:#fff;background:linear-gradient(rgba(7,28,31,.70),rgba(11,39,43,.78)),url("https://www.ceuta.es/ceuta/images/servicios/museos/imagenes/paginas/murallas.jpg") center/cover no-repeat;position:relative}`
    );

    // Turn the full-screen chapter separators into compact inline chapter headings.
    ceuta = ceuta.replace(
      /<section class="cc"><b>(الفصل\s+\d+)<\/b><h1>([\s\S]*?)<\/h1><p>([\s\S]*?)<\/p><\/section><section class="chapter" id="(c\d+)">/g,
      `<section class="chapter" id="$4"><header class="chapter-inline"><span class="chapter-number">$1</span><h2>$2</h2><p class="chapter-sub">$3</p></header>`
    );

    // Stable anchors for fast navigation.
    ceuta = ceuta.replace('<section class="front"><h1>مقدمة</h1>', '<section class="front" id="intro"><h1>مقدمة</h1>');
    ceuta = ceuta.replace('<section class="front"><h1>المحتويات</h1>', '<section class="front" id="contents"><h1>المحتويات</h1>');
    ceuta = ceuta.replace('<section class="front"><h1>الخط الزمني</h1>', '<section class="front" id="timeline"><h1>الخط الزمني</h1>');
    ceuta = ceuta.replace('<section class="refs"><h1>المصادر والمراجع</h1>', '<section class="refs" id="sources"><h1>المصادر والمراجع</h1>');

    const quickNav = `<aside class="quick-nav" aria-label="التنقل السريع"><div class="quick-nav-title">التنقل السريع</div><a href="#intro">المقدمة</a><a href="#contents">المحتويات</a><a href="#c1"><span>1</span> من الأندلس إلى الساحل المغربي</a><a href="#c2"><span>2</span> سبتة قبل 1415</a><a href="#c3"><span>3</span> حصارا 1418 و1419</a><a href="#c4"><span>4</span> مليلية 1497</a><a href="#c5"><span>5</span> حصار المولى إسماعيل</a><a href="#c6"><span>6</span> حصار مليلية 1774</a><a href="#c7"><span>7</span> Presidios وPlazas</a><a href="#c8"><span>8</span> جواز السفر والإدارة</a><a href="#c9"><span>9</span> حدود مليلية والمعاهدات</a><a href="#c10"><span>10</span> الحماية وحرب الريف</a><a href="#c11"><span>11</span> الأمم المتحدة</a><a href="#c12"><span>12</span> جبل طارق</a><a href="#timeline">الخط الزمني</a><a href="#sources">المصادر</a></aside>`;
    if (!ceuta.includes('class="quick-nav"')) {
      ceuta = ceuta.replace('</header>', `</header>${quickNav}`);
    }

    const quickNavCss = `
.quick-nav{position:fixed;left:18px;top:82px;width:248px;max-height:calc(100vh - 102px);overflow:auto;z-index:16;background:rgba(255,253,248,.97);border:1px solid var(--line);border-radius:16px;padding:14px;box-shadow:0 12px 34px rgba(19,50,56,.13);direction:rtl;text-align:right;scrollbar-width:thin}.quick-nav-title{font-weight:800;color:var(--g);padding:4px 7px 10px;border-bottom:2px solid var(--gold);margin-bottom:7px}.quick-nav a{display:block;padding:7px 8px;border-radius:9px;font-size:.78rem;line-height:1.5;color:#3b4b4f}.quick-nav a:hover{background:#edf3f1;color:var(--g)}.quick-nav a span{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#e4ecea;color:var(--g);font-size:.68rem;font-weight:800;margin-left:4px}.chapter-inline{padding:0 0 18px;margin:0 0 26px;border-bottom:1px solid var(--line)}.chapter-number{display:inline-block;color:#9b6b22;font-weight:800;font-size:.88rem;margin-bottom:5px}.chapter-inline h2{margin:0!important;color:var(--g)!important;font-size:clamp(1.8rem,4vw,2.65rem)!important;line-height:1.45}.chapter-sub{margin:7px 0 0;color:#697679;font-size:1rem}.chapter{scroll-margin-top:84px}.front,.refs{scroll-margin-top:84px}@media(min-width:1200px){.front,.chapter,.refs{margin-left:290px;margin-right:auto}}@media(max-width:1199px){.quick-nav{position:sticky;left:auto;top:57px;width:auto;max-height:none;margin:10px 14px 0;display:flex;gap:6px;overflow-x:auto;white-space:nowrap;padding:9px 10px;border-radius:12px}.quick-nav-title{display:none}.quick-nav a{display:inline-block;flex:0 0 auto;border:1px solid #e2e8e6}.quick-nav a span{display:none}}@media(max-width:720px){.quick-nav{top:54px;margin-inline:8px}.chapter-inline h2{font-size:1.8rem!important}.chapter{padding-top:34px}}`;
    ceuta = ceuta.replace('</style>', `${quickNavCss}</style>`);

    await writeFile(ceutaPath, ceuta, "utf8");
  }
};

export default defineConfig({
  build: {
    outDir: "dist/client",
    rollupOptions: {
      input: {
        main: "index.html",
        books: "livres.html",
        checkout: "acheter.html",
        contact: "contact.html",
        thanks: "merci.html",
        adminWero: "admin-wero.html",
        adminBankTransfer: "admin-bank-transfer.html",
        adminBooks: "admin-books.html",
        cadderdz: "cadderdz/index.html",
        degaulle: "degaulle/index.html",
        guerredesables: "guerredesables/index.html",
        ifniSahara: "ifni-sahara/index.html",
        treaties: "treaties/index.html",
        moroccoIberianDiplomacy: "morocco-iberian-diplomacy/index.html",
        ceutaMelilla: "ceuta-melilla/index.html",
        touat: "touat/index.html",
        algerieColoniale: "algerie-coloniale/index.html"
      }
    }
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"]
  },
  plugins: [copyStaticDocuments]
});
