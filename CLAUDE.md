# CLAUDE.md - AI Assistant Guide for Hidetaka.dev

This document provides comprehensive guidance for AI assistants working with the Hidetaka.dev codebase. It covers the project structure, development workflows, conventions, and best practices.

## Project Overview

**Project Name:** Hidetaka.dev - Personal Portfolio Website
**Owner:** Hidetaka Okamoto (@hideokamoto)
**Live Site:** https://hidetaka.dev
**Repository:** /home/user/hidetaka.dev.2023

### Technology Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript 5 (strict mode)
- **Styling:** TailwindCSS 3.4.14 (utility-first, class-based dark mode)
- **CMS:** microCMS (headless CMS for content management)
- **Deployment:** Cloudflare Workers via @opennextjs/cloudflare
- **Date Handling:** dayjs
- **Feed Parsing:** fast-xml-parser

### Project Type

This is a **bilingual portfolio and developer blog** featuring:
- Personal profile and about page
- Blog aggregation from multiple sources (Dev.to, Qiita, Zenn, WordPress)
- Work/projects showcase (OSS, books, community activities)
- Speaking engagements archive
- Writing/articles section
- Multi-language support (English + Japanese)

---

## Directory Structure

```
/home/user/hidetaka.dev.2023/
├── src/
│   ├── app/                    # Next.js App Router (pages & routing)
│   │   ├── page.tsx           # Home page (English)
│   │   ├── layout.tsx         # Root layout with Header/Footer
│   │   ├── sitemap.ts         # Dynamic sitemap generation
│   │   ├── robots.ts          # robots.txt
│   │   ├── about/             # About page
│   │   ├── blog/              # Blog listing + detail pages
│   │   ├── writing/           # Writing/articles section
│   │   ├── work/              # Work/projects showcase
│   │   ├── speaking/          # Speaking engagements
│   │   ├── api/               # API routes (thumbnail generation)
│   │   └── ja/                # Japanese language versions (mirror structure)
│   │
│   ├── components/
│   │   ├── ui/                # Pure, reusable UI components (design system)
│   │   ├── tailwindui/        # Tailwind UI-based layout components
│   │   ├── containers/        # Page-level container components
│   │   ├── Hero/              # Hero section components
│   │   ├── home/              # Home page sections
│   │   ├── projects/          # Project-related components
│   │   └── content/           # Content display components
│   │
│   ├── libs/
│   │   ├── microCMS/          # microCMS SDK integration
│   │   │   ├── client.ts      # Client factory
│   │   │   ├── apis.ts        # API methods (MicroCMSAPI class)
│   │   │   ├── types.ts       # TypeScript types for CMS content
│   │   │   ├── mocks.ts       # Mock data for testing/fallback
│   │   │   └── utils.ts       # Utility functions
│   │   ├── dataSources/       # Multi-source feed integration
│   │   │   ├── blogs.ts       # Blog aggregation
│   │   │   ├── thoughts.ts    # WordPress blog
│   │   │   ├── devto.ts       # Dev.to API
│   │   │   ├── qiita.ts       # Qiita feed
│   │   │   ├── zenn.ts        # Zenn feed
│   │   │   ├── npmjs.ts       # npm package data
│   │   │   ├── wporg.ts       # WordPress.org plugins
│   │   │   └── types.ts       # Shared types (FeedItem)
│   │   ├── urlUtils/          # URL utilities
│   │   │   └── lang.util.ts   # Language/i18n helpers
│   │   ├── metadata.ts        # Next.js metadata helpers
│   │   ├── jsonLd.ts          # JSON-LD schema generation
│   │   ├── formatDate.ts      # Date formatting
│   │   └── sanitize.ts        # HTML sanitization
│   │
│   ├── styles/
│   │   └── global.css         # TailwindCSS imports (minimal)
│   │
│   ├── config.ts              # Site-wide configuration (SITE_CONFIG)
│   ├── consts.ts              # Constants (titles, descriptions)
│   ├── env.d.ts               # Environment type definitions
│   └── middleware.ts          # Next.js middleware (URL redirects)
│
├── public/                     # Static assets
│   ├── images/                # Images (profile.jpg, etc)
│   ├── favicons/              # Favicon collection
│   └── _headers               # Cloudflare headers config
│
├── docs/                       # Project documentation
│   ├── guides/
│   │   ├── component-system.md # Component design principles
│   │   └── design-guidelines.md # Design system specs
│   └── adrs/                   # Architecture decision records
│
├── Configuration Files:
│   ├── package.json           # Dependencies and scripts
│   ├── tsconfig.json          # TypeScript config (strict mode, path aliasing)
│   ├── tailwind.config.cjs    # Tailwind CSS config
│   ├── next.config.ts         # Next.js config
│   ├── wrangler.jsonc         # Cloudflare Workers config
│   └── .env.example           # Environment variables template
```

