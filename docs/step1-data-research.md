# Step 1: データ収集調査結果

調査日: 2026-03-28

## 調査対象

すかいらーくグループのアレルギー情報サイト（`allergy.skylark.co.jp`）

## 主要な発見

### 1. データソース

すかいらーくグループは専用のアレルギー情報サイトを運営している。

- **URL**: `https://allergy.skylark.co.jp/`
- **アレルゲン一覧表URL**: `https://allergy.skylark.co.jp/chart?brand={BRAND_CODE}&shop=&usage={USAGE_TYPE}`
- **アレルゲン検索URL**: `https://allergy.skylark.co.jp/allergen?brand={BRAND_CODE}&usage={USAGE_TYPE}`
- **利用シーンURL**: `https://allergy.skylark.co.jp/scene_irregular?brand={BRAND_CODE}`

### 2. データ構造

**アレルゲン一覧表（chartページ）のHTMLテーブル構造:**

```
カラム: [商品名, そば, 落花生, 小麦, 卵, 乳, えび, かに, くるみ]
値:     ● = 含む / ー = 含まない
```

- 特定原材料8品目のみ（そば、落花生、小麦、卵、乳、えび、かに、くるみ）
- 特定原材料に準ずる20品目は一部ブランドのみ公開（バーミヤンは8品目のみ確認）
- カテゴリごとにテーブルが分かれている
- 各テーブルは2つずつ存在する（レスポンシブ表示用の複製。偶数インデックスのみ取得すればOK）

### 3. バーミヤン（brand=170001）の詳細

**利用シーン（usage）:**
- `usage=1`: 店内メニュー
- テイクアウト、宅配メニューも存在

**カテゴリ構成（店内メニュー）:**

| カテゴリ | メニュー数 |
|---------|-----------|
| ランチ | 22 |
| 定食 | 7 |
| 点心/餃子 | 8 |
| 冷菜 | 4 |
| 北京ダック/揚げ物 | 8 |
| 主菜/中華小皿 | 38 |
| 麺 | 25 |
| 飯 | 11 |
| デザート | 12 |
| キッズ | 8 |
| セット/ライス | 13 |

**合計: 155品目（ユニーク）**

**データ例（濃厚担々麺）:**

| 商品名 | そば | 落花生 | 小麦 | 卵 | 乳 | えび | かに | くるみ |
|-------|------|--------|------|-----|-----|------|------|--------|
| 濃厚担々麺 | ー | ● | ● | ● | ● | ー | ー | ー |

→ 落花生（ピーナッツ）が含まれていることが確認できた。

### 4. バックエンド構成

- **REST APIは存在しない** — データはサーバーサイドレンダリングされたHTMLに埋め込まれている
- ネットワークリクエストはGoogle Analytics等のトラッキングのみ
- JavaScriptフレームワーク（SPA）で構築されており、通常のHTTP GETではデータ取得不可
- **Playwrightなどのヘッドレスブラウザによるスクレイピングが必要**

### 5. すかいらーくグループ全ブランド一覧

**ブランドコード（brand別にURLアクセスするためのコード）:**

| ブランド名 | ブランドコード | アクセス方式 |
|-----------|--------------|-------------|
| ガスト | 010016 | brand= |
| バーミヤン | 170001 | brand= |
| しゃぶ葉 | 190010 | brand= |
| 夢庵 | 130002 | brand= |
| ジョナサン | 020001 | brand= |
| ステーキガスト | 010042 | brand= |
| むさしの森珈琲 | 190011 | brand= |
| から好し | 010221 | brand= |
| 藍屋 | 130001 | brand= |
| La Ohana | 190012 | brand= |
| とんから亭 | 010217 | brand= |
| chawan | 010207 | brand= |
| 魚屋路 | 010006 | brand= |
| 桃菜 | 010046 | brand= |
| グラッチェガーデンズ | 010035 | brand= |
| 八郎そば | — | shop=131011 |
| ゆめあん食堂 | — | shop=131001 |
| 三○三 | — | shop=130489 |

※ 八郎そば、ゆめあん食堂、三○三は個店単位のアクセス（shop=）
※ ニラックス、トマトアンドアソシエイツ、フロジャポン、資さんは各社HPで確認

### 6. 免責・注意事項（公式記載）

1. メニューが同じでも予告なしに原材料が変更になる場合がある
2. 顧客が選ぶ商品（小鉢、ソース、ドレッシング等）はアレルギー情報に含まれない
3. 調理器具・食器・揚げ油・衣は共有 → コンタミ（意図しない混入）の可能性
4. 麺類（そば含む）は同じ釜で調理
5. ドリンクバー・アルコールはアレルギー情報非公開
6. 一部海産物はえび・かにが混ざる漁法で採取

## スクレイピング戦略

### 推奨手法

**Playwright（ヘッドレスブラウザ）によるスクレイピング**

1. `allergy.skylark.co.jp/chart?brand={code}&usage=1` にアクセス
2. JavaScriptのレンダリングを待機
3. HTMLテーブルからデータを抽出
4. 偶数インデックスのテーブルのみ取得（奇数はレスポンシブ複製）
5. 各テーブルの親要素からカテゴリ名を取得
6. CSV/JSON形式で保存

### スクレイピング対象URL一覧（すかいらーく全ブランド）

```
https://allergy.skylark.co.jp/chart?brand=010016&usage=1  # ガスト
https://allergy.skylark.co.jp/chart?brand=170001&usage=1  # バーミヤン
https://allergy.skylark.co.jp/chart?brand=190010&usage=1  # しゃぶ葉
https://allergy.skylark.co.jp/chart?brand=130002&usage=1  # 夢庵
https://allergy.skylark.co.jp/chart?brand=020001&usage=1  # ジョナサン
https://allergy.skylark.co.jp/chart?brand=010042&usage=1  # ステーキガスト
https://allergy.skylark.co.jp/chart?brand=190011&usage=1  # むさしの森珈琲
https://allergy.skylark.co.jp/chart?brand=010221&usage=1  # から好し
https://allergy.skylark.co.jp/chart?brand=130001&usage=1  # 藍屋
https://allergy.skylark.co.jp/chart?brand=190012&usage=1  # La Ohana
https://allergy.skylark.co.jp/chart?brand=010217&usage=1  # とんから亭
https://allergy.skylark.co.jp/chart?brand=010207&usage=1  # chawan
https://allergy.skylark.co.jp/chart?brand=010006&usage=1  # 魚屋路
https://allergy.skylark.co.jp/chart?brand=010046&usage=1  # 桃菜
https://allergy.skylark.co.jp/chart?brand=010035&usage=1  # グラッチェガーデンズ
```

### 技術的な注意点

- SPAのため、`fetch`/`requests`等の単純なHTTPリクエストではデータ取得不可
- Playwright or Puppeteer が必須
- テーブルは偶数indexのみ（奇数はレスポンシブ用の複製）
- 各ブランドで `usage=1`（店内）, `usage=2`（テイクアウト）, `usage=3`（宅配）の3パターンが想定される
- レート制限に注意（適度な待機を入れる）

## 次のステップ（Step 2へ）

1. 技術スタック選定（React Native / Flutter）
2. DB設計（メニュー、ブランド、アレルゲンのスキーマ）
3. スクレイピングスクリプト作成
4. 画面フロー設計・UIデザイン
