# microCMS 投稿原稿: wordpress-skills

このドキュメントは microCMS の `projects` エンドポイントに投稿するコンテンツ原稿です。

> **重要**: content ID は microCMS が自動生成するランダム値を使用してください。
> `wordpress-skills` という ID は使用しないこと。
> LP は Cloudflare Worker として `hidetaka.dev/work/wordpress-skills` で独立稼働しており、
> Next.js の `/work/[slug]` との slug 衝突を避けるため。

---

## フィールド一覧

| フィールド | 値 |
|---|---|
| **title** | `wordpress-skills` |
| **url** | `https://hidetaka.dev/work/wordpress-skills` |
| **published_at** | `2026-06-02` |
| **project_type** | `owned_oss` |
| **lang** | `English` |
| **is_solo** | `true` |
| **status** | `active` |
| **tags** | `WordPress`, `AI`, `Claude Code`, `Agent Skills`, `Cloudflare Workers`, `Python` |

---

## about（英語）

```
Agent Skills that give AI coding agents primary-source grounding for WordPress development. Instead of generating code from memory, the agent searches and reads official WordPress Developer Handbooks at request time — so answers about plugins, themes, the Block Editor, the REST API, and coding standards come from the docs, not from a guess.
```

---

## background（英語・HTML）

```html
<p>Official and semi-official skills (e.g. WordPress/agent-skills, Automattic/wordpress-agent-skills) are great at <strong>generating</strong> WordPress code. But generation relies on the model's training data, which goes stale and occasionally invents APIs that never existed.</p>

<p><code>wordpress-skills</code> is the <strong>grounding layer</strong>: it fetches the relevant Handbook pages at request time, so your agent has the current, official source in front of it.</p>

<p>Included skill: <strong>wordpress-handbook</strong> — searches the seven official WordPress Developer Handbooks (Plugin / Theme / Block Editor / REST API / Common APIs / Coding Standards / Advanced Administration) and fetches full article content on demand.</p>

<p>Compatible with Claude Code, Cursor, GitHub Copilot, Codex, Gemini CLI, and any agent that supports the open <a href="https://agentskills.io">SKILL.md</a> standard.</p>
```

---

## architecture（英語・HTML）

```html
<p>Built as a monorepo with two packages:</p>

<ul>
  <li><strong>skills/wordpress-handbook</strong> — Python-based skill scripts that query <code>developer.wordpress.org</code> search and fetch Handbook article content over HTTPS.</li>
  <li><strong>site/</strong> — Astro landing page deployed as a standalone Cloudflare Worker, mounted at <code>hidetaka.dev/work/wordpress-skills</code> via Cloudflare route matching.</li>
</ul>

<p>Install via GitHub CLI:</p>
<pre><code>gh skill install hideokamoto/wordpress-skills wordpress-handbook</code></pre>

<p>Or via Vercel skills CLI:</p>
<pre><code>npx skills add hideokamoto/wordpress-skills --skill wordpress-handbook</code></pre>
```

---

## 日本語版フィールド

| フィールド | 値 |
|---|---|
| **title** | `wordpress-skills` |
| **url** | `https://hidetaka.dev/work/wordpress-skills` |
| **published_at** | `2026-06-02` |
| **project_type** | `owned_oss` |
| **lang** | `Japanese` |
| **is_solo** | `true` |
| **status** | `active` |
| **tags** | `WordPress`, `AI`, `Claude Code`, `Agent Skills`, `Cloudflare Workers`, `Python` |

## about（日本語）

```
AI コーディングエージェントに WordPress 開発の一次情報グラウンディングを与える Agent Skills です。記憶からコードを生成するのではなく、リクエスト時に developer.wordpress.org の公式ハンドブックを検索・取得します。プラグイン・テーマ・ブロックエディター・REST API・コーディング規約に関する回答が、"うろ覚え"ではなく公式ドキュメント由来になります。
```

## background（日本語・HTML）

```html
<p>公式・準公式のスキル（WordPress/agent-skills、Automattic/wordpress-agent-skills など）は WordPress コードの<strong>生成</strong>に強みがあります。ただし生成はモデルの学習データに依存するため、情報が古くなったり、存在しない API を作り出してしまうことがあります。</p>

<p><code>wordpress-skills</code> は<strong>グラウンディング層</strong>です。リクエスト時に該当するハンドブックのページを取得し、最新かつ公式の情報をエージェントの手元に置きます。</p>

<p>収録スキル: <strong>wordpress-handbook</strong> — 公式 7 ハンドブック（プラグイン / テーマ / ブロックエディター / REST API / 共通 API / コーディング規約 / 高度な管理）を検索し、必要に応じて記事本文を取得します。</p>

<p>Claude Code・Cursor・GitHub Copilot・Codex・Gemini CLI など、オープンな <a href="https://agentskills.io">SKILL.md</a> 標準に対応したエージェントで動作します。</p>
```

## architecture（日本語・HTML）

```html
<p>2 パッケージのモノレポ構成:</p>

<ul>
  <li><strong>skills/wordpress-handbook</strong> — <code>developer.wordpress.org</code> の検索とハンドブック記事取得を行う Python 製スキルスクリプト。</li>
  <li><strong>site/</strong> — Astro 製ランディングページ。独立した Cloudflare Worker としてデプロイされ、Cloudflare のルートマッチングにより <code>hidetaka.dev/work/wordpress-skills</code> にマウントされます。</li>
</ul>

<p>GitHub CLI でインストール:</p>
<pre><code>gh skill install hideokamoto/wordpress-skills wordpress-handbook</code></pre>

<p>Vercel skills CLI でインストール:</p>
<pre><code>npx skills add hideokamoto/wordpress-skills --skill wordpress-handbook</code></pre>
```

---

## LP パス設計について

### 現在の構成

```
hidetaka.dev/work/wordpress-skills  →  Astro LP (Cloudflare Worker)
hidetaka.dev/work/[slug]            →  Next.js 詳細ページ (microCMS content)
```

Cloudflare Workers のルートマッチングがエッジで先に処理されるため、
`/work/wordpress-skills` へのリクエストは Next.js に届かず LP Worker が応答します。

### slug 衝突の回避

microCMS の content ID は自動生成のランダム値（例: `abc123xyz`）のため、
`/work/wordpress-skills` という静的ページは Next.js により生成されません。
**content ID として `wordpress-skills` を手動設定しないこと。**

### 日本語 LP

Astro サイトの `/work/wordpress-skills/ja/` が日本語 LP として機能します
（Cloudflare Worker ルート `hidetaka.dev/work/wordpress-skills/*` でカバー）。

hidetaka.dev の Work ページで日本語ユーザーがカードをクリックした場合も、
英語 LP (`/work/wordpress-skills`) にリンクし、LP 内で言語切り替えします。
