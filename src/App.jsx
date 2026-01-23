import React, { useState, useMemo } from 'react';
import { Wifi, Smartphone, Home, ChevronRight, Check, MapPin, X, Award, TrendingUp, DollarSign, Menu, Info, ArrowRight, Zap, Building2, MousePointerClick } from 'lucide-react';

// --- モックデータ (戸建て・マンション両対応) ---
const INITIAL_PROVIDERS = [
  // --- 戸建て (House) データ ---
  {
    id: 1,
    name: "九州トクトク光 ホーム",
    providerName: "Kyushu Power Net",
    type: "fiber",
    buildingType: "house", // 戸建て
    carrier: "au",
    monthlyFee: 5200,
    cashback: 45000,
    contractYear: 3,
    maxSpeed: "1Gbps",
    avgSpeed: "480Mbps",
    features: ["鹿児島県内シェアNo.1", "auスマホセット割あり", "開通工事費実質無料"],
    points: ["九州電力グループの独自回線で混雑知らず", "auユーザーならスマホ代が毎月割引", "セキュリティソフトが永年無料"],
    badge: "recommend",
    rank: 1,
    link: "#",
    description: "九州限定の電力系光回線。独自の回線網を使うため混雑が少なく、鹿児島市〜霧島市エリアで圧倒的人気。"
  },
  {
    id: 2,
    name: "ドコモ光 戸建てプラン",
    providerName: "NTT Docomo",
    type: "fiber",
    buildingType: "house",
    carrier: "docomo",
    monthlyFee: 5720,
    cashback: 20000,
    contractYear: 2,
    maxSpeed: "1Gbps",
    avgSpeed: "280Mbps",
    features: ["ドコモスマホが毎月割引", "dポイント還元", "提供エリア全国カバー"],
    points: ["ドコモユーザーならセット割で最安級", "次世代技術v6プラス対応でサクサク", "訪問設定サポートが初回無料"],
    badge: "popularity",
    rank: 2,
    link: "#",
    description: "ドコモユーザーならこれ一択。家族全員のスマホ代が安くなるセット割が強力。離島エリアもカバー率高め。"
  },
  {
    id: 3,
    name: "ソフトバンク光 ファミリー",
    providerName: "SoftBank",
    type: "fiber",
    buildingType: "house",
    carrier: "softbank",
    monthlyFee: 5720,
    cashback: 36000,
    contractYear: 2,
    maxSpeed: "1Gbps",
    avgSpeed: "320Mbps",
    features: ["SoftBank/Y!mobile割引", "他社違約金・撤去費全額還元", "最短開通"],
    points: ["他社からの乗り換え費用を全額負担", "Y!mobileユーザーも割引対象", "ルーター機能付きユニットが便利"],
    badge: null,
    rank: 3,
    link: "#",
    description: "他社からの乗り換えキャンペーンが強力。違約金を負担してくれるので、既存回線からの切り替えにおすすめ。"
  },
  {
    id: 4,
    name: "ホームルーター AIR 5G",
    providerName: "Mobile 5G",
    type: "home",
    buildingType: "house", // 戸建て扱い（工事不可物件用）
    carrier: "docomo",
    monthlyFee: 4950,
    cashback: 15000,
    contractYear: 0,
    maxSpeed: "4.2Gbps",
    avgSpeed: "110Mbps",
    features: ["工事不要でコンセントに挿すだけ", "契約縛りなし", "データ無制限"],
    points: ["工事なし！届いたその日から使える", "データ容量無制限で使い放題", "契約期間の縛りなしで解約金0円"],
    badge: "cheapest",
    rank: 4,
    link: "#",
    description: "鹿児島市内の5Gエリアなら光回線並みの速度。借家や古い戸建てで工事ができない場合に最適。"
  },
  {
    id: 5,
    name: "さつま高速ネット (NURO系)",
    providerName: "HighSpeed Kagoshima",
    type: "fiber",
    buildingType: "house",
    carrier: "softbank",
    monthlyFee: 5200,
    cashback: 60000,
    contractYear: 3,
    maxSpeed: "2Gbps",
    avgSpeed: "850Mbps",
    features: ["下り最大2Gbps", "独自回線で高速", "高額キャッシュバック"],
    points: ["下り最大2Gbpsの爆速回線", "高額キャッシュバックキャンペーン中", "専用ONUで無線LAN機能も標準装備"],
    badge: null,
    rank: 5,
    link: "#",
    description: "速度重視のゲーマー向け。提供エリアが主要都市部に限られるため、事前にエリア確認が必須。"
  },

  // --- マンション (Mansion) データ ---
  {
    id: 101,
    name: "九州トクトク光 マンション",
    providerName: "Kyushu Power Net",
    type: "fiber",
    buildingType: "mansion", // マンション
    carrier: "au",
    monthlyFee: 3960, // マンションは安い
    cashback: 35000,
    contractYear: 2,
    maxSpeed: "1Gbps",
    avgSpeed: "420Mbps",
    features: ["鹿児島マンションシェアNo.1", "auスマホセット割", "建物導入済みなら工事不要"],
    points: ["県内の分譲・賃貸マンションへの導入率が高い", "電力セット割でさらに月額がお得に", "配線方式に関わらず安定した速度"],
    badge: "recommend",
    rank: 1,
    link: "#",
    description: "九州電力管内のマンションならまず確認すべき回線。導入済み物件が多く、工事なしで即日開通できることも。"
  },
  {
    id: 102,
    name: "さつま高速ネット for マンション",
    providerName: "HighSpeed Kagoshima",
    type: "fiber",
    buildingType: "mansion",
    carrier: "softbank",
    monthlyFee: 2090, // 設備導入済みの場合の最安値
    cashback: 25000,
    contractYear: 3,
    maxSpeed: "2Gbps",
    avgSpeed: "780Mbps",
    features: ["月額2,090円〜の驚異的安さ", "利用者数で料金変動", "爆速2Gbps"],
    points: ["建物内の利用者が多いほど料金が安くなる仕組み", "マンションでも専用回線を引き込むため高速", "SoftBankスマホとのセット割も適用可"],
    badge: "cheapest",
    rank: 2,
    link: "#",
    description: "導入済みマンションにお住まいなら最強のコスパ。月額2,000円台で2Gbpsが使える破格のプラン。"
  },
  {
    id: 103,
    name: "ドコモ光 マンションプラン",
    providerName: "NTT Docomo",
    type: "fiber",
    buildingType: "mansion",
    carrier: "docomo",
    monthlyFee: 4400,
    cashback: 20000,
    contractYear: 2,
    maxSpeed: "1Gbps",
    avgSpeed: "220Mbps",
    features: ["全国のマンション対応", "ドコモセット割", "プロバイダ選択可能"],
    points: ["フレッツ光導入マンションならほぼ確実に利用可能", "ドコモユーザーなら家族全員のスマホ代割引", "v6プラス対応プロバイダを選べば快適"],
    badge: "popularity",
    rank: 3,
    link: "#",
    description: "最も無難で確実な選択肢。フレッツ光の設備があれば使えるため、賃貸アパートでも契約しやすい。"
  },
  {
    id: 104,
    name: "ソフトバンク光 マンション",
    providerName: "SoftBank",
    type: "fiber",
    buildingType: "mansion",
    carrier: "softbank",
    monthlyFee: 4180,
    cashback: 36000,
    contractYear: 2,
    maxSpeed: "1Gbps",
    avgSpeed: "250Mbps",
    features: ["違約金全額負担", "Y!mobile割引", "おうち割光セット"],
    points: ["他社からの乗り換え費用を全額キャッシュバック", "Y!mobileユーザーも割引対象で節約効果大", "10Gbpsプラン対応マンションも拡大中"],
    badge: null,
    rank: 4,
    link: "#",
    description: "違約金負担キャンペーンが強力。今のネットが遅い・高いと悩んでいるマンション住まいの方の乗り換え先に。"
  },
  {
    id: 105,
    name: "ホームルーター AIR 5G (マンション)",
    providerName: "Mobile 5G",
    type: "home",
    buildingType: "mansion",
    carrier: "docomo",
    monthlyFee: 4950,
    cashback: 15000,
    contractYear: 0,
    maxSpeed: "4.2Gbps",
    avgSpeed: "110Mbps",
    features: ["工事不可でもOK", "引越し先でもすぐ使える", "配線スッキリ"],
    points: ["VDSL方式で速度が出ないマンションの救世主", "コンセントに挿すだけなので配線がごちゃつかない", "転勤族でも手続きなしで移動可能"],
    badge: null,
    rank: 5,
    link: "#",
    description: "建物が古くて光回線が引けない、またはVDSLで速度が遅い場合の解決策としておすすめ。"
  }
];

