# PanchangPath — Site Inventory (Phase A)

Built from source (`src/pages/**`, `src/lib/*` data files), not by crawling the live site.
Date of this inventory: 2026-07-23.

## Engine / calculation context (so subagents don't re-derive this)

- **Ephemeris engine**: `astronomy-engine` v2.1.19 (npm), wrapped in `src/lib/astro-core.ts`.
  Full-site migration off the old hand-rolled Keplerian/Meeus scheme completed 2026-07-21.
  Sun/Moon/Mercury–Saturn all go through `astro-core.ts`; Rahu/Ketu use a mean-node polynomial
  (astronomy-engine has no lunar-node function).
- **Ayanamsha**: Lahiri, `23.85 + 1.3612*T - 0.000136*T²` (T = Julian centuries from J2000),
  single implementation in `astro-core.ts`'s `lahiriAyanamsha(jd)`.
- **Timezone handling**: per-location `tzOffset` stored in `src/lib/locations.ts` (162 cities).
  No IANA tz/DST database — fixed numeric UTC offset per city. This means any city with DST
  (e.g. US/EU cities if present) will be wrong for part of the year — worth checking in Phase B
  which cities in the list actually have DST and whether tzOffset accounts for it.
- **Sunrise/sunset**: includes proper equation-of-time correction (fixed 2026-07).
- **Known-good baseline** (already fixed, don't re-flag unless regressed): Yamaganda table,
  Gowri Panchangam day/night tables, regional current-month bug, Moon longitude scale bug,
  Abhijit Muhurta day-length-proportional window, amanta-month Amavasya search, Shraddha/Pitru
  Paksha per-year computation, Namavali padding/duplicates (Ganesh/Durga/Lakshmi/Saraswati/Shani/
  Surya/Hanuman), Janma Kundali Dasha UTC-only date construction, header nav sync (Janma Kundali,
  Events, Rashifal, Prashnavali, Regional Panchang, 6 Jyotish calculators).
- **Lower-confidence data already flagged by the project itself** (verify opportunistically,
  don't treat as new discoveries): Narak Chaturdashi 2026 date, Dev Uthani Ekadashi 2026 date
  (computed from site's own Tithi engine, not cross-checked), Govardhan Puja day-after convention,
  2027 Shraddha calendar (±1 day vs drikpanchang per known Moon-precision limits).

## Doc/inventory discrepancy noticed during Phase A

- CLAUDE.md's "Known Issues" section claims a `/jyotish/baby-names` page was added and wired into
  the header's "Others" dropdown (2026-07 fix). **This page does not exist** (`src/pages/jyotish/`
  has no `baby-names.astro`) and there is no "Baby Names" string anywhere in `Header.astro` — the
  "Others" menu currently only contains Horoscope Match / Compatibility (both pointing to
  `/jyotish/horoscope-match`). Not a live-site defect (nothing links to a 404), but the project's
  own documentation is stale on this point. Flagged as content/doc issue, not queued for Phase B
  testing since there's no page to test.

---

## 1. Panchang core

| Page | Type | URL |
|---|---|---|
| Homepage (Today's Panchang) | dynamic/live, geolocation-aware | `/` |
| Monthly Calendar | calculator | `/calendar` |
| Sunrise & Sunset | calculator | `/sunrise-sunset` |
| Moonrise & Moonset | calculator | `/moonrise-moonset` |
| Planetary Events hub | template list, build-time dynamic (365-day scan from build date) | `/events` |
| Planetary Event detail | template ×N (count varies by build date — not a fixed slug list) | `/events/[id]` |
| Standalone Kundali page | calculator (separate from widget) | `/kundali` |
| Muhurta hub | static | `/muhurta` |
| Jyotish hub | static | `/jyotish` |
| Festivals hub | static + card feed | `/festivals` |

## 2. Regional Panchang (11 traditions + preview hub)

Traditions (from `REGIONS` in `panchang-i18n.ts`): Bengali, Assamese, Tamil, Malayalam, Marathi,
Gujarati, Kannada, Telugu, Odia, Nepali, ISKCON.

| Page | Type | URL |
|---|---|---|
| Regional preview hub | static | `/panchang/regional` |
| Regional Panchang detail | template ×11 | `/panchang/bengali`, `/assamese`, `/tamil`, `/malayalam`, `/marathi`, `/gujarati`, `/kannada`, `/telugu`, `/odia`, `/nepali`, `/iskcon` |

Test strategy: representative sample (Tamil, Bengali, Nepali) + spot-check the rest for the
amanta/purnimanta month-label bug class specifically (already fixed once, regression-check only).

## 3. Muhurta tools (9 sub-pages)

| Page | Type | URL |
|---|---|---|
| Choghadiya | calculator | `/muhurta/choghadiya` |
| Shubha Hora | calculator | `/muhurta/hora` |
| Rahu Kala | calculator | `/muhurta/rahu-kala` |
| Lagna Table | calculator | `/muhurta/lagna` |
| Abhijit Muhurat | calculator | `/muhurta/abhijit` |
| Panchaka/Gowri | calculator | `/muhurta/panchaka` |
| Vivah Muhurat | calculator | `/muhurta/vivah` |
| Griha Pravesh | calculator | `/muhurta/griha-pravesh` |
| Shubha Dates | calculator, has `?activity=vehicle|property|business|general` query-param variants | `/muhurta/shubha-dates` (+4 variants) |

## 4. Jyotish calculators (15 + hub)

`/jyotish` (hub) +:
`kundali`, `janma-kundali`, `horoscope-match`, `gemstone`, `rudraksha`, `rashi`, `sunsign`,
`nakshatra`, `lagna`, `mangal-dosha`, `kalasarpa`, `sadesati`, `shraddha`, `sahasra-chandrodaya`,
`pancha-pakshi` — all under `/jyotish/<name>`.

Batching (per plan in prompt): A = Kundali/Janma Kundali/Horoscope Match, B = Rashi/Sun Sign/
Nakshatra/Lagna, C = Mangal Dosha/Kalasarpa/Sadesati, D = Gemstone/Rudraksha/Pancha
Pakshi/Shraddha/Sahasra Chandrodaya.

## 5. Festivals & Vrat

| Page | Type | URL |
|---|---|---|
| Festivals hub | static + feed | `/festivals` |
| Festival/Vrat detail | template ×88 (88 `date:` entries in `FESTIVALS_2025_2027`, spanning 2025–2027) | `/festivals/[slug]` |

Slug format: `slugify(name)-year`, e.g. `diwali-2025`. Test representative sample (a `major`, a
`vrat`, a `regional` type) + spot-check rest, per plan's template-testing guidance.

## 6. Rashifal

| Page | Type | URL |
|---|---|---|
| Rashifal hub | static + period toggle | `/rashifal` |
| Rashi detail | template × 12 rashis × 4 periods (client-side tab, same URL) | `/rashifal/[rashi]` |
| Find-your-Rashi (by name letter, by birth date) | inline widgets on hub page | `/rashifal` |

Test representative sample: 2–3 rashis × all 4 periods each.

## 7. Planets (live/self-refreshing, location-independent)

`/planets/planetary-positions`, `/planets/rahu-ketu`, `/planets/shani`, `/planets/gochara` — all
self-refresh every 60s per CLAUDE.md.

## 8. Devotional Content Library (10 built categories + hub)

| Category | Count | Index URL | Detail URL |
|---|---|---|---|
| Aarti | 18 | `/devotional/aarti` | `/devotional/aarti/[slug]` |
| Chalisa | 15 | `/devotional/chalisa` | `/devotional/chalisa/[slug]` |
| Stotram | 15 | `/devotional/stotram` | `/devotional/stotram/[slug]` |
| Ashtakam | 11 | `/devotional/ashtakam` | `/devotional/ashtakam/[slug]` |
| Vedic Mantras | 15 | `/devotional/mantra` | `/devotional/mantra/[slug]` |
| Vedic Yantras | 12 | `/devotional/yantra` | `/devotional/yantra/[slug]` |
| Deity Namavali | 10 (× 108 names each) | `/devotional/namavali` | `/devotional/namavali/[slug]` |
| Vrat Katha | 18 | `/devotional/vrat-katha` | `/devotional/vrat-katha/[slug]` |
| Puja Vidhi | 15 | `/devotional/puja-vidhi` | `/devotional/puja-vidhi/[slug]` |
| Durga Saptashati | 13 (chapters) | `/devotional/durga-saptashati` | `/devotional/durga-saptashati/[slug]` |
| Sundarkand | 1 (single-item, redirects straight to detail) | `/devotional/sundarkand` → 301 | `/devotional/sundarkand/[slug]` |
| **Not built** (out of scope) | — | Nama Ramayanam — no page exists, hub shows "Coming Soon" | — |
| Hub | — | `/devotional` | — |

Total individual entries: 18+15+15+11+15+12+10+18+15+13+1 = **158** detail pages.
Devotional text-accuracy spot-checks (per plan §3.3) should sample across categories rather than
checking all 158 — prioritize the longest/most sacred texts (Durga Saptashati, Sundarkand, a
couple of Chalisas/Stotrams) since those already had a documented sourcing methodology.

## 9. Other tools & pages

| Page | Type | URL |
|---|---|---|
| Prashnavali oracle | calculator/interactive | `/prashnavali` |
| Blog hub | static list | `/blog` |
| Blog post | template × 6 posts (corrected — Phase A miscounted as 7 by including the `BlogPost` interface's own `publishDate:` field in a grep count) | `/blog/[slug]` |
| About | static | `/about` |
| Contact | static | `/contact` |
| Privacy | static | `/privacy` |
| Terms | static | `/terms` |
| 404 / 500 | static | — |
| `cities.json` | API/data endpoint (162 cities) | `/cities.json` |

## 10. Cross-cutting (test once per representative page, not per-page)

- Header/footer nav (desktop dropdowns, mobile drawer, `searchItems` — all 3 must stay in sync)
- Language toggle (EN/HI)
- Dark mode toggle
- Location picker + browser-geolocation auto-detect (162 cities in `locations.ts`)
- Unit/other global toggles surfaced on the homepage

---

## Page-count summary

| Section | Static pages | Template-generated pages |
|---|---|---|
| Panchang core | 9 | events/[id] — count varies by build date |
| Regional Panchang | 2 | 11 |
| Muhurta | 9 (1 with 4 query variants) | 0 |
| Jyotish | 16 (hub + 15) | 0 |
| Festivals | 1 | 88 |
| Rashifal | 1 | 12 (×4 periods each, same URL) |
| Planets | 4 | 0 |
| Devotional | 11 (hub + 10 category indexes) | 158 |
| Misc | 8 (about/contact/privacy/terms/blog hub/404/500/cities.json) | 7 (blog posts) |

**Total distinct static routes ≈ 61, template-generated detail pages ≈ 276 (excluding the
build-date-dependent events list and the always-current homepage/calendar).**

This is a large surface. Recommend batching per the 16-batch plan already laid out in the audit
prompt (§2), testing templated sections via 2–3 representative samples + spot-checks rather than
exhaustively.