---

## Key Conventions & Patterns

### 1. Component Architecture

**Three-Tier Component System:**

1. **UI Components** (`src/components/ui/`)
   - Pure, presentational components
   - No data fetching or side effects
   - Props-driven with TypeScript interfaces
   - Reusable across pages and contexts
   - Examples: `PageHeader`, `Badge`, `ProfileCard`, `Pagination`

2. **Container Components** (`src/components/containers/`)
   - Page-specific logic and composition
   - Handle i18n and data structuring
   - Compose UI components
   - Examples: `AboutPage`, `BlogPage`, `WorkPage`

3. **Layout Components** (`src/components/tailwindui/`)
   - Site-wide layout elements
   - Header, Footer, Navigation
   - Container wrappers

**Component Design Principles** (from `docs/guides/component-system.md`):
- **Pure components:** Props-only dependencies, no side effects
- **Reusability:** Generic design, context-independent
- **Type safety:** Explicit TypeScript interfaces
- **Accessibility:** Semantic HTML, aria-labels, keyboard navigation
- **Single responsibility:** Each component has one clear purpose

### 2. Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `PageHeader`, `AboutPage` |
| Files | Match component name | `PageHeader.tsx`, `AboutPage.tsx` |
| Utilities | camelCase | `loadThoughts()`, `formatDate()` |
| Constants | SCREAMING_SNAKE_CASE | `SITE_TITLE`, `SITE_CONFIG` |
| Types/Interfaces | PascalCase | `FeedItem`, `MicroCMSProjectsRecord` |

### 3. Code Organization Patterns

**Functional Components + TypeScript**
```tsx
// All components are functional (no classes)
// Props typed explicitly with interfaces
// Default exports for components, named for utilities

type PageHeaderProps = {
  title: string
  description?: string
  className?: string
}

export default function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <header className={cn('...', className)}>
      {/* ... */}
    </header>
  )
}
```

**Server Components by Default**
- Leverage Next.js 16 server components
- No `"use client"` unless absolutely necessary
- Async components for data fetching
- Client components only for interactivity

**Page Composition Pattern**
```tsx
// src/app/[slug]/page.tsx
export async function generateStaticParams() { /* ... */ }
export async function generateMetadata({ params }) { /* ... */ }

export default async function Page({ params }) {
  const data = await fetchData(params)
  return <PageContainer data={data} />
}
```

### 4. Internationalization (i18n)

**Strategy:** Directory-based routing + conditional rendering

```
/ (root)        → English version
/ja/            → Japanese version
```

**Implementation:**
- No external i18n library
- `lang` parameter passed through component tree
- Conditional rendering: `lang.startsWith('ja') ? '日本語' : 'English'`
- Middleware handles legacy redirects (`/ja-JP/*` → `/ja/*`)

