# デザインガイドライン

このドキュメントは、hidetaka.devのデザインリニューアルにおける決定事項とデザイン原則をまとめたものです。

## デザイン原則

### 1. ゼロベースアプローチ
- 既存のデザインパターンに依存せず、各セクションをゼロベースで設計する
- コンテンツと情報構造を再考し、最適な提示方法を選択する
- プロフェッショナルな開発者ポートフォリオサイトとしての洗練されたデザインを目指す

### 2. ファーストビュー最適化
- Heroセクションはファーストビューに収まるように設計する
- 冗長な情報は避け、重要なメッセージに焦点を当てる
- 縦長のレイアウトは避け、横長のコンパクトなレイアウトを採用する

### 3. プロフェッショナルな印象
- 適度な装飾と洗練されたデザインのバランスを保つ
- 「洗練されている」と「素っ気ない」の違いを理解し、適切な装飾を追加する
- 開発者のポートフォリオサイトとして信頼感を与えるデザイン

## カラーパレット

### プライマリカラー
- **Indigo**: `indigo-600`, `indigo-700` - アクセントカラーとして使用
- **Slate**: `slate-900`, `slate-700`, `slate-600` - テキストカラーとして使用
- **White**: `white` - 背景とコントラストとして使用

### セカンダリカラー
- **Purple**: `purple-200`, `purple-300` - グラデーションの補助色
- **Cyan**: `cyan-200`, `cyan-300` - グラデーションの補助色
- **Zinc**: `zinc-800`, `zinc-900` - ダークモード用

### 背景色
- **Heroセクション**: `bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/30`
- **セクション背景**: `bg-white` (ライトモード), `bg-zinc-900` (ダークモード)

### グラデーション
- **背景装飾**: 複数のblurされた円形グラデーションを使用
  - Indigo: `bg-indigo-200/50 blur-3xl`
  - Purple: `bg-purple-200/40 blur-3xl`
  - Cyan: `bg-cyan-200/30 blur-3xl`

## タイポグラフィ

### 見出し
- **H1 (Hero)**: `text-5xl sm:text-6xl lg:text-7xl font-extrabold`
- **H2 (セクションタイトル)**: `text-3xl font-bold sm:text-4xl`
- **H3 (カードタイトル)**: `text-xl font-semibold` または `text-lg font-semibold`

### 本文
- **リードテキスト**: `text-lg leading-relaxed`
- **本文**: `text-base leading-relaxed` または `text-sm leading-6`
- **キャプション**: `text-sm` または `text-xs`

### フォントウェイト
- **見出し**: `font-extrabold`, `font-bold`, `font-semibold`
- **本文**: `font-medium`, `font-normal`
- **ラベル**: `font-semibold`, `font-medium`

### トラッキング
- **大見出し**: `tracking-tight`
- **ラベル**: `tracking-wider`, `tracking-widest` (uppercase)

## スペーシング

### セクション間
- **Hero**: `py-24 sm:py-32 lg:py-40`
- **通常セクション**: `py-24 sm:py-32`
- **コンパクトセクション**: `py-20 sm:py-24`

### コンテナ
- **最大幅**: `max-w-7xl`
- **パディング**: `px-6 sm:px-8 lg:px-12`

### 要素間
- **大きな要素間**: `gap-16 lg:gap-20`
- **中程度の要素間**: `gap-8`, `gap-10`, `gap-12`
- **小さな要素間**: `gap-4`, `gap-6`

## レイアウト

### Heroセクション
- **レイアウト**: 横長の2カラムレイアウト（`lg:flex-row`）
- **画像配置**: 右側に配置（`lg:order-first`は使用しない）
- **コンテンツ幅**: `lg:max-w-2xl`
- **画像サイズ**: `lg:w-96`, `max-w-sm`

### セクション構造
- **コンテナ**: `Container`コンポーネントを使用
- **中央揃え**: セクションタイトルと説明は中央揃え（`text-center`）
- **グリッド**: カードレイアウトは`grid`を使用

## コンポーネントデザイン

### Heroセクション
- **背景**: グラデーション背景 + 複数のblurグラデーション + グリッドパターン
- **ロールラベル**: 丸いバッジスタイル、アニメーション付きドット
- **CTAボタン**: `indigo-600`背景、白テキスト、シャドウ、ホバー時にスケール
- **プロフィール画像**: 丸みのある角、グローエフェクト、白いボーダー

