---
name: seo-content-writer
description: Research and draft SEO-optimized blog posts for PanchangPath's /blog section. Use when asked to "write a blog post about X", "draft an SEO article on X", or "write a PanchangPath blog post".
---

# SEO Content Writer — PanchangPath

Writes SEO blog posts for panchangpath.com through a research-then-approval-then-draft workflow. Every post goes through an explicit outline-approval checkpoint before full drafting begins — never skip straight to a full draft.

## Baked-in variables

| Variable | Value |
|---|---|
| Brand | PanchangPath |
| URL | https://panchangpath.com |
| Default word count | 1500 |
| Language | English only |
| Audience | People seeking accurate Hindu Panchang/festival/muhurta timings — traditional practitioners and Hindu diaspora abroad |
| Primary topics | Panchang & Tithi, Festivals & Vrats, Muhurta timing, Jyotish/Kundali, Rashifal, Devotional practice |
| Competitor mentions | Never name drikpanchang.com or any other competitor, anywhere |
| Negative keywords (baseline) | "guaranteed," "overnight," medical/legal-advice-style astrology claims — extend per-post in Step 1 |

Never make claims about advertising on PanchangPath in generated content — no "ad-free", "zero ads", "no advertising", "without the ads", or equivalent. The site is applying to Google AdSense, so any promise that advertising is absent will become false. Positioning the site as clean, fast, uncluttered or free to use is fine.

## Workflow

### Step 1 — Gather requirements

Ask the user for (skip questions they've already answered in their request):
- Primary keyword
- Topic/angle
- Target audience slice (default: general PanchangPath audience)
- Word count (default: 1500)
- Negative keywords/phrases to avoid for this post (in addition to the baseline above)
- Optional CTA or related-topic notes

If the user hasn't specified a topic at all, suggest 2-3 options from `references/keyword-targets.md`.

### Step 2 — Research

1. Run 3-7 web searches covering search intent, statistics, trends, and expert perspectives on the topic.
2. Read `references/internal-links.md` and identify 3-5 relevant internal pages to link to. If it looks stale (missing a page you know exists, e.g. a recently-added calculator), re-run `node scripts/generate-link-map.mjs` from the repo root before continuing.
3. Compile all sources with specific placement recommendations: which section they support, and what anchor text to use.

### Step 3 — Present outline & recommendations [APPROVAL REQUIRED]

Present, in this order:
1. Search-intent analysis (what is the reader actually trying to find out?)
2. Complete H2/H3 outline
3. Source integration plan — 5-10 sources with URLs and where each will be used
4. Internal-linking plan — 3-5 links with reasoning for each

Explicitly ask: "Does this outline look right? I won't start drafting until you approve it." **Do not draft the post before this is approved.** If the user requests changes, revise and re-present before proceeding.

### Step 4 — Write the full post

Only after Step 3 is approved. Follow:
- The approved outline exactly.
- `references/tone-of-voice.md` for voice and the do/avoid lists.
- `references/seo-checklist.md` as the acceptance bar.

Structure:
- **Intro** (150-200 words): hook, problem, promise.
- **Body** (4-6 H2s, 2-4 H3s each, ~1200-1400 words combined for the 1500-word default): primary keyword worked naturally into 2-3 H2s.
- **2-4 FAQ-style H2/H3 sections**: self-contained Q&A, each answerable on its own without the rest of the article.
- **Conclusion** (100-150 words): summary + CTA.

Sources: paraphrase everything, embed as contextual hyperlinks with descriptive anchor text (never "click here," never a naked URL, never a verbatim quote).

Internal links: 3-5, woven naturally, using the pages and reasoning from the approved Step 3 plan.

Write the body as HTML (matching the `contentHtml` field's rendering — `<h2>`, `<h3>`, `<p>`, `<ul>`/`<ol>`, `<a href="...">` tags; no `<html>`/`<body>` wrapper).

Before presenting the draft as done, run it against every item in `references/seo-checklist.md`.

### Step 5 — Publish

1. Open `src/lib/blog.ts` and append a new entry to the `BLOG_POSTS` array:
   ```ts
   {
     slug: 'my-post-slug',       // kebab-case, derived from the title
     title: 'Post Title',
     description: 'Meta description, 150-160 characters.',
     publishDate: '2026-07-13',  // today's date, ISO format
     keywords: ['primary keyword', 'secondary keyword'],
     contentHtml: `<p>...</p>`,  // the full HTML body from Step 4
   }
   ```
2. Run `npm run build` and confirm it succeeds with the new post included.
3. Confirm the post is reachable at `/blog/<slug>` (the `/blog` hub link is already wired into Header.astro's nav — no per-post nav changes needed; only the hub link exists in nav, matching how `/devotional` and `/festivals` work).

## References

- `references/tone-of-voice.md` — voice, positioning, do/avoid lists
- `references/keyword-targets.md` — seeded head terms and long-tail queries by content cluster
- `references/seo-checklist.md` — the Step 4 quality bar
- `references/internal-links.md` — generated internal link map (regenerate with `node scripts/generate-link-map.mjs` after adding new pages)
