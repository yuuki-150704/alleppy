# Step 2: アプリケーション設計書

設計日: 2026-03-28
改訂: 案B（完全0円・PWAファースト）に変更

---

## 1. 技術スタック

### 設計方針

**AI費用以外は完全0円**で開発・デプロイ・運用する。

### 全体アーキテクチャ

```
┌──────────────────────────────────────────────┐
│              PWA（Webアプリ）                    │
│  React Native (Expo Web) + TypeScript          │
│  ┌──────────┐  ┌────────────────────┐         │
│  │ Expo     │  │ バンドル済みJSON     │         │
│  │ Router   │  │ (アレルゲンデータ)   │         │
│  └──────────┘  └────────────────────┘         │
│  ┌──────────┐  ┌────────────────────┐         │
│  │ Service  │  │ localStorage       │         │
│  │ Worker   │  │ (ユーザー設定)      │         │
│  └──────────┘  └────────────────────┘         │
│  オフライン完全動作                              │
└──────────────────────────────────────────────┘
                    │ デプロイ（0円）
┌───────────────────┼──────────────────────────┐
│         Vercel or GitHub Pages                 │
│         （無料ホスティング）                     │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│        データ更新パイプライン                    │
│  ┌──────────────────────────┐                │
│  │ Playwright スクレイパー    │  ← ローカル実行  │
│  │ allergy.skylark.co.jp    │                │
│  └────────────┬─────────────┘                │
│               ▼                              │
│  ┌──────────────────────────┐                │
│  │ JSONファイル出力           │  → git commit  │
│  │ data/brands/bamiyan.json │  → デプロイ     │
│  └──────────────────────────┘                │
└──────────────────────────────────────────────┘
```

### 選定理由

| 技術 | 選定 | 理由 | 費用 |
|------|------|------|------|
| フレームワーク | React Native (Expo Web) | TypeScript対応、Web/ネイティブ両対応 | 0円 |
| ルーティング | Expo Router | ファイルベースルーティング | 0円 |
| データ管理 | バンドル済みJSON | バックエンド不要、オフライン完全動作 | 0円 |
| ユーザーデータ | localStorage (AsyncStorage) | 認証不要、ローカル完結 | 0円 |
| オフライン | Service Worker | PWAオフラインキャッシュ | 0円 |
| デプロイ | Vercel（無料枠） | 自動デプロイ、カスタムドメイン不要 | 0円 |
| スクレイピング | Playwright (Node.js) | SPA対応必須 | 0円 |
| 多言語 | i18n-js | 軽量（将来） | 0円 |
| 言語 | TypeScript | 型安全、AI開発支援が最強 | 0円 |

### 不採用の選択肢と理由

| 技術 | 不採用理由 |
|------|-----------|
| Supabase | 0円制約のため。将来のスケール時に導入検討 |
| expo-sqlite | Web（PWA）では動作しない |
| ネイティブアプリ（App Store/Google Play） | ストア公開費用が必要（Apple $99/年、Google $25） |
| Flutter | DartはAI支援がTSほど強くない |
| Firebase | 0円制約のため。無料枠はあるが将来の課金リスク |

### 0円の内訳

| サービス | 無料枠 | 十分？ |
|---------|--------|--------|
| Vercel | 100GB帯域/月、自動デプロイ | MVP十分 |
| GitHub | 公開リポジトリ無制限 | 十分 |
| GitHub Actions | 公開リポジトリ無料（2000分/月） | 十分 |
| Playwright | OSS、無料 | 十分 |
| Expo | OSS、無料 | 十分 |

---

## 2. データ設計

### 2.1 設計方針

SQLデータベースは使わない。代わりに：
- **アレルゲンデータ**: JSONファイルとしてアプリにバンドル
- **ユーザー設定**: localStorage（AsyncStorage）
- **フィルタリング**: JavaScriptの配列操作（データが小さいため十分高速）

### 2.2 JSONデータ構造

#### アレルゲンマスタ（`data/allergens.json`）

```json
[
  { "id": 1, "nameJa": "そば", "nameEn": "Buckwheat", "category": "mandatory", "displayOrder": 1 },
  { "id": 2, "nameJa": "落花生", "nameEn": "Peanut", "category": "mandatory", "displayOrder": 2 },
  { "id": 3, "nameJa": "小麦", "nameEn": "Wheat", "category": "mandatory", "displayOrder": 3 },
  { "id": 4, "nameJa": "卵", "nameEn": "Egg", "category": "mandatory", "displayOrder": 4 },
  { "id": 5, "nameJa": "乳", "nameEn": "Milk", "category": "mandatory", "displayOrder": 5 },
  { "id": 6, "nameJa": "えび", "nameEn": "Shrimp", "category": "mandatory", "displayOrder": 6 },
  { "id": 7, "nameJa": "かに", "nameEn": "Crab", "category": "mandatory", "displayOrder": 7 },
  { "id": 8, "nameJa": "くるみ", "nameEn": "Walnut", "category": "mandatory", "displayOrder": 8 }
]
```

