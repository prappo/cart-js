import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/cart-js/', // Replace with your repo name
  build: {
    outDir: 'demo',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
}); 