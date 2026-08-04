---
name: "Setchū Design Guidelines"
description: "Reference for hidetaka.dev's 折衷 (Setchū) design system — the site's canonical color tokens, typography, and component conventions. Use whenever writing or reviewing UI/styling code in this repo: choosing or reviewing colors, editing Tailwind classes, building or modifying components under src/components or src/app, adding a chart or data-viz element, working with dark mode, or answering questions about this site's color palette, fonts, spacing, or visual design — even if the request doesn't say 'design system' explicitly. Prevents inventing new hex values or colors outside the Setchū palette: colors must always resolve through --rvt-* CSS variables or the remapped Tailwind scale (indigo-*/green-*/yamabuki-*/zinc-slate-gray-*), never a hardcoded literal."
instructions: |
  This skill packages hidetaka.dev's 折衷 (Setchū) design system — color tokens, typography, and component
  conventions — so styling work in this repo stays consistent with the canonical palette instead of drifting
  into ad-hoc hex values.
---

# Setchū (折衷) Design Guidelines

白磁と墨のニュートラルを土台に、**藍青 (あいあお)** を主役、**松葉緑** と **山吹** を少量のアクセントに。
This is hidetaka.dev's whole design language in one sentence: a quiet, editorial neutral base (washi
porcelain + ink) carries the page, indigo-blue does the heavy lifting for anything that needs attention,
and pine-green / gold appear only as small spot accents.

## The one rule that matters most

**Never write a raw hex value in component code.** Every color on this site resolves through one of two
equivalent channels:

- **CSS variables** — `var(--rvt-accent)`, `var(--rvt-bg)`, etc. (used in inline `style={{ }}` or custom CSS)
- **Tailwind utility classes** — `indigo-*`, `green-*`, `yamabuki-*`, `zinc-*`/`slate-*`/`gray-*` (these are
  *remapped* in `tailwind.config.cjs` to render the Setchū palette, not Tailwind's defaults)

If a design calls for a color that doesn't exist in the tables below, that's a signal to reuse the closest
existing token (usually a spot accent used more sparingly, or a neutral) rather than to introduce a new hex
value. The palette is deliberately small — that restraint is what keeps the site calm instead of busy.

**Canonical source of truth:** `src/styles/setchu.css` (CSS variables) and `tailwind.config.cjs` (Tailwind
scale mapping), documented in full at `docs/guides/design-guidelines.md`. This skill is a working summary of
those three files — if anything here ever looks inconsistent with them, the CSS/Tailwind files win. Re-derive
this summary after any token change instead of trusting stale numbers here.

## Color tokens

| Role | Token | Tailwind | Light | Dark |
|---|---|---|---|---|
| 背景 background (白磁) | `--rvt-bg` | `zinc-100`/`slate-100`/`gray-100` | `#F8FAF7` | `#16181C` |
| サーフェス surface (cards) | `--rvt-bg2` | `bg-white` / `dark:bg-zinc-900` | `#FFFFFF` | `#1F2228` |
| 沈み込み sunken tint | `--rvt-bg3` | — | `#EFF2EE` | `#262A31` |
| テキスト text (墨 ink) | `--rvt-fg` | `zinc-900` (via mapping) | `#23262B` | `#E9E7DF` |
| 副次テキスト secondary text | `--rvt-fg2` | `zinc-600` | `#565A61` | `#B7B4AC` |
| ミュート muted | `--rvt-fg3` | `zinc-500` | `#7B7E82` | `#8B8E93` |
| ボーダー border | `--rvt-border` | `zinc-200` | `#E4E9E2` | `#2E3138` |
| プライマリ 藍青 (protagonist) | `--rvt-accent` | `indigo-600` (light) / `indigo-400` (dark) | `#2F5375` | `#6E9BC0` |
| 藍青 deeper (hover/gradient) | `--rvt-accent2` | — | `#24425F` | `#5A86AB` |
| primary の上の文字 | `--rvt-primary-contrast` | — | `#FFFFFF` | `#12151A` |
| セカンダリ 松葉緑 (spot accent) | `--rvt-secondary` | `green-600` (light) / `green-400` (dark) | `#3E7A55` | `#6FB088` |
| アクセント 山吹 (spot accent) | `--rvt-accent-gold` | `yamabuki-500` (light) / `yamabuki-300` (dark) | `#E0A63C` | `#ECBE56` |

Status colors (kept inside the Setchū world, not generic red/yellow/green):

| Role | Token | Light | Dark |
|---|---|---|---|
| success | `--success` | `#3E7A55` (松葉緑) | `#6FB088` |
| warning | `--warning` | `#7E561F` (darkened 山吹 for AA text contrast — never the raw `#E0A63C` as text) | `#ECBE56` |
| error | `--error` | `#B4553B` (muted vermilion 朱, calmer than a neon red) | `#D98A76` |
| info | `--info` | `#2F5375` (藍青) | `#6E9BC0` |

Data-viz extension — for charts/legends only, **fixed** across light and dark (not theme-switched):

```
--chart-1: #2F5375;  /* 藍青 */
--chart-2: #3E7A55;  /* 松葉緑 */
--chart-3: #E0A63C;  /* 山吹 */
--chart-4: #6E9BC0;  /* 淡藍 */
--chart-5: #6C4E96;  /* 京紫 */
--chart-6: #B4553B;  /* 朱 */
```

Reach for these `--chart-*` tokens (in that order) when a chart needs more distinct series than the core
palette alone provides — e.g. `MonthlyPostsChart.tsx`'s own-content bars. External brand colors (Qiita green,
Zenn blue, etc.) are a deliberate, documented exception for representing third-party sources by their actual
brand identity — don't "fix" those into Setchū tokens.

