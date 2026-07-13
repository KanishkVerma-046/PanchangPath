# Technical SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every PanchangPath page correctly indexable, shareable, and eligible for search-engine rich results, per `docs/superpowers/specs/2026-07-13-technical-seo-design.md`.

**Architecture:** Extend the shared `Layout.astro` with canonical/OG/Twitter meta tags and sitewide Organization/WebSite JSON-LD (defaults are backward-compatible, so every existing page benefits with zero changes). Add a small reusable `BreadcrumbSchema.astro` component and wire it into the 5 groups of dynamic detail pages. Generate a branded default OG image once via a throwaway Playwright script. Audit and, where warranted, rewrite Tier 1 hub page titles/descriptions. Finish with a sitemap/crawlability check and a full build-based verification pass.

**Tech Stack:** Astro v7, TypeScript, Playwright (existing devDependency, used only for one-off image generation — not added to the app itself).

## Global Constraints

- All new `Layout.astro` props must be optional with defaults — every existing page must keep working unmodified.
- No new npm dependencies — reuse `playwright`, already a devDependency.
- Titles ≲60 characters, meta descriptions ≲155-160 characters, no keyword stuffing (per `.claude/skills/seo-content-writer/references/keyword-targets.md` and the approved spec).
- Execute and get sign-off on one task at a time — do not batch multiple tasks' changes into a single review pass.

## Pre-verified findings (no task needed)

- **Article JSON-LD already exists** in `src/components/BlogDetail.astro:13-29` with the exact shape the spec calls for (headline, description, author/publisher as Organization, datePublished, mainEntityOfPage). No task required for this spec item.
- **FAQPage JSON-LD has zero applicable pages today.** Grepped `src/pages/muhurta/*.astro` and `src/pages/jyotish/*.astro` (and `jyotish.astro`) for `FAQ|Frequently Asked|faq` — no matches. The spec scoped this as "opportunistic only, no new FAQ copy authored," so with no existing FAQ-shaped content, there is nothing to wrap in schema. No task required; revisit if a future page adds an FAQ section.

---

### Task 1: Generate the default OG image

**Files:**
- Create: `scripts/og-image-template.html`
- Create: `scripts/generate-og-image.mjs`
- Create (generated, not hand-written): `public/og-image.png`

**Interfaces:**
- Produces: `public/og-image.png`, a 1200×630 PNG, consumed by Task 2's `Layout.astro` default `image` prop.

- [ ] **Step 1: Write the OG image HTML template**

Create `scripts/og-image-template.html`:

```html
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 1200px;
    height: 630px;
  }
  body {
    background: linear-gradient(135deg, #FFFBF3 0%, #FBE4D2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Georgia, 'Times New Roman', serif;
  }
  .card {
    text-align: center;
  }
  .symbol {
    font-size: 120px;
    line-height: 1;
    margin-bottom: 24px;
  }
  .wordmark {
    font-size: 72px;
    font-weight: 700;
    color: #2B1608;
    letter-spacing: -1px;
  }
  .rule {
    width: 160px;
    height: 4px;
    background: #C8922A;
    margin: 28px auto;
    border-radius: 2px;
  }
  .tagline {
    font-size: 28px;
    color: #B5390A;
    font-weight: 500;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="symbol">🕉️</div>
    <div class="wordmark">PanchangPath</div>
    <div class="rule"></div>
    <div class="tagline">Hindu Panchang for Any Date &amp; Location</div>
  </div>
</body>
</html>
```

- [ ] **Step 2: Write the screenshot script**

Create `scripts/generate-og-image.mjs`:

```js
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(__dirname, 'og-image-template.html');
const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`file://${templatePath.replace(/\\/g, '/')}`);
await page.screenshot({ path: outputPath });
await browser.close();