**URL Redirects in Middleware** (`src/middleware.ts`):
- `/ja-JP/*` → `/ja/*` (i18n normalization)
- `/projects` → `/work` (URL refactoring)
- `/articles`, `/oss`, `/news` → `/writing` (consolidation)

### 5. Styling with TailwindCSS

**Approach:** Pure utility classes, no custom CSS

**Design System:**
- **Primary Color:** Indigo (`indigo-600`, `indigo-700`)
- **Text Colors:** Slate (`slate-900`, `slate-700`, `slate-600`)
- **Dark Mode:** Zinc backgrounds (`zinc-800`, `zinc-900`)
- **Accents:** Purple, Cyan (gradients)

**Key Patterns:**
```tsx
// Dark mode support
className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"

// Responsive design
className="text-3xl sm:text-4xl lg:text-5xl"

// Hover effects
className="transition-transform hover:scale-105"

// Group hover
className="group"
// child: className="group-hover:shadow-md"
```

**Typography Scale:**
- H1 (Hero): `text-5xl sm:text-6xl lg:text-7xl font-extrabold`
- H2 (Sections): `text-3xl font-bold sm:text-4xl`
- H3 (Cards): `text-xl font-semibold`
- Body: `text-base leading-relaxed`

### 6. Data Fetching & Content Management

**Primary CMS: microCMS**

```typescript
// Content Types
MicroCMSEventsRecord      // Speaking events
MicroCMSProjectsRecord    // Work/projects
MicroCMSPostsRecord       // Blog posts
```

**Secondary Sources:** Multi-source feed aggregation
- WordPress REST API (`thoughts.ts`)
- Dev.to API (`devto.ts`)
- Qiita RSS (`qiita.ts`)
- Zenn RSS (`zenn.ts`)
- npm Registry (`npmjs.ts`)
- WordPress.org Plugins (`wporg.ts`)

**Data Fetching Pattern:**
```tsx
// Server-side data fetching in page components
export default async function Page() {
  const [thoughts, categories] = await Promise.all([
    loadThoughts(page, limit, lang),
    loadAllCategories(lang),
  ])
  return <BlogPageContent thoughts={thoughts} categories={categories} />
}
```

**Fallback Strategy:**
- Mock data when `MICROCMS_API_KEY` is missing
- Environment variable: `MICROCMS_API_MODE=mock`

### 7. TypeScript Configuration

**Strict Mode Enabled:**
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2017",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Path Aliasing:**
- Use `@/*` for imports from `src/`
- Example: `import { SITE_CONFIG } from '@/config'`

---

## Development Workflows

### Setup & Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add:
# - MICROCMS_API_KEY=your_key_here
# - OG_IMAGE_GEN_AUTH_TOKEN=your_token_here

# 3. Start development server
npm run dev
# Opens at http://localhost:3000
```

### Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server (port 3000) |
| `npm run build` | Standard Next.js build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run cf:build` | Build for Cloudflare Workers |
| `npm run cf:preview` | Local preview with Wrangler |
| `npm run cf:deploy` | Deploy to Cloudflare Workers |

### Environment Variables

Required in `.env.local`:
```bash
MICROCMS_API_KEY=xxxx           # microCMS API key
OG_IMAGE_GEN_AUTH_TOKEN=xxx     # OG image generation auth token
```

Optional:
```bash
MICROCMS_API_MODE=mock          # Use mock data instead of API
```

### Build Process

**Standard Next.js:**
```bash
npm run build          # Compiles to .next/
npm run start          # Runs production server
```

**Cloudflare Workers:**
```bash
npm run cf:build       # Converts to .open-next/
npm run cf:preview     # Test locally with Wrangler
npm run cf:deploy      # Deploy to production
```

### Deployment to Cloudflare

**Prerequisites:**
1. Cloudflare account with Workers enabled
2. Wrangler CLI authenticated: `npx wrangler login`
3. Environment variables configured in `wrangler.jsonc` or Cloudflare dashboard