#### ブランドデータ（`data/brands.json`）

```json
[
  {
    "id": "bamiyan",
    "nameJa": "バーミヤン",
    "nameEn": "Bamiyan",
    "brandCode": "170001",
    "groupName": "すかいらーくグループ",
    "sourceUrl": "https://allergy.skylark.co.jp/chart?brand=170001&usage=1",
    "usageTypes": [
      { "id": 1, "nameJa": "店内メニュー", "nameEn": "Dine-in" },
      { "id": 2, "nameJa": "テイクアウト", "nameEn": "Takeout" },
      { "id": 3, "nameJa": "宅配メニュー", "nameEn": "Delivery" }
    ],
    "lastScrapedAt": "2026-03-28T00:00:00Z"
  }
]
```

#### メニュー＋アレルゲンデータ（`data/menus/bamiyan-1.json`）

ブランドID + 利用シーンID（例: `bamiyan-1` = バーミヤン店内メニュー）

```json
{
  "brandId": "bamiyan",
  "usageType": 1,
  "scrapedAt": "2026-03-28T00:00:00Z",
  "categories": [
    {
      "id": "lunch",
      "nameJa": "ランチ",
      "displayOrder": 1,
      "items": [
        {
          "id": "bamiyan-1-001",
          "nameJa": "【日替わりランチ】からあげの甘酢あんかけランチ【スープ除く】",
          "allergens": {
            "そば": false,
            "落花生": false,
            "小麦": true,
            "卵": false,
            "乳": true,
            "えび": false,
            "かに": false,
            "くるみ": false
          }
        },
        {
          "id": "bamiyan-1-002",
          "nameJa": "濃厚担々麺",
          "allergens": {
            "そば": false,
            "落花生": true,
            "小麦": true,
            "卵": true,
            "乳": true,
            "えび": false,
            "かに": false,
            "くるみ": false
          }
        }
      ]
    }
  ]
}
```

**重要な設計判断**: アレルゲンは `true`/`false` を全8品目明示的に持つ。
理由: `false` を省略すると「データなし」と「含まない」の区別がつかない。命に関わるアプリでは「データなし ≠ 安全」を明確にする。

### 2.3 ユーザーデータ（localStorage）

```typescript
// localStorage のキー
const STORAGE_KEYS = {
  USER_ALLERGENS: 'alleppy_user_allergens',    // number[] — アレルゲンIDの配列
  LANGUAGE: 'alleppy_language',                 // string — "ja" | "en" | ...
  ONBOARDING_DONE: 'alleppy_onboarding_done',  // boolean
  RECENT_BRANDS: 'alleppy_recent_brands',       // string[] — ブランドIDの配列（最大5件）
  DISPLAY_MODE: 'alleppy_display_mode',         // "safe" | "danger" | "all"
} as const;

// 例: ユーザーが落花生(2)とそば(1)を登録
// localStorage: alleppy_user_allergens = [1, 2]
```

### 2.4 核心ロジック（3モードフィルタリング）

SQLの代わりにTypeScriptの配列操作で実装。データサイズが数百件なので十分高速。

```typescript
type MenuItem = {
  id: string;
  nameJa: string;
  allergens: Record<string, boolean>;
};

type FilterMode = 'safe' | 'danger' | 'all';

// ユーザーのアレルゲンIDリスト → アレルゲン名リストに変換
// 例: [1, 2] → ["そば", "落花生"]

function filterMenuItems(
  items: MenuItem[],
  userAllergenNames: string[],
  mode: FilterMode
): (MenuItem & { isDangerous: boolean })[] {

  const withDangerFlag = items.map(item => {
    const isDangerous = userAllergenNames.some(
      allergen => item.allergens[allergen] === true
    );
    return { ...item, isDangerous };
  });

  switch (mode) {
    case 'safe':
      return withDangerFlag.filter(item => !item.isDangerous);
    case 'danger':
      return withDangerFlag.filter(item => item.isDangerous);
    case 'all':
      return withDangerFlag;
  }
}
```

### 2.5 データ更新戦略

