// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// Cambiar por el dominio definitivo cuando esté comprado.
const SITE_URL = 'https://pablogranados.com.ar';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'never',
  build: { format: 'file' },
  adapter: vercel(),
  integrations: [sitemap({ filter: (page) => !page.includes('/api/') && !page.includes('/admin') && !page.includes('/gracias') && !page.includes('/agendar') })],
  vite: { plugins: [tailwindcss()] },
});