**Deployment Steps:**
```bash
# 1. Build for Cloudflare
npm run cf:build

# 2. Deploy to production
npm run cf:deploy

# Or deploy to staging (if configured)
npm run cf:deploy:staging
```

**Environment Variables on Cloudflare:**
- Set in Cloudflare dashboard: Workers & Pages > hidetaka-dev > Settings > Variables
- Or via CLI: `npx wrangler secret put MICROCMS_API_KEY --env production`

---

## Common Tasks for AI Assistants

### 1. Adding a New Page

**Steps:**
1. Create page route in `src/app/[page-name]/page.tsx`
2. Create Japanese version in `src/app/ja/[page-name]/page.tsx`
3. Add metadata with `generateMetadata()`
4. Fetch data in async component
5. Create container component in `src/components/containers/pages/`
6. Update navigation in `src/components/tailwindui/Header.tsx`

**Example:**
```tsx
// src/app/about/page.tsx
import { Metadata } from 'next'
import AboutPage from '@/components/containers/pages/AboutPage'

export const metadata: Metadata = {
  title: 'About | Hidetaka.dev',
  description: 'About Hidetaka Okamoto',
}

export default function About() {
  return <AboutPage lang="en" />
}
```

### 2. Creating a New UI Component

**Location:** `src/components/ui/[ComponentName].tsx`

**Template:**
```tsx
import React from 'react'

type ComponentNameProps = {
  // Required props
  title: string

  // Optional props
  description?: string
  variant?: 'primary' | 'secondary'
  className?: string
}

export default function ComponentName({
  title,
  description,
  variant = 'primary',
  className = '',
}: ComponentNameProps) {
  return (
    <div className={`base-classes ${className}`}>
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="text-slate-600 dark:text-slate-400">{description}</p>}
    </div>
  )
}
```

**Key Requirements:**
- Pure component (no side effects)
- TypeScript props interface
- Dark mode support
- Responsive design
- className prop for customization
- Default values for optional props

### 3. Adding Data from microCMS

**Steps:**
1. Define TypeScript type in `src/libs/microCMS/types.ts`
2. Add API method to `MicroCMSAPI` class in `src/libs/microCMS/apis.ts`
3. Create mock data in `src/libs/microCMS/mocks.ts`
4. Fetch data in page component
5. Pass to container component

**Example:**
```tsx
// src/libs/microCMS/apis.ts
export class MicroCMSAPI {
  async getProjects(lang: string): Promise<MicroCMSProjectsRecord[]> {
    try {
      const { contents } = await this.client.getList<MicroCMSProjectsRecord>({
        endpoint: 'projects',
        queries: { filters: `lang[equals]${lang}`, limit: 100 },
      })
      return contents
    } catch (error) {
      console.warn('Failed to fetch projects, using mock data')
      return MOCK_PROJECTS
    }
  }
}
```

### 4. Updating Styles/Design

**Approach:** Modify TailwindCSS utility classes directly in components

**Example:**
```tsx
// Before
<h1 className="text-3xl font-bold">Title</h1>

// After (larger, responsive)
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">Title</h1>
```

**Important:**
- DO NOT create custom CSS files
- DO NOT use inline styles
- DO use Tailwind utility classes
- DO include dark mode variants: `dark:bg-zinc-900`
- DO include responsive variants: `sm:text-5xl lg:text-7xl`

### 5. Handling Multi-language Content

**Pattern:** Duplicate route structure under `/ja/`

```
src/app/
├── about/
│   └── page.tsx          # English
└── ja/
    └── about/
        └── page.tsx      # Japanese
```

**In Components:**
```tsx
type Props = {
  lang: string
}

export default function MyComponent({ lang }: Props) {
  const isJapanese = lang.startsWith('ja')

  return (
    <div>
      <h1>{isJapanese ? '日本語タイトル' : 'English Title'}</h1>
    </div>
  )
}
```

