// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// Cambiar por el dominio definitivo cuando esté comprado.
const SITE_URL = 'https://pablogranados.com';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  build: { format: 'file' },
  adapter: vercel(),
  integrations: [sitemap({ filter: (page) => !page.includes('/api/') })],
  vite: { plugins: [tailwindcss()] },
});
