# SEO Content Writer Skill — Design

## Background

The user provided a PDF ("SEO Content Writer Skill Generator Prompt") describing a generic template for building a Claude skill that writes SEO blog posts in a brand voice, via a 4-step approval workflow (gather requirements → research → outline approval → write). The template assumes a marketing-agency/consultant context: it expects a tone-of-voice doc, a manually-uploaded sitemap CSV, and a client-wins/testimonials doc, and it ends by packaging the skill as a `.zip` for upload to claude.ai.

None of that maps directly onto PanchangPath, a Hindu almanac utility site with no blog, no clients, and no manually-maintained sitemap. This design adapts the PDF's workflow into a **project skill for Claude Code** (lives in this repo, not packaged/uploaded) and adds the site infrastructure (a `/blog` section) needed for the skill to have somewhere to publish to.

## Goals

1. A repeatable Claude Code skill that researches and drafts SEO blog posts for PanchangPath, with a human-approval checkpoint before full drafting.
2. A minimal `/blog` section on the site, built following existing repo conventions, so posts have somewhere real to live.
3. Reference material (tone of voice, internal-link map, keyword targets, quality checklist) that grounds the skill in this site's actual content and positioning — not generic marketing boilerplate.

## Non-goals

- No client-wins/testimonials/social-proof step (doesn't fit a utility site — dropped per user decision).
- No manually-uploaded sitemap CSV — the internal-link reference is generated from the codebase instead, so it can't go stale.
- No bilingual (Hindi) content for v1 — English only.
- No packaging as a distributable `.zip` — this is a live, in-repo project skill, not a claude.ai upload.
- No mention of the site being ad-free anywhere in tone-of-voice guidance or generated content (explicit user instruction).
- No naming of drikpanchang.com or other competitors in generated content, ever.

## 1. Skill mechanics

**Location:** `.claude/skills/seo-content-writer/SKILL.md` (project skill, invoked via the `Skill` tool, e.g. triggered by "write an SEO blog post about X").

**Workflow** (adapted from the PDF's 4 steps, +1 publish step since this runs in-repo rather than producing a doc for a human to paste elsewhere):

- **Step 1 — Gather requirements.** Ask for: primary keyword, topic/angle, target audience slice (default: general PanchangPath audience unless specified), word count (default 1500), negative keywords/phrases to avoid for this post, and any optional CTA or related-topic notes.
- **Step 2 — Research.** Run 3-7 web searches covering search intent, statistics, trends, and expert perspectives on the topic. Load `references/internal-links.md` to identify 3-5 relevant internal pages to link to. Compile all sources with specific placement recommendations (which section, what anchor text).
- **Step 3 — Present outline & recommendations [APPROVAL REQUIRED].** Present: search-intent analysis, complete H2/H3 outline, source integration plan (5-10 sources with URLs + placement), internal-linking plan (3-5 links + reasoning). Explicitly ask for approval before proceeding. **Do not draft the post before this is approved.**
- **Step 4 — Write the full post.** Only after approval: follow the approved outline, `references/tone-of-voice.md`, and `references/seo-checklist.md`. Primary keyword in title/first paragraph/2-3 H2s at ~1-2% density. 2-4 FAQ-style H2/H3 sections (self-contained Q&A, extractable on their own). All sources embedded as contextual hyperlinks with descriptive anchor text, paraphrased — never quoted verbatim, never "click here," never a naked URL. 3-5 internal links woven naturally. Standard structure: intro (150-200w hook + problem + promise), body (4-6 H2s each with 2-4 H3s, 1200-1400w combined for the 1500w default), conclusion (100-150w summary + CTA).
- **Step 5 — Publish.** Append the finished post to `src/lib/blog.ts`'s `BLOG_POSTS` array, confirm it renders via `npm run build`, and wire the post's existence into site navigation only if it's the *first* post (index/route wiring, not per-post — individual posts don't get their own nav entries, only the `/blog` hub does, same as `/festivals` or `/devotional`).

Every post finishes against `references/seo-checklist.md` before being presented as done.

## 2. Site infrastructure — `/blog` section

Built once, alongside the skill (not rebuilt per post). Follows the same data-array + shared-component pattern already used by the Devotional Library and Festivals features (see `CLAUDE.md`'s "Devotional Library pattern").

- **`src/lib/blog.ts`** — exports a `BlogPost` interface (`slug`, `title`, `description`, `publishDate`, `keywords: string[]`, `contentHtml`, `readingTimeMinutes` — computed or stored) and a `BLOG_POSTS: BlogPost[]` array. Post bodies are stored as HTML strings (same storage approach as the verbatim Sanskrit texts in `devotional/durga-saptashati.ts` / `sundarkand.ts` — a large string field, rendered with `set:html`).
- **`src/components/BlogIndexGrid.astro`** — card grid/list of posts (title, description, publish date, reading time), mirroring `DevotionalIndexGrid.astro`.
- **`src/components/BlogDetail.astro`** — full post render: title, metadata, `contentHtml`, prev/next links, mirroring `DevotionalDetail.astro`. Includes `Article` JSON-LD structured data (schema shape per `.agents/skills/seo/SKILL.md`'s Article example) using `title`, `description`, `publishDate`, and the site's own domain — no fake author/reviewer data.
- **`src/pages/blog/index.astro`** — renders `BlogIndexGrid` over `BLOG_POSTS`.
- **`src/pages/blog/[slug].astro`** — `getStaticPaths()` over `BLOG_POSTS`, renders `BlogDetail`.
- **Header.astro wiring** — add a "Blog" entry to desktop dropdown, mobile drawer, and `searchItems`, all three, per this repo's established nav-sync rule. Individual posts are reachable via the `/blog` index, not added to nav individually.
- **Sitemap** — no extra work; `@astrojs/sitemap` (already installed, already wired in `astro.config.mjs`) picks up new static routes automatically at build time.

## 3. Reference files

All under `.claude/skills/seo-content-writer/references/`:

- **`tone-of-voice.md`** — drafted as part of implementation (not manually supplied by the user). Positioning: precise and trustworthy (grounded in Drik astronomical calculations and Lahiri Ayanamsha), accessible to both traditional practitioners and Hindu diaspora audiences abroad, confident without being preachy or mystical-vague. Explicit "avoid" list includes: claiming the site is ad-free, naming competitors, medical/legal-advice-style astrology claims, empty buzzwords ("game-changer," "revolutionary"). Includes 5-10 example sentences and preferred/avoided phrasing, per the PDF's own guidance on what makes a good tone doc.
- **`internal-links.md`** — **generated, not hand-maintained.** A one-off script (`scripts/generate-link-map.mjs`, run manually / re-run when pages are added — not a build step) scans every `src/pages/**/*.astro` for its `<Layout title="..." description="...">` props via regex, derives the URL from the file path, and emits a Markdown table of `URL | Title | Description`. This replaces the PDF's manually-uploaded sitemap CSV with something that can't silently go stale.
- **`keyword-targets.md`** — seeded via real web research (WebSearch) during implementation, organized by the site's 6 content clusters (Panchang/Tithi, Festivals & Vrats, Muhurta timing, Jyotish/Kundali, Rashifal, Devotional practice). For each cluster: head terms, long-tail/question-style queries (the kind of phrasing real searchers use), and a one-line intent note. This seeds Step 1's topic selection so it's grounded in actual search behavior rather than guesswork.
- **`seo-checklist.md`** — adapted from the PDF's Step-4 quality-standards checklist: outline approved before writing; primary keyword present naturally (not stuffed); all sources embedded as hyperlinks; 3-5 internal links integrated; no negative keywords used; no competitor names used; tone matches `tone-of-voice.md`; every heading followed by substantive content; word count within ~10% of target; all research paraphrased, nothing quoted verbatim (copyright hygiene).

## 4. Variables baked into the skill

Hardcoded in `SKILL.md` rather than asked at runtime, since this is a single-site skill, not a reusable template:

| Variable | Value |
|---|---|
| Brand | PanchangPath |
| URL | https://panchangpath.com |
| Default word count | 1500 |
| Language | English only |
| Audience | People seeking accurate Hindu Panchang/festival/muhurta timings — traditional practitioners and Hindu diaspora abroad |
| Primary topics | Panchang & Tithi, Festivals & Vrats, Muhurta timing, Jyotish/Kundali, Rashifal, Devotional practice |
| Competitor mentions | Never name drikpanchang.com or any other competitor |
| Negative keywords (baseline) | "guaranteed," "overnight," medical/legal-advice-style astrology claims — extendable per-post in Step 1 |

Asked fresh at Step 1 for every post: primary keyword, specific topic/angle, and any post-specific negative keywords or CTA.

## Open risks / things to watch during implementation

- The Article JSON-LD schema needs a real `author`/`publisher` identity — using "PanchangPath" as both is reasonable for a utility site without named authors; flag if this looks wrong once drafted.
- `contentHtml` as a raw string field mirrors the Durga Saptashati pattern but that content is static verbatim scripture; blog posts will be written by Claude per-post, so keep an eye on whether HTML-string storage stays ergonomic as the post count grows (v1 doesn't need pagination or a CMS — revisit if this ever exceeds ~30-40 posts).
- `generate-link-map.mjs` is a manual/on-demand script, not wired into `npm run build` — it needs to be re-run by whoever (human or the skill itself) adds new pages, or `internal-links.md` will drift. Acceptable for v1; note it in the skill's own instructions as a reminder.
