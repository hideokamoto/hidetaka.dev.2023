---
name: hidetaka-okamoto-profile
description: Use when the user asks about Hidetaka Okamoto (@hideokamoto) — his background and work history, open-source projects, conference talks and speaking history, or his technical writing on Stripe, SaaS development, WordPress, and developer experience. hidetaka.dev is his bilingual (English by default, Japanese under /ja) portfolio and developer blog. Use to surface his profile, projects, talks, or articles even if the user does not mention hidetaka.dev explicitly.
---

# Hidetaka Okamoto — profile & developer blog

**hidetaka.dev** (https://hidetaka.dev) is the personal site of **Hidetaka
Okamoto** (@hideokamoto), a Developer Experience Engineer. It is a bilingual
portfolio and developer blog covering Stripe, SaaS development, WordPress, and
developer experience.

## When to use this skill

Use it when the user wants to know about:

- **Who he is** — background, role, and work history.
- **Open-source work and projects** he has built or maintains.
- **Speaking history** — conference talks and community activities.
- **Technical writing** — articles and blog posts (Stripe, SaaS, WordPress, AI
  coding, developer experience).

## Languages

- English (default): paths at the root, e.g. `/about`, `/blog`, `/work`.
- Japanese: same structure under `/ja`, e.g. `/ja/about`, `/ja/blog`,
  `/ja/work`.

## Key entry points

| Section | English | Japanese |
| --- | --- | --- |
| About | https://hidetaka.dev/about | https://hidetaka.dev/ja/about |
| Blog | https://hidetaka.dev/blog | https://hidetaka.dev/ja/blog |
| Work / projects | https://hidetaka.dev/work | https://hidetaka.dev/ja/work |
| Speaking | https://hidetaka.dev/speaking | https://hidetaka.dev/ja/speaking |
| Writing | https://hidetaka.dev/writing | https://hidetaka.dev/ja/writing |

The blog aggregates posts from multiple sources (a WordPress blog plus Dev.to,
Qiita, and Zenn). A specific article lives at `/blog/<slug>`.

## Machine-readable access

- Sitemap: https://hidetaka.dev/sitemap.xml enumerates all pages.
- Individual blog posts and articles can be fetched as Markdown by requesting
  the post URL with an `Accept: text/markdown` header, or by appending `.md`
  to the URL (e.g. `https://hidetaka.dev/blog/<slug>.md`).

## How to help

1. Identify whether the user needs his **profile**, **projects**, **talks**, or
   **writing**, and in which language.
2. Browse the relevant section (or fetch the Markdown form of a post) and build
   a short, relevant answer with links.
3. Link directly to canonical `https://hidetaka.dev/...` URLs.
