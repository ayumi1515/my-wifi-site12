# しらべまとめ帳（鹿児島の光回線ほか）

Astro で作った、ページごとにでき上がったHTMLを出す（静的な）サイトです。
GitHub の `main` に入ると、Vercel が自動で組み立てて公開します。

## 料金などを直すとき（いちばんよく使う）

1. GitHub の画面で `src/data/providers.json` を開き、えんぴつのマーク（Edit）を押す
2. 直したい回線の `label`（表示する金額）と `note`（条件の説明）を書きかえる
3. **公式サイトで確かめた日を `checkedAt` に書く**（例 `"2026-12-01"`）。出典のURLは `sources` に
4. 下の「Commit changes」で保存 → 数分で公開されます

- 「最安」「No.1」「満足度」などは、はっきりした根拠がない限り書かない（景品表示法）
- まだ確かめられない回線は `"published": false` にすると、ページから消えます（例：auひかり）
- おすすめの順番は `order`（`house`＝戸建て、`mansion`＝マンション）の数字が小さい順

## ファイルの場所

| 何を | どこ |
|---|---|
| 回線の料金・説明・広告リンク | `src/data/providers.json` |
| 選び方・比較ガイド | `src/data/guides-*.json` |
| 通信以外の広告リンク | `src/data/offers.json` |
| 地域ページの文章 | `src/data/areas.json` |
| よくある質問 | `src/data/faqs.json` |
| サイト名・アドレス・問い合わせフォーム | `src/site.config.mjs` |
| ページの作り | `src/pages/` |

## A8.net の広告タグを入れるとき

A8 のタグ（`<a href=...><img ...></a><img ...>`）は、そのまま貼らずに、次で `affiliate` の形に直してから `providers.json` に入れます。

```bash
node scripts/a8-to-json.mjs '<A8のタグをそのまま貼る>'
```

出てきた `label` の「〇〇」をサービス名に直してください。
リンクは自動で `rel="sponsored"`（広告リンクの印）つきで出ます。
**入れる前に、リンク先が本当にそのサービスの申込み窓口かを確かめてください。**

## パソコンで確かめるとき

```bash
npm install
npm run check-data   # データの点検（確認日・出典・言いすぎの言葉）
npm run build        # 組み立て
npm run preview      # http://localhost:4321 で見る
```

## 選び方ガイドを更新するとき

`guides-*.json` の記事は `/guides/` とトップへ自動で掲載されます。各記事に確認日・公式出典を記録し、関連記事の slug と関連サービスの id を実在するものへそろえてください。通信以外の広告は `offers.json` の `guideSlugs` で掲載先を指定します。無料体験の対象プランと広告先を一致させ、計測用画像を含めてA8の発行リンクを保持してください。
