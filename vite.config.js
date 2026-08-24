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
    // This is done after Vite builds index.html so the historical homepage source
    // stays intact while the published catalogue always exposes the newest item.
    const homePath = "dist/client/index.html";
    let home = await readFile(homePath, "utf8");
    const newArticleCard = `
      <article class="item" data-era="القرن 13-14" data-topic="دبلوماسية" data-type="وثائق" data-country="إسبانيا" data-new="true">
        <a class="item-media" href="/morocco-iberian-diplomacy/" aria-label="المغرب في الدبلوماسية الإيبيرية خلال القرنين الثالث عشر والرابع عشر">
          <img src="/assets/cards/marinids.webp" alt="المغرب في الدبلوماسية الإيبيرية خلال القرنين الثالث عشر والرابع عشر" loading="eager">
        </a>
        <div class="meta">
          <span class="badge" style="background:#d8a737;color:#15231d">جديد</span>
          <span class="badge">وثائق دبلوماسية</span>
          <span class="badge era">القرنان 13–14</span>
        </div>
        <h3>المغرب في الدبلوماسية الإيبيرية خلال القرنين الثالث عشر والرابع عشر</h3>
        <p class="desc">بحث أرشيفي موثق في المعاهدات والمراسلات والسفارات والحروب، مع جرد للوثائق المرتبطة بالمغرب في الأرشيفات الإسبانية.</p>
        <a class="read" href="/morocco-iberian-diplomacy/">قراءة البحث ←</a>
      </article>`;

    if (!home.includes('/morocco-iberian-diplomacy/')) {
      home = home.replace(/(<div class="gallery"[^>]*>)/, `$1${newArticleCard}`);
    }
    home = home.replace(/>9 ملفات</g, ">10 ملفات<");
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
