# microCMS 投稿原稿: wordpress-skills

`projects` API（Work ページのデータソース）へ追加するレコードの原稿です。
microCMS の管理画面でこの内容のとおりに 1 件作成してください。

> ⚠️ **最重要**: コンテンツ ID（content ID）は必ず `wordpress-skills` にしてください。
> Work カードのリンク先・サイトマップ・詳細ルートはすべてこの ID を基準に、専用
> ランディングページ（LP）`https://hidetaka.dev/work/wordpress-skills` へ解決されます。
> ID が一致しないと LP ではなく通常の `/work/[slug]` 詳細ページに飛んでしまいます。
> （仕組み: `src/libs/projectLandingPages.ts` / `wordpress-skills` リポジトリの `wrangler.jsonc`）

---

## フィールド一覧

| フィールド | 値 |
|------------|----|
| **コンテンツ ID** | `wordpress-skills` |
| **title** | `wordpress-skills` |
| **url** | `https://github.com/hideokamoto/wordpress-skills` |
| **published_at** | `2026-06-04`（公開日。実際のリリース日に合わせて調整可） |
| **project_type** | `owned_oss` |
| **status** | `active` |
| **is_solo** | `true` |
| **lang** | `English`（プロジェクトは言語非依存で両ロケールに表示されます） |
| **tags** | `WordPress`, `AI`, `Agent Skills`, `Claude Code`, `Cursor`, `MCP` |
| **image** | OG 画像を推奨（未設定でもカードは表示されます。4:3 程度を推奨） |
| **affiliate_link** | （空欄） |

---

## about（カード/詳細の概要文）

英語をプロジェクトの一次言語とし、英語版を登録することを推奨します。日本語で運用する場合は日本語版に差し替えてください。

### English

```
Agent Skills that give AI coding agents primary-source grounding for WordPress development. Instead of generating code from memory, your agent searches and reads the official WordPress Developer Handbooks on developer.wordpress.org at request time — so answers about plugins, themes, the Block Editor, the REST API, and coding standards come from the docs, not a guess.
```

### 日本語（任意・差し替え用）

```
AI コーディングエージェントに、WordPress 開発の「一次情報グラウンディング」を与える Agent Skills。実行時に developer.wordpress.org の公式ハンドブックを検索・取得するため、プラグイン・テーマ・ブロックエディター・REST API・コーディング規約の回答が“うろ覚え”ではなく公式ドキュメント由来になります。
```

---

## background（詳細ページ向け・リッチエディタ / HTML）

> 補足: `wordpress-skills` には専用 LP があり、Work カードからは LP に直接遷移します。
> そのため `background` / `architecture` は必須ではありません。SEO や詳細ページを充実
> させたい場合のみ登録してください。

### English

```html
<p>Official and semi-official skills (e.g. <code>WordPress/agent-skills</code>, <code>Automattic/wordpress-agent-skills</code>) are great at <strong>generating</strong> WordPress code. But generation relies on the model's training data, which goes stale and occasionally invents APIs that never existed.</p>
<p><strong>wordpress-skills</strong> is the <strong>grounding layer</strong>: it fetches the relevant Handbook pages at request time, so your agent has the current, official source in front of it. Run both — generation skills to scaffold, wordpress-skills to verify.</p>
<p>Built on the open <a href="https://agentskills.io">SKILL.md</a> standard, so it is portable across Claude Code, Cursor, Codex, Gemini CLI, Copilot and other compatible agents.</p>
```

### 日本語（任意）

```html
<p>公式・準公式のスキル（例: <code>WordPress/agent-skills</code>、<code>Automattic/wordpress-agent-skills</code>）はコードの<strong>生成</strong>に強い一方、生成はモデルの学習データに依存し、情報が古くなったり存在しない API を作り出すことがあります。</p>
<p><strong>wordpress-skills</strong> は<strong>グラウンディング層</strong>です。該当するハンドブックのページを実行時に取得し、最新・公式の情報をエージェントの手元に置きます。生成系スキルで足場を作り、wordpress-skills で検証する——併用がおすすめです。</p>
<p>オープンな <a href="https://agentskills.io">SKILL.md</a> 標準に準拠しているため、Claude Code・Cursor・Codex・Gemini CLI・Copilot など対応エージェント間でポータブルに利用できます。</p>
```

---

## architecture（詳細ページ向け・任意・HTML）

### English

```html
<p>Included skill: <code>wordpress-handbook</code> — searches the seven official WordPress Developer Handbooks (Plugin / Theme / Block Editor / REST API / Common APIs / Coding Standards / Advanced Administration) and fetches full article content on demand.</p>
<p>Requirements: Python 3.x to run the skill scripts, and network access to <code>developer.wordpress.org</code> over HTTPS.</p>
```

---

## 登録後の確認事項

1. **コンテンツ ID が `wordpress-skills`** であること（最重要）。
2. Work ページ（`/work` および `/ja/work`）の「Open Source」セクションにカードが表示され、
   クリックで LP（`/work/wordpress-skills` / 日本語は `/work/wordpress-skills/ja`）に遷移すること。
3. LP（別 Cloudflare Worker）が `hidetaka.dev/work/wordpress-skills` で公開済みであること。
4. `/work/wordpress-skills` を直接リクエストすると Next.js の詳細ページではなく LP が
   表示されること（エッジルートが優先されます）。

> ローカル開発・プレビューでは microCMS の代わりにモックデータ
> （`src/libs/microCMS/mocks.ts`）が使われ、同じカードが表示されます。
