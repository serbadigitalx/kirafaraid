import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://www.kirafaraid.my';

// Pages that carry a carta image, keyed by pathname.
// Generate the files with: node scripts/generate-carta.mjs
const CARTA_IMAGES = {
  '/jadual-pembahagian-faraid/': {
    slug: 'carta-pembahagian-faraid',
    title: 'Carta Pembahagian Faraid',
  },
  '/faraid-suami-meninggal/': {
    slug: 'carta-pembahagian-faraid-suami-meninggal',
    title: 'Carta Pembahagian Faraid: Suami Meninggal',
  },
  '/faraid-isteri-meninggal/': {
    slug: 'carta-pembahagian-faraid-isteri-meninggal',
    title: 'Carta Pembahagian Faraid: Isteri Meninggal',
  },
};

export default defineConfig({
  site: SITE,
  integrations: [
    react(),
    sitemap({
      filter(page) {
        return !page.includes('/partner/');
      },
      serialize(item) {
        item.lastmod = new Date().toISOString();
        // Declare the carta images so they are eligible for Google Images.
        // These queries ("carta pembahagian faraid" and its scenario variants)
        // return an image pack above the organic results.
        const carta = CARTA_IMAGES[new URL(item.url).pathname];
        if (carta) {
          item.img = [{ url: `${SITE}/carta/${carta.slug}.png`, title: carta.title }];
        }
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
