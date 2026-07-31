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
  vite: {
    plugins: [tailwindcss()],
  },
});
