import providersRaw from '../data/providers.json';
import areasRaw from '../data/areas.json';
import faqsRaw from '../data/faqs.json';

export type Building = 'house' | 'mansion';
export interface Price { monthly: number; label: string; note: string }
export interface Provider {
  id: string; published: boolean; name: string; company: string;
  kind: 'fiber' | 'router'; network: string; carriers: string[];
  order: { house: number; mansion: number };
  summary: string; house: Price | null; mansion: Price | null;
  speed: string; contract: string; initialCost: string; mobileSet: string[];
  area: string; goodFor: string[]; points: string[]; cautions: string[];
  affiliate: {
    href: string; label: string;
    banner: { href: string; src: string; width: number; height: number; pixel?: string | null } | null;
    pixel: string | null;
  } | null;
  officialUrl: string; sources: { label: string; url: string }[]; checkedAt: string;
}
export interface Area {
  slug: string; name: string; tenGiga: boolean; lead: string;
  sections: { title: string; body: string[] }[]; sourceNote: string;
}

export const providers = (providersRaw as Provider[]).filter((p) => p.published);
export const areas = areasRaw as Area[];
export const faqs = faqsRaw as { q: string; a: string }[];

export function ranked(building: Building, kind?: Provider['kind']) {
  return providers
    .filter((p) => p[building] && (!kind || p.kind === kind))
    .sort((a, b) => a.order[building] - b.order[building]);
}

export const carrierGuide = [
  { key: 'docomo', label: 'ドコモ', ids: ['docomo-hikari', 'home5g'] },
  { key: 'au', label: 'au・UQ mobile', ids: ['bbiq', 'biglobe-hikari'] },
  { key: 'softbank', label: 'ソフトバンク・ワイモバイル', ids: ['softbank-hikari', 'softbank-air'] },
  { key: 'other', label: '格安SIM・そのほか', ids: ['bbiq', 'flets-hikari'] },
];

export function byId(id: string) {
  return providers.find((p) => p.id === id);
}

export function jpDate(iso: string) {
  if (!iso) return '未確認';
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}年${m}月${d}日`;
}

/** いちばん新しい確認日 */
export const lastChecked = providers.map((p) => p.checkedAt).filter(Boolean).sort().at(-1) ?? '';

export function faqLd(list: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: list.map((f) => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbLd(site: string, items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.name, item: new URL(it.href, site).href,
    })),
  };
}