console.log(`OG image written to ${outputPath}`);
```

- [ ] **Step 3: Run the script**

Run: `node scripts/generate-og-image.mjs`
Expected: prints `OG image written to .../public/og-image.png`, and the file exists.

- [ ] **Step 4: Verify the image visually**

Use the Read tool on `public/og-image.png` and confirm: brand colors, 🕉️ symbol, "PanchangPath" wordmark, and tagline are all visible, centered, and not cut off at the 1200×630 edges.

- [ ] **Step 5: Commit**

```bash
git add scripts/og-image-template.html scripts/generate-og-image.mjs public/og-image.png
git commit -m "feat: generate default OG share image"
```

---

### Task 2: Layout.astro meta tag completeness (canonical, OG, Twitter Card)

**Files:**
- Modify: `src/layouts/Layout.astro:1-37`

**Interfaces:**
- Consumes: `public/og-image.png` from Task 1 (referenced by path, works even before Task 1 runs, but visual correctness depends on it existing).
- Produces: `Layout` now accepts optional `image?: string` and `canonical?: string` props, both defaulted. Every existing `<Layout title=... description=...>` call site is unaffected.

- [ ] **Step 1: Modify Layout.astro's frontmatter**

In `src/layouts/Layout.astro`, replace lines 6-16:

```astro
interface Props {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
}

const {
  title = 'PanchangPath — Hindu Almanac for Any Date & Location',
  description = 'Precise Panchang with Tithi, Nakshatra, Yoga, Karana, Rahu Kalam, festivals and muhurtas — clean, fast, and ad-free.',
  image = '/og-image.png',
  canonical,
} = Astro.props;

const siteUrl = 'https://panchangpath.com';
const canonicalUrl = canonical ?? `${siteUrl}${Astro.url.pathname}`;
const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

const currentYear = new Date().getFullYear();
```

- [ ] **Step 2: Add the new meta tags to the head**

In `src/layouts/Layout.astro`, replace lines 29-32 (the existing Open Graph block):

```astro
  <link rel="canonical" href={canonicalUrl} />
  <!-- Open Graph -->
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:site_name" content="PanchangPath" />
  <meta property="og:image" content={imageUrl} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={imageUrl} />
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: build succeeds with no errors.

Then inspect `dist/index.html` (or `dist/index/index.html`, whichever Astro emits) and confirm it contains a `<link rel="canonical" href="https://panchangpath.com/">`, `<meta property="og:image" content="https://panchangpath.com/og-image.png">`, and `<meta name="twitter:card" content="summary_large_image">`.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: add canonical URL, OG image, and Twitter Card meta tags"
```

---

### Task 3: Organization/WebSite JSON-LD (sitewide)

**Files:**
- Modify: `src/layouts/Layout.astro` (head section, added in Task 2)

**Interfaces:**
- Consumes: `siteUrl` const from Task 2's frontmatter.
- Produces: nothing consumed by later tasks (self-contained, sitewide, static schema).

- [ ] **Step 1: Add the JSON-LD script to Layout.astro's head**

In `src/layouts/Layout.astro`, immediately before the closing `</head>` tag, add:

```astro
  <script type="application/ld+json" set:html={JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'PanchangPath',
        url: siteUrl,
        logo: `${siteUrl}/favicon.svg`,
        description: 'Free Hindu Panchang, festival calendar, muhurta timing and Jyotish calculators — Drik astronomical method, Lahiri Ayanamsha.',
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: 'PanchangPath',
        url: siteUrl,
        publisher: { '@id': `${siteUrl}/#organization` },
      },
    ],
  })} />
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: build succeeds.

Inspect `dist/index.html` and confirm a `<script type="application/ld+json">` block is present containing `"@type":"Organization"` and `"@type":"WebSite"`. Paste the JSON (without the surrounding `<script>` tags) into a JSON validator or `node -e "JSON.parse(require('fs').readFileSync('/path/to/extracted.json','utf8'))"` to confirm it's syntactically valid.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: add sitewide Organization/WebSite JSON-LD"
```

---

### Task 4: BreadcrumbList JSON-LD on dynamic detail pages

**Files:**
- Create: `src/components/seo/BreadcrumbSchema.astro`
- Modify: `src/pages/festivals/[slug].astro:1-2, 36-41`
- Modify: `src/pages/events/[id].astro:1-2` (near top, inside `<Layout>`)
- Modify: `src/pages/rashifal/[rashi].astro:1-3, 26-29`
- Modify: `src/pages/panchang/[region].astro:1-2, 52-55`
- Modify: `src/components/DevotionalDetail.astro:1-2, 22-27`

**Interfaces:**
- Produces: `BreadcrumbSchema` component with `Props { items: { name: string; url: string }[] }`, consumed by all 5 modified files below.

- [ ] **Step 1: Create the BreadcrumbSchema component**

Create `src/components/seo/BreadcrumbSchema.astro`:

```astro
---
interface Crumb {
  name: string;
  url: string;
}

interface Props {
  items: Crumb[];
}

