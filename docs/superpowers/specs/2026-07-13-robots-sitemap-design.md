# robots.txt + sitemap design

**Date:** 2026-07-13
**Status:** Approved

## Goal

Add a `robots.txt` that allows all crawlers and points to a real, working sitemap.

## Context

The site currently has no `robots.txt`, no sitemap, no `@astrojs/sitemap` integration, and no `site` set in `astro.config.mjs`. The custom domain `panchangpath.com` is not yet attached to Cloudflare Pages (live today at `panchangpath.pages.dev`), but per `CLAUDE.md` the site is positioned/branded as `panchangpath.com`, so canonical URLs should use that domain now rather than churn later once DNS is wired up.

## Components

1. **`astro.config.mjs`** — add `site: 'https://panchangpath.com'` (required by the sitemap integration to generate absolute URLs) and register the `@astrojs/sitemap` integration.
2. **`package.json`** — add `@astrojs/sitemap` as a dependency.
3. **`public/robots.txt`** (new static file):
   ```
   User-agent: *
   Allow: /

   Sitemap: https://panchangpath.com/sitemap-index.xml
   ```
   Astro's static output copies `public/` files verbatim to `dist/`.

## Sitemap generation

`@astrojs/sitemap` hooks into `astro build` and walks every static route Astro generates — including all `getStaticPaths()` pages (festivals, events, rashifal, devotional, panchang regions, etc.) — emitting `dist/sitemap-index.xml` plus one or more chunked `dist/sitemap-0.xml` files with the actual URLs. No per-page code changes needed.

The integration always names its entry point `sitemap-index.xml`, even for a single chunk — it does not produce a plain `sitemap.xml`. This is standard for the official Astro integration, and Google/Bing both accept a sitemap index referenced directly from `robots.txt`.

## Verification

Run `npm run build` and confirm `dist/robots.txt` and `dist/sitemap-index.xml` both exist; spot-check that a few known routes (e.g. a festival detail page) appear in the generated sitemap XML.

## Out of scope

- Attaching the `panchangpath.com` custom domain in Cloudflare (tracked separately).
- Any `<link rel="canonical">` tag work — not requested, no existing canonical tags to reconcile.
