import raw from '../data/offers.json';
export interface Offer {
  id: string; name: string; officialUrl: string;
  affiliate: { href: string; label: string; pixel: string | null; banner: null };
  note: string;
  guideSlugs: string[];
}
export const offers = raw as Offer[];
