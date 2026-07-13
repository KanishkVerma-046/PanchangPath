# SEO Checklist — PanchangPath Blog Posts

Run every finished post against this list before presenting it as done. Adapted from the SEO Content Writer Skill Generator Prompt's Step 4 quality standards for PanchangPath's context.

## Before writing
- [ ] Outline was explicitly approved by the user (Step 3) before drafting began.

## Content
- [ ] Primary keyword appears in the title, the first paragraph, and 2-3 H2s — naturally, never stuffed (~1-2% density).
- [ ] 2-4 FAQ-style H2/H3 sections, each self-contained enough to answer the question on its own.
- [ ] Word count within ~10% of the target agreed in Step 1.
- [ ] Every heading is followed by substantive content (no empty/decorative headings).
- [ ] No negative keywords or phrases from Step 1 appear anywhere in the post.
- [ ] Tone matches `tone-of-voice.md` and `SKILL.md`'s baked-in variables — no site-positioning/business-model claims, no mystical-vague language, no manufactured urgency.

## Sources & links
- [ ] All research is paraphrased — nothing quoted verbatim from a source (copyright hygiene).
- [ ] Every external source is embedded as a contextual hyperlink with descriptive anchor text — never "click here," never a naked URL.
- [ ] 3-5 internal links woven naturally into the body, each pointing to a real page from `internal-links.md`.
- [ ] No competitor mentions — see `SKILL.md`'s baked-in variables for the specific name to never use.

## Structure
- [ ] Intro: 150-200 words — hook, problem, promise.
- [ ] Body: 4-6 H2 sections, each with 2-4 H3s where relevant.
- [ ] Conclusion: 100-150 words — summary + CTA.

## Publish
- [ ] Post appended to `src/lib/blog.ts`'s `BLOG_POSTS` array with a real `slug`, `title`, `description`, `publishDate`, `keywords`, and `contentHtml`.
- [ ] `npm run build` succeeds with the new post included.
- [ ] New post's URL renders correctly (title, dates, reading time, internal links, JSON-LD) when checked in a local build.
