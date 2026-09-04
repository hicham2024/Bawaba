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

    // The archival scans are referenced by absolute URLs in the article HTML.
    // Copy the directory explicitly so Vite includes every original image.
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
