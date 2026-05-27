# 要件定義書

## はじめに

本ドキュメントは、hidetaka.devポートフォリオサイト向けの包括的なCTA（Call-to-Action）コンポーネントシステムの要件を定義します。CTAコンポーネントは、記事コンテンツを読んだ後の読者に明確な次のアクションを提供することで、低いエンゲージメントスコア（平均4.3/10、ブログは2.4/10）という重大な課題に対処します。このシステムは、記事タイプに基づいて文脈に適したCTAを表示し、バイリンガルコンテンツ（日本語と英語）をサポートし、既存の記事詳細ページとシームレスに統合されます。

## 用語集

- **CTA_Component**: 記事コンテンツの後にコールトゥアクション要素をレンダリングするReactコンポーネント
- **Article_Type**: コンテンツのカテゴリ（tutorial、essay、tool_announcement、general）
- **CTA_Pattern**: CTA要素の特定の構成（見出し、説明、ボタン、ビジュアル要素）
- **Article_Detail_Page**: 完全な記事コンテンツを表示するページコンポーネント（BlogDetailPage、DevNoteDetailPageなど）
- **Related_Articles**: 関連コンテンツリンクを表示する既存コンポーネント
- **Social_Share_Buttons**: ソーシャルメディア共有用の既存コンポーネント
- **Engagement_Metrics**: セッションあたりのページビュー、直帰率、滞在時間を含む測定値

## 要件

### 要件1: CTAパターン表示

**ユーザーストーリー:** 読者として、記事を読んだ後に関連する次のアクションを見たい。そうすることで、ウェブサイトのコンテンツに継続的に関与できる。

#### 受入基準

1. WHEN 記事詳細ページがレンダリングされる THEN CTA_ComponentはArticle_Typeに適したCTAパターンを表示すること
2. WHEN Article_Typeが"tutorial"である THEN CTA_Componentは実践指向のアクションを含むチュートリアルCTAパターンを表示すること
3. WHEN Article_Typeが"essay"である THEN CTA_Componentは探索指向のアクションを含むエッセイCTAパターンを表示すること
4. WHEN Article_Typeが"tool_announcement"である THEN CTA_Componentは今すぐ試すアクションを含むツールCTAパターンを表示すること
5. WHEN Article_Typeが指定されていないか"general"である THEN CTA_Componentは一般的なエンゲージメントアクションを含むデフォルトCTAパターンを表示すること

### 要件2: バイリンガルコンテンツサポート

**ユーザーストーリー:** バイリンガルウェブサイトの訪問者として、好みの言語でCTAコンテンツを見たい。そうすることで、次のアクションを明確に理解できる。

#### 受入基準

1. WHEN ページ言語が日本語である THEN CTA_Componentはすべてのテキストコンテンツを日本語で表示すること
2. WHEN ページ言語が英語である THEN CTA_Componentはすべてのテキストコンテンツを英語で表示すること
3. THE CTA_Componentは表示言語を決定するためにlang propを受け入れること
4. THE CTA_Componentは言語に関係なく一貫したビジュアルレイアウトを維持すること

### 要件3: コンポーネント統合

**ユーザーストーリー:** 開発者として、CTAコンポーネントが既存の記事ページとシームレスに統合されることを望む。そうすることで、実装が簡単で保守しやすくなる。

#### 受入基準

1. THE CTA_Componentは記事コンテンツの後、Related_Articlesコンポーネントの前に配置されること
2. THE CTA_Componentはスタイルカスタマイズ用のclassNameを含む標準的なReact propsを受け入れること
3. THE CTA_Componentは既存のデザインシステムコンポーネント（CTAButton、スタイリングユーティリティ）を使用すること
4. THE CTA_Componentは既存のコンポーネント構造と命名規則に従うこと
5. THE CTA_ComponentはNext.js 16 App RouterおよびReact 19と互換性があること

### 要件4: ハードコードされたコンテンツパターン

**ユーザーストーリー:** コンテンツマネージャーとして、初期のCTAパターンが実証済みのコンテンツでハードコードされることを望む。そうすることで、CMS統合なしで機能を迅速にローンチできる。

#### 受入基準

1. THE CTA_Componentは3つの異なるハードコードされたCTAパターン（tutorial、essay、tool_announcement）を含むこと
2. THE CTA_Componentは一般記事用の1つのデフォルトCTAパターンを含むこと
3. EACH CTAパターンは見出し、説明テキスト、1〜3個のアクションボタンを含むこと
4. THE CTA_Componentは将来CMSに簡単に移行できる構造化された形式でパターンコンテンツを保存すること

### 要件5: ビジュアルデザインとスタイリング

**ユーザーストーリー:** 読者として、CTAセクションが視覚的に明確で魅力的であることを望む。そうすることで、それに気づき、アクションを起こすよう促される。

#### 受入基準

1. THE CTA_Componentは記事コンテンツと区別するために視覚的に明確な背景色または境界線を使用すること
2. THE CTA_Componentは既存のデザインシステムと一貫したTailwind CSSクラスを使用すること
3. THE CTA_Componentはレスポンシブであり、モバイル、タブレット、デスクトップビューポートで適切に表示されること
4. THE CTA_Componentはサイトテーマと一貫したダークモードスタイリングをサポートすること
5. THE CTA_Componentは視覚的な余白を作るために適切なスペーシング（パディングとマージン）を含むこと

### 要件6: 将来のCMS統合のための拡張性

**ユーザーストーリー:** 開発者として、CTAコンポーネントアーキテクチャが将来のCMS統合をサポートすることを望む。そうすることで、大規模なリファクタリングなしでコンテンツを動的に管理できる。

#### 受入基準

1. THE CTA_Componentは動的コンテンツ用のオプショナルなctaData propを受け入れること
2. WHEN ctaData propが提供される THEN CTA_Componentはハードコードされたパターンの代わりに提供されたデータを使用すること
3. THE CTA_ComponentはCTAデータ構造のTypeScriptインターフェースを定義すること
4. THE CTA_ComponentはハードコードからCMS駆動コンテンツへの移行時に後方互換性を維持すること

### 要件7: アクセシビリティ準拠

**ユーザーストーリー:** 支援技術を使用するユーザーとして、CTAコンポーネントが完全にアクセシブルであることを望む。そうすることで、すべてのアクションをナビゲートして操作できる。

#### 受入基準

1. THE CTA_ComponentはセマンティックなHTML要素（section、heading、nav）を使用すること
2. THE CTA_Componentはスクリーンリーダー用の適切なARIAラベルを含むこと
3. THE CTA_Componentはすべてのインタラクティブ要素がキーボードアクセス可能であることを保証すること
4. THE CTA_ComponentはWCAG AA準拠のための十分な色コントラスト比を維持すること
5. THE CTA_Componentはキーボードナビゲーション用のフォーカスインジケーターを提供すること

### 要件8: パフォーマンス最適化

**ユーザーストーリー:** ウェブサイト訪問者として、ページが迅速に読み込まれることを望む。そうすることで、スムーズなブラウジング体験ができる。

#### 受入基準

1. THE CTA_Componentは必要な場合のみクライアントサイドコンポーネントであること（サーバーコンポーネントを優先）
2. THE CTA_Componentは初期レンダリング中に外部APIコールを行わないこと
3. THE CTA_Componentは最適化を保証するために画像にNext.js Imageコンポーネントを使用すること
4. THE CTA_ComponentはJavaScriptバンドルサイズへの影響が最小限であること（gzip圧縮で5KB未満）