### 6. Adding URL Redirects

**Location:** `src/middleware.ts`

**Example:**
```tsx
// Add redirect for old URL to new URL
if (pathname === '/old-path' || pathname.startsWith('/old-path/')) {
  const newPath = pathname.replace('/old-path', '/new-path')
  return NextResponse.redirect(new URL(newPath, request.url))
}

// Don't forget the Japanese version
if (pathname === '/ja/old-path' || pathname.startsWith('/ja/old-path/')) {
  const newPath = pathname.replace('/ja/old-path', '/ja/new-path')
  return NextResponse.redirect(new URL(newPath, request.url))
}
```

### 7. Debugging & Testing

**Local Development:**
```bash
npm run dev               # Start dev server
# Visit http://localhost:3000
```

**Linting:**
```bash
npm run lint              # Run ESLint
```

**Cloudflare Preview:**
```bash
npm run cf:preview        # Build & preview locally
# Visit http://localhost:8787
```

**Mock Mode:**
```bash
# In .env.local
MICROCMS_API_MODE=mock    # Use mock data (no API calls)
```

---

## Important Files Reference

### Configuration Files

| File | Purpose | Key Settings |
|------|---------|--------------|
| `src/config.ts` | Site-wide config | URL, author, social links |
| `src/consts.ts` | Global constants | Site title, description |
| `src/middleware.ts` | URL redirects | Legacy URL mappings |
| `src/env.d.ts` | Environment types | TypeScript env definitions |
| `tsconfig.json` | TypeScript config | Strict mode, path aliasing (`@/*`) |
| `tailwind.config.cjs` | Tailwind config | Dark mode, content globs |
| `next.config.ts` | Next.js config | `unoptimized: true` for Cloudflare |
| `wrangler.jsonc` | Cloudflare config | Worker settings, env vars |

### Core Application Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout (Header + Footer) |
| `src/app/page.tsx` | Home page (English) |
| `src/app/ja/page.tsx` | Home page (Japanese) |
| `src/components/tailwindui/Header.tsx` | Site navigation |
| `src/components/tailwindui/Footer.tsx` | Site footer |

### Data & API Files

| File | Purpose |
|------|---------|
| `src/libs/microCMS/apis.ts` | MicroCMS API methods |
| `src/libs/microCMS/types.ts` | CMS content types |
| `src/libs/microCMS/mocks.ts` | Fallback mock data |
| `src/libs/dataSources/blogs.ts` | Multi-source blog aggregation |
| `src/libs/dataSources/types.ts` | Shared `FeedItem` type |

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project setup, deployment instructions |
| `docs/guides/component-system.md` | Component design principles |
| `docs/guides/design-guidelines.md` | Design system specs |
| `docs/adrs/` | Architecture decision records |

---

## Best Practices for AI Assistants

### DO:
✅ Use existing UI components from `src/components/ui/` before creating new ones
✅ Follow the three-tier component architecture (UI → Container → Layout)
✅ Maintain pure components with no side effects in `ui/`
✅ Use TypeScript strict mode and explicit type definitions
✅ Include dark mode support: `dark:bg-zinc-900 dark:text-white`
✅ Make components responsive: `text-3xl sm:text-4xl lg:text-5xl`
✅ Add both English and Japanese versions when creating pages
✅ Use path aliasing: `import { SITE_CONFIG } from '@/config'`
✅ Fetch data server-side in page components (async functions)
✅ Sanitize HTML content before rendering (use `sanitize.ts`)
✅ Add accessibility attributes (aria-label, semantic HTML)
✅ Test in both light and dark mode
✅ Test responsive design at different breakpoints
✅ Use mock mode for development without API keys
✅ Follow existing naming conventions (PascalCase components, camelCase utilities)

