// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { SITE } from './src/site.config.mjs';
import { readFileSync } from 'node:fs';

// Googleの検索に実際に出た市区町村（ライバルが少ない地名）だけはサイトマップに入れる
const indexedCodes = new Set(JSON.parse(readFileSync(new URL('./src/data/indexed-municipalities.json', import.meta.url), 'utf8')).codes);

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // 市区町村ごとのページ（/hikari/area/都道府県コード/市区町村コード/）は、地名以外の中身がほぼ同じため
      // 検索には出さない（noindex）。サイトマップからも外す。ページ自体は診断・エリア確認の入口として残す。
      // ただし src/data/indexed-municipalities.json にある市区町村（Googleで表示された実績のある地名）は入れる。
      filter: (page) => { const m = page.match(/\/hikari\/area\/\d{2}\/(\d{5})\/$/); return !m || indexedCodes.has(m[1]); },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
