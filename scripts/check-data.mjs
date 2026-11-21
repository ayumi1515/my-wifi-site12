// データの点検：npm run check-data
// ・公開中の回線に「確認日」「出典」があるか
// ・確認日が90日より古くないか
// ・根拠のいる言葉（最安・No.1・業界一など）が入っていないか
// ・広告リンクが A8 の形か
import fs from 'node:fs';

const providers = JSON.parse(fs.readFileSync(new URL('../src/data/providers.json', import.meta.url)));
const areas = JSON.parse(fs.readFileSync(new URL('../src/data/areas.json', import.meta.url)));
const faqs = JSON.parse(fs.readFileSync(new URL('../src/data/faqs.json', import.meta.url)));
const NG = [/最安/, /No\.?\s*1/i, /ナンバーワン/, /業界一/, /日本一/, /九州一/, /圧倒的/, /絶対/, /満足度/, /★/];
const problems = [];
const warn = [];
const today = new Date();

for (const p of providers) {
  if (!p.published) continue;
  if (!p.checkedAt) problems.push(`${p.id}: 確認日（checkedAt）がありません`);
  else {
    const days = (today - new Date(p.checkedAt)) / 86400000;
    if (days > 90) warn.push(`${p.id}: 確認日が${Math.floor(days)}日前です。公式で確かめ直してください`);
  }
  if (!p.sources?.length) problems.push(`${p.id}: 出典（sources）がありません`);
  if (!p.house && !p.mansion) problems.push(`${p.id}: 料金がありません`);
  if (p.affiliate && !/^https:\/\/px\.a8\.net\/svt\/ejp\?a8mat=/.test(p.affiliate.href)) warn.push(`${p.id}: 広告リンクがA8の形ではありません（${p.affiliate.href}）`);
}
const texts = JSON.stringify({ providers: providers.filter((p) => p.published), areas, faqs });
for (const re of NG) {
  const m = texts.match(re);
  if (m) problems.push(`根拠のいる言葉「${m[0]}」が入っています。根拠がなければ消してください`);
}
warn.forEach((w) => console.log('⚠️ ', w));
problems.forEach((w) => console.log('❌ ', w));
if (problems.length) process.exit(1);
console.log(`✅ データの点検OK（公開中 ${providers.filter((p) => p.published).length} 件）`);
