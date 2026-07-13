# Technical SEO Improvements — Design

**Date:** 2026-07-13
**Status:** Approved for planning

## Goal

Make every PanchangPath page correctly indexable, shareable, and eligible for search-engine rich results (article snippets, breadcrumbs, sitelinks search box) without changing on-page copy beyond title/description tags. This is the technical-SEO half of a two-part SEO effort; blog content strategy (using the existing `seo-content-writer` skill) is a separate, later effort.

## Current state

- `src/layouts/Layout.astro` has `<meta name="description">` and Open Graph `og:title`/`og:description`/`og:type` only. No canonical link, no OG image, no `og:url`/`og:site_name`, no Twitter Card tags, no JSON-LD anywhere.
- `@astrojs/sitemap` is configured (`astro.config.mjs`) and `public/robots.txt` correctly references `sitemap-index.xml`. Not yet verified that all dynamic routes are actually present in the generated output.
- No image assets exist in `public/` besides `favicon.ico`/`favicon.svg` — no raster OG image exists yet.
- Most devotional/jyotish/blog hub pages already pass reasonably keyword-rich `title`/`description` props to `Layout`. Homepage's title (`"PanchangPath — Today's Hindu Panchang"`) is generic and passes no `description` override (falls back to the site default).
- `src/lib/blog.ts`'s `BlogPost` interface has no author/byline field; `BLOG_POSTS` is currently empty.
- No `sameAs` social profiles exist for PanchangPath yet.

## Scope

### 1. Meta tag completeness (`Layout.astro`)

Add:
- **Canonical URL** — new optional `canonical` prop, defaulting to `https://panchangpath.com` + `Astro.url.pathname`. Emits `<link rel="canonical" href="...">`. Pages needing a different canonical can pass the prop explicitly.
- **OG completeness** — `og:url` (same resolved URL as canonical), `og:site_name` (`"PanchangPath"`), `og:image` (default `/og-image.png`, overridable via new `image` prop), `og:image:width` (1200), `og:image:height` (630).
- **Twitter Card** — `twitter:card` = `summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image` (reuses the OG image prop, no separate asset).

All new props are optional with sensible defaults so existing pages need zero changes to keep working.

### 2. Default OG image

- Build an HTML/CSS template (brand colors from `global.css`, 🕉️ mark, "PanchangPath" wordmark, tagline "Hindu Panchang for Any Date & Location") in a scratch HTML file.
- Rasterize it with **Playwright** (already a devDependency — no new dependency needed) via a one-off Node script, `scripts/generate-og-image.mjs`: launches a headless page sized 1200×630, loads the template, screenshots to `public/og-image.png`.
- This runs once at build/design time, not on every `astro build`.

### 3. Structured data (JSON-LD)

- **Organization + WebSite schema** — one `<script type="application/ld+json">` block injected sitewide in `Layout.astro`'s `<head>`. Fields: `name`, `url`, `logo` (points at `/favicon.svg` or a rasterized PNG if SVG proves incompatible with validators), `description`. No `sameAs` (no social profiles yet — can be added later without restructuring).
- **Article schema** — added to `src/pages/blog/[slug].astro` per post: `headline` (post title), `description`, `datePublished` (from `BlogPost.publishDate`), `author` and `publisher` both set to the PanchangPath Organization object (no per-post byline field exists, so no schema change needed on `BlogPost`).
- **BreadcrumbList** — added to dynamic detail pages reflecting existing nav hierarchy (Home → Section → Page): `festivals/[slug].astro`, `events/[id].astro`, `devotional/*/[slug].astro` pages, `rashifal/[rashi].astro`, `panchang/[region].astro`.
- **FAQPage** — opportunistic only. Applied only to pages that already contain an existing Q&A-style section in their current copy (identified during implementation by grepping for FAQ-shaped content across `muhurta/*.astro` and `jyotish/*.astro`). No new FAQ copy is authored as part of this work — schema markup only wraps content that already exists on the page.

### 4. Per-page title/description audit (Tier 1)

Audit and, where it improves keyword targeting per `.claude/skills/seo-content-writer/references/keyword-targets.md`, rewrite `title`/`description` for these Tier 1 hub pages only (detail/leaf pages under them are out of scope for this pass):

- `/` (homepage) — weakest current title, needs work
- `/festivals`
- `/muhurta`
- `/jyotish`
- `/rashifal`
- `/devotional`
- `/calendar`
- `/panchang/regional`
- `/blog`
- `/events`

Constraints: titles ≲60 characters, descriptions ≲155-160 characters, primary keyword present in both where natural (no keyword stuffing).

### 5. Sitemap & crawlability check

After `npm run build`, inspect the generated `dist/sitemap-index.xml` / `dist/sitemap-0.xml` (or however `@astrojs/sitemap` names its output) to confirm:
- All dynamic routes are present: festival slugs, event ids, every devotional detail page, every jyotish calculator, every muhurta tool, every regional panchang page, every blog post.
- No accidental `noindex` robots meta tags on any page that should be indexed.
- No orphaned pages (reachable by direct URL / sitemap but not linked from any nav, hub page, or other sitemap-eligible page).

### 6. Verification

- `npm run build` succeeds.
- Spot-check generated HTML for a homepage, a blog post, a festival detail page, and a devotional detail page: confirm canonical, OG, Twitter, and JSON-LD tags render correctly with real (not placeholder) values.
- Validate JSON-LD structurally against Google's documented Rich Results requirements (structural review only — no live deploy yet, so no live Rich Results Test run).

## Out of scope (explicitly deferred)

- Blog content strategy / topic selection (separate spec, uses existing `seo-content-writer` skill).
- `sameAs` social profile links (no profiles exist yet).
- Title/description audit for non-Tier-1 (leaf/detail) pages.
- Adding a per-post author/byline field to `BlogPost`.
- Any new FAQ content — only wrapping existing FAQ-shaped copy in schema.

## Execution note

Per user preference, implementation should proceed one numbered scope item at a time (not as one large batch) to keep each step's token/context footprint small and reviewable.
