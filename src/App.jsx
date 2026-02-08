import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Wifi, Smartphone, Home, ChevronRight, Check, MapPin, X, Award, TrendingUp, DollarSign, Menu, Info, ArrowRight, Zap, Building2, MousePointerClick, Edit, Save, Copy, RotateCcw, Settings, Lock, Plus, Trash2, AlertCircle } from 'lucide-react';

// --- 設定 ---
const ADMIN_PASSWORD = "mysecret123";

// --- 画像データ (共通化) ---
// ここで定義した画像を使い回すことで、戸建て・マンションで同じ画像を表示します
const IMAGES = {
  // ドコモ光（A8バナーから抽出した画像URL）
  docomo: "https://www24.a8.net/svt/bgt?aid=260208733982&wid=002&eno=01&mid=s00000017718004023000&mc=1",
  
  // SoftBank光 / Air (ロゴ画像)
  softbank: "data:image/png;base64,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",
  
  // home 5G
  home5g: "data:image/png;base64,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",
  
  // auひかり
  au: "data:image/png;base64,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",

  // ビッグローブ
  biglobe: "data:image/png;base64,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",

  // フレッツ光
  flets: "data:image/png;base64,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"
};

// --- 初期データ (リセット時に使用) ---
const DEFAULT_PROVIDERS = [
  // --- 戸建て (House) データ ---
  {
    id: 1,
    name: "BBIQ (ビビック) ホームタイプ", 
    providerName: "株式会社QTnet",
    type: "fiber",
    buildingType: "house",
    carrier: "au",
    monthlyFee: 5500, 
    cashback: 30000, 
    contractYear: 3,
    maxSpeed: "1Gbps",
    avgSpeed: "500Mbps", 
    features: ["九州エリア顧客満足度No.1", "auスマホとセットで割引", "開通工事費実質無料"],
    points: ["九州電力グループの独自回線で、混雑しにくく速度が安定", "auユーザーなら「auスマートバリュー」で毎月のスマホ代が安くなる", "セキュリティソフト（マカフィー）が標準装備で無料"],
    badge: "recommend",
    rank: 1,
    link: "#", 
    imageUrl: "", // 画像URLを設定可能
    description: "鹿児島県民ならまずはコレ。九州電力グループが提供する独自回線で、安定した速度と手厚いサポートが魅力。"
  },
  {
    id: 2,
    name: "ドコモ光",
    providerName: "NTTドコモ",
    type: "fiber",
    buildingType: "house",
    carrier: "docomo",
    monthlyFee: 5720,
    cashback: 20000,
    contractYear: 2,
    maxSpeed: "1Gbps",
    avgSpeed: "320Mbps",
    features: ["ドコモスマホセット割", "dポイントプレゼント", "全国エリア対応"],
    points: ["ドコモユーザーならセット割で家族全員のスマホ代が割引", "選べるプロバイダが豊富（GMOとくとくBBなどが人気）", "提供エリアが広く、離島や山間部でも繋がりやすい"],
    badge: "popularity",
    rank: 2,
    link: "https://px.a8.net/svt/ejp?a8mat=4AX6CD+G8NPLM+3SPO+NTJWY",
    imageUrl: IMAGES.docomo,
    description: "ドコモユーザーなら迷わずこれ。スマホセット割が適用される唯一の光回線。信頼と実績のNTTドコモ提供。"
  },
  {
    id: 3,
    name: "SoftBank 光",
    providerName: "ソフトバンク株式会社",
    type: "fiber",
    buildingType: "house",
    carrier: "softbank",
    monthlyFee: 5720,
    cashback: 40000, 
    contractYear: 2,
    maxSpeed: "1Gbps",
    avgSpeed: "310Mbps",
    features: ["他社違約金・撤去費全額還元", "SoftBank/Y!mobile割引", "開通前Wi-Fiレンタル無料"],
    points: ["他社からの乗り換えにかかる違約金を全額負担してくれるキャンペーンが強力", "SoftBankやY!mobileユーザーはおうち割でスマホ代がお得に", "開通工事までの間、無料でAirターミナル等をレンタル可能"],
    badge: null,
    rank: 3,
    link: "https://px.a8.net/svt/ejp?a8mat=4AX6CE+9NP6U2+3IB8+61JSI",
    imageUrl: IMAGES.softbank,
    description: "乗り換え時のコストを抑えたい方に最適。違約金負担キャンペーンが充実しており、Y!mobileユーザーにもおすすめ。"
  },
  {
    id: 4,
    name: "home 5G (ドコモ)",
    providerName: "NTTドコモ",
    type: "home",
    buildingType: "house",
    carrier: "docomo",
    monthlyFee: 4950,
    cashback: 15000,
    contractYear: 0,
    maxSpeed: "4.2Gbps",
    avgSpeed: "180Mbps", 
    features: ["工事不要でコンセントに挿すだけ", "データ量無制限", "契約期間の縛りなし"],
    points: ["光回線の工事ができない建物でも、コンセントに挿すだけでWi-Fi環境が完成", "ドコモのプラチナバンドを利用するため繋がりやすい", "契約期間の縛りがないため、いつ解約しても違約金0円"],
    badge: "cheapest",
    rank: 4,
    link: "https://px.a8.net/svt/ejp?a8mat=4AX6CD+G8NPLM+3SPO+NTJWY",
    imageUrl: IMAGES.home5g,
    description: "工事をしたくない、すぐにネットを使いたい方に。光回線に匹敵する速度が出る人気ホームルーター。"
  },
  {
    id: 5,
    name: "auひかり ホーム",
    providerName: "KDDI",
    type: "fiber",
    buildingType: "house",
    carrier: "au",
    monthlyFee: 5610,
    cashback: 60000,
    contractYear: 3,
    maxSpeed: "1Gbps",
    avgSpeed: "480Mbps",
    features: ["独自回線で高速", "高額キャッシュバック", "au/UQセット割"],
    points: ["NTT回線を使わない独自回線（一部NTT使用）のため混雑に強い", "BBIQがエリア外だった場合のauユーザーの最有力候補", "代理店経由の申し込みで高額キャッシュバックが狙える"],
    badge: null,
    rank: 5,
    link: "https://px.a8.net/svt/ejp?a8mat=4AX6CE+9ICAE2+42Y0+5ZMCH",
    imageUrl: IMAGES.au,
    description: "BBIQと並んでauユーザーにおすすめ。高額キャッシュバックと安定した通信速度が魅力。"
  },
  {
    id: 6,
    name: "ビッグローブ光",
    providerName: "ビッグローブ株式会社",
    type: "fiber",
    buildingType: "house",
    carrier: "au",
    monthlyFee: 5478,
    cashback: 40000,
    contractYear: 3,
    maxSpeed: "1Gbps",
    avgSpeed: "280Mbps",
    features: ["au・UQモバイルセット割", "老舗プロバイダの安心感", "IPv6標準対応"],
    points: ["auスマートバリュー・UQ自宅セット割が適用可能でスマホ代がお得", "引っ越し時の工事費が何度でも無料になる特典あり（3年プラン）", "老舗プロバイダならではの信頼性と充実したサポート"],
    badge: null,
    rank: 6,
    link: "https://px.a8.net/svt/ejp?a8mat=4AX5KH+11ICNU+3SPO+7LW1F7",
    imageUrl: IMAGES.biglobe,
    description: "KDDIグループの老舗プロバイダ。au・UQユーザーなら割引が効くため、BBIQやauひかりがエリア外だった場合の有力な選択肢。"
  },
  {
    id: 7,
    name: "フレッツ光 (プロバイダ選択型)",
    providerName: "NTT西日本 / 各種プロバイダ",
    type: "fiber",
    buildingType: "house",
    carrier: "all",
    monthlyFee: 6000,
    cashback: 10000,
    contractYear: 2,
    maxSpeed: "1Gbps",
    avgSpeed: "250Mbps",
    features: ["圧倒的な知名度とエリア", "300社以上からプロバイダ選択可", "サポート充実"],
    points: ["NTT西日本の回線を利用するため、離島や山間部を含めた広いエリアをカバー", "好きなプロバイダを自由に選んで使える", "法人契約やSOHO利用にも選ばれる高い信頼性"],
    badge: null,
    rank: 7,
    link: "https://px.a8.net/svt/ejp?a8mat=2ZPIWA+2KVNX6+1MWA+NUES1",
    imageUrl: IMAGES.flets,
    description: "知名度No.1。特定のプロバイダを使いたい方や、仕事で使うため信頼性を最優先したい方におすすめ。"
  },

  // --- マンション (Mansion) データ ---
  {
    id: 101,
    name: "BBIQ (ビビック) マンションタイプ",
    providerName: "株式会社QTnet",
    type: "fiber",
    buildingType: "mansion",
    carrier: "au",
    monthlyFee: 4070, 
    cashback: 25000,
    contractYear: 2,
    maxSpeed: "1Gbps",
    avgSpeed: "450Mbps",
    features: ["鹿児島県内導入マンション多数", "auスマホセット割", "電気とセットで割引"],
    points: ["鹿児島県内の分譲・賃貸マンションへの導入率が高く契約しやすい", "建物内の契約戸数に関わらず直接配線方式なら高速", "九電グループならではの安心感とサポート体制"],
    badge: "recommend",
    rank: 1,
    link: "#",
    imageUrl: "",
    description: "九州のマンションにお住まいなら、まずはBBIQが導入されているかチェック。電力系ならではの安定感が魅力。"
  },
  {
    id: 102,
    name: "GMOとくとくBB光 (GMO光アクセス)",
    providerName: "GMOインターネット",
    type: "fiber",
    buildingType: "mansion",
    carrier: "all",
    monthlyFee: 3773, 
    cashback: 30000,
    contractYear: 0,
    maxSpeed: "1Gbps",
    avgSpeed: "300Mbps",
    features: ["月額料金がシンプルに安い", "契約期間の縛りなし", "解約違約金0円"],
    points: ["スマホセット割がなくても元々の月額料金が安い", "「v6プラス」対応で混雑する夜間でも快適", "いつ解約しても違約金がかからないので安心"],
    badge: "cheapest",
    rank: 2,
    link: "#",
    imageUrl: "",
    description: "格安SIMユーザーや、縛られたくない方に最適。シンプルに安く、高性能なWi-Fiルーターも無料レンタル可能。"
  },
  {
    id: 103,
    name: "ドコモ光 マンションプラン",
    providerName: "NTTドコモ",
    type: "fiber",
    buildingType: "mansion",
    carrier: "docomo",
    monthlyFee: 4400,
    cashback: 20000,
    contractYear: 2,
    maxSpeed: "1Gbps",
    avgSpeed: "250Mbps",
    features: ["全国のマンション対応", "ドコモセット割", "v6プラス対応"],
    points: ["フレッツ光の設備があるマンションならほぼ確実に利用可能", "ドコモユーザーならセット割で通信費をトータル節約", "プロバイダ特典でWi-Fiルーター無料レンタルも"],
    badge: "popularity",
    rank: 3,
    link: "#",
    imageUrl: IMAGES.docomo,
    description: "全国ほとんどのマンションで契約可能。ドコモユーザーがマンションで光回線を使うなら第一候補。"
  },
  {
    id: 104,
    name: "SoftBank 光 マンション",
    providerName: "ソフトバンク株式会社",
    type: "fiber",
    buildingType: "mansion",
    carrier: "softbank",
    monthlyFee: 4180,
    cashback: 36000,
    contractYear: 2,
    maxSpeed: "1Gbps",
    avgSpeed: "260Mbps",
    features: ["違約金全額負担", "Y!mobile割引", "おうち割光セット"],
    points: ["他社のネット回線からの乗り換え費用を全額負担してくれる", "Y!mobileユーザーも割引対象になるため節約効果が大きい", "フレッツ光回線を利用するため対応物件が多い"],
    badge: null,
    rank: 4,
    link: "#",
    imageUrl: IMAGES.softbank,
    description: "マンション備え付けのネットが遅い場合の乗り換え先に。違約金負担があるため、契約更新月を待たずに乗り換えやすい。"
  },
  {
    id: 105,
    name: "SoftBank Air (Airターミナル5)",
    providerName: "ソフトバンク株式会社",
    type: "home",
    buildingType: "mansion",
    carrier: "softbank",
    monthlyFee: 5368,
    cashback: 30000,
    contractYear: 0,
    maxSpeed: "2.1Gbps",
    avgSpeed: "100Mbps", 
    features: ["工事不要・置くだけ", "データ容量無制限", "SoftBankスマホ割引"],
    points: ["工事ができない賃貸マンションでも、コンセントに挿すだけで使える", "データ容量無制限で動画も見放題", "SoftBank/Y!mobileユーザーならセット割が適用される"],
    badge: null,
    rank: 5,
    link: "#",
    imageUrl: IMAGES.softbank,
    description: "工事不可物件の救世主。Airターミナル5になり5G対応で速度も向上。SoftBankユーザーにおすすめ。"
  },
  {
    id: 106,
    name: "ビッグローブ光 マンション",
    providerName: "ビッグローブ株式会社",
    type: "fiber",
    buildingType: "mansion",
    carrier: "au",
    monthlyFee: 4378,
    cashback: 40000,
    contractYear: 3,
    maxSpeed: "1Gbps",
    avgSpeed: "260Mbps",
    features: ["au・UQモバイルセット割", "IPv6対応", "移転工事費無料"],
    points: ["マンションでもauスマートバリュー・UQ自宅セット割が使える", "3年プランなら引っ越し時の工事費が何度でも無料", "IPv6オプションで夜間も快適通信"],
    badge: null,
    rank: 6,
    link: "#",
    imageUrl: IMAGES.biglobe,
    description: "au/UQユーザーで、マンションがBBIQ非対応だった場合の有力候補。信頼性の高い老舗プロバイダ。"
  },
  {
    id: 107,
    name: "フレッツ光 マンション (プロバイダ選択型)",
    providerName: "NTT西日本 / 各種プロバイダ",
    type: "fiber",
    buildingType: "mansion",
    carrier: "all",
    monthlyFee: 4500,
    cashback: 5000,
    contractYear: 2,
    maxSpeed: "1Gbps",
    avgSpeed: "200Mbps",
    features: ["対応物件数No.1", "プロバイダ自由選択", "安定のNTT回線"],
    points: ["ほとんどのマンションに設備が導入されており、すぐに開通しやすい", "好みのプロバイダを選んで契約できる", "光コラボ（ドコモ光など）への転用もスムーズ"],
    badge: null,
    rank: 7,
    link: "#",
    imageUrl: IMAGES.flets,
    description: "対応物件数が最も多い。プロバイダにこだわりがある方や、他の光回線が導入できなかった場合に。"
  }
];

