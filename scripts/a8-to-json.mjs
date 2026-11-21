// A8.net の広告タグを、providers.json の "affiliate" の形に直す道具
// 使い方：node scripts/a8-to-json.mjs '<a href="https://px.a8.net/...">...</a><img ...>'
const tag = process.argv.slice(2).join(' ');
if (!tag) { console.log("使い方: node scripts/a8-to-json.mjs '<A8のタグをそのまま貼る>'"); process.exit(1); }
const href = tag.match(/href="(https:\/\/px\.a8\.net\/svt\/ejp\?a8mat=[^"]+)"/)?.[1];
const imgs = [...tag.matchAll(/<img[^>]*>/g)].map((m) => m[0]);
const attr = (s, n) => s.match(new RegExp(`${n}="([^"]*)"`))?.[1];
const pixelTag = imgs.find((s) => attr(s, 'width') === '1');
const bannerTag = imgs.find((s) => attr(s, 'width') !== '1');
const pixel = pixelTag ? attr(pixelTag, 'src') : null;
const out = bannerTag
  ? { href, label: '〇〇の申込み窓口を見る', banner: { href, src: attr(bannerTag, 'src'), width: Number(attr(bannerTag, 'width')), height: Number(attr(bannerTag, 'height')), pixel }, pixel: null }
  : { href, label: '〇〇の申込み窓口を見る', banner: null, pixel };
console.log(JSON.stringify(out, null, 2));
