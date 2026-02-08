import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Wifi, Smartphone, Home, ChevronRight, Check, MapPin, X, Award, TrendingUp, DollarSign, Menu, Info, ArrowRight, Zap, Building2, MousePointerClick, Edit, Save, Copy, RotateCcw, Settings, Lock, Plus, Trash2, AlertCircle } from 'lucide-react';

// --- 設定 ---
const DEFAULT_PROVIDERS = [
  {
    "id": 1,
    "name": "BBIQ (ビビック) ホームタイプ",
    "providerName": "株式会社QTnet",
    "type": "fiber",
    "buildingType": "house",
    "carrier": "au",
    "monthlyFee": 5500,
    "cashback": 30000,
    "contractYear": 3,
    "maxSpeed": "1Gbps",
    "avgSpeed": "500Mbps",
    "features": [
      "九州エリア顧客満足度No.1",
      "auスマホとセットで割引",
      "開通工事費実質無料"
    ],
    "points": [
      "九州電力グループの独自回線で、混雑しにくく速度が安定",
      "auユーザーなら「auスマートバリュー」で毎月のスマホ代が安くなる",
      "セキュリティソフト（マカフィー）が標準装備で無料"
    ],
    "badge": "recommend",
    "rank": 1,
    "link": "https://px.a8.net/svt/ejp?a8mat=4AX6CE+CULUL6+348K+2Z6GBM",
    "imageUrl": "data:image/png;base64,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",
    "description": "鹿児島県民ならまずはコレ。九州電力グループが提供する独自回線で、安定した速度と手厚いサポートが魅力。"
  },
  {
    "id": 2,
    "name": "ドコモ光",
    "providerName": "NTTドコモ",
    "type": "fiber",
    "buildingType": "house",
    "carrier": "docomo",
    "monthlyFee": 5720,
    "cashback": 20000,
    "contractYear": 2,
    "maxSpeed": "1Gbps",
    "avgSpeed": "320Mbps",
    "features": [
      "ドコモスマホセット割",
      "dポイントプレゼント",
      "全国エリア対応"
    ],
    "points": [
      "ドコモユーザーならセット割で家族全員のスマホ代が割引",
      "選べるプロバイダが豊富（GMOとくとくBBなどが人気）",
      "提供エリアが広く、離島や山間部でも繋がりやすい"
    ],
    "badge": "popularity",
    "rank": 2,
    "link": "https://px.a8.net/svt/ejp?a8mat=4AX6CD+G8NPLM+3SPO+NTJWY",
    "imageUrl": "https://www24.a8.net/svt/bgt?aid=260208733982&wid=002&eno=01&mid=s00000017718004023000&mc=1",
    "description": "ドコモユーザーなら迷わずこれ。スマホセット割が適用される唯一の光回線。信頼と実績のNTTドコモ提供。"
  },
  {
    "id": 3,
    "name": "SoftBank 光",
    "providerName": "ソフトバンク株式会社",
    "type": "fiber",
    "buildingType": "house",
    "carrier": "softbank",
    "monthlyFee": 5720,
    "cashback": 40000,
    "contractYear": 2,
    "maxSpeed": "1Gbps",
    "avgSpeed": "310Mbps",
    "features": [
      "他社違約金・撤去費全額還元",
      "SoftBank/Y!mobile割引",
      "開通前Wi-Fiレンタル無料"
    ],
    "points": [
      "他社からの乗り換えにかかる違約金を全額負担してくれるキャンペーンが強力",
      "SoftBankやY!mobileユーザーはおうち割でスマホ代がお得に",
      "開通工事までの間、無料でAirターミナル等をレンタル可能"
    ],
    "badge": null,
    "rank": 3,
    "link": "https://px.a8.net/svt/ejp?a8mat=4AX6CE+9NP6U2+3IB8+61JSI",
    "imageUrl": "data:image/png;base64,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",
    "description": "乗り換え時のコストを抑えたい方に最適。違約金負担キャンペーンが充実しており、Y!mobileユーザーにもおすすめ。"
  },
  {
    "id": 4,
    "name": "home 5G (ドコモ)",
    "providerName": "NTTドコモ",
    "type": "home",
    "buildingType": "house",
    "carrier": "docomo",
    "monthlyFee": 4950,
    "cashback": 15000,
    "contractYear": 0,
    "maxSpeed": "4.2Gbps",
    "avgSpeed": "180Mbps",
    "features": [
      "工事不要でコンセントに挿すだけ",
      "データ量無制限",
      "契約期間の縛りなし"
    ],
    "points": [
      "光回線の工事ができない建物でも、コンセントに挿すだけでWi-Fi環境が完成",
      "ドコモのプラチナバンドを利用するため繋がりやすい",
      "契約期間の縛りがないため、いつ解約しても違約金0円"
    ],
    "badge": "cheapest",
    "rank": 4,
    "link": "https://px.a8.net/svt/ejp?a8mat=4AX6CD+G8NPLM+3SPO+NTJWY",
    "imageUrl": "data:image/png;base64,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",
    "description": "工事をしたくない、すぐにネットを使いたい方に。光回線に匹敵する速度が出る人気ホームルーター。"
  },
  {
    "id": 5,
    "name": "auひかり ホーム",
    "providerName": "KDDI",
    "type": "fiber",
    "buildingType": "house",
    "carrier": "au",
    "monthlyFee": 5610,
    "cashback": 60000,
    "contractYear": 3,
    "maxSpeed": "1Gbps",
    "avgSpeed": "480Mbps",
    "features": [
      "独自回線で高速",
      "高額キャッシュバック",
      "au/UQセット割"
    ],
    "points": [
      "NTT回線を使わない独自回線（一部NTT使用）のため混雑に強い",
      "BBIQがエリア外だった場合のauユーザーの最有力候補",
      "代理店経由の申し込みで高額キャッシュバックが狙える"
    ],
    "badge": null,
    "rank": 5,
    "link": "https://px.a8.net/svt/ejp?a8mat=4AX6CE+9ICAE2+42Y0+5ZMCH",
    "imageUrl": "data:image/png;base64,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",
    "description": "BBIQと並んでauユーザーにおすすめ。高額キャッシュバックと安定した通信速度が魅力。"
  },
  {
    "id": 6,
    "name": "ビッグローブ光",
    "providerName": "ビッグローブ株式会社",
    "type": "fiber",
    "buildingType": "house",
    "carrier": "au",
    "monthlyFee": 5478,
    "cashback": 40000,
    "contractYear": 3,
    "maxSpeed": "1Gbps",
    "avgSpeed": "280Mbps",
    "features": [
      "au・UQモバイルセット割",
      "老舗プロバイダの安心感",
      "IPv6標準対応"
    ],
    "points": [
      "auスマートバリュー・UQ自宅セット割が適用可能でスマホ代がお得",
      "引っ越し時の工事費が何度でも無料になる特典あり（3年プラン）",
      "老舗プロバイダならではの信頼性と充実したサポート"
    ],
    "badge": null,
    "rank": 6,
    "link": "https://px.a8.net/svt/ejp?a8mat=4AX5KH+11ICNU+3SPO+7LW1F7",
    "imageUrl": "data:image/png;base64,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",
    "description": "KDDIグループの老舗プロバイダ。au・UQユーザーなら割引が効くため、BBIQやauひかりがエリア外だった場合の有力な選択肢。"
  },
  {
    "id": 7,
    "name": "フレッツ光 (プロバイダ選択型)",
    "providerName": "NTT西日本 / 各種プロバイダ",
    "type": "fiber",
    "buildingType": "house",
    "carrier": "all",
    "monthlyFee": 6000,
    "cashback": 10000,
    "contractYear": 2,
    "maxSpeed": "1Gbps",
    "avgSpeed": "250Mbps",
    "features": [
      "圧倒的な知名度とエリア",
      "300社以上からプロバイダ選択可",
      "サポート充実"
    ],
    "points": [
      "NTT西日本の回線を利用するため、離島や山間部を含めた広いエリアをカバー",
      "好きなプロバイダを自由に選んで使える",
      "法人契約やSOHO利用にも選ばれる高い信頼性"
    ],
    "badge": null,
    "rank": 7,
    "link": "https://px.a8.net/svt/ejp?a8mat=2ZPIWA+2KVNX6+1MWA+NUES1",
    "imageUrl": "data:image/png;base64,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",
    "description": "知名度No.1。特定のプロバイダを使いたい方や、仕事で使うため信頼性を最優先したい方におすすめ。"
  },
  {
    "id": 101,
    "name": "BBIQ (ビビック) マンションタイプ",
    "providerName": "株式会社QTnet",
    "type": "fiber",
    "buildingType": "mansion",
    "carrier": "au",
    "monthlyFee": 4070,
    "cashback": 25000,
    "contractYear": 2,
    "maxSpeed": "1Gbps",
    "avgSpeed": "450Mbps",
    "features": [
      "鹿児島県内導入マンション多数",
      "auスマホセット割",
      "電気とセットで割引"
    ],
    "points": [
      "鹿児島県内の分譲・賃貸マンションへの導入率が高く契約しやすい",
      "建物内の契約戸数に関わらず直接配線方式なら高速",
      "九電グループならではの安心感とサポート体制"
    ],
    "badge": "recommend",
    "rank": 1,
    "link": "https://px.a8.net/svt/ejp?a8mat=4AX6CE+CULUL6+348K+2Z6GBM",
    "imageUrl": "data:image/png;base64,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",
    "description": "九州のマンションにお住まいなら、まずはBBIQが導入されているかチェック。電力系ならではの安定感が魅力。"
  },
  {
    "id": 102,
    "name": "GMOとくとくBB光 (GMO光アクセス)",
    "providerName": "GMOインターネット",
    "type": "fiber",
    "buildingType": "mansion",
    "carrier": "all",
    "monthlyFee": 3773,
    "cashback": 30000,
    "contractYear": 0,
    "maxSpeed": "1Gbps",
    "avgSpeed": "300Mbps",
    "features": [
      "月額料金がシンプルに安い",
      "契約期間の縛りなし",
      "解約違約金0円"
    ],
    "points": [
      "スマホセット割がなくても元々の月額料金が安い",
      "「v6プラス」対応で混雑する夜間でも快適",
      "いつ解約しても違約金がかからないので安心"
    ],
    "badge": "cheapest",
    "rank": 2,
    "link": "https://px.a8.net/svt/ejp?a8mat=4AX6CF+7O968Q+3IB8+BZGEQ",
    "imageUrl": "data:image/png;base64,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",
    "description": "格安SIMユーザーや、縛られたくない方に最適。シンプルに安く、高性能なWi-Fiルーターも無料レンタル可能。"
  },
  {
    "id": 103,
    "name": "ドコモ光 マンションプラン",
    "providerName": "NTTドコモ",
    "type": "fiber",
    "buildingType": "mansion",
    "carrier": "docomo",
    "monthlyFee": 4400,
    "cashback": 20000,
    "contractYear": 2,
    "maxSpeed": "1Gbps",
    "avgSpeed": "250Mbps",
    "features": [
      "全国のマンション対応",
      "ドコモセット割",
      "v6プラス対応"
    ],
    "points": [
      "フレッツ光の設備があるマンションならほぼ確実に利用可能",
      "ドコモユーザーならセット割で通信費をトータル節約",
      "プロバイダ特典でWi-Fiルーター無料レンタルも"
    ],
    "badge": "popularity",
    "rank": 3,
    "link": "https://px.a8.net/svt/ejp?a8mat=4AX6CD+G8NPLM+3SPO+NTJWY",
    "imageUrl": "https://www24.a8.net/svt/bgt?aid=260208733982&wid=002&eno=01&mid=s00000017718004023000&mc=1",
    "description": "全国ほとんどのマンションで契約可能。ドコモユーザーがマンションで光回線を使うなら第一候補。"
  },
  {
    "id": 104,
    "name": "SoftBank 光 マンション",
    "providerName": "ソフトバンク株式会社",
    "type": "fiber",
    "buildingType": "mansion",
    "carrier": "softbank",
    "monthlyFee": 4180,
    "cashback": 36000,
    "contractYear": 2,
    "maxSpeed": "1Gbps",
    "avgSpeed": "260Mbps",
    "features": [
      "違約金全額負担",
      "Y!mobile割引",
      "おうち割光セット"
    ],
    "points": [
      "他社のネット回線からの乗り換え費用を全額負担してくれる",
      "Y!mobileユーザーも割引対象になるため節約効果が大きい",
      "フレッツ光回線を利用するため対応物件が多い"
    ],
    "badge": null,
    "rank": 4,
    "link": "https://px.a8.net/svt/ejp?a8mat=4AX6CE+9NP6U2+3IB8+61JSI",
    "imageUrl": "data:image/png;base64,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",
    "description": "マンション備え付けのネットが遅い場合の乗り換え先に。違約金負担があるため、契約更新月を待たずに乗り換えやすい。"
  },
  {
    "id": 105,
    "name": "SoftBank Air (Airターミナル5)",
    "providerName": "ソフトバンク株式会社",
    "type": "home",
    "buildingType": "mansion",
    "carrier": "softbank",
    "monthlyFee": 5368,
    "cashback": 30000,
    "contractYear": 0,
    "maxSpeed": "2.1Gbps",
    "avgSpeed": "100Mbps",
    "features": [
      "工事不要・置くだけ",
      "データ容量無制限",
      "SoftBankスマホ割引"
    ],
    "points": [
      "工事ができない賃貸マンションでも、コンセントに挿すだけで使える",
      "データ容量無制限で動画も見放題",
      "SoftBank/Y!mobileユーザーならセット割が適用される"
    ],
    "badge": null,
    "rank": 5,
    "link": "https://px.a8.net/svt/ejp?a8mat=4AX6CF+7O968Q+3IB8+BZGEQ",
    "imageUrl": "data:image/png;base64,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",
    "description": "工事不可物件の救世主。Airターミナル5になり5G対応で速度も向上。SoftBankユーザーにおすすめ。"
  },
  {
    "id": 106,
    "name": "ビッグローブ光 マンション",
    "providerName": "ビッグローブ株式会社",
    "type": "fiber",
    "buildingType": "mansion",
    "carrier": "au",
    "monthlyFee": 4378,
    "cashback": 40000,
    "contractYear": 3,
    "maxSpeed": "1Gbps",
    "avgSpeed": "260Mbps",
    "features": [
      "au・UQモバイルセット割",
      "IPv6対応",
      "移転工事費無料"
    ],
    "points": [
      "マンションでもauスマートバリュー・UQ自宅セット割が使える",
      "3年プランなら引っ越し時の工事費が何度でも無料",
      "IPv6オプションで夜間も快適通信"
    ],
    "badge": null,
    "rank": 6,
    "link": "https://px.a8.net/svt/ejp?a8mat=4AX5KH+11ICNU+3SPO+7LW1F7",
    "imageUrl": "data:image/png;base64,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",
    "description": "au/UQユーザーで、マンションがBBIQ非対応だった場合の有力候補。信頼性の高い老舗プロバイダ。"
  },
  {
    "id": 107,
    "name": "フレッツ光 マンション (プロバイダ選択型)",
    "providerName": "NTT西日本 / 各種プロバイダ",
    "type": "fiber",
    "buildingType": "mansion",
    "carrier": "all",
    "monthlyFee": 4500,
    "cashback": 5000,
    "contractYear": 2,
    "maxSpeed": "1Gbps",
    "avgSpeed": "200Mbps",
    "features": [
      "対応物件数No.1",
      "プロバイダ自由選択",
      "安定のNTT回線"
    ],
    "points": [
      "ほとんどのマンションに設備が導入されており、すぐに開通しやすい",
      "好みのプロバイダを選んで契約できる",
      "光コラボ（ドコモ光など）への転用もスムーズ"
    ],
    "badge": null,
    "rank": 7,
    "link": "https://px.a8.net/svt/ejp?a8mat=2ZPIWA+2KVNX6+1MWA+NUES1",
    "imageUrl": "data:image/png;base64,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",
    "description": "対応物件数が最も多い。プロバイダにこだわりがある方や、他の光回線が導入できなかった場合に。"
  }
];