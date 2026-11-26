// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SITE } from './src/site.config.mjs';

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // 市区町村ごとのページ（/hikari/area/都道府県コード/市区町村コード/）は、地名以外の中身がほぼ同じため
      // 検索には出さない（noindex）。サイトマップからも外す。ページ自体は診断・エリア確認の入口として残す。
      filter: (page) => !/\/hikari\/area\/\d{2}\/\d{5}\/$/.test(page),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
