import { defineConfig } from "vite";
import { cp, mkdir } from "node:fs/promises";

const copyStaticDocuments = {
  name: "copy-static-documents",
  async closeBundle() {
    await mkdir("dist/client/guerredesables/assets", { recursive: true });
    await cp("guerredesables/assets", "dist/client/guerredesables/assets", {
      recursive: true,
      filter: (source) => /archive-\d+\.jpg$|manifest\.json$|\/assets$/.test(source)
    });

    await mkdir("dist/client/treaties", { recursive: true });
    await cp(
      "treaties/treaties-england-morocco-1755.pdf",
      "dist/client/treaties/treaties-england-morocco-1755.pdf"
    );

    // Book pages are copied as standalone HTML after Vite's build. Because
    // their image URLs stay as /assets/cards/*.webp, copy the source card
    // directory verbatim into Netlify's publish directory as well. This makes
    // the covers deterministic and independent from Vite asset hashing.
    await mkdir("dist/client/assets/cards", { recursive: true });
    await cp("assets/cards", "dist/client/assets/cards", { recursive: true });

    const standalonePages = [
      "livres.html",
      "acheter.html",
      "contact.html",
      "merci.html",
      "admin-wero.html"
    ];
    for (const page of standalonePages) {
      await cp(page, `dist/client/${page}`);
    }

    await mkdir("dist/client/contact", { recursive: true });
    await cp("contact/index.html", "dist/client/contact/index.html");
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
        contact: "contact/index.html",
        thanks: "merci.html",
        adminWero: "admin-wero.html",
        cadderdz: "cadderdz/index.html",
        banihamad: "banihamad/index.html",
        degaulle: "degaulle/index.html",
        guerredesables: "guerredesables/index.html",
        ifniSahara: "ifni-sahara/index.html",
        treaties: "treaties/index.html",
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