```
┌────────────────────────────────────────┐
│        データ更新フロー（0円）            │
│                                        │
│  1. ローカルでPlaywrightスクレイパー実行  │
│     └→ JSON出力 → data/ に保存          │
│                                        │
│  2. git commit & push                  │
│     └→ Vercelが自動デプロイ             │
│                                        │
│  3. ユーザーはブラウザリロードで最新取得   │
│     └→ Service Workerが新データを検出    │
│     └→ 「更新があります」バナー表示       │
│                                        │
│  ※ 将来的にGitHub Actions cronで自動化  │
│    可能（公開リポジトリなら0円）           │
└────────────────────────────────────────┘
```

---

## 3. 画面フロー設計

### 3.1 画面遷移図

```
                    ┌──────────────┐
                    │ スプラッシュ   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │ 初回起動    │ 2回目以降   │
              ▼            │            ▼
     ┌────────────┐        │   ┌──────────────┐
     │ 言語選択    │        │   │ ホーム画面    │
     └──────┬─────┘        │   │ （ブランド    │
            ▼              │   │  一覧/検索）  │
     ┌────────────┐        │   └──────┬───────┘
     │ アレルギー   │        │          │
     │ 登録       │────────┘          │
     └──────┬─────┘                   │
            ▼                         ▼
     ┌──────────────┐        ┌──────────────┐
     │ ホーム画面    │───────→│ ブランド      │
     │              │        │ メニュー画面   │
     └──────────────┘        └──────┬───────┘
            │                       │
            │                       ▼
            │                ┌──────────────┐
            │                │ メニュー      │
            │                │ 詳細画面      │
            │                └──────────────┘
            │
            ▼
     ┌──────────────┐
     │ 設定画面      │
     │ ・アレルギー編集│
     │ ・言語変更     │
     │ ・免責事項     │
     └──────────────┘
```

### 3.2 ナビゲーション構造

**ボトムタブ（2タブ）:**
- ホーム（ブランド検索・一覧）
- 設定（アレルギー・言語）

将来追加予定:
- AI検索（自然言語検索）
- お気に入り（よく見るメニュー/ブランド）

### 3.3 各画面の詳細設計

#### 画面1: スプラッシュ画面
- Alleppyロゴ表示
- 初回/2回目以降の分岐判定（localStorageの `onboarding_done` で判定）

#### 画面2: 言語選択（オンボーディング）
- 日本語 / English / 中文 / 한국어
- MVP時は日本語のみ、他は「Coming Soon」表示

#### 画面3: アレルギー登録（オンボーディング）

```
┌──────────────────────────┐
│   あなたのアレルギーを     │
│   教えてください          │
│                          │
│  ┌────┐ ┌────┐ ┌────┐  │
│  │    │ │    │ │    │  │
│  │えび │ │かに │ │落花生│  │
│  └────┘ └────┘ └─✅──┘  │  ← 選択状態
│  ┌────┐ ┌────┐ ┌────┐  │
│  │    │ │    │ │    │  │
│  │小麦 │ │ 卵 │ │ 乳 │  │
│  └────┘ └────┘ └────┘  │
│  ┌────┐ ┌────┐          │
│  │    │ │    │          │
│  │そば │ │くるみ│          │
│  └─✅─┘ └────┘          │  ← 選択状態
│                          │
│  [     登録する     ]    │
│       スキップ →         │
└──────────────────────────┘
```

- 8品目をアイコンで表示、タップで選択/解除（複数選択可）
- 「スキップ」可能（後から設定で登録可）
- 選択結果をlocalStorageに保存

#### 画面4: ホーム画面

```
┌──────────────────────────┐
│  Alleppy                 │
├──────────────────────────┤
│  🔍 ブランドを検索        │
├──────────────────────────┤
│  最近見たブランド          │
│  [バーミヤン] [ガスト]     │
├──────────────────────────┤
│  すかいらーくグループ      │
│  ┌──────────────────┐    │
│  │ ガスト            │    │
│  │ バーミヤン         │    │
│  │ しゃぶ葉           │    │
│  │ ジョナサン         │    │
│  │ ...               │    │
│  └──────────────────┘    │
├──────────────────────────┤
│  ホーム        設定      │  ← ボトムタブ
└──────────────────────────┘
```

#### 画面5: ブランドメニュー画面（最重要画面）