### DON'T:
❌ Create custom CSS files or classes (use Tailwind utilities only)
❌ Use inline styles
❌ Add side effects or data fetching to UI components
❌ Create class components (use functional components only)
❌ Skip TypeScript types or use `any`
❌ Forget dark mode variants
❌ Forget responsive breakpoints (sm, lg)
❌ Create English-only pages (add Japanese versions)
❌ Hardcode site metadata (use `SITE_CONFIG` and `consts.ts`)
❌ Skip accessibility attributes
❌ Add dependencies without justification
❌ Commit `.env.local` (use `.env.example` as template)
❌ Use `"use client"` unnecessarily (prefer server components)
❌ Break existing component APIs (maintain backward compatibility)

### Code Quality Checks:
- TypeScript compiles without errors: `npm run build`
- ESLint passes: `npm run lint`
- All imports resolve correctly (no missing dependencies)
- Dark mode works (manually test)
- Responsive design works (test at sm, md, lg breakpoints)
- Both English and Japanese versions render correctly
- No console errors in browser

---

## Git Workflow

**Branch Naming:**
- Feature branches: `claude/` prefix (AI-assisted development)
- Example: `claude/add-new-feature-xyz`

**Commit Messages:**
- Use conventional commits format
- Bilingual (Japanese + English) acceptable
- Examples:
  - `feat: add new blog post component`
  - `fix: ブログ記事のProfileCardで正しいプロフィール画像パスを指定`
  - `refactor: プロフィール情報とソーシャルリンクを一元管理`

**Workflow:**
- Merge-based workflow (pull requests)
- Test locally before pushing
- Run `npm run lint` before committing

---

## Additional Resources

### Documentation
- **Component System Guide:** `/home/user/hidetaka.dev.2023/docs/guides/component-system.md`
- **Design Guidelines:** `/home/user/hidetaka.dev.2023/docs/guides/design-guidelines.md`
- **ADRs:** `/home/user/hidetaka.dev.2023/docs/adrs/`

### External References
- Next.js 16 App Router: https://nextjs.org/docs
- TailwindCSS: https://tailwindcss.com/docs
- microCMS SDK: https://github.com/microcmsio/microcms-js-sdk
- OpenNextJS Cloudflare: https://opennext.js.org/cloudflare

### Site Configuration
- **Site URL:** https://hidetaka.dev
- **Author:** Hidetaka Okamoto
- **Twitter:** @hidetaka_dev
- **GitHub:** @hideokamoto

---

## Troubleshooting

### Common Issues

**Issue:** Build fails with TypeScript errors
**Solution:** Run `npm run build` to see errors. Ensure all types are properly defined.

**Issue:** microCMS API calls fail
**Solution:** Check `MICROCMS_API_KEY` in `.env.local`. Use `MICROCMS_API_MODE=mock` for development.

**Issue:** Styles not applying
**Solution:** TailwindCSS uses JIT. Ensure class names are complete strings (not concatenated).

**Issue:** Dark mode not working
**Solution:** Add `dark:` variants to all color classes. Check TailwindCSS config uses `class` strategy.

**Issue:** Images not loading on Cloudflare
**Solution:** Ensure `next.config.ts` has `images: { unoptimized: true }`.

**Issue:** 404 on Japanese pages
**Solution:** Ensure both `/[page]/page.tsx` and `/ja/[page]/page.tsx` exist.

---

## Summary

This codebase is a **modern, type-safe, bilingual portfolio website** built with Next.js 16, React 19, and TailwindCSS. It follows a **component-driven architecture** with strict separation of concerns:

- **UI components** are pure and reusable
- **Container components** handle logic and composition
- **Page components** fetch data server-side
- **Styling** is utility-first with TailwindCSS
- **Content** comes from microCMS and multiple external feeds
- **Deployment** targets Cloudflare Workers

When working with this codebase, prioritize **type safety, component purity, accessibility, and multi-language support**. Always test both light/dark modes and responsive layouts.

---

**Last Updated:** 2025-11-15
**Document Version:** 1.0.0
