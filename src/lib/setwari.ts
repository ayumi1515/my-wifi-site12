// セット割の計算に使うデータ（診断とトップページのキャリア別タブで共有）。
// 金額は src/data/household-plans.json（スマホのセット割）と household-homes.json（自宅回線の月額）から。
import planData from '../data/household-plans.json';
import homeData from '../data/household-homes.json';

export const today = new Date().toISOString().slice(0, 10);
export const brands = [
  { id: 'docomo', name: 'ドコモ' }, { id: 'au', name: 'au' }, { id: 'softbank', name: 'ソフトバンク' },
  { id: 'ymobile', name: 'ワイモバイル' }, { id: 'uq-mobile', name: 'UQ mobile' }, { id: 'rakuten-mobile', name: '楽天モバイル' },
  { id: 'ahamo', name: 'ahamo' }, { id: 'linemo', name: 'LINEMO' }, { id: 'povo', name: 'povo' }, { id: 'other', name: 'そのほか・わからない' },
];
export type Plan = { id: string; brandId: string; name: string; bundleIds: string[]; bundleDiscount: number; excludeFamilyWithBundle?: boolean; validThrough?: string; familyDiscount?: number[]; familyMode?: string };
export const plans = (planData.plans as Plan[]).filter((p) => !p.validThrough || p.validThrough >= today);
export const homes = homeData.homes as { id: string; name: string; kind: 'fiber' | 'router'; prefectures: string[] | null; buildings: string[]; monthly: Record<string, number | null>; decemberMonthly?: Record<string, number | null>; requiredBundleOptionMonthly?: number; contractMonths: number; url: string }[];
export const brandInfo = Object.fromEntries(brands.map((b) => {
  const own = plans.filter((p) => p.brandId === b.id && p.bundleDiscount > 0);
  // 家族割と一緒に使えないプラン（ワイモバイル・UQなど）は、その家族割の額も持っておき、差だけを「得」として見せる
  const byHome: Record<string, { min: number; max: number; plans: string[]; exclusive: boolean; family: number; familyAfterFirst: boolean }> = {};
  own.forEach((p) => p.bundleIds.forEach((h) => {
    const x = byHome[h] ?? { min: p.bundleDiscount, max: p.bundleDiscount, plans: [], exclusive: false, family: 0, familyAfterFirst: false };
    x.min = Math.min(x.min, p.bundleDiscount);
    if (p.bundleDiscount >= x.max) { x.max = p.bundleDiscount; x.exclusive = !!p.excludeFamilyWithBundle; x.family = p.excludeFamilyWithBundle ? Math.max(0, ...(p.familyDiscount ?? [0])) : 0; x.familyAfterFirst = p.familyMode === 'after-first'; }
    x.plans.push(p.name); byHome[h] = x;
  }));
  const zeroPlans = plans.filter((p) => p.brandId === b.id && p.bundleDiscount === 0).map((p) => p.name);
  return [b.id, { name: b.name, homes: byHome, zeroPlans, familyExclusive: own.some((p) => p.excludeFamilyWithBundle) }];
}));
export const homeList = homes.map((h) => ({ id: h.id, name: h.name, kind: h.kind, prefectures: h.prefectures, buildings: h.buildings, monthly: h.monthly, decemberMonthly: h.decemberMonthly ?? null, option: h.requiredBundleOptionMonthly ?? 0, contractMonths: h.contractMonths, url: h.url }));