## Balance: 65 / 25 / 10

- **~65% neutral** (白磁 backgrounds/surfaces) — let pages breathe, most of the screen should be quiet
- **~25% 藍青 primary** — headings, primary buttons, links, active nav state
- **~10% combined 松葉緑 + 山吹** — tags, single-stat highlights, status — always as isolated points, never
  as competing large fields

**The one thing to actively avoid:** using pine-green and gold as large areas *in the same view*. Either one
alone as a small accent reads as intentional; both together at scale reads as busy and undoes the "calm
editorial" tone the whole system is built around.

## Typography

| Use | Font | Token / class |
|---|---|---|
| Display / headings (明朝) | Shippori Mincho | `var(--rvt-font-display)` / `font-display` / `font-serif` |
| Body / UI (ゴシック) | Zen Kaku Gothic New | `var(--rvt-font-body)` / default `body` / `font-sans` / `font-japanese` |
| Code, labels, HEX values | SF Mono / ui-monospace | `var(--rvt-font-mono)` / `font-mono` |

- **H1 (Hero):** `font-display`, `clamp(2.5rem, 5vw, 4rem)`, `font-weight: 700`, `tracking-tight`
- **H2 (section):** `font-display`, `text-3xl sm:text-4xl`
- **H3 (card):** `font-display`, `text-xl` / `text-lg`
- **Lead paragraph:** `text-lg leading-relaxed`
- **Body copy:** `text-base leading-relaxed`, color `--rvt-fg2`
- **Label / eyebrow:** mono, uppercase, `tracking-wider`, colored `--rvt-accent` (indigo)

## Component conventions

- **Radii:** 8–12px for cards (`--rvt-radius` 10px / `--rvt-radius-lg` 12px), 6–8px for buttons and inputs
  (`--rvt-radius-sm` 6px / `--rvt-radius-md` 8px). Full pills (`--rvt-radius-pill`) are for standalone
  toggles/badges, not primary nav.
- **Borders over shadows:** default to `1px solid var(--rvt-border)`. When a shadow is used, keep it
  ink-tinted and weak — `--rvt-shadow-cta` / `--rvt-shadow-cta-hover` — never a loud drop shadow or glow.
- **Buttons:**
  - Primary: indigo fill (`indigo-600` / `--rvt-accent`) + white text (`--rvt-primary-contrast`), light
    shadow, `hover:scale-105`. Defined in `src/libs/componentStyles.utils.ts` (`getCTAButtonStyles`).
  - Secondary: washi surface + border, text in the neutral 900 shade.
  - Text-only: indigo text, no fill.
- **Tags / badges:** `default` (washi neutral) / `indigo` (藍青) / `gold` (山吹). `gold` is for one-point
  emphasis only — don't use it for a whole row of tags.
- **Cards:** `bg-white` light / `dark:bg-zinc-900` (== dark surface), border `--rvt-border`,
  `rounded-lg`–`rounded-2xl`, hover state is a modest `hover:shadow-md` — not a scale or glow effect.
- **Decoration:** hero radial gradient orbs use `--rvt-accent-glow` / `--rvt-accent2` kept very faint; the
  faint background grid (`.rvt-grid-bg`) is dark-mode-only texture, not a light-mode element.

## Dark mode

`class` strategy — `.dark` on `documentElement`, driven by `DarkModeScript` / `ModeToggle`, following
`prefers-color-scheme` by default. Every `--rvt-*` token switches automatically; component code should almost
never hardcode a separate literal for dark mode — use the token or the Tailwind `dark:` variant of an already
-remapped class (e.g. `dark:bg-zinc-900`), not a new arbitrary dark color.

## Accessibility

- Body text uses `--rvt-fg2` on washi backgrounds — chosen to hold AA contrast; don't lighten it further.
- Focus rings are indigo (`--rvt-accent`) — keep focus-visible styling intact when touching interactive
  components.
- `#E0A63C` (raw 山吹) is for backgrounds/large text/fills only — never small body text on white, which is
  why `--warning` uses the darkened `#7E561F` shade instead of the raw accent.
- Respect `prefers-reduced-motion` (see `globals.css`).

## Quick checklist before shipping a UI change

1. Every color traces back to a `--rvt-*` var or a remapped Tailwind class — no new hex.
2. Green and gold each stay small and isolated; they never both cover large areas in the same view.
3. Headings use `font-display` (Shippori Mincho); body text uses the default sans (Zen Kaku Gothic New).
4. Both light and dark mode were actually looked at, not just assumed to "just work."
5. If a genuinely new token feels necessary, add it to `src/styles/setchu.css` +
   `tailwind.config.cjs` + `docs/guides/design-guidelines.md` together — don't let this skill, the CSS, and
   the docs drift apart.
