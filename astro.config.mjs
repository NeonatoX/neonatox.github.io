import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://neonatox.github.io',
  base: '/',
  integrations: [
    tailwind(),
    sitemap()
  ],
  i18n: {
    defaultLocale: 'es',
    locales: [
      { path: 'es', codes: ['es', 'es-ES'], label: 'Español' },
      { path: 'en', codes: ['en', 'en-US'], label: 'English' },
      { path: 'pt', codes: ['pt', 'pt-BR'], label: 'Português' }
    ],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    }
  }
});