### カードコンポーネント
- **ボーダー**: `border-zinc-200` (ライト), `border-zinc-800` (ダーク)
- **背景**: `bg-white` (ライト), `bg-zinc-900` (ダーク)
- **ホバー**: `hover:shadow-md` でシャドウを追加
- **角丸**: `rounded-lg` または `rounded-2xl`

### ボタン
- **プライマリ**: `bg-indigo-600`, `text-white`, `shadow-lg`
- **セカンダリ**: `border`, `bg-white`, `text-zinc-900`
- **ホバー**: `hover:scale-105`, `hover:shadow-xl`

## 装飾要素

### 背景装飾
- **グラデーション**: 複数のblurされた円形グラデーションを配置
- **グリッドパターン**: 控えめなグリッドパターンをオーバーレイ
- **透明度**: 装飾は控えめに（`/40`, `/50`程度）

### アニメーション
- **パルス**: ロールラベルのドットに`animate-pulse`
- **ホバー**: `hover:scale-105`, `hover:translate-x-1`
- **トランジション**: `transition-all`, `transition-transform`

### シャドウ
- **カード**: `shadow-sm`, `hover:shadow-md`
- **ボタン**: `shadow-lg`, `hover:shadow-xl`
- **画像**: `shadow-2xl`

## 画像デザイン

### プロフィール画像
- **形状**: 丸みのある角（`rounded-3xl`）
- **ボーダー**: `border-4 border-white/90`
- **グロー**: 複数のblurグラデーションでグローエフェクト
- **サイズ**: `aspect-square`, `max-w-sm`

## インタラクション

### ホバーエフェクト
- **ボタン**: スケール + シャドウ強化
- **リンク**: カラー変更（`hover:text-indigo-600`）
- **カード**: シャドウ追加（`hover:shadow-md`）

### トランジション
- **デュレーション**: `transition-all` または `transition-transform`
- **タイミング**: デフォルト（`duration-200`または`duration-300`）

## レスポンシブデザイン

### ブレークポイント
- **sm**: `640px`
- **lg**: `1024px`

### モバイル
- **レイアウト**: 縦積み（`flex-col`）
- **タイポグラフィ**: 小さめのサイズ
- **スペーシング**: コンパクトに

### デスクトップ
- **レイアウト**: 横並び（`lg:flex-row`）
- **タイポグラフィ**: 大きなサイズ
- **スペーシング**: 広めに

## ダークモード

### 背景色
- **セクション**: `dark:bg-zinc-900`, `dark:bg-zinc-950`
- **カード**: `dark:bg-zinc-900`

### テキスト
- **見出し**: `dark:text-white`
- **本文**: `dark:text-zinc-400`, `dark:text-slate-400`

### ボーダー
- **カード**: `dark:border-zinc-800`
- **ボタン**: `dark:border-zinc-700`

## コンテンツ構造

### Heroセクション
1. ロールラベル（バッジ形式）
2. 名前（H1）
3. タグライン（価値提案）
4. 説明文
5. CTAボタン + ソーシャルリンク
6. プロフィール画像（右側）

### 情報の優先順位
1. **価値提案** - 何を提供できるか
2. **専門性** - どの技術領域に強いか
3. **実績** - 過去の経験と成果
4. **連絡先** - CTAとソーシャルリンク

## 実装例

### Heroセクションの基本構造
```tsx
<section className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/30">
  {/* Background decoration */}
  <div className="absolute inset-0 overflow-hidden">
    {/* Blur gradients */}
  </div>
  
  {/* Grid pattern */}
  <div className="absolute inset-0 bg-[linear-gradient(...)]" />
  
  <div className="relative mx-auto max-w-7xl px-6 py-24">
    {/* Content */}
  </div>
</section>
```

### カードコンポーネントの基本構造
```tsx
<article className="group border border-zinc-200 bg-white p-8 transition-shadow hover:shadow-md">
  {/* Card content */}
</article>
```

## 注意事項

1. **過度な装飾を避ける** - プロフェッショナルな印象を保つ
2. **一貫性を保つ** - カラーパレットとスペーシングを統一
3. **アクセシビリティ** - コントラスト比とフォーカス状態に注意
4. **パフォーマンス** - アニメーションは控えめに、必要最小限に

## 更新履歴

- 2024年: デザインリニューアル - Heroセクションをゼロベースで再設計