const { items } = Astro.props;
const siteUrl = 'https://panchangpath.com';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
  })),
};
---

<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

- [ ] **Step 2: Wire into `festivals/[slug].astro`**

In `src/pages/festivals/[slug].astro`, add the import after line 2:

```astro
import BreadcrumbSchema from '../../components/seo/BreadcrumbSchema.astro';
```

Then, immediately after the opening `<Layout ...>` tag (after line 41 `>`), add:

```astro
  <BreadcrumbSchema items={[
    { name: 'Home', url: '/' },
    { name: 'Festivals', url: '/festivals' },
    { name: f.name, url: `/festivals/${thisSlug}` },
  ]} />
```

- [ ] **Step 3: Wire into `events/[id].astro`**

In `src/pages/events/[id].astro`, add the import after line 2:

```astro
import BreadcrumbSchema from '../../components/seo/BreadcrumbSchema.astro';
```

Then, immediately after the file's `<Layout ...>` opening tag, add:

```astro
  <BreadcrumbSchema items={[
    { name: 'Home', url: '/' },
    { name: 'Planetary Events', url: '/events' },
    { name: ev.title, url: `/events/${ev.id}` },
  ]} />
```

- [ ] **Step 4: Wire into `rashifal/[rashi].astro`**

In `src/pages/rashifal/[rashi].astro`, add the import after line 4:

```astro
import BreadcrumbSchema from '../../components/seo/BreadcrumbSchema.astro';
```

Then, immediately after the opening `<Layout ...>` tag (after line 29 `>`), add:

```astro
  <BreadcrumbSchema items={[
    { name: 'Home', url: '/' },
    { name: 'Rashifal', url: '/rashifal' },
    { name: rashi.name, url: `/rashifal/${rashi.id}` },
  ]} />
```

- [ ] **Step 5: Wire into `panchang/[region].astro`**

In `src/pages/panchang/[region].astro`, add the import after line 7:

```astro
import BreadcrumbSchema from '../../components/seo/BreadcrumbSchema.astro';
```

Then, immediately after the opening `<Layout ...>` tag (after line 55 `>`), add:

```astro
  <BreadcrumbSchema items={[
    { name: 'Home', url: '/' },
    { name: 'Regional Panchang', url: '/panchang/regional' },
    { name: regionDef.name, url: `/panchang/${slug}` },
  ]} />
```

- [ ] **Step 6: Wire into the shared `DevotionalDetail.astro` component**

This single edit covers all 11 devotional categories that reuse this component (aarti, chalisa, stotram, ashtakam, mantra, yantra, namavali, vrat-katha, puja-vidhi, durga-saptashati, sundarkand).

In `src/components/DevotionalDetail.astro`, add the import after line 2:

```astro
import BreadcrumbSchema from './seo/BreadcrumbSchema.astro';
```

Then, immediately after the frontmatter's closing `---` (before line 22's `<!-- ── Hero ── -->`), add:

```astro
<BreadcrumbSchema items={[
  { name: 'Home', url: '/' },
  { name: 'Devotional', url: '/devotional' },
  { name: category.label, url: category.url },
  { name: item.title, url: `${category.url}/${item.slug}` },
]} />
```

- [ ] **Step 7: Build and verify**

Run: `npm run build`
Expected: build succeeds.

Spot-check the generated HTML for one page from each group — e.g. `dist/festivals/diwali-2025/index.html`, `dist/rashifal/mesha/index.html`, and `dist/devotional/aarti/<any-slug>/index.html` — and confirm each contains a `<script type="application/ld+json">` with `"@type":"BreadcrumbList"` and the expected crumb names.

- [ ] **Step 8: Commit**

```bash
git add src/components/seo/BreadcrumbSchema.astro src/pages/festivals/[slug].astro src/pages/events/[id].astro src/pages/rashifal/[rashi].astro src/pages/panchang/[region].astro src/components/DevotionalDetail.astro
git commit -m "feat: add BreadcrumbList JSON-LD to dynamic detail pages"
```

---

### Task 5: Tier 1 title/description audit

**Files:**
- Modify: `src/pages/index.astro:45`

**Interfaces:** None — this task only rewrites literal string props on an existing `<Layout>` call.

Audit findings for all 10 Tier 1 pages (against `.claude/skills/seo-content-writer/references/keyword-targets.md`):

