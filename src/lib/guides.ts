export type GuideCategory = 'internet' | 'learning' | 'living' | 'travel';
export interface Guide {
  slug: string;
  category: GuideCategory;
  title: string;
  description: string;
  lead: string;
  updatedAt: string;
  summary: string[];
  decisions: { situation: string; answer: string; reason: string }[];
  sections: {
    id: string; title: string; paragraphs: string[]; bullets?: string[];
    table?: { headers: string[]; rows: string[][] }; note?: string;
  }[];
  faqs: { q: string; a: string }[];
  sources: { label: string; url: string }[];
  relatedProviderIds: string[];
  relatedSlugs: string[];
  /** 見出し用のイラスト（public/images/guides/ の名前。-640.webp の縮小版も置く）。なければ図で代わりに表示 */
  image?: string;
  /** false にすると、記事の上の「dポイント還元の条件」の欄を出さない */
  showPoints?: boolean;
  imageAlt?: string;
}

const modules = import.meta.glob<Guide[]>('../data/guides-*.json', { eager: true, import: 'default' });
export const guides: Guide[] = Object.values(modules).flat();
export const categoryLabel: Record<GuideCategory, string> = {
  internet: '通信・ネット', learning: '学び・スキル', living: '暮らし・家電', travel: '旅行・レンタル',
};
export const guideBySlug = (slug: string) => guides.find((guide) => guide.slug === slug);
export const readingMinutes = (guide: Guide) => Math.max(3, Math.ceil(JSON.stringify(guide).length / 650));
