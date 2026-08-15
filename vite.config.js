import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist/client',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        livres: resolve(__dirname, 'livres.html'),
        acheter: resolve(__dirname, 'acheter.html'),
        adminWero: resolve(__dirname, 'admin-wero.html'),
        ifniSahara: resolve(__dirname, 'ifni-sahara.html')
      }
    }
  }
});
