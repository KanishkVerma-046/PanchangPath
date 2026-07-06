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
Keplerian heliocentric XY → geocentric longitude. Planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn in `ORB` constant. Moon and Rahu use dedicated polynomial formulas. **Known issue**: `jyotish/gemstone.astro` and `jyotish/rudraksha.astro` use a truncated Moon-longitude formula (6 of the 15 correction terms used everywhere else) — can be off by ~0.3°, enough to flip a recommendation near a Rashi/Nakshatra boundary. Fix by copying the full `moonLon()` from `kundali.ts` or `jyotish/nakshatra.astro`.

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

- **Wrong Yamaganda Kalam table** — `src/lib/panchang.ts` `YAMAGANDA_SLOTS` and its duplicate in `muhurta/rahu-kala.astro` don't match the standard fixed table; produces wrong Yamaganda times most weekdays.
- **Gowri Panchangam Wednesday = Sunday** — `src/lib/muhurta.ts` `GOWRI_DAY`/`GOWRI_NIGHT` (and duplicate in `muhurta/panchaka.astro`) have an identical copy-paste row for Wednesday and Sunday.
- **`/panchang/regional` shows wrong current month** for 6 of 11 traditions (mr/gu/kn/te/or/iskcon) — `panchang/regional.astro` does `Object.keys({...})[name]` (indexes an array by a string key, always `undefined`) instead of `({...})[name]`. The correct pattern already exists in the sibling page `panchang/[region].astro`.
- **`gemstone.astro`/`rudraksha.astro`** — truncated Moon longitude formula, see Orbital Mechanics above.
- **Moon longitude scaled down ~1000x** — `moonLongitude()`/`moonLon()` in `src/lib/panchang.ts` and `src/lib/kundali.ts` divide the already-in-degrees periodic correction `dL` by 1000, corrupting Tithi/Nakshatra/Yoga/Karana and every Moon-based Jyotish result (Rashi, Nakshatra, Mangal Dosha, Kalasarpa Yoga, Shani Sadesati, Horoscope Match); duplicated inline in ~25 files across `jyotish/*.astro` and `KundaliWidget.astro`.
- **Sunrise/sunset missing Equation of Time** — `sunriseUTC()` in `src/lib/panchang.ts` uses only mean solar time (`noon = 12 - lng/15`), omitting the seasonal EoT correction (~±15 min) that sibling function `solarNoonUTC()` already computes; cascades into Rahu Kalam, Gulika Kalam, Yamaganda, Choghadiya, Hora, Gowri Panchangam, and Abhijit Muhurta timing.
- **Abhijit Muhurta uses a fixed 48-minute window** — `src/lib/panchang.ts` (`abStart`/`abEnd`) and `muhurta/abhijit.astro` use a constant ±24 minutes instead of the traditional day-length/15, off by up to ~8 minutes near solstices.
- **Several `festivals.ts` 2026 dates are wrong or missing** — Guru Purnima, Ganesh Chaturthi, and Diwali are each off (by up to a month), Raksha Bandhan is possibly off by a day (lower confidence), the entire Oct–Nov 2026 season is missing 8 festivals (Navratri through Dev Uthani Ekadashi), and there is no 2027 festival data at all.
- **`janma-kundali.astro` Dasha dates depend on visitor's browser timezone** — line ~294 mixes local-time `Date` construction with a manual offset subtraction instead of `Date.UTC(...)`.
- Several devotional Namavali lists (`namavali.ts`) have repeated names padding out the 108-count rather than 108 genuinely distinct names (Ganesh, Durga, Lakshmi, Saraswati, Shani lists affected; Shiva/Krishna checked clean).
- Header.astro has several placeholder `href="/"` nav items (Sunrise & Sunset, Moonrise & Moonset, Planetary Positions, Gallery items, etc.) — three are actively misleading since a real page exists elsewhere: "Baby Names" and "Compatibility" under the "Others" menu should point to `/jyotish/baby-names` and `/jyotish/horoscope-match`, and "Rahu Kalam" under the Panchang menu should point to `/muhurta/rahu-kala`.
- **Header nav sync gaps for major pages** — Janma Kundali, the Planetary Events Feed (`/events`), Rashifal, and Prashnavali are each missing from one or more of the desktop dropdown/mobile drawer/`searchItems` in `Header.astro`, and Regional Panchang is missing from `searchItems`; violates the three-location sync rule.
- **6 Jyotish calculators missing from Header dropdown/drawer** — Rudraksha, Sun Sign, Pancha Pakshi, Shraddha Tithi, Sahasra Chandrodaya, and Lagna calculators are indexed in `Header.astro`'s `searchItems` but not shown in the desktop dropdown or mobile drawer.
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
