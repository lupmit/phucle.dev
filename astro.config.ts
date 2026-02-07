import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
  site: 'https://phucle.dev',
  build: {
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  vite: {
    build: {
      cssMinify: 'lightningcss',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          pure_funcs: ['console.log', 'console.info'],
        },
      },
    },
  },
});
