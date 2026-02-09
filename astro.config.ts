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
      minify: 'esbuild',
      cssMinify: 'esbuild',
      rollupOptions: {
        output: {
          compact: true,
          manualChunks: undefined,
        },
      },
    },
    esbuild: {
      minifyWhitespace: true,
      minifyIdentifiers: true,
      minifySyntax: true,
      drop: ['console', 'debugger'],
      legalComments: 'none',
    },
  },
});
