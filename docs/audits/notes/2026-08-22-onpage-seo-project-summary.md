# On-Page SEO Project — Final Summary (Tasks 0–10)

**Project span:** 2026-08-22 (single day, multiple sessions/tasks). **Status:** Closed out — every task 0 through 10 complete, deployed, and verified live on production (`panchangpath.com`) as of this note.

This is the consolidated record for the whole on-page SEO initiative, so future sessions don't have to reconstruct it from chat history. It covers what was touched, every schema type added, every real (non-copy) bug the process turned up, and everything deliberately left unbuilt or unfixed.

---

## 1. Pages touched, by category

| Category | Pages | Notes |
|---|---|---|
| Core | 2 | Homepage, `/calendar` |
| Regional Panchang | 11 | All 11 regional traditions (`/panchang/[region]`) |
| Muhurta | 10 | All 10 sub-pages under `/muhurta/` |
| Festivals | 64 of 96 | 12 highest-demand 2026 entries got full-depth treatment (FAQ schema, cross-links, date reverification); 52 more 2026/2027 entries got a title+meta-only light pass; 32 past-dated 2025 entries deliberately untouched (see §4) |
| Jyotish Calculators | 17 | Hub page + all calculator pages under `/jyotish/` |
| Rashifal & Planets | 17 | Rashifal hub + 12 rashi pages + Prashnavali + 4 `/planets/*` pages |
| Devotional Library | 143 + 30 cross-links | All 10 built categories' index + detail pages, plus 30 same-deity/same-festival `relatedLinks` pairs added across two sessions |
| Blog & FAQ (this session, Task 9) | 7 | All 6 blog posts + `/faq` (confirmed correct, untouched) |
| **Total distinct pages touched** | **~271** | Sum of the above; Task 10's re-touches (Lagna muhurta, 10 Namavali pages) fall inside categories already counted, not added again |

---

## 2. Schema added, by type and location

