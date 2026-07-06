## Project

**PanchangPath** — a modern Hindu almanac website (panchangpath.com). Positioned as a cleaner, faster alternative to drikpanchang.com. Zero ads, Drik (astronomical) calculations, Lahiri Ayanamsha.

Stack: **Astro v7** (`output: 'static'`), **Tailwind CSS v4** (`@theme` CSS custom properties), TypeScript. Deployed to **Cloudflare Pages**.

## Features Built

1. **Header & Navigation** — sticky nav, dark mode toggle, Hindi/English language switch, location selector, live search (`src/components/Header.astro` — dropdown menus, mobile drawer, and `searchItems` array must all three be updated together whenever a new page/tool is added)
2. **Today's Panchang Summary Panel** — Tithi, Nakshatra, Yoga, Karana, Rahu Kalam, Muhurtas; location-aware via browser geolocation
3. **Lagna Kundali Widget** — live birth chart with North/South Indian styles, all 9 grahas, Margi/Vakri + Asta/Udita status, planet popups, Keplerian orbital mechanics (`src/lib/kundali.ts`)
4. **Upcoming Festivals & Vrats Feed** — scrollable card strip (mobile) / 4-col grid (desktop), gradient thumbnails, countdown badges, detail pages (`src/pages/festivals/[slug].astro`)
5. **Upcoming Planetary Events Feed** — text-based timeline list: sign transits, retrograde/direct stations, conjunctions, eclipses, solstices/equinoxes; detail pages (`src/pages/events/[id].astro`)
6. **Rashifal (Daily Horoscope) Section** — all 12 rashis with daily/weekly/monthly/yearly predictions; homepage feed (`src/components/RashifalFeed.astro`), full index page (`src/pages/rashifal/index.astro`), individual rashi detail pages with 4-period tabs and rashi info sidebar (`src/pages/rashifal/[rashi].astro`), Prashnavali oracle (`src/pages/prashnavali.astro`), Find-your-Rashi tools (by name syllable and birth date)
7. **Multi-Language & Regional Panchang Support** — language/region picker, regional calendar traditions (Bengali, Assamese, Tamil, Malayalam, Marathi, Gujarati, Kannada, Telugu, Odia, Nepali, ISKCON) at `src/pages/panchang/[region].astro` + a preview hub at `src/pages/panchang/regional.astro`; region metadata in `src/lib/panchang-i18n.ts`
8. **Muhurta (Auspicious Timing) Tools** — 9 sub-pages under `src/pages/muhurta/` (Choghadiya, Shubha Hora, Rahu Kala, Lagna Table, Abhijit Muhurat, Panchaka/Gowri, Vivah Muhurat, Griha Pravesh, Shubha Dates); scoring engine in `src/lib/muhurta.ts`
9. **Jyotish Calculators Hub** — 16 calculators under `src/pages/jyotish/` (Kundali, Janma Kundali, Horoscope Match, Gemstone, Rudraksha, Rashi, Sunsign, Nakshatra, Lagna, Mangal Dosha, Kalasarpa Yoga, Shani Sadesati, Baby Names, Shraddha Tithi, Sahasra Chandrodaya, Pancha Pakshi) plus the hub page `src/pages/jyotish.astro`; shared calculator data in `src/lib/jyotish.ts` (math itself is duplicated per-page — see Gotchas)
10. **Devotional Content Library** — `src/pages/devotional/`, data in `src/lib/devotional/*.ts`. 10 of 12 planned categories built: Aarti (18), Chalisa (15), Stotram (15), Ashtakam (11 + 1 cross-linked), Vedic Mantras (15), Vedic Yantras (12), Deity Namavali (10× 108-name lists), Vrat Katha (18), Puja Vidhi (15), Durga Saptashati (13 chapters, full verbatim Sanskrit), Sundarkand (60 dohas, full verbatim text). **Not yet built**: Nama Ramayanam. See "Devotional Library pattern" below.

## Architecture

