import municipalitiesRaw from '../data/japan-municipalities.json';

export interface NationalMunicipality {
  code: string;
  name: string;
  kana?: string;
  kind?: string;
  aliases?: string[];
  parentRegionName?: string;
  countyName?: string;
  parentCityName?: string;
  parentCityCode?: string;
}

export interface NationalPrefecture {
  code: string;
  name: string;
  nttRegion: 'east' | 'west';
  municipalities: NationalMunicipality[];
}

interface AreaDataset {
  source: { label?: string; title?: string; url: string; checkedAt?: string; asOf?: string; notes?: string[] };
  prefectures: { code: string; name: string; municipalities: NationalMunicipality[] }[];
}

const dataset = municipalitiesRaw as AreaDataset;
const eastPrefectureCodes = new Set(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '19', '20']);

export const nationalAreaSource = dataset.source;
export const prefectures: NationalPrefecture[] = dataset.prefectures.map((p) => ({
  ...p,
  code: String(p.code).padStart(2, '0'),
  nttRegion: eastPrefectureCodes.has(String(p.code).padStart(2, '0')) ? 'east' : 'west',
  municipalities: p.municipalities.map((m) => ({ ...m, code: String(m.code).padStart(5, '0') })),
}));

export function getPrefecturePath(p: Pick<NationalPrefecture, 'code'>) {
  return `/hikari/area/${p.code}/`;
}

export function getMunicipalityPath(p: Pick<NationalPrefecture, 'code'>, m: Pick<NationalMunicipality, 'code'>) {
  return `${getPrefecturePath(p)}${m.code}/`;
}

const existingKagoshimaPages: Record<string, string> = {
  '46201': '/hikari/area/kagoshima-shi/',
  '46203': '/hikari/area/kanoya-shi/',
  '46215': '/hikari/area/satsumasendai-shi/',
  '46218': '/hikari/area/kirishima-shi/',
  '46225': '/hikari/area/aira-shi/',
};

export function getExistingMunicipalityPath(p: Pick<NationalPrefecture, 'code'>, m: Pick<NationalMunicipality, 'code'>) {
  return p.code === '46' ? existingKagoshimaPages[m.code] : undefined;
}

export function getMunicipalityPrimaryPath(p: Pick<NationalPrefecture, 'code'>, m: Pick<NationalMunicipality, 'code'>) {
  return getExistingMunicipalityPath(p, m) ?? getMunicipalityPath(p, m);
}

export const nttAreaChecks = {
  east: {
    name: 'NTT東日本',
    url: 'https://flets.com/app2/ftcao/prefselect/index/',
    region: '北海道・東北・関東・甲信越の17都道県が原則の営業区域です。',
  },
  west: {
    name: 'NTT西日本',
    url: 'https://flets-w.com/cart/',
    region: '北陸・東海・近畿・中国・四国・九州・沖縄の30府県が原則の営業区域です。',
  },
};

/** 公式ページへ案内するだけで、地域ごとの提供可否・特典を保証しない。 */
export const nationalServiceChecks = [
  { id: 'docomo-hikari', kind: 'fiber', name: 'ドコモ光', url: 'https://www.docomo.ne.jp/internet/hikari/', note: '公式ページの「エリア検索」から住所を確認します。1ギガと10ギガでは提供エリアが異なります。' },
  { id: 'softbank-hikari', kind: 'fiber', name: 'SoftBank 光', url: 'https://www.softbank.jp/support/faq/view/19009', note: '公式FAQの案内からNTT東西の住所検索へ進みます。希望する速度のエリアを確認してください。' },
  { id: 'biglobe-hikari', kind: 'fiber', name: 'ビッグローブ光', url: 'https://join.biglobe.ne.jp/ftth/hikari/area.html', note: '「提供エリアを確認する」から住所を検索。エリア内でも建物の設備などによって利用できない場合があります。' },
  { id: 'home5g', kind: 'router', name: 'home 5G', url: 'https://www.docomo.ne.jp/home_5g/flow/', note: '公式の案内からサービスエリアマップへ進み、利用機種と設置住所を確認します。室内の電波状況でも使い心地が変わります。' },
  { id: 'softbank-air', kind: 'router', name: 'SoftBank Air', url: 'https://www.softbank.jp/internet/air/area-list/', note: '住所別の最大通信速度情報です。掲載だけで申込み可否は確定しないため、設置住所で窓口に確認してください。' },
] as const;

export const nationalAreaReferenceSources = [
  { label: 'NTT東日本：光アクセスサービスの提供エリア検索', url: nttAreaChecks.east.url },
  { label: 'NTT西日本：サービス提供エリア確認', url: nttAreaChecks.west.url },
  { label: 'NTT西日本：営業エリアと一部地域の例外', url: 'https://www.ntt-west.co.jp/denwa/tetsuduki/westarea.html' },
  { label: 'ビッグローブ光：NTT東西のエリア案内・県境の例外', url: 'https://join.biglobe.ne.jp/ftth/hikari/area.html' },
];

export function getMunicipalitySearchText(p: NationalPrefecture, m: NationalMunicipality) {
  return [p.name, m.name, m.kana, m.countyName, m.parentRegionName, m.parentCityName, ...(m.aliases ?? [])].filter(Boolean).join(' ');
}

export function getMunicipalityKindLabel(m: NationalMunicipality) {
  if (m.kind === 'designated-ward') return '行政区';
  if (m.kind === 'designated-city') return '政令指定都市';
  if (m.name.endsWith('区')) return '特別区';
  if (m.name.endsWith('市')) return '市';
  if (m.name.endsWith('町')) return '町';
  if (m.name.endsWith('村')) return '村';
  return '市区町村';
}
