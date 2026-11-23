import assert from 'node:assert/strict';
import { diagnoseConnectivity } from '../src/lib/connectivity-diagnosis.ts';
import providers from '../src/data/providers.json' with { type: 'json' };
import mobileServices from '../src/data/mobile-services.json' with { type: 'json' };

const base = {
  goal: 'both', prefecture: '13', building: 'house', construction: 'yes',
  carrier: 'other', stay: 'long', dataUse: 'small', support: 'either',
};
const diagnose = input => diagnoseConnectivity({ ...base, ...input });
const tests = [];
function test(name, run) { run(); tests.push(name); }

test('BBIQ is limited to the researched prefecture, for every carrier', () => {
  for (let n = 1; n <= 47; n++) {
    for (const carrier of ['docomo', 'ahamo', 'au', 'uq', 'softbank', 'ymobile', 'other']) {
      const result = diagnose({ prefecture: String(n).padStart(2, '0'), carrier });
      if (n !== 46) assert(!result.home.providerIds.includes('bbiq'));
    }
  }
  for (const carrier of ['au', 'uq']) assert(diagnose({ prefecture: '46', carrier }).home.providerIds.includes('bbiq'));
});

test('ahamo is not given a docomo bundle discount', () => {
  const ahamo = diagnose({ carrier: 'ahamo' }).home;
  assert.match(ahamo.reason, /ahamo.*セット割の対象として計算しません/);
  assert.notEqual(ahamo.reason, diagnose({ carrier: 'docomo' }).home.reason);
});

test('uncertain construction requires checking before product selection', () => {
  for (const stay of ['long', 'short']) {
    const result = diagnose({ construction: 'unknown', stay }).home;
    assert.equal(result.mode, 'check-first');
    assert.deepEqual(result.providerIds, []);
  }
});

test('short stays with construction available compare full-term costs first', () => {
  const result = diagnose({ construction: 'yes', stay: 'short', carrier: 'au', prefecture: '46' }).home;
  assert.equal(result.mode, 'short-stay');
  assert.deepEqual(result.providerIds, []);
  assert.match(result.reason, /工事費・端末代の残額/);
});

test('construction unavailable yields routers, even with a matching fiber bundle', () => {
  const result = diagnose({ construction: 'no', carrier: 'au', prefecture: '46', stay: 'short' }).home;
  assert.equal(result.mode, 'router');
  assert.deepEqual(new Set(result.providerIds), new Set(['home5g', 'softbank-air']));
  assert.match(result.reason, /解約時に残る端末代/);
});

test('home-only and mobile-only goals omit the unrelated result', () => {
  assert.equal(diagnose({ goal: 'home' }).mobile, null);
  assert.equal(diagnose({ goal: 'mobile' }).home, null);
  assert(diagnose({ goal: 'both' }).home && diagnose({ goal: 'both' }).mobile);
});

test('store support is a hard requirement, including conflicting pay-as-you-go answers', () => {
  for (const dataUse of ['small', 'large', 'flexible']) {
    const result = diagnose({ dataUse, support: 'shop' }).mobile;
    assert(result.ids.length > 0);
    for (const id of result.ids) assert(mobileServices.find(service => service.id === id).tags.includes('shop-support'));
    assert(!result.ids.includes('povo'));
  }
  const flexible = diagnose({ dataUse: 'flexible', support: 'shop' }).mobile;
  assert.match(flexible.reason, /都度データ購入型.*店舗.*候補がありません/);
  assert.match(flexible.reason, /都度購入の条件には一致しない/);
});

test('online pay-as-you-go preserves the requested payment model', () => {
  const result = diagnose({ dataUse: 'flexible', support: 'online' }).mobile;
  assert.deepEqual(result.ids, ['povo']);
  assert.match(result.reason, /有効期限/);
});

test('large-data results use the large-data plans and preserve store requirements', () => {
  const all = diagnose({ dataUse: 'large' }).mobile;
  assert.equal(all.ids.length, 3);
  for (const id of all.ids) assert(mobileServices.find(service => service.id === id).tags.includes('large-data'));
  assert.deepEqual(diagnose({ dataUse: 'large', support: 'shop' }).mobile.ids, ['uq-mobile']);
});

test('all possible result IDs resolve to live editorial data, without mutating input', () => {
  const providerIds = new Set(providers.filter(provider => provider.published).map(provider => provider.id));
  const mobileIds = new Set(mobileServices.map(service => service.id));
  for (const carrier of ['docomo', 'ahamo', 'au', 'uq', 'softbank', 'ymobile', 'other']) {
    for (const construction of ['yes', 'no', 'unknown']) {
      for (const dataUse of ['small', 'large', 'flexible']) {
        for (const support of ['shop', 'online', 'either']) {
          const input = Object.freeze({ ...base, carrier, construction, dataUse, support });
          const result = diagnoseConnectivity(input);
          for (const id of result.home.providerIds) assert(providerIds.has(id), `Unknown provider ${id}`);
          for (const id of result.mobile.ids) assert(mobileIds.has(id), `Unknown mobile ${id}`);
          assert.equal(new Set(result.mobile.ids).size, result.mobile.ids.length);
          assert(result.mobile.ids.length <= 3);
          assert.deepEqual(result, diagnoseConnectivity(input));
        }
      }
    }
  }
});

console.log(`診断の点検OK（${tests.length}項目：地域制限・対象プラン・工事・短期・店舗希望・データ整合）`);
