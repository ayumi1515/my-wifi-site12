// 商品マスタ（src/data/product-master.json）を読み、ページで使う形にする。
// 料金や広告リンクの数字は元データ（providers.json・offers.json）にだけあり、ここではそれを引くだけ。
// 元データを直せば、この部品を使う全部のページにまとめて反映される。
import master from '../data/product-master.json';
import { providers } from './data';
import { offers } from './offers';

export type ProductStatus = 'active';
export interface ProductEntry { id: string; name: string; kind: string; status: string; dataFrom?: string; setwari?: string; areaLine?: string }
export interface ResolvedProduct {
  id: string; name: string; kind: string; setwari?: string;
  officialUrl: string;
  affiliate: { href: string; label: string; pixel: string | null; banner?: unknown } | null;
  /** カードに出す短い事実（料金と確認日） */
  line: string;
}

const entries = master.products as ProductEntry[];

/** 掲載中の商品だけを返す。元データに見つからないもの・審査中のものは返さない（空きはページに出さない） */
export function resolveProduct(id: string): ResolvedProduct | null {
  const e = entries.find((x) => x.id === id && x.status === 'active');
  if (!e) return null;
  const p = providers.find((x) => x.id === id);
  if (p) {
    const house = p.house?.label;
    const mansion = (p as { mansion?: { label?: string } }).mansion?.label;
    const checked = (p as { checkedAt?: string }).checkedAt?.replace(/-/g, '/');
    const price = house ? `戸建て${house}${mansion && mansion !== house ? `・マンション${mansion}` : ''}／月` : '';
    return { id, name: p.name, kind: e.kind, setwari: e.setwari, officialUrl: p.officialUrl, affiliate: (p.affiliate as ResolvedProduct['affiliate']) ?? null, line: `${price}${checked ? `（${checked}確認・税込）` : ''}` };
  }
  const o = offers.find((x) => x.id === id);
  if (o) return { id, name: o.name, kind: e.kind, setwari: e.setwari, officialUrl: o.officialUrl, affiliate: o.affiliate ?? null, line: e.areaLine ?? '' };
  return null;
}

export const areaTiers = master.areaTiers;

export function resolveList(ids: string[]): ResolvedProduct[] {
  return ids.map(resolveProduct).filter((x): x is ResolvedProduct => x !== null);
}
