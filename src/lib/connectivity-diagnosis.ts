import mobileServices from '../data/mobile-services.json' with { type: 'json' };

export interface DiagnosisInput {
  goal: 'home' | 'mobile' | 'both';
  prefecture: string;
  building: 'house' | 'mansion';
  construction: 'yes' | 'no' | 'unknown';
  carrier: 'docomo' | 'ahamo' | 'au' | 'uq' | 'softbank' | 'ymobile' | 'other';
  stay: 'long' | 'short';
  dataUse: 'small' | 'large' | 'flexible';
  support: 'shop' | 'online' | 'either';
}

export interface HomeDiagnosis {
  mode: 'fiber' | 'router' | 'short-stay' | 'check-first';
  providerIds: string[];
  title: string;
  reason: string;
}

export interface MobileDiagnosis {
  ids: string[];
  reason: string;
}

export interface ConnectivityDiagnosis {
  home: HomeDiagnosis | null;
  mobile: MobileDiagnosis | null;
}

function diagnoseHome(input: DiagnosisInput): HomeDiagnosis {
  const buildingCheck = input.building === 'mansion'
    ? '集合住宅は、管理会社に導入済み回線と部屋までの配線方式も確認してください。'
    : '戸建ては、回線の引込みと必要な工事を住所別に確認してください。';

  // Construction restrictions come before carrier discounts and price examples.
  if (input.construction === 'no') {
    return {
      mode: 'router',
      providerIds: ['home5g', 'softbank-air'],
      title: '工事なしのホームルーターを比べる',
      reason: '光回線の工事ができない条件なので、設置住所で申込み可否を確認できるホームルーターを比較候補にします。屋内の電波状況と端末代も確認してください。'
        + (input.stay === 'short' ? '短期利用では、解約時に残る端末代を含めると負担が大きくなる場合があります。利用予定月までの総額で比べてください。' : ''),
    };
  }
  if (input.construction === 'unknown') {
    return {
      mode: 'check-first',
      providerIds: [],
      title: '提供エリアと工事の条件を先に確認する',
      reason: '工事の可否がまだ分からないため、回線を決める前に公式の住所検索と建物側の条件を確かめましょう。' + buildingCheck,
    };
  }
  if (input.stay === 'short') {
    return {
      mode: 'short-stay',
      providerIds: [],
      title: '短期利用は、解約する月までの総額を比べる',
      reason: '短期利用では、月額や還元額だけでなく、工事費・端末代の残額と解約費用が重要です。工事費の負担が少ない候補や、1年利用の比較で条件を確認してください。' + buildingCheck,
    };
  }

  let providerIds: string[];
  let reason: string;
  if (input.carrier === 'docomo') {
    providerIds = ['docomo-hikari', 'biglobe-hikari'];
    reason = 'ドコモ光のセット割の対象になるスマホプランかを確認し、割引なしの候補とも比較します。割引額は契約プラン・回線数によって異なります。';
  } else if (input.carrier === 'au' || input.carrier === 'uq') {
    providerIds = input.prefecture === '46' ? ['biglobe-hikari', 'bbiq'] : ['biglobe-hikari', 'docomo-hikari'];
    reason = 'au・UQ mobileの対象プランでセット割を使える候補と条件を比べます。UQのコミコミプランなど対象外のプランもあり、光電話等の追加契約・費用が必要な場合があります。';
    if (input.prefecture === '46') reason += '鹿児島県では、公式の住所確認を前提にBBIQも比較候補へ加えています。';
  } else if (input.carrier === 'softbank' || input.carrier === 'ymobile') {
    providerIds = ['softbank-hikari', 'biglobe-hikari'];
    reason = 'SoftBank 光と対象スマホのセット割条件を確認し、割引なしの候補とも比較します。指定オプションの追加費用と、対象スマホプランを確認してください。';
  } else {
    providerIds = ['biglobe-hikari', 'docomo-hikari', 'softbank-hikari'];
    reason = input.carrier === 'ahamo'
      ? 'ahamoはドコモ光セット割の対象として計算しません。回線自体の月額・工事費・追加費用を同じ条件で比べる候補です。'
      : 'スマホのセット割を前提にせず、回線自体の月額・工事費・追加費用を同じ条件で比べる候補です。';
  }
  return {
    mode: 'fiber',
    providerIds,
    title: '住所と契約条件を確認して、光回線を比べる',
    reason: reason + buildingCheck + '候補の表示は、この住所で利用できることや料金順位を確定するものではありません。',
  };
}

function diagnoseMobile(input: DiagnosisInput): MobileDiagnosis {
  const dataTag = { small: 'small-data', large: 'large-data', flexible: 'flexible-data' }[input.dataUse];
  const hasTag = (service: (typeof mobileServices)[number], tag: string) => service.tags.includes(tag);
  const shopRequired = input.support === 'shop';
  let candidates = mobileServices.filter(service => hasTag(service, dataTag) && (!shopRequired || hasTag(service, 'shop-support')));
  let reason: string;

  if (shopRequired && candidates.length === 0) {
    candidates = mobileServices.filter(service => hasTag(service, 'shop-support'));
    reason = '掲載中の都度データ購入型には、店舗で契約・管理を相談できる候補がありません。店舗相談の希望を優先し、容量を選ぶ月額型などの候補を表示します。都度購入の条件には一致しないため、必要な容量と支払い方を店舗で確認してください。';
  } else if (input.dataUse === 'flexible') {
    reason = '必要な時期にデータを購入する方式の候補です。データ容量と有効期限、未購入が続いた場合の利用停止条件を自分で管理できるか確認してください。毎月定額のプランとは支払い方が異なります。';
  } else {
    reason = input.dataUse === 'small'
      ? '少ない通信量で選べる掲載プランを比較候補にします。掲載例の容量は1〜7GBなど異なるため、直近の利用量に合う容量と通話・初期費用をそろえて比べてください。'
      : '掲載中の30GB程度以上のプランを比較候補にします。容量・通話条件・段階制の上限料金は異なるため、使う量に合わせて公式の条件を確認してください。';
    if (shopRequired) reason += '店舗相談に対応する掲載候補に絞っています。近くの店舗と取扱いサービスを確認してください。';
    else if (input.support === 'online') reason += 'オンラインでの申込み・管理を想定し、SIM・eSIMと端末の対応を確認してください。';
  }

  // Stable display order, independent of prices, advertising approval, or payouts.
  const ids = candidates.map(service => service.id).sort().slice(0, 3);
  return { ids, reason: reason + '表示順はおすすめ順位や安い順ではなく、掲載情報と選択条件による比較候補です。' };
}

export function diagnoseConnectivity(input: DiagnosisInput): ConnectivityDiagnosis {
  return {
    home: input.goal === 'mobile' ? null : diagnoseHome(input),
    mobile: input.goal === 'home' ? null : diagnoseMobile(input),
  };
}
