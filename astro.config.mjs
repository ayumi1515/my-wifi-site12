// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SITE } from './src/site.config.mjs';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  integrations: [sitemap({
    filter: (page) => !/\/hikari\/area\/\d{2}\/\d{5}\/$/.test(page),
  })],
  vite: { plugins: [tailwindcss()] },
});