// --- コンポーネント ---

const AdminPanel = ({ providers, setProviders, onClose, onReset }) => {
  const [editingId, setEditingId] = useState(null);
  
  // 新規作成用のデフォルト値
  const initialFormState = {
    name: "新しいサービス",
    providerName: "",
    type: "fiber",
    buildingType: "house",
    carrier: "docomo",
    monthlyFee: 0,
    cashback: 0,
    contractYear: 2,
    maxSpeed: "1Gbps",
    avgSpeed: "",
    features: ["特徴1", "特徴2", "特徴3"],
    points: ["おすすめポイント1", "おすすめポイント2", "おすすめポイント3"],
    badge: null,
    rank: 99,
    link: "#",
    imageUrl: "",
    description: "サービスの説明文を入力してください。"
  };

  const [editForm, setEditForm] = useState(initialFormState);
  const [generatedCode, setGeneratedCode] = useState('');

  // 新規追加
  const handleAddNew = () => {
    setEditingId('new');
    setEditForm({ ...initialFormState, id: Date.now() });
  };

  // 編集開始
  const handleEdit = (provider) => {
    setEditingId(provider.id);
    setEditForm({ ...provider });
  };

  // 削除
  const handleDelete = (id) => {
    if (window.confirm("本当に削除しますか？")) {
      const updatedProviders = providers.filter(p => p.id !== id);
      setProviders(updatedProviders);
      if (editingId === id) setEditingId(null);
    }
  };

  // 保存
  const handleSave = () => {
    if (editingId === 'new') {
      setProviders([...providers, { ...editForm, id: Date.now() }]);
    } else {
      const updatedProviders = providers.map(p => 
        p.id === editingId ? editForm : p
      );
      setProviders(updatedProviders);
    }
    setEditingId(null);
  };

  // 配列形式の入力をハンドリング
  const handleArrayInput = (key, index, value) => {
    const newArray = [...editForm[key]];
    newArray[index] = value;
    setEditForm({ ...editForm, [key]: newArray });
  };

  const handleGenerateCode = () => {
    const code = `const DEFAULT_PROVIDERS = ${JSON.stringify(providers, null, 2)};`;
    setGeneratedCode(code);
  };

  const handleCopyCode = () => {
    const textarea = document.createElement('textarea');
    textarea.value = generatedCode;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('コードをコピーしました！VS Codeの「DEFAULT_PROVIDERS」部分に上書きで貼り付けてください。');
  };

  // 編集フォーム（共通部品）
  const renderForm = () => (
    <div className="w-full space-y-3 bg-white p-4 rounded border border-blue-200 shadow-sm animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500">サービス名</label>
          <input type="text" className="w-full border p-2 rounded" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">会社名・プロバイダ名</label>
          <input type="text" className="w-full border p-2 rounded" value={editForm.providerName} onChange={e => setEditForm({...editForm, providerName: e.target.value})} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500">住居タイプ</label>
            <select className="w-full border p-2 rounded" value={editForm.buildingType} onChange={e => setEditForm({...editForm, buildingType: e.target.value})}>
              <option value="house">戸建て</option>
              <option value="mansion">マンション</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-500">対応キャリア</label>
            <select className="w-full border p-2 rounded" value={editForm.carrier} onChange={e => setEditForm({...editForm, carrier: e.target.value})}>
              <option value="docomo">docomo</option>
              <option value="au">au</option>
              <option value="softbank">SoftBank</option>
              <option value="all">全対応/その他</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">順位 (Rank)</label>
          <input type="number" className="w-full border p-2 rounded" value={editForm.rank} onChange={e => setEditForm({...editForm, rank: Number(e.target.value)})} />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">アフィリエイトリンク (URL)</label>
          <input type="text" className="w-full border p-2 rounded border-red-300 bg-red-50 font-mono text-sm" value={editForm.link} onChange={e => setEditForm({...editForm, link: e.target.value})} placeholder="https://..." />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">画像URL (任意)</label>
          <input type="text" className="w-full border p-2 rounded font-mono text-sm" value={editForm.imageUrl || ''} onChange={e => setEditForm({...editForm, imageUrl: e.target.value})} placeholder="https://..." />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">月額料金 (円)</label>
          <input type="number" className="w-full border p-2 rounded" value={editForm.monthlyFee} onChange={e => setEditForm({...editForm, monthlyFee: Number(e.target.value)})} />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">キャッシュバック (円)</label>
          <input type="number" className="w-full border p-2 rounded" value={editForm.cashback} onChange={e => setEditForm({...editForm, cashback: Number(e.target.value)})} />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-gray-500">特徴タグ (3つまで)</label>
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <input key={i} type="text" className="w-full border p-2 rounded text-xs" value={editForm.features[i] || ''} onChange={e => handleArrayInput('features', i, e.target.value)} placeholder={`特徴 ${i+1}`} />
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-gray-500">おすすめポイント (3つまで)</label>
          <div className="space-y-2">
            {[0, 1, 2].map(i => (
              <input key={i} type="text" className="w-full border p-2 rounded text-xs" value={editForm.points[i] || ''} onChange={e => handleArrayInput('points', i, e.target.value)} placeholder={`ポイント ${i+1}`} />
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-gray-500">説明文</label>
          <textarea className="w-full border p-2 rounded" rows="2" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}></textarea>
        </div>
      </div>
      <div className="flex gap-2 justify-end mt-4 pt-4 border-t">
        <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 border rounded hover:bg-gray-200">キャンセル</button>
        <button onClick={handleSave} className="px-6 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-1 shadow-sm font-bold"><Save size={16}/> 保存して更新</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-4 border-b bg-gray-800 text-white flex justify-between items-center sticky top-0 z-10">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Settings /> 管理モード
          </h2>
          <div className="flex gap-2">
            <button onClick={onReset} className="text-xs text-gray-400 hover:text-white underline px-2">
              データを初期状態に戻す
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full"><X /></button>
          </div>
        </div>

        <div className="p-6 space-y-8 bg-gray-100">
          
          {/* アラート */}
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 text-sm flex items-start gap-3">
            <AlertCircle className="shrink-0" />
            <div>
              <p className="font-bold">編集内容はあなたのブラウザに自動保存されます。</p>
              <p>編集した内容は即座に反映され、ブラウザを閉じても消えません。<br/>
              ただし、インターネット上のサイト（他の人の画面）にはまだ反映されていません。<br/>
              本番反映するには、一番下の「コード生成」ボタンを使って更新してください。</p>
            </div>
          </div>

          {/* 1. リスト編集エリア */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 border-l-4 border-blue-600 pl-3">掲載サービスの管理</h3>
            </div>

            {/* 新規追加ボタン */}
            <div className="mb-6">
              {editingId === 'new' ? (
                <div className="mb-4">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2 bg-blue-100 p-2 rounded"><Plus size={18}/> 新しいサービスを作成中</h4>
                  {renderForm()}
                </div>
              ) : (
                <button onClick={handleAddNew} className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 bg-white rounded-lg hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 font-bold flex items-center justify-center gap-2 transition group shadow-sm">
                  <div className="bg-gray-200 group-hover:bg-blue-500 group-hover:text-white rounded-full p-1 transition"><Plus size={20} /></div>
                  新しいサービスを追加する
                </button>
              )}
            </div>

            <div className="space-y-4">
              {providers.map((p) => (
                <div key={p.id} className={`border rounded-lg p-4 transition bg-white shadow-sm ${editingId === p.id ? 'ring-2 ring-blue-400' : ''}`}>
                  {editingId === p.id ? (
                    renderForm()
                  ) : (
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded text-white ${p.buildingType === 'house' ? 'bg-blue-500' : 'bg-green-500'}`}>{p.buildingType === 'house' ? '戸建て' : 'マンション'}</span>
                          <span className="font-bold text-lg">{p.name}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 border px-2 py-0.5 rounded">Rank: {p.rank}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate max-w-md font-mono">{p.link === '#' ? '⚠️リンク未設定' : p.link}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleEdit(p)} className="px-3 py-2 text-xs border border-blue-600 text-blue-600 bg-white rounded hover:bg-blue-50 flex items-center gap-1 transition">
                          <Edit size={14} /> 編集
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="px-3 py-2 text-xs border border-red-200 text-red-600 bg-white rounded hover:bg-red-50 flex items-center gap-1 transition">
                          <Trash2 size={14} /> 削除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2. コード生成エリア */}
          <div className="bg-slate-900 text-slate-200 p-6 rounded-xl">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <Copy size={20} /> 本番反映用コード書き出し
            </h3>
            <p className="text-sm mb-4 text-slate-400">
              編集が終わったら、ここでコードをコピーして VS Code に貼り付け、GitHubへプッシュしてください。<br/>
              これを行うことで、インターネット上のサイト（本番環境）に変更が反映されます。
            </p>
            <button 
              onClick={handleGenerateCode} 
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition mb-4"
            >
              現在のデータでコードを生成する
            </button>

            {generatedCode && (
              <div className="relative">
                <textarea 
                  className="w-full h-40 bg-slate-800 p-4 rounded text-xs font-mono border border-slate-700 focus:outline-none"
                  readOnly
                  value={generatedCode}
                />
                <button 
                  onClick={handleCopyCode}
                  className="absolute top-2 right-2 bg-white text-slate-900 px-3 py-1 rounded text-xs font-bold hover:bg-gray-200"
                >
                  コピー
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

const Header = () => (
  <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 text-white p-1.5 rounded">
          <Wifi size={20} />
        </div>
        <span className="text-lg font-bold text-gray-800">
          ネット回線<span className="text-blue-600">比較ナビ</span>
          <span className="ml-2 text-xs text-gray-500 font-normal hidden sm:inline-block">by 鹿児島通信</span>
        </span>
      </div>
      <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-600">
        <a href="#ranking" className="hover:text-blue-600 transition">ランキング</a>
        <a href="#guide" className="hover:text-blue-600 transition">選び方</a>
        <a href="#faq" className="hover:text-blue-600 transition">よくある質問</a>
        <a href="#" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition">無料相談</a>
      </nav>
      <button className="md:hidden text-gray-600">
        <Menu size={24} />
      </button>
    </div>
  </header>
);

const ArticleHeader = () => (
  <div className="bg-gray-50 py-10 border-b border-gray-200">
    <div className="container mx-auto px-4 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-relaxed">
        【2026年最新】鹿児島県の光回線おすすめ人気ランキング！戸建て・マンション別に徹底比較
      </h1>
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
        <span className="flex items-center gap-1"><Info size={16} /> 2026年1月23日 更新</span>
        <span className="bg-white border px-2 py-0.5 rounded text-xs">監修者：ネット回線アドバイザー</span>
      </div>
      
      {/* 導入文 */}
      <p className="text-gray-700 leading-7 mb-8">
        「鹿児島で一番速い光回線はどこ？」「マンションでも安く使えるのは？」<br className="hidden md:inline"/>
        そんな疑問にお答えするため、鹿児島県内で利用可能な主要ネット回線を徹底調査しました。
        戸建て・マンションそれぞれの料金相場やキャンペーン内容を比較し、本当におすすめできる回線をランキング形式でご紹介します。
      </p>

      {/* 目次 (TOC) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <p className="font-bold text-lg text-gray-800 mb-3 border-b-2 border-blue-500 inline-block pb-1">目次</p>
        <ul className="space-y-2 text-sm md:text-base text-blue-600 font-medium">
          <li><a href="#search" className="hover:underline flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>STEP1：住居タイプとスマホキャリアを選ぶ</a></li>
          <li><a href="#ranking" className="hover:underline flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>STEP2：おすすめ光回線ランキングを見る</a></li>
          <li><a href="#area" className="hover:underline flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>地域別エリア情報と工事の注意点</a></li>
        </ul>
      </div>
    </div>
  </div>
);

const ProviderRow = ({ provider, rank }) => {
  const isTop3 = rank <= 3;
  const rankColor = rank === 1 ? "bg-yellow-400 border-yellow-500 text-yellow-900" : rank === 2 ? "bg-gray-300 border-gray-400 text-gray-800" : rank === 3 ? "bg-orange-300 border-orange-400 text-orange-900" : "bg-blue-600 border-blue-700 text-white";

  return (
    <div className={`bg-white border rounded-xl overflow-hidden mb-8 shadow-sm hover:shadow-md transition ${isTop3 ? 'border-2 border-yellow-400' : 'border-gray-200'}`}>
      
      {/* Header Bar */}
      <div className={`px-4 py-3 flex items-center justify-between ${rank === 1 ? 'bg-yellow-50' : 'bg-gray-50'} border-b border-gray-100`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 shrink-0 ${rankColor} rounded-full flex items-center justify-center font-bold text-xl shadow-sm border-b-2`}>
            {rank}
          </div>
          <div>
            <h3 className="text-lg md:text-2xl font-bold text-gray-800 leading-tight">{provider.name}</h3>
            {isTop3 && <p className="text-xs text-gray-600 hidden md:block mt-0.5">満足度評価 ★★★★☆ (4.5)</p>}
          </div>
        </div>
        <div className="hidden md:block">
           {provider.badge && (
             <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
               {provider.badge === 'recommend' ? '迷ったらコレ！' : provider.badge === 'cheapest' ? '月額最安級' : '人気No.1'}
             </span>
           )}
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column: Image & Points */}
          <div className="lg:w-1/3 shrink-0">
            {/* Image Placeholder */}
            <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center text-gray-400 mb-4 border border-gray-200 relative overflow-hidden group">
               {provider.imageUrl ? (
                 <img src={provider.imageUrl} alt={provider.name} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
               ) : (
                 <>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                   <div className="text-center">
                     <span className="text-sm font-bold block mb-1">サービス画像</span>
                     <span className="text-xs text-gray-400">{provider.providerName}</span>
                   </div>
                 </>
               )}
               {/* Badge overlay for mobile */}
               {provider.badge && (
                 <div className="absolute top-2 left-2 md:hidden bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                   {provider.badge === 'recommend' ? 'おすすめ' : '人気'}
                 </div>
               )}
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <p className="font-bold text-green-800 mb-2 flex items-center gap-1 text-sm">
                <Check size={16} className="fill-green-600 text-white rounded-full p-0.5" /> おすすめポイント
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                {provider.points.map((point, idx) => (
                   <li key={idx} className="flex items-start gap-1.5 leading-snug">
                     <span className="text-green-500 mt-0.5">●</span> {point}
                   </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Specs & CTA */}
          <div className="lg:w-2/3 flex flex-col justify-between">
            {/* Spec Table */}
            <div className="mb-6">
              <table className="w-full text-sm text-left border-collapse">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-2 bg-gray-50 font-bold text-gray-600 w-1/3">住居タイプ</th>
                    <td className="py-3 px-2 text-gray-800">
                      <span className="inline-flex items-center gap-1">
                        {provider.buildingType === 'house' ? <Home size={14}/> : <Building2 size={14}/>}
                        {provider.buildingType === 'house' ? '戸建てプラン' : 'マンションプラン'}
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-2 bg-gray-50 font-bold text-gray-600">月額料金(目安)</th>
                    <td className="py-3 px-2 text-gray-800 font-bold text-lg">¥{provider.monthlyFee.toLocaleString()} <span className="text-xs font-normal text-gray-500">~</span></td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-2 bg-gray-50 font-bold text-gray-600">最大通信速度</th>
                    <td className="py-3 px-2 text-gray-800">{provider.maxSpeed} <span className="text-xs text-gray-500">(平均 {provider.avgSpeed})</span></td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-2 bg-gray-50 font-bold text-gray-600 align-top pt-3">キャンペーン</th>
                    <td className="py-3 px-2 text-red-600 font-bold align-top">
                      <div className="flex flex-col gap-1">
                        <span className="bg-red-50 text-red-700 px-1 rounded inline-block w-fit">最大{provider.cashback.toLocaleString()}円キャッシュバック</span>
                        {provider.contractYear > 0 && <span className="text-xs text-gray-500 font-normal">※工事費実質無料キャンペーン実施中</span>}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="py-3 px-2 bg-gray-50 font-bold text-gray-600">スマホセット割</th>
                    <td className="py-3 px-2">
                       <span className={`text-xs font-bold px-2 py-1 rounded text-white inline-block ${provider.carrier === 'docomo' ? 'bg-red-500' : provider.carrier === 'au' ? 'bg-orange-500' : provider.carrier === 'softbank' ? 'bg-blue-500' : 'bg-gray-500'}`}>
                        {provider.carrier === 'docomo' ? 'ドコモ' : provider.carrier === 'au' ? 'au' : provider.carrier === 'softbank' ? 'SoftBank' : 'なし'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={provider.link} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg text-center hover:bg-gray-50 transition shadow-sm text-sm flex items-center justify-center" onClick={e => e.preventDefault()}>
                詳細を見る
              </a>
              <a href={provider.link} className="flex-1 bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg text-center shadow-md hover:shadow-lg transition text-sm flex items-center justify-center gap-2 transform active:scale-95 border-b-4 border-orange-700" target="_blank" rel="noopener noreferrer">
                公式サイトへ
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterSection = ({ currentCarrier, setCarrier, buildingType, setBuildingType }) => {
  return (
    <div id="search" className="mb-12">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <MousePointerClick className="text-blue-600" />
        条件を選んでランキングを表示
      </h2>

      {/* 1. Building Type Tabs (Kakaku.com style) */}
      <div className="flex rounded-t-lg overflow-hidden border-b-2 border-blue-600 mb-6">
        <button
          onClick={() => setBuildingType('house')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold text-lg transition-colors ${
            buildingType === 'house'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Home size={24} />
          戸建て
        </button>
        <button
          onClick={() => setBuildingType('mansion')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold text-lg transition-colors ${
            buildingType === 'mansion'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <Building2 size={24} />
          マンション
        </button>
      </div>

      {/* 2. Carrier Filter */}
      <div className="bg-blue-50 rounded-b-xl p-6 md:p-8 border border-blue-100 -mt-6 rounded-t-none">
        <div className="text-center mb-6">
          <p className="font-bold text-gray-800 mb-2">お使いのスマホキャリアを選択してください</p>
          <p className="text-xs text-gray-600">
            セット割が適用される、あなたにとって「実質最安」の回線を優先表示します。
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { id: 'docomo', label: 'docomo', color: 'border-red-500 bg-white text-red-600' },
            { id: 'au', label: 'au / UQ', color: 'border-orange-500 bg-white text-orange-600' },
            { id: 'softbank', label: 'SoftBank / Y!', color: 'border-blue-500 bg-white text-blue-600' },
            { id: 'all', label: '格安SIM・その他', color: 'border-gray-400 bg-white text-gray-600' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCarrier(c.id)}
              className={`py-4 px-2 rounded-lg border-2 font-bold text-sm md:text-base transition-all duration-200 flex flex-col items-center gap-2 ${
                currentCarrier === c.id 
                  ? `${c.color} shadow-lg scale-105 ring-2 ring-offset-2 ring-blue-100` 
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <Smartphone size={24} className={currentCarrier === c.id ? "opacity-100" : "opacity-50"} />
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const AreaGuide = () => (
  <section id="area" className="my-16">
    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-500 pl-4">
      鹿児島県の光回線エリア事情
    </h2>
    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <MapPin className="text-red-500" /> 地域別のおすすめ回線
          </h3>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="font-bold text-gray-800 mb-1">鹿児島市・霧島市・鹿屋市などの市街地</p>
              <p className="text-sm text-gray-600">
                選択肢が最も豊富です。独自回線（BBIQやNUROなど）もエリア内の可能性が高いため、速度重視ならこれらを優先的に検討しましょう。
              </p>
            </div>
            <div className="border-b pb-4">
              <p className="font-bold text-gray-800 mb-1">薩摩川内市・姶良市・出水市</p>
              <p className="text-sm text-gray-600">
                NTT回線（ドコモ光、ソフトバンク光など）はほぼ全域カバー。独自回線は一部エリア外の場合があるため、住所検索が必須です。
              </p>
            </div>
            <div>
              <p className="font-bold text-gray-800 mb-1">離島エリア（種子島・屋久島・奄美大島など）</p>
              <p className="text-sm text-gray-600">
                基本的にはNTT回線（フレッツ光網）を使ったサービス一択となります。ドコモ光などが安定しておすすめです。
              </p>
            </div>
          </div>
        </div>
        <div className="md:w-1/3 bg-gray-100 rounded-lg p-6 flex items-center justify-center text-center">
          <div>
             <Zap className="mx-auto text-yellow-500 mb-2" size={32} />
             <p className="font-bold text-gray-700 mb-2">エリア確認のコツ</p>
             <p className="text-xs text-gray-500">
               申し込み後に「エリア外でした」とならないよう、まずは各公式サイトの「エリア検索」で郵便番号を入力してみるのが確実です。
             </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = ({ onOpenAdmin }) => (
  <footer className="bg-gray-100 border-t border-gray-200 pt-12 pb-6 text-sm text-gray-600">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-1 md:col-span-2">
          <h4 className="font-bold text-gray-800 text-lg mb-4">ネット回線比較ナビ</h4>
          <p className="text-xs leading-relaxed max-w-md">
            当サイトは、インターネット回線の複雑な料金プランやキャンペーン情報を分かりやすく整理し、ユーザーに最適な選択肢を提案する比較メディアです。情報は定期的に更新していますが、最新のキャンペーン内容は必ず公式サイトをご確認ください。
          </p>
        </div>
        <div>
          <h5 className="font-bold text-gray-800 mb-3">カテゴリ</h5>
          <ul className="space-y-2 text-xs">
             <li><a href="#" className="hover:text-blue-600">光回線ランキング</a></li>
             <li><a href="#" className="hover:text-blue-600">ホームルーター比較</a></li>
             <li><a href="#" className="hover:text-blue-600">ポケットWi-Fi</a></li>
             <li><a href="#" className="hover:text-blue-600">格安SIMセット割</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-gray-800 mb-3">運営情報</h5>
          <ul className="space-y-2 text-xs">
             <li><a href="#" className="hover:text-blue-600">運営者情報</a></li>
             <li><a href="#" className="hover:text-blue-600">プライバシーポリシー</a></li>
             <li><a href="#" className="hover:text-blue-600">お問い合わせ</a></li>
             <li><a href="#" className="hover:text-blue-600">免責事項</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-500 relative">
        &copy; 2026 Kagoshima Internet Navi. All rights reserved.
        <button 
          onClick={onOpenAdmin} 
          className="absolute right-0 top-6 text-gray-300 hover:text-gray-500 transition p-2"
          aria-label="管理者メニュー"
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  </footer>
);

// --- メインアプリ ---

const App = () => {
  const [carrier, setCarrier] = useState('docomo');
  const [buildingType, setBuildingType] = useState('house');
  const [providers, setProviders] = useState(DEFAULT_PROVIDERS);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // パスワードチェック関数
  const handleOpenAdmin = () => {
    const input = prompt("管理者パスワードを入力してください");
    if (input === ADMIN_PASSWORD) {
      setIsAdminOpen(true);
    } else if (input !== null) {
      alert("パスワードが間違っています");
    }
  };

  // リセット関数
  const handleResetData = () => {
    if (window.confirm("全てのデータを初期状態に戻しますか？\n（これまで編集した内容はすべて消えます）")) {
      setProviders(DEFAULT_PROVIDERS);
      alert("初期化しました。");
    }
  };

  const filteredProviders = useMemo(() => {
    let result = [...providers];
    
    // 1. Building Type Filter
    result = result.filter(p => p.buildingType === buildingType);

    // 2. Carrier Logic (Sort Priority)
    if (carrier !== 'all') {
      result = result.sort((a, b) => {
        if (a.carrier === carrier && b.carrier !== carrier) return -1;
        if (a.carrier !== carrier && b.carrier === carrier) return 1;
        return a.rank - b.rank; // Keep original rank for secondary sort
      });
    } else {
      result = result.sort((a, b) => a.rank - b.rank);
    }
    return result;
  }, [carrier, buildingType, providers]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <Header />
      <ArticleHeader />
      
      <main className="container mx-auto px-4 max-w-4xl pb-12 pt-8">
        
        <FilterSection 
          currentCarrier={carrier} 
          setCarrier={setCarrier} 
          buildingType={buildingType}
          setBuildingType={setBuildingType}
        />

        <div id="ranking">
          <div className="mb-8 flex flex-col md:flex-row md:items-end gap-3 border-b-2 border-gray-100 pb-2">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {buildingType === 'house' ? <Home className="text-blue-600"/> : <Building2 className="text-blue-600"/>}
              {buildingType === 'house' ? '戸建て' : 'マンション'}のおすすめランキング
            </h2>
            <p className="text-sm text-gray-500 pb-1">
              {carrier === 'all' ? '全キャリア対象' : `${carrier === 'docomo' ? 'ドコモ' : carrier === 'au' ? 'au' : 'SoftBank'}ユーザー推奨順`}
            </p>
          </div>

          <div>
            {filteredProviders.map((provider, index) => (
              <ProviderRow 
                key={provider.id} 
                provider={provider} 
                rank={index + 1} 
              />
            ))}
            {filteredProviders.length === 0 && (
              <div className="text-center py-10 bg-gray-50 rounded-lg text-gray-500">
                条件に一致する回線が見つかりませんでした。
              </div>
            )}
          </div>
        </div>

        <AreaGuide />
      </main>

      <Footer onOpenAdmin={handleOpenAdmin} />

      {/* Admin Panel Modal */}
      {isAdminOpen && (
        <AdminPanel 
          providers={providers} 
          setProviders={setProviders} 
          onClose={() => setIsAdminOpen(false)}
          onReset={handleResetData}
        />
      )}
    </div>
  );
};

export default App;