### Key source files
- `src/lib/panchang.ts` — Tithi, Nakshatra, Yoga, Karana, Rahu Kalam, Muhurta calculations
- `src/lib/kundali.ts` — Keplerian orbital mechanics for 9 Jyotish grahas; exports `jdFull`, `allTropicalLons`, `calculateKundali`
- `src/lib/planetaryEvents.ts` — Event scanner (sign transits, retrogrades, eclipses, solstices); exports `computeUpcomingEvents`, `formatCountdownLabel`, `formatEventDateTime`
- `src/lib/festivals.ts` — Festival data (2025–2026), slugs, icons, gradients
- `src/lib/locations.ts` — City database with lat/lng/tzOffset
- `src/lib/rashifal.ts` — 12 rashi data objects (predictions, lucky attrs, name letters); exports `RASHIS`, `getDailyPrediction`, `getRashiById`, `getRashiByNameLetter`, `getRashiByBirthDate`, `PRASHNAVALI_ANSWERS`
- `src/lib/muhurta.ts` — Choghadiya, Hora, Gowri Panchangam, Yamaganda and other muhurta timing tables
- `src/lib/jyotish.ts` — shared data (nakshatras, etc.) for the Jyotish calculator pages
- `src/lib/panchang-i18n.ts` — `REGIONS` array (11 regional traditions), month-name/year-naming logic per tradition
- `src/lib/devotional/types.ts` — `DevotionalItem` interface + `CATEGORY_META` (per-category label, gradient, url, `built` flag)
- `src/components/KundaliWidget.astro` — Kundali chart + table; exposes `window.updateKundaliWidget(lat, lng, city)`
- `src/components/FestivalFeed.astro` — Festival card strip/grid
- `src/components/PlanetaryEventsFeed.astro` — Planetary events timeline list
- `src/components/RashifalFeed.astro` — Homepage Rashifal section: 4×3 rashi card grid, period tab links, Prashnavali CTA, inline rashi finder tools
- `src/components/DevotionalIndexGrid.astro` / `DevotionalDetail.astro` — shared list/detail shell reused by every Devotional Library category (detail component accepts optional `lyricsLabel`/`meaningLabel`/`benefitsLabel` props to relabel sections per category, e.g. "Samagri" for Puja Vidhi, "108 Names" for Namavali)
- `src/pages/index.astro` — Homepage; imports all feed components
- `src/pages/rashifal/index.astro` — Full Rashifal page with client-side period toggle (Daily/Weekly/Monthly/Yearly)
- `src/pages/rashifal/[rashi].astro` — Individual rashi detail page; `getStaticPaths()` over all 12 rashis
- `src/pages/prashnavali.astro` — Prashnavali oracle; 108 answers passed via `define:vars`, random reveal on button click
- `src/pages/devotional/index.astro` — Devotional Library hub; reads `CATEGORY_META` and shows "Coming Soon" for categories with `built: false`

### Ayanamsha
Lahiri: `23.85 + 1.3612*T - 0.000136*T²` (T = Julian centuries from J2000). **Known issue**: several pages (`index.astro`, `calendar.astro`, `muhurta/vivah.astro`, `muhurta/shubha-dates.astro`, `muhurta/panchaka.astro`, `muhurta/griha-pravesh.astro`) use a truncated 2-term version missing `-0.000136*T²`. Negligible impact today (~0.00001°) but inconsistent — use the full 3-term formula in any new/edited page.

### Orbital mechanics
Keplerian heliocentric XY → geocentric longitude. Planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn in `ORB` constant. Moon and Rahu use dedicated polynomial formulas. All Moon-longitude formulas across the codebase (`panchang.ts`, `kundali.ts`, `KundaliWidget.astro`, all 16 `jyotish/*.astro` pages, `Header.astro`, `calendar.astro`, and the affected `muhurta/*.astro` pages) now use the same full 15-term `dL` correction sum, fixed 2026-07 (previously 15 of 16 `jyotish/*.astro` pages used a truncated 6-term version).

### Slug format
`slugify(name) + '-' + year` → e.g. `diwali-2025`, `budha-vakri-2026-6`

### Devotional Library pattern
Every category follows the same shape:
1. `src/lib/devotional/<category>.ts` exports an array of `DevotionalItem` (interface in `types.ts`: `slug`, `title`, `titleHi`, `deity?`, `deityHi?`, `icon`, `lyricsHi`, `transliteration?`, `meaning?`, `benefits?`).
2. `src/pages/devotional/<category>/index.astro` renders `<DevotionalIndexGrid category={...} items={...} />`.
3. `src/pages/devotional/<category>/[slug].astro` has `getStaticPaths()` over the array and renders `<DevotionalDetail item={...} category={...} prev={...} next={...} />` (optionally with custom `*Label` props).
4. Flip the category's `built: false → true` in `CATEGORY_META` (`src/lib/devotional/types.ts`).
5. Wire into `src/components/Header.astro`: desktop dropdown, mobile drawer, **and** the `searchItems` array — all three, every item.
6. Single-item categories (e.g. Sundarkand) skip the grid: `index.astro` does `Astro.redirect('/devotional/<category>/<slug>', 301)` straight to the one detail page.

**Sourcing long/sacred texts accurately**: for anything where word-for-word fidelity matters (full stotras, chalisas, Durga Saptashati, Sundarkand), do not reconstruct from memory if a reference source is available — `WebFetch` **cannot** return verbatim text (hard ~125-character quote limit, it summarizes/paraphrases instead). Instead: `curl` the raw HTML directly (with a browser `User-Agent`), strip tags in Node (`content.replace(/<script.../gi,'').replace(/<[^>]+>/g,'')`, decode `&nbsp;`/`&#x...;` entities), then locate the verse content between a start marker (e.g. a chapter heading string) and an end marker (drikpanchang.com pages end article content right before a `A+AA-` font-size-toggle UI string, followed by prev/next nav — cut there to drop nav/footer junk). Verify extraction by checking the source's own verse-count colophon (e.g. "एवमादितः॥104॥") or sequential numbering (Doha 1→60 with no gaps/dupes) before trusting the result. See git history for the Durga Saptashati / Sundarkand commits for a working extraction script.