- **Organization + WebSite** (`@graph`, sitewide) — added once in `Layout.astro`, renders on every page. Reconfirmed live this session on a spread sample beyond the homepage: 6 blog posts, `/faq`, a Namavali page, a festival page, a Jyotish calculator, a Muhurta page, and a Regional Panchang page — all correct.
- **Article** — all 6 blog posts (`BlogDetail.astro`). Was previously confirmed on only 1 of 6; this session confirmed it was already present on all 6.
- **FAQPage** — Jyotish calculators (via `CalculatorFaq.astro`), several Muhurta pages (Panchaka, Rahu Kala), the 12 full-depth festival entries, various Devotional pages, `/faq` itself, and **this session: all 6 blog posts** (new — extracted programmatically from each post's existing "Frequently Asked Questions" H2/H3/P block in `BlogDetail.astro` rather than hand-duplicated).
- **BreadcrumbSchema** — Devotional detail pages (`DevotionalDetail.astro`).

---

## 3. Real bugs found and fixed (not pure copy/SEO)

These are the ones with genuine correctness or architecture impact, in rough chronological order across the whole project:

1. Wrong Yamaganda Kalam table (`panchang.ts`, `muhurta/rahu-kala.astro`)
2. Gowri Panchangam Wednesday accidentally used Sunday's table (`muhurta.ts`, `muhurta/panchaka.astro`)
3. `/panchang/regional` showed the wrong current month for 6 of 11 traditions (broken `Object.keys()` array-indexed-by-string expression)
4. ~15 of 16 Jyotish calculators used a truncated Moon-longitude formula
5. Moon longitude scaled down ~1000x across 24 files
6. Truncated Meeus lunar/solar series caused few-arcminute Tithi/Nakshatra/Yoga/Karana boundary-time errors — replaced with `astronomy-engine`
7. Sunrise/sunset was missing the Equation of Time correction (6 files)
8. Abhijit Muhurta used a fixed 48-minute window instead of day-length-proportional
9. Guru Purnima, Ganesh Chaturthi, and Diwali 2026 dates were wrong
10. Raksha Bandhan 2026 date verified correct (was flagged as possibly off by a day)
11. Entire Oct–Nov 2026 festival season was missing (9 festivals added)
12. No 2027 festival data existed at all
13. 2025 Narak Chaturdashi date was wrong by one day
14. `getHinduCalendarInfo()`'s amanta-month label lagged the actual Amavasya crossing
15. `janma-kundali.astro` Dasha dates depended on the visitor's browser timezone instead of a fixed UTC calculation
16. Surya and Hanuman Namavali lists had duplicate names padding out the 108-count
17. Ganesh, Durga, Lakshmi, Saraswati, and Shani Namavali lists had 31 duplicate-name slots total
18. `jyotish/shraddha.astro`'s Pitru Paksha calendar was hardcoded to 2026 only
19. Header nav had placeholder/dead links (Sunrise & Sunset, Moonrise & Moonset, Planets menu, Gallery menu, footer city query-params)
20. Header nav sync gaps for Janma Kundali, Planetary Events, Rashifal, Prashnavali, Regional Panchang
21. 6 Jyotish calculators were missing from the Header dropdown/mobile drawer
22. `kundali.ts`/`KundaliWidget.astro`/`jyotish/*`/`muhurta/*`/`planets/*` still used an old Keplerian-ORB scheme instead of `astronomy-engine` — the migration caught one real correctness bug (Jupiter's 2026-03-10 retrograde station was shown several days late under the old approximation)
23. Rashifal homepage messaging self-contradiction
24. Assamese regional page was displaying Bengali's era name
25. Nepal's Bikram Sambat calendar was reusing India's month-rollover calculation
26. Events page had a stale hardcoded year
27. Shani Sadesati / Pancha Pakshi pages had an escaped-backslash bug in a meta attribute
28. Sitewide bug: ~114 Devotional pages rendered `titleHi` inside the `<title>` tag instead of `title` (Task 8 finding, fixed same session)

**New findings this session (Task 9/10):** no new *incorrect-calculation* bug surfaced this time. Two structural findings did come up (documented in full below): the blog's duplicate-H2 bilingual pattern, and the transit/retrograde event-page pruning behavior. Neither is a correctness bug — both are deliberate architecture with a real trade-off worth a future decision.

---

## 4. Flagged but deliberately not built or fixed

Consolidated across the whole project:

- **PDF calendar download** — not built.
- **Shubha Dates URL restructuring** — flagged, not decided.
- **Tamil Rasi Palan content gap** — regional tradition page has no dedicated Rasi Palan content (Task 3, Regional Panchang).
- **ISKCON Panchang parana-time gap** — flagged, not built.
- **Nepali calendar items** — the amanta-month-index display bug (wrong current month) was fixed sitewide in the July 2026 regional pass; a separate, still-open item is a latent Bikram Sambat/Vikram Samvat `getYear()` calculation bug flagged during the Regional Panchang SEO pass — **not fixed**, distinct from the resolved display bug.
- **Diwali's Lakshmi Puja muhurat-calculation logic** isn't shown on-page (content depth gap, Task 5A).
- **Ganesh Chaturthi's exact Ganpati Sthapana muhurat time** isn't computed on-page (content depth gap, Task 5A).
- **Krishna Janmashtami's Smarta-vs-Vaishnava "two dates" question** has no second verified date anywhere on the site — confirmed unresolvable within Task 5A's scope, not a bug.
- **Nakshatra → Rashi cross-link is one-directional** — `/jyotish/nakshatra`'s FAQ links to `/jyotish/rashi`, no matching link back.
- **Blog's bilingual-H2 architecture** (investigated this session, see §5) — flagged for a future decision, not changed.
- **Moonrise-moonset page's date/city query-param gap** — flagged, not built.
- **Festival archive/orphan-page decision** — the 32 past-dated 2025 festival entries still have no decision on record (archive, noindex, redirect, or leave as-is); this remains genuinely undocumented anywhere in `docs/` as of this session.
- **Non-eclipse planetary-event pages get pruned once past, sitewide** (investigated this session, see §6) — flagged for a future decision, not changed.
- **Muhurta/Festival page internal-link thinness beyond the spot-checked samples** — `lagna.astro`, `abhijit.astro`, and `griha-pravesh.astro` were all found to have only a single back-link before this session's fix to `lagna.astro`; the other two were left as found (spot-check scope, not a full pass — see §7).
- **Image alt-text checklist item is structurally not applicable** — see §7.

---

## 5. Investigation: blog's bilingual H2 structure (flagged, not changed)

Every blog post's English body ends with a "Frequently Asked Questions" H2, and `BlogDetail.astro` renders a second, full Hindi copy of the article (`post.contentHtmlHi`) as a **separate sibling `<article class="hi-text">` block**, not inline per-element swaps. That doubles the H2 count on every post (e.g. 5 content H2s + 1 FAQ H2, English + Hindi = 12 total).

This is different from the rest of the site's bilingual pattern, which swaps `textContent` on `data-hi` attributes in place (no duplicate DOM nodes). The code comment in `BlogDetail.astro` explains why: the article body is raw HTML with embedded `<a>` links, and a `textContent`-based swap would destroy those links. So blog posts use the same `en-text`/`hi-text` class-and-`display:none` toggle mechanism as the rest of the site, just applied to two whole blocks instead of individual text nodes — a deliberate technical adaptation to a real constraint, not an accidental inconsistency.

Practical effect: the Hindi block is `display:none` by default (matches sitewide behavior — the Hindi toggle is currently disabled, so it's very unlikely to ever be switched on for a visitor) and only shown if `localStorage['pp-lang'] === 'hi'`. The open question for a future decision: is having 6 extra hidden H2 headings and a full hidden duplicate article body per post an acceptable SEO cost given the toggle is disabled site-wide, or is it worth revisiting (e.g. only render the Hindi block client-side on demand, or drop it while the toggle is off)? Left as-is this session per the brief — investigate and flag, don't fix.

---

## 6. Investigation: planetary-transit/retrograde event pages (flagged, not changed)

Checked whether the previously-found "page exists, nothing links to it" issue on the Rahu-Ketu Makara transit page is unique to that page or a wider pattern.

`src/lib/planetaryEvents.ts`'s `computeUpcomingEvents(today, 365)` is forward-only (filters `daysAway >= 0`) and is the **single shared source** for three things: the homepage feed, `/events/index.astro`'s full list, and `/events/[id].astro`'s `getStaticPaths()`. Because all three pull from the exact same function call with the same arguments at the same build, an event that's still upcoming is always both built *and* linked — no drift between "built" and "linked" for upcoming events.

The real issue is different and applies to **every non-eclipse event type equally** (sign transits for Sun/Mars/Mercury/Jupiter/Venus/Saturn/Rahu, retrograde/direct stations for Mercury/Venus/Mars/Jupiter/Saturn, conjunctions, oppositions, solstices/equinoxes): `getPastSignificantEvents()`, the only mechanism that keeps *past* event pages reachable, covers **only eclipses** (`KNOWN_ECLIPSES`, going back up to 1000 days). The moment any other event type's date rolls into the past, it drops out of `computeUpcomingEvents()` on the next rebuild and is not picked up by anything else — so its static page **stops being generated entirely** on the next `npm run deploy` (this is a static site; each deploy replaces the whole `dist/`). A URL that was live, indexed, or shared for that event 404s afterward — this is a harder failure than "orphaned," since the page itself disappears, not just its inbound links.

This is confirmed as **deliberate, documented architecture** — a code comment in `planetaryEvents.ts` states past sign transits/retrograde stations are "routine, many per year, not archived," unlike eclipses and festivals (both kept reachable indefinitely). So the Rahu-Ketu Makara transit page wasn't a one-off bug; it's one instance of a sitewide, intentional retention-policy gap that affects every transit/retrograde event once it's in the past. Worth a future decision alongside the 32-old-festival-pages question (§4): should past transit/retrograde events be archived the way eclipses and festivals are, rather than dropped from the build entirely?

---

## 7. Sitewide technical pass (Task 10, Steps 1–3)

**Step 1 — Image alt text:** structurally not applicable to this site. Confirmed via a sitewide grep that the only `<img>` tag anywhere in `src/` is in `Welcome.astro`, the unused Astro starter-template component (not imported by any page). Every real page uses CSS gradients, emoji, or inline SVG for its visuals — there is nothing to spot-check.

**Step 2 — Internal linking density spot-check.** Sampled `/muhurta/lagna` (thin), a light-pass festival page (`/festivals/basant-panchami-2026`), and a lower-traffic devotional item (`/devotional/namavali/shani-ashtottara-shatanamavali`):
- `/muhurta/lagna` had exactly one internal link (a back-link to `/muhurta`) plus one external Wikipedia link. **Fixed** — added 5 contextual links (Kundali, Jyotish hub, Rashi calculator, Vivah Muhurat, Griha Pravesh Muhurat) into the existing "How Lagna Is Calculated" copy.
- The festival page relies entirely on template defaults (breadcrumb, "View This Day's Panchang", prev/next) since it's one of Task 5B's 52 light-pass entries with no `relatedLinks`/FAQ. This matches every other light-pass festival by design — **left as-is**, flagged in §4 rather than fixed, since giving all 52 entries bespoke related links would be the full sitewide pass the brief said not to do.
- The Namavali detail template (`namavali/[slug].astro`) never wired the `relatedLinks` prop that 6 of the other 9 built Devotional categories already use, leaving every Namavali page (10 items) with only breadcrumb/back/prev-next nav. **Fixed** — added a one-directional `RELATED` map (Namavali → matching same-deity Chalisa) for all 10 items, mirroring the existing Aarti↔Chalisa and Mantra↔Yantra pattern from `docs/superpowers/plans/2026-08-22-devotional-cross-link-candidates.md`.

**Step 3 — Organization/WebSite schema:** confirmed rendering correctly on a 12-page sample spanning every major category (see §2). No issues.

---

## 8. Verification

All changes from this session (Task 9 + Task 10) were built, deployed via `npm run deploy`, and confirmed as the current Cloudflare Pages Production deployment via `npx wrangler pages deployment list` (source commit `e401d17`). Live, cache-busted checks on `panchangpath.com` (not `.pages.dev`) confirmed: all 6 blog post titles and FAQPage schema, `/faq` unchanged, the `lagna.astro` link additions, and the Namavali cross-link additions.

## Commits this session

1. `0987e85` — shorten blog post titles under 60 chars, add FAQPage schema to all 6 posts
2. `e401d17` — add missing internal links on thin pages (Lagna muhurta, Namavali)

Neither has been pushed to remote yet — held pending explicit go-ahead per this project's standing instruction.
