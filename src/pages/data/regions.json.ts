// 全国の市区町村の一覧（都道府県コードごと）。/hikari/ の市区町村検索が必要なときだけ読み込む。
import type { APIRoute } from 'astro';
import { prefectures, getMunicipalityPath, getMunicipalitySearchText } from '../../lib/national-areas';

export const GET: APIRoute = () => {
  const data = Object.fromEntries(
    prefectures.map((p) => [
      p.code,
      p.municipalities.map((m) => ({
        code: m.code, name: m.name, countyName: m.countyName, parentCityName: m.parentCityName,
        path: getMunicipalityPath(p, m), search: getMunicipalitySearchText(p, m),
      })),
    ]),
  );
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
