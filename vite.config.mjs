import { cp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const copyStaticFiles = () => ({
  name: 'copy-static-files',
  async closeBundle() {
    const tasks = [
      cp(resolve(__dirname, 'robots.txt'), resolve(__dirname, 'dist/robots.txt')),
      cp(resolve(__dirname, 'sitemap.xml'), resolve(__dirname, 'dist/sitemap.xml')),
      cp(resolve(__dirname, 'images/checkmark.lottie'), resolve(__dirname, 'dist/images/checkmark.lottie')),
      cp(resolve(__dirname, 'lawn-mowing'), resolve(__dirname, 'dist/lawn-mowing'), { recursive: true })
    ];
    await Promise.all(tasks);
  }
});

export default defineConfig({
  plugins: [copyStaticFiles()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssMinify: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2,
        drop_console: true,
        drop_debugger: true
      },
      mangle: true
    },
    assetsInlineLimit: 8192,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        notFound: resolve(__dirname, '404.html')
      },
      output: {
        manualChunks(id) {
          if (id.includes('@tsparticles') || id.includes('tsparticles')) {
            return 'vendor-confetti';
          }
          if (id.includes('@lottiefiles') || id.includes('dotlottie')) {
            return 'vendor-lottie';
          }
          if (id.includes('alpinejs') || id.includes('@alpinejs')) {
            return 'vendor-alpine';
          }
          if (id.includes('lucide')) {
            return 'vendor-lucide';
          }
        }
      }
    }
  }
});
