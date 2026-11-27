import raw from '../data/offers.json';
export interface Offer {
  id: string; name: string; officialUrl: string;
  affiliate: { href: string; label: string; pixel: string | null; bannerRequired?: boolean; banner: {href:string;src:string;width:number;height:number;pixel?:string|null} | null };
  note: string;
  bannerNote?: string;
  guideSlugs: string[];
}
export const offers = raw as Offer[];