```
┌──────────────────────────┐
│ ← バーミヤン     店内 ▼  │
├──────────────────────────┤
│ [安全] [危険] [全表示]    │  ← 3モード切り替え
├──────────────────────────┤
│ ランチ│麺│飯│主菜│デザート│  ← カテゴリタブ
├──────────────────────────┤
│                          │
│ ┌──────────────────────┐ │
│ │ 武蔵野麻婆            │ │  ← 安全（通常表示）
│ │ 含有: 小麦             │ │
│ └──────────────────────┘ │
│                          │
│ ┌─── ⚠ ────────────────┐ │
│ │ 濃厚担々麺       危険  │ │  ← 危険（赤ボーダー）
│ │ ⚠落花生  小麦 卵 乳   │ │  ← ユーザーのアレルゲン強調
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ 海老と白菜のあんかけ麺  │ │
│ │ 含有: 小麦 卵 乳 えび   │ │
│ └──────────────────────┘ │
│                          │
├──────────────────────────┤
│  ホーム        設定      │
└──────────────────────────┘
```

#### 画面6: メニュー詳細画面

```
┌──────────────────────────┐
│ ← 濃厚担々麺             │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ ⚠ あなたのアレルギー   │ │  ← 赤背景の警告バナー
│ │   （落花生）が         │ │
│ │   含まれています       │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│  アレルゲン情報（8品目）   │
│                          │
│  ○ そば      含まない    │
│  ⚠ 落花生    含む ←!!   │  ← 赤字 + 強調
│  ⚠ 小麦     含む        │
│  ⚠ 卵       含む        │
│  ⚠ 乳       含む        │
│  ○ えび      含まない    │
│  ○ かに      含まない    │
│  ○ くるみ    含まない    │
│                          │
├──────────────────────────┤
│ この情報はバーミヤン       │
│ 公式データ(2026/03/28時点)│
│ に基づいています。        │
│ 店舗でもご確認ください。   │
├──────────────────────────┤
│ 公式アレルギー情報 →      │  ← 公式サイトへのリンク
└──────────────────────────┘
```

#### 画面7: 設定画面
- アレルギー編集
- 言語変更（将来）
- 免責・注意事項
- バージョン情報
- データ更新日時表示

### 3.4 UI設計原則

**原則1: ゼロステップフィルタリング**
- アレルギーを1回登録すれば、以降は自動フィルタ
- 「毎回アレルギーを選択 → 検索」という手間を完全排除

**原則2: 視覚的な即座の判断**
- 安全な料理: 通常表示（白/グレー背景）
- 危険な料理: 赤色ボーダー + ⚠アイコン + 含有アレルゲン表示
- 色覚障害配慮: 色だけでなくアイコン + テキストでも区別

**原則3: 最少タップ数**
- ホーム → ブランド → メニュー = 最短2タップ
- 最近見たブランドからは1タップ

---

## 4. プロジェクト構成

```
alleppy/
├── docs/                           # ドキュメント
│   ├── planning.md
│   ├── step1-data-research.md
│   └── step2-design.md
├── data/                           # アレルゲンデータ（JSON）
│   ├── allergens.json              # アレルゲンマスタ（8品目）
│   ├── brands.json                 # ブランド一覧
│   └── menus/                      # ブランド別メニュー
│       ├── bamiyan-1.json          # バーミヤン店内
│       ├── bamiyan-2.json          # バーミヤンテイクアウト
│       └── ...
├── app/                            # Expo Router
│   ├── _layout.tsx                 # ルートレイアウト
│   ├── (tabs)/
│   │   ├── _layout.tsx             # タブレイアウト
│   │   ├── index.tsx               # ホーム画面
│   │   └── settings.tsx            # 設定画面
│   ├── brand/
│   │   └── [id].tsx                # ブランドメニュー画面
│   ├── menu/
│   │   └── [id].tsx                # メニュー詳細画面
│   └── onboarding/
│       ├── language.tsx            # 言語選択
│       └── allergens.tsx           # アレルギー登録
├── components/                     # 共通コンポーネント
│   ├── AllergenIcon.tsx
│   ├── MenuItemCard.tsx
│   ├── FilterToggle.tsx
│   ├── CategoryTabs.tsx
│   └── WarningBanner.tsx
├── lib/                            # ユーティリティ
│   ├── storage.ts                  # localStorage ラッパー
│   ├── filter.ts                   # フィルタリングロジック
│   └── i18n.ts                     # 多言語（将来）
├── hooks/                          # カスタムフック
│   ├── useAllergens.ts             # アレルゲンマスタ
│   ├── useMenuItems.ts             # メニュー検索・フィルタ
│   ├── useUserAllergens.ts         # ユーザーアレルギー設定
│   └── useBrands.ts                # ブランドデータ
├── types/                          # 型定義
│   └── index.ts                    # Brand, MenuItem, Allergen 等
├── constants/                      # 定数
│   └── colors.ts                   # カラーパレット
├── scripts/                        # スクレイピング
│   └── scraper/
│       ├── index.ts                # メインスクレイパー
│       └── skylark.ts              # すかいらーくグループ用
├── .claude/
│   └── CLAUDE.md
├── app.json                        # Expo設定
├── package.json
└── tsconfig.json
```

