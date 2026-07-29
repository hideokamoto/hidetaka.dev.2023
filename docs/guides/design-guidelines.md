# デザインガイドライン — 折衷 (Setchū)

このドキュメントは、hidetaka.dev の現行デザインシステム **折衷 (Setchū) / Palette 05「和紙と墨」** の決定事項とデザイン原則をまとめたものです。

> トークンの正本は `src/styles/setchu.css`（CSS 変数）と `tailwind.config.cjs`（Tailwind スケールへのマッピング）です。色や書体を変更する場合は、まずこの 2 ファイルを更新してください。

## コンセプト

和紙と墨のニュートラルを土台に、**藍青 (あいあお)** を主役、**松葉緑** と **山吹** を少量のアクセントに。スライド・Web・アプリで一貫して使えるトークン一式です。

**緑と黄は「差し色」に留めるのがこの配色を静かに保つ鍵。** 3 色を均等に使うと途端に賑やかになります。

### 配色バランスの目安

| 役割 | 比率 | 使いどころ |
|------|------|-----------|
| ニュートラル（和紙） | 約 65% | 背景・面を広く取る |
| 藍青（主役） | 約 25% | 見出し・主要ボタン・リンク・エキスパートラベル |
| 松葉緑・山吹（差し色） | 約 10% | タグ・強調・ステータスなど一点集中 |

**避けたいこと:** 緑と山吹を同じ画面で大面積に併用しない。

## デザイン原則

### 1. 静けさ (Calm)
- 装飾は控えめに。ネオン的なグロー・鮮やかなグラデーションは使わない
- 影は墨色で薄く（`--rvt-shadow-cta` / `--rvt-shadow-cta-hover`）
- 余白を広く取り、コンテンツを呼吸させる

### 2. 編集的な佇まい (Editorial)
- 見出しは明朝体（Shippori Mincho）で品よく
- 情報の階層を明快に。ラベルは等幅（mono）で小さく添える

### 3. プロフェッショナルな信頼感
- 「洗練されている」と「素っ気ない」の違いを理解し、適切な装飾を加える
- 開発者ポートフォリオとして信頼感を与えるデザイン

## カラートークン

CSS 変数（`--rvt-*`）を正本とし、Tailwind のユーティリティは `tailwind.config.cjs` でこのパレットにマッピングしています（`indigo-*` → 藍青、`zinc/slate/gray-*` → 和紙、`green-*` → 松葉緑、`yamabuki-*` → 山吹）。

### ライト

| 役割 | HEX | トークン |
|------|-----|---------|
| 背景（和紙） | `#F5F2EC` | `--rvt-bg` |
| サーフェス（面） | `#FFFFFF` | `--rvt-bg2` |
| テキスト（墨） | `#23262B` | `--rvt-fg` |
| 副次テキスト | `#565A61` | `--rvt-fg2` |
| ミュート | `#7B7E82` | `--rvt-fg3` |
| ボーダー | `#E4DED2` | `--rvt-border` |
| プライマリ 藍青 | `#2F5375` | `--rvt-accent` |
| セカンダリ 松葉緑 | `#3E7A55` | `--rvt-secondary` |
| アクセント 山吹 | `#E0A63C` | `--rvt-accent-gold` |

### ダーク

| 役割 | HEX | トークン |
|------|-----|---------|
| 背景 | `#16181C` | `--rvt-bg` |
| サーフェス | `#1F2228` | `--rvt-bg2` |
| テキスト | `#E9E7DF` | `--rvt-fg` |
| ミュート | `#8B8E93` | `--rvt-fg3` |
| ボーダー | `#2E3138` | `--rvt-border` |
| プライマリ 藍青 | `#6E9BC0` | `--rvt-accent` |
| セカンダリ 松葉緑 | `#6FB088` | `--rvt-secondary` |
| アクセント 山吹 | `#ECBE56` | `--rvt-accent-gold` |

## タイポグラフィ

| 用途 | フォント | 指定 |
|------|---------|------|
| 見出し・ディスプレイ | **Shippori Mincho**（明朝） | `var(--rvt-font-display)` / `font-display` |
| 本文 | **Zen Kaku Gothic New**（ゴシック） | `var(--rvt-font-body)` / 既定の `body` |
| コード・ラベル | **SF Mono / ui-monospace** | `var(--rvt-font-mono)` / `font-mono` |

### 見出し
- **H1 (Hero)**: 明朝、`clamp(2.5rem, 5vw, 4rem)`、`font-weight: 700`、`tracking-tight`
- **H2 (セクション)**: `text-3xl sm:text-4xl`、明朝
- **H3 (カード)**: `text-xl` / `text-lg`、明朝

### 本文・ラベル
- **リード**: `text-lg leading-relaxed`
- **本文**: `text-base leading-relaxed`（`--rvt-fg2`）
- **ラベル / eyebrow**: 等幅・大文字・`tracking-wider`、藍青（`--rvt-accent`）

## スペーシング / レイアウト

- **最大幅**: `max-w-7xl`
- **パディング**: `px-6 sm:px-8 lg:px-12`
- **セクション間**: `py-24 sm:py-32`（Hero は `lg:py-40`）
- **カードグリッド**: `grid`、要素間は `gap-6`〜`gap-12`
- **Hero**: 横長 2 カラム（`lg:flex-row`）、画像は右

## コンポーネント

### ボタン
- **プライマリ**: 藍青背景（`indigo-600`）＋ 白文字、薄い影、`hover:scale-105`
- **セカンダリ**: 和紙面＋ボーダー、`text-*-900`
- 定義は `src/libs/componentStyles.utils.ts`（`getCTAButtonStyles` 等）

### タグ / バッジ
- `default`（和紙）/ `indigo`（藍青）/ `gold`（山吹）
- 差し色（`gold`）は一点強調に留める

### カード
- 背景 `bg-white`（ライト）/ `dark:bg-zinc-900`（＝ダークのサーフェス）
- ボーダー `--rvt-border`、`rounded-lg`〜`rounded-2xl`
- ホバーは `hover:shadow-md` 程度

### 装飾
- Hero の径向グラデーション（オーブ）は `--rvt-accent-glow` / `--rvt-accent2` を用い、ごく淡く
- ダークモードのみ、極薄のグリッド（`.rvt-grid-bg`）で紙面のテクスチャを添える

## ダークモード

- `class` ストラテジ。`documentElement` に `.dark` を付与（`DarkModeScript` / `ModeToggle` が `prefers-color-scheme` に追従）
- 全ての色は `--rvt-*` トークン経由で自動的に切り替わる

## アクセシビリティ

- 本文テキスト（`--rvt-fg2`）は和紙背景で AA を確保
- フォーカスリングは藍青（`--rvt-accent`）
- `prefers-reduced-motion` を尊重（`globals.css`）

## 注意事項

1. **差し色を守る** — 松葉緑・山吹を大面積に使わない
2. **静けさを保つ** — 過度な装飾・強いグローを避ける
3. **トークン経由で色を使う** — 直値の HEX ではなく `--rvt-*` / Tailwind スケールを使う
4. **一貫性** — カラー・スペーシング・書体を統一

## 更新履歴

- 2026: 折衷 (Setchū / Palette 05「和紙と墨」) へ刷新。Revtrona Design System を置き換え、明朝＋ゴシックの書体と藍青主役のパレットを導入
