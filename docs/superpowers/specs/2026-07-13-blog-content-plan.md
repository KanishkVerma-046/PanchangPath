# Blog Content Plan — Initial Batch

**Date:** 2026-07-13
**Status:** Approved

## Goal

Publish an initial batch of 6 SEO blog posts, one per content cluster defined in `.claude/skills/seo-content-writer/references/keyword-targets.md`, to seed `src/lib/blog.ts`'s currently-empty `BLOG_POSTS` array. This is the content half of the two-part SEO effort; the technical-SEO half (canonical/OG/Twitter tags, JSON-LD, sitemap verification) is already complete and merged (see `docs/superpowers/specs/2026-07-13-technical-seo-design.md`).

## Scope

Each post is broader than a single long-tail query — it's written to comprehensively address multiple related long-tail queries within its cluster, rather than one narrow angle per post. The Devotional Practice post specifically avoids naming any single chalisa/aarti/stotram as its subject (a comparative/explainer angle instead), per explicit instruction.

| # | Cluster | Topic | Primary Keyword | Long-tails covered |
|---|---|---|---|---|
| 1 | Panchang & Tithi | Understanding the Hindu Panchang: Tithi, Nakshatra & Rahu Kalam Explained | "what is tithi in hindu calendar" | What is tithi, how it's calculated from DOB, Amanta vs Purnimanta, why tithi changes at different times, what is Rahu Kalam |
| 2 | Festivals & Vrats | Hindu Vrat & Fasting Traditions: Ekadashi, Vrat Katha and Festival Differences Explained | "why do we fast on ekadashi" | Why we fast on Ekadashi, Vrat Katha meaning/significance, Diwali vs Dhanteras difference (dates handled via a link to the live festival calendar, not listed inline, to stay evergreen) |
| 3 | Muhurta Timing | Shubh Muhurat Explained: Choghadiya, Wedding Dates, Griha Pravesh & Days to Avoid | "shubh muhurat" | What is Choghadiya, choosing a wedding date, tithis good for buying a vehicle, days of the week avoided for muhurta |
| 4 | Jyotish & Kundali | How to Read Your Kundali: Birth Chart Basics, Kundali Matching, Mangal Dosha & Kalasarpa Yoga | "how to read a birth chart / kundali" | Reading a birth chart, kundali matching/milan, Mangal Dosha severity, Kalasarpa Yoga, finding rashi/nakshatra from DOB |
| 5 | Rashifal | Rashifal Explained: Daily vs Weekly vs Monthly, Accuracy, and Rashi vs Moon Sign | "difference between rashi and moon sign" | How accurate is daily rashifal, rashi vs moon sign, what daily/weekly/monthly rashifal each mean |
| 6 | Devotional Practice | Aarti, Chalisa, Stotram & Mantra Explained: A Guide to Hindu Devotional Practice | "difference between aarti, chalisa, and stotram" | Aarti vs Chalisa vs Stotram difference, Puja Vidhi how-to, Durga Saptashati significance, best time to recite Gayatri Mantra — deliberately no single chalisa/aarti/stotram as the subject |

## Execution mechanism

Each post is produced entirely through the existing `seo-content-writer` skill (`.claude/skills/seo-content-writer/SKILL.md`) — no new tooling, no code changes beyond what that skill's own Step 5 ("Publish") already specifies (append to `BLOG_POSTS` in `src/lib/blog.ts`, run `npm run build`). The skill's own workflow already includes an outline-approval checkpoint (Step 3) before drafting each post — that gate is not duplicated here.

Cadence: all 6 posts are drafted and published now (not spread out over time), per explicit instruction — this list is fixed at 6, this session, not an ongoing calendar.

Execution order: posts 1-6 in the table order above, one at a time. Per standing project preference, each post's full cycle (requirements → research → outline approval → draft → publish) completes before the next post's cycle begins, with an explicit check-in before starting each new post.

## Out of scope

- Any post naming a single devotional item (chalisa/aarti/stotram) as its subject.
- Exact 2026 festival/Ekadashi dates listed inline in body copy (link to the live `/festivals` or Ekadashi tooling instead, to keep posts evergreen).
- A recurring/ongoing content calendar beyond this batch of 6 — future batches are a separate future decision.