### 主要ライブラリ

| ライブラリ | 用途 | 費用 |
|-----------|------|------|
| expo ~52.x | Expoフレームワーク | 0円 |
| expo-router ~4.x | ファイルベースルーティング | 0円 |
| @react-native-async-storage/async-storage | localStorage互換ストレージ | 0円 |
| react-native-reanimated | アニメーション | 0円 |
| playwright (dev) | スクレイピング | 0円 |

**削除したライブラリ（案B移行で不要になったもの）:**
- ~~expo-sqlite~~ → JSONバンドルに変更
- ~~drizzle-orm~~ → SQL不要
- ~~@supabase/supabase-js~~ → バックエンド不要

---

## 5. MVPスコープ

### 含む（Step 3で実装）

| 機能 | 詳細 |
|------|------|
| アレルギー登録 | localStorage保存（認証不要） |
| ブランド一覧 | バーミヤン1社でテスト |
| メニュー一覧 | 3モードフィルタリング + カテゴリタブ |
| メニュー詳細 | 8品目のアレルゲン含有表示 |
| オフライン動作 | JSONバンドル + Service Worker |
| 免責表示 | 各画面に出典・ダブルチェック推奨 |
| PWAデプロイ | Vercelに無料デプロイ |

### 含まない（将来フェーズ）

| 機能 | フェーズ | 備考 |
|------|---------|------|
| 全チェーンデータ | Step 4 | スクレイピング対象を拡大 |
| 多言語対応 | Step 5 | i18n-js導入 |
| インバウンド課金 | Step 5 | 決済機能 |
| AI自然言語検索 | Step 6 | データ基盤完成後 |
| ネイティブアプリ化 | Step 7 | App Store/Google Play公開（費用発生） |
| ユーザー認証 | Step 7 | Supabase Auth導入 |

---

## 6. MVP開発プラン（Step 3の実装順序）

| Phase | 内容 | 想定時間 |
|-------|------|---------|
| 1 | プロジェクトセットアップ（Expo Web初期化、ライブラリ導入） | 30分 |
| 2 | スクレイピング（Playwrightでバーミヤンのデータ収集 → JSON出力） | 1-2時間 |
| 3 | データ層構築（型定義、JSONインポート、フィルタリングロジック、localStorage） | 1時間 |
| 4 | 画面実装（オンボーディング、ホーム、メニュー一覧、詳細、設定） | 2-4時間 |
| 5 | PWA対応（Service Worker、マニフェスト、オフラインキャッシュ） | 30分 |
| 6 | デプロイ（Vercelに接続、自動デプロイ設定） | 15分 |

**想定合計: AI活用で 5-8時間**

---

## 7. リスクと対策

| リスク | 影響 | 対策 |
|--------|------|------|
| スクレイピングがブロックされる | データ取得不可 | User-Agent設定、レート制限遵守。フォールバック: 手動入力 |
| メニュー変更への追従 | データが古くなる | 定期的にスクレイパー実行 → git push → 自動デプロイ。免責で「店舗確認推奨」|
| 法的リスク（著作権・利用規約） | サービス停止要請 | 出典明記、免責表示。フォールバック: 公式リンク方式 |
| PWAの制限（iOS Safari） | 一部機能制限 | 基本機能（表示・フィルタ）は全ブラウザで動作。プッシュ通知等は不使用 |
| データの正確性 | ユーザーの健康被害 | 免責+ダブルチェック推奨を必ず表示 |
| Vercel無料枠の超過 | サービス停止 | 初期はアクセス少ない。超過時はGitHub Pagesに移行（0円） |

---

## 8. 将来のネイティブアプリ移行パス

PWA → ネイティブアプリへの移行は、同じReact Nativeコードベースから可能。

```
Phase 1（現在）: Expo Web → PWA → Vercel（0円）
Phase 2（将来）: Expo Build → APK配布（Android、0円）
Phase 3（将来）: Apple Developer Program取得 → App Store公開（$99/年）
Phase 4（将来）: Google Play Developer取得 → Play Store公開（$25）
```

主な変更点:
- データ管理: JSONバンドル → expo-sqlite（ネイティブ化時）→ Supabase（スケール時）
- ストレージ: localStorage → AsyncStorage（自動互換）
- オフライン: Service Worker → expo-sqliteローカルDB
