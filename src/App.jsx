import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Wifi, Smartphone, Home, ChevronRight, Check, MapPin, X, Award, TrendingUp, DollarSign, Menu, Info, ArrowRight, Zap, Building2, MousePointerClick, Edit, Save, Copy, RotateCcw, Settings, Lock, Plus, Trash2, AlertCircle } from 'lucide-react';

// --- 設定 ---
const ADMIN_PASSWORD = "mysecret123"; // ★ここに管理者用パスワードを設定してください

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
    link: "#",
    imageUrl: "",
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
    link: "#",
    imageUrl: "",
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
    link: "#",
    imageUrl: "",
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
    link: "#",
    imageUrl: "",
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
    link: "#",
    imageUrl: "",
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
    link: "#",
    imageUrl: "",
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
    imageUrl: "",
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
    imageUrl: "",
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
    imageUrl: "",
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
    imageUrl: "",
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
    imageUrl: "",
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
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // データ初期化 (LocalStorage -> Default)
  const [providers, setProviders] = useState(() => {
    const saved = localStorage.getItem('wifi_providers_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved data:", e);
      }
    }
    return DEFAULT_PROVIDERS;
  });

  // 自動保存
  useEffect(() => {
    localStorage.setItem('wifi_providers_data', JSON.stringify(providers));
  }, [providers]);

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