## Known Issues (found via full-site audit, not yet fixed)

- ~~**Wrong Yamaganda Kalam table**~~ — fixed 2026-07: `YAMAGANDA_SLOTS` in `src/lib/panchang.ts` and the duplicate `YAMAG_SLOTS` in `muhurta/rahu-kala.astro` now use the verified `[4,3,2,1,0,6,5]` table.
- ~~**Gowri Panchangam Wednesday = Sunday (GOWRI_DAY)**~~ — fixed 2026-07: `GOWRI_DAY` in `src/lib/muhurta.ts` and the duplicate in `muhurta/panchaka.astro` now use the verified table. **`GOWRI_NIGHT` still has the same Wed=Sun copy-paste bug and is unfixed** — its correct night-time values haven't been independently verified against drikpanchang yet.
- ~~**`/panchang/regional` shows wrong current month** for 6 of 11 traditions (mr/gu/kn/te/or/iskcon)~~ — fixed 2026-07: hoisted a named `AMANTA_TO_IDX` const in `panchang/regional.astro`, matching the working pattern already in `panchang/[region].astro`, replacing the broken `Object.keys({...})[name]` array-indexed-by-string expression.
- ~~**~15 of 16 `jyotish/*.astro` pages** — truncated Moon longitude formula~~ — fixed 2026-07 (see Orbital Mechanics above).
- ~~**Moon longitude scaled down ~1000x**~~ — fixed 2026-07 across all 24 affected files (`panchang.ts`, `kundali.ts`, `KundaliWidget.astro`, `Header.astro`, `index.astro`, `calendar.astro`, 4 `muhurta/*.astro` pages, 15 `jyotish/*.astro` pages).
- ~~**Sunrise/sunset missing Equation of Time**~~ — fixed 2026-07: `sunriseUTC()`/`solarNoonUTC()` in `src/lib/panchang.ts` now share a proper Meeus equation-of-time formula (`equationOfTimeMinutes()`), and the same correction was propagated to the 5 duplicate inline copies in `muhurta/{choghadiya,hora,rahu-kala,abhijit,panchaka}.astro`.
- ~~**Abhijit Muhurta uses a fixed 48-minute window**~~ — fixed 2026-07: `abStart`/`abEnd` in `src/lib/panchang.ts` and `abhijitStart`/`abhijitEnd` in `muhurta/abhijit.astro` now use `± dayMins/30` (day-length-proportional). Note: `abhijit.astro`'s separate "Do Ghati Muhurat" card is intentionally still a fixed ±24 min — a Ghati is a fixed 24-minute unit by definition, unlike a Muhurta.
- ~~Guru Purnima, Ganesh Chaturthi, Diwali 2026 dates wrong~~ — fixed 2026-07 (2026-07-29, 2026-09-14, 2026-11-08 respectively).
- **Raksha Bandhan 2026 possibly off by a day** — still unfixed, lower confidence; audit suggests `2026-08-28` instead of `2026-08-27` but this needs independent re-verification against drikpanchang.com (Bhadra timing rules) before changing.
- ~~**Entire Oct–Nov 2026 festival season missing**~~ — fixed 2026-07: added Navratri Begins, Maha Navami, Vijayadashami, Dhanteras, Narak Chaturdashi, Govardhan Puja, Bhai Dooj, Chhath Puja, and Dev Uthani Ekadashi. Narak Chaturdashi's date is lower-confidence (not independently re-verified); Dev Uthani Ekadashi's date (2026-11-21) was computed from this site's own Tithi engine rather than cross-checked against drikpanchang; Govardhan Puja uses the day-after-Diwali convention (`2026-11-10`) — some regions observe it the same day as Diwali instead.
- **No 2027 festival data at all** — still unfixed. Attempted 2026-07 via computing dates from the site's own Tithi engine, but abandoned after finding the amanta-month labeling bug below made the results unreliable (computed Makar Sankranti landed on 2027-01-14, one day off the audit's drikpanchang-verified 2027-01-15, and the computed year-over-year Diwali spacing implied two consecutive leap-months, which isn't astronomically possible).
- **`getHinduCalendarInfo()` amanta-month label lags the actual Amavasya crossing** — e.g. for Nov 2026 (New Delhi) it kept reporting `amantaMonth.name: 'Ashwin'` for a week after the real Amavasya/month change, only switching to `'Kartika'` several days late. Not yet root-caused; affects anything that derives a festival/event date from `amantaMonth.name` rather than a direct Tithi/Amavasya calculation.
- **`janma-kundali.astro` Dasha dates depend on visitor's browser timezone** — line ~294 mixes local-time `Date` construction with a manual offset subtraction instead of `Date.UTC(...)`.
- Several devotional Namavali lists (`namavali.ts`) have repeated names padding out the 108-count rather than 108 genuinely distinct names (Ganesh, Durga, Lakshmi, Saraswati, Shani lists affected; Shiva/Krishna checked clean).
- Header.astro has several placeholder `href="/"` nav items still unfixed: Sunrise & Sunset, Moonrise & Moonset, and the entire Planets menu (Planetary Positions, Rahu & Ketu, Shani, Gochara) — no dedicated pages exist for these yet. ~~Gallery menu~~ (removed 2026-07, no pages existed). ~~"Baby Names"/"Compatibility" under Others, "Rahu Kalam" under Panchang, dead footer city query-param links~~ — fixed 2026-07 (Others menu now points to `/jyotish/baby-names` and `/jyotish/horoscope-match`; Rahu Kalam points to `/muhurta/rahu-kala`; the non-functional footer "Cities" column was removed from `Layout.astro`).
- ~~**Header nav sync gaps for major pages**~~ — fixed 2026-07: Janma Kundali, Planetary Events (`/events`), Rashifal, Prashnavali, and Regional Panchang are now present in all three of desktop dropdown/mobile drawer/`searchItems`.
- ~~**6 Jyotish calculators missing from Header dropdown/drawer**~~ — fixed 2026-07: Rudraksha, Sun Sign, Pancha Pakshi, Shraddha Tithi, Sahasra Chandrodaya, and Lagna calculators are now in the desktop dropdown and mobile drawer (were already in `searchItems`).
- Footer "Cities" links (`/?city=New+Delhi` etc.) are dead — nothing reads a `city` query param.

