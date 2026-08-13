import { defineConfig } from "vite";
import { cp, mkdir } from "node:fs/promises";

const copyGuerreArchives = {
  name: "copy-guerre-archives",
  async closeBundle() {
    await mkdir("dist/client/guerredesables/assets", { recursive: true });
    await cp("guerredesables/assets", "dist/client/guerredesables/assets", {
      recursive: true,
      filter: (source) => /archive-\d+\.jpg$|manifest\.json$|\/assets$/.test(source)
    });
  }
};

export default defineConfig({
  build: {
    outDir: "dist/client",
    rollupOptions: {
      input: {
        main: "index.html",
        cadderdz: "cadderdz/index.html",
        banihamad: "banihamad/index.html",
        degaulle: "degaulle/index.html",
        guerredesables: "guerredesables/index.html"
      }
    }
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"]
  },
  plugins: [copyGuerreArchives]
});
