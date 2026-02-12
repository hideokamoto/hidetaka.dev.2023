# WordPress URL to Blog Card

WordPress記事本文内の独立したURLを自動的にOGPブログカードに変換するモジュール。

## 概要

このモジュールは、WordPress REST APIから取得した記事本文HTML内の独立したURL（`<p>https://example.com</p>`形式）を検出し、iframeベースのOGPブログカードに変換します。

## 主な機能

- **URL検出**: 記事本文HTML内の独立したURLを正確に検出
- **除外処理**: リンクタグ内のURL、画像URL、自サイトURLを除外
- **ブログカード変換**: 検出されたURLをiframeタグに変換
- **サーバーサイド処理**: Next.jsサーバーコンポーネントで完結
- **パフォーマンス最適化**: 軽量な文字列処理のみ、遅延読み込み対応

## モジュール構成

- `types.ts` - TypeScript型定義
- `urlDetector.ts` - URL検出ロジック
- `blogCardTransformer.ts` - URL変換ロジック
- `TransformedBlogContent.tsx` - サーバーコンポーネント

## テスト

- Vitest + fast-checkによるユニットテストとプロパティベーステスト
- 包括的なカバレッジと正確性の検証
