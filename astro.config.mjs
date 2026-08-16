import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.kirafaraid.my',
  integrations: [
    react(),
    sitemap({
      filter(page) {
        return !page.includes('/partner/');
      },
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
  adapter: vercel(),
  output: 'static',
  // Canonicals and the sitemap both emit trailing slashes. Without this, Vercel
  // served /panduan-faraid and /panduan-faraid/ as separate 200s and Google
  // indexed both, splitting ranking signals across duplicate URLs.
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
});