| Page | Verdict |
|---|---|
| `/` (homepage) | **Rewrite** — title is generic, no `description` override at all |
| `/festivals` | Pass — already covers "hindu festivals 2026" cluster |
| `/muhurta` | Pass — already covers muhurta/choghadiya/vivah cluster |
| `/jyotish` | Pass — already keyword-dense (kundali, mangal dosha, kalasarpa, etc.) |
| `/rashifal` | Pass — already covers rashifal/horoscope cluster |
| `/devotional` | Pass — already lists every category by name |
| `/calendar` | Pass — matches "panchang calendar" intent |
| `/panchang/regional` | Pass — already lists all 11 traditions by name |
| `/blog` | Pass — matches blog cluster intent |
| `/events` | Pass — matches planetary events cluster |

- [ ] **Step 1: Rewrite the homepage title and description**

In `src/pages/index.astro`, replace line 45:

```astro
<Layout title="PanchangPath — Today's Hindu Panchang">
```

with:

```astro
<Layout
  title="Today's Panchang — Tithi, Nakshatra, Hindu Calendar | PanchangPath"
  description="Free Hindu Panchang for any date and location — Tithi, Nakshatra, Yoga, Karana, Rahu Kalam, festivals and muhurtas. Drik calculations, Lahiri Ayanamsha."
>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: build succeeds. Inspect the generated homepage HTML and confirm `<title>Today's Panchang — Tithi, Nakshatra, Hindu Calendar | PanchangPath</title>` and the new `<meta name="description" ...>` are present (not the old generic ones).

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: strengthen homepage title/description for target keywords"
```

---

### Task 6: Sitemap, crawlability & final verification pass

**Files:** None modified — this task is inspection-only. If it surfaces a real bug (e.g. a missing route, an accidental noindex), that fix becomes a new follow-up task rather than being silently folded in here.

- [ ] **Step 1: Build the site**

Run: `npm run build`
Expected: build succeeds with no errors.

- [ ] **Step 2: Inspect the generated sitemap**

Run (PowerShell): `Get-Content dist/sitemap-index.xml` then `Get-Content dist/sitemap-0.xml` (adjust filename if Astro splits into more than one sitemap file — list `dist/*.xml` first to see what was generated).

Confirm the sitemap includes: at least one festival slug URL, at least one devotional detail URL (e.g. `/devotional/aarti/...`), at least one jyotish calculator URL, at least one muhurta tool URL, at least one `/panchang/<region>` URL, and (if any posts exist) a `/blog/<slug>` URL.

- [ ] **Step 3: Check for accidental noindex**

Run: search `dist/**/*.html` for `noindex` (e.g. via `Grep` tool with pattern `noindex` over the `dist` directory).
Expected: no matches — no page should carry a `noindex` robots meta tag.

- [ ] **Step 4: Spot-check meta/JSON-LD on 4 representative pages**

Open the generated HTML for: the homepage, one blog post (if any exist), one festival detail page, and one devotional detail page. For each, confirm presence of: `<link rel="canonical">`, `og:image`, `twitter:card`, and at least one `application/ld+json` script block with real (non-empty) values — not placeholder text.

- [ ] **Step 5: Record findings**

If everything passes, no commit is needed for this task (nothing changed). If a real gap is found (e.g. a route missing from the sitemap, a stray noindex), open it as a new follow-up task rather than patching ad hoc — this task is verification, not a catch-all fix slot.

---

## Self-Review

**Spec coverage:**
1. Meta tag completeness → Task 2. ✅
2. Default OG image → Task 1. ✅
3. Structured data: Organization/WebSite → Task 3 ✅; Article → already existed, documented in "Pre-verified findings" ✅; BreadcrumbList → Task 4 ✅; FAQPage → zero applicable pages, documented in "Pre-verified findings" ✅.
4. Per-page title/description audit (Tier 1) → Task 5 ✅.
5. Sitemap & crawlability check → Task 6, Steps 1-3 ✅.
6. Verification → Task 6, Steps 4-5 ✅.

**Placeholder scan:** No TBDs, no "add appropriate X," no "similar to Task N" — every step has literal file paths and complete code. Task 6 intentionally has no code changes (it's a verification task), which is documented, not a placeholder.

**Type consistency:** `BreadcrumbSchema`'s `Props { items: { name: string; url: string }[] }` is used identically across all 5 call sites in Task 4. `Layout`'s new `image`/`canonical` props (Task 2) are consumed correctly in Task 3 (`siteUrl` const) without redefinition.
