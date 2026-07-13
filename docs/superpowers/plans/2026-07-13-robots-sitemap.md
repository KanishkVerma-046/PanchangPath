# robots.txt + Sitemap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `robots.txt` that allows all crawlers and points to a working, auto-generated sitemap.

**Architecture:** Register the official `@astrojs/sitemap` integration (which walks all static routes at build time, including every `getStaticPaths()` page, and emits `dist/sitemap-index.xml` + chunked `dist/sitemap-0.xml`), set `site: 'https://panchangpath.com'` in `astro.config.mjs` so the integration can produce absolute URLs, and add a static `public/robots.txt` that references the generated sitemap index.

**Tech Stack:** Astro v7 (`output: 'static'`), `@astrojs/sitemap` npm package.

## Global Constraints

- Canonical domain for sitemap/robots URLs: `https://panchangpath.com` (per spec — domain not yet DNS-attached, but this is the intended production URL; see `docs/superpowers/specs/2026-07-13-robots-sitemap-design.md`).
- Sitemap entry point is `sitemap-index.xml` (the integration's actual default output name) — not `sitemap.xml`.
- `robots.txt` allows all crawlers on all paths (no disallow rules).

---

### Task 1: Add sitemap integration, configure site URL, add robots.txt

**Files:**
- Modify: `package.json` (add `@astrojs/sitemap` dependency via `npm install`)
- Modify: `astro.config.mjs`
- Create: `public/robots.txt`

**Interfaces:**
- Consumes: nothing (self-contained config/infra task)
- Produces: `dist/robots.txt`, `dist/sitemap-index.xml`, `dist/sitemap-0.xml` after `npm run build` — no other task in this plan depends on these, but any future page-count growth automatically flows through the same integration with no further code changes needed.

- [ ] **Step 1: Install `@astrojs/sitemap`**

Run:
```bash
npm install @astrojs/sitemap
```

Expected: `package.json` `dependencies` gains an `"@astrojs/sitemap": "^..."` entry; `package-lock.json` updates; no errors.

- [ ] **Step 2: Register the integration and set `site` in `astro.config.mjs`**

Current content of `astro.config.mjs`:
```js
// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  }
});
```

Replace with:
```js
// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://panchangpath.com',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});
```

- [ ] **Step 3: Create `public/robots.txt`**

Full file content:
```
User-agent: *
Allow: /

Sitemap: https://panchangpath.com/sitemap-index.xml
```

- [ ] **Step 4: Build and verify output**

Run:
```bash
npm run build
```

Expected: build completes with no errors, and the following files exist:
- `dist/robots.txt`
- `dist/sitemap-index.xml`
- `dist/sitemap-0.xml` (or similarly numbered chunk file)

Verify content — run:
```bash
node -e "const fs=require('fs'); console.log(fs.readFileSync('dist/robots.txt','utf8')); console.log('---'); console.log(fs.readFileSync('dist/sitemap-index.xml','utf8'));"
```

Expected: `dist/robots.txt` output matches Step 3's content exactly; `dist/sitemap-index.xml` output contains a `<sitemap><loc>https://panchangpath.com/sitemap-0.xml</loc></sitemap>`-style reference (exact chunk filename may vary).

- [ ] **Step 5: Spot-check a known dynamic route made it into the sitemap**

Run:
```bash
node -e "const fs=require('fs'); const xml=fs.readFileSync('dist/sitemap-0.xml','utf8'); console.log(xml.includes('/festivals/') ? 'FOUND festivals route' : 'MISSING festivals route');"
```

Expected: `FOUND festivals route` (confirms `getStaticPaths()` pages like `festivals/[slug].astro` were picked up by the integration).

If the chunk filename from Step 4 differs from `dist/sitemap-0.xml`, use the actual filename observed.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json astro.config.mjs public/robots.txt
git commit -m "$(cat <<'EOF'
Add robots.txt and auto-generated sitemap

Registers @astrojs/sitemap so every static route (including
getStaticPaths pages) is included in a generated sitemap-index.xml,
and adds public/robots.txt pointing crawlers to it.
EOF
)"
```

Expected: commit succeeds; `git status` shows a clean working tree.