// --- コンポーネント ---

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
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
               <div className="text-center">
                 <span className="text-sm font-bold block mb-1">サービス画像</span>
                 <span className="text-xs text-gray-400">{provider.providerName}</span>
               </div>
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
                       <span className={`text-xs font-bold px-2 py-1 rounded text-white inline-block ${provider.carrier === 'docomo' ? 'bg-red-500' : provider.carrier === 'au' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                        {provider.carrier === 'docomo' ? 'ドコモ' : provider.carrier === 'au' ? 'au' : 'SoftBank'}
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
              <a href={provider.link} className="flex-1 bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg text-center shadow-md hover:shadow-lg transition text-sm flex items-center justify-center gap-2 transform active:scale-95 border-b-4 border-orange-700" onClick={e => e.preventDefault()}>
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

const Footer = () => (
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
      <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
        &copy; 2026 Kagoshima Internet Navi. All rights reserved.
      </div>
    </div>
  </footer>
);

// --- メインアプリ ---

const App = () => {
  const [carrier, setCarrier] = useState('docomo');
  const [buildingType, setBuildingType] = useState('house'); // 'house' or 'mansion'

  const filteredProviders = useMemo(() => {
    let result = [...INITIAL_PROVIDERS];
    
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
  }, [carrier, buildingType]);

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

      <Footer />
    </div>
  );
};

export default App;