## Critical Gotchas

- **Apostrophes in TypeScript strings** — must be escaped with backslash (`\'`) inside single-quoted TS strings, or use template literals
- **Google Fonts** — use `<link>` in HTML `<head>`, NOT `@import` in CSS (Tailwind v4 breaks `@import` ordering)
- **Client-side scripts in static Astro** — `<script>` blocks cannot import from TS server modules; orbital math must be duplicated inline (see `KundaliWidget.astro` and every `jyotish/*.astro` calculator). This is a known source of copy-paste drift between pages — when fixing a formula bug, grep for the same constant/function name across all `jyotish/*.astro` and `muhurta/*.astro` pages, since it's likely duplicated 10-20 times.
- **`getStaticPaths()`** — required for all dynamic routes (`festivals/[slug].astro`, `events/[id].astro`, `rashifal/[rashi].astro`, `devotional/*/[slug].astro`, `panchang/[region].astro`)
- **`festivals.astro` + `festivals/[slug].astro`** coexist fine — file vs directory have different filesystem names
- **Passing data to client scripts in static Astro** — use `define:vars={{ myData }}` on `<script>` tags to pass server-side variables (e.g. `PRASHNAVALI_ANSWERS` in `prashnavali.astro`); cannot use ES module imports from TS libs inside `<script>` blocks
- **`WebFetch` cannot return verbatim text** — hard ~125-char quote limit, always summarizes. Use `curl` + manual HTML-tag-stripping for anything requiring exact text (see "Sourcing long/sacred texts accurately" above).
- **`astro check` reports ~900+ TypeScript errors** — nearly all are the same pattern (`document.getElementById(...)` returning untyped `HTMLElement`, missing null-checks) across every calculator's inline `<script>` block. This is pre-existing, doesn't block `astro build`, and isn't worth mass-fixing; don't be alarmed by the count.

## Development

Start the dev server in background mode:

```
astro dev --background
```

Manage with `astro dev stop`, `astro dev status`, `astro dev logs`.

TypeScript check: `node_modules/.bin/astro check` (see Gotchas — expect a large, mostly-noise error count; use `npm run build` as the real correctness gate).

## Deployment

Cloudflare Pages, project name `panchangpath` (account: skaarat@gmail.com), **not** Git-connected — deploys are manual/on-demand, not automatic on push.

```
npm run deploy
```

Runs `astro build && wrangler pages deploy dist --project-name=panchangpath --branch=main`. `wrangler` is a devDependency so this works without an `npx` install prompt. Live at https://panchangpath.pages.dev (custom domain `panchangpath.com` not yet attached — would need to be added to the same Cloudflare account under Pages → Custom domains).

Remember to `git commit` + `git push` separately — deploying does not push to GitHub, and pushing to GitHub does not deploy.

## Documentation

Full documentation: https://docs.astro.build

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
