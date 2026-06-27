## Project

**PanchangPath** — a modern Hindu almanac website (panchangpath.com). Positioned as a cleaner, faster alternative to drikpanchang.com. Zero ads, Drik (astronomical) calculations, Lahiri Ayanamsha.

Stack: **Astro v7** (`output: 'static'`), **Tailwind CSS v4** (`@theme` CSS custom properties), TypeScript.

## Features Built

1. **Header & Navigation** — sticky nav, dark mode toggle, Hindi/English language switch, location selector
2. **Today's Panchang Summary Panel** — Tithi, Nakshatra, Yoga, Karana, Rahu Kalam, Muhurtas; location-aware via browser geolocation
3. **Lagna Kundali Widget** — live birth chart with North/South Indian styles, all 9 grahas, Margi/Vakri + Asta/Udita status, planet popups, Keplerian orbital mechanics (`src/lib/kundali.ts`)
4. **Upcoming Festivals & Vrats Feed** — scrollable card strip (mobile) / 4-col grid (desktop), gradient thumbnails, countdown badges, detail pages (`src/pages/festivals/[slug].astro`)
5. **Upcoming Planetary Events Feed** — text-based timeline list: sign transits, retrograde/direct stations, conjunctions, eclipses, solstices/equinoxes; detail pages (`src/pages/events/[id].astro`)

## Architecture

### Key source files
- `src/lib/panchang.ts` — Tithi, Nakshatra, Yoga, Karana, Rahu Kalam, Muhurta calculations
- `src/lib/kundali.ts` — Keplerian orbital mechanics for 9 Jyotish grahas; exports `jdFull`, `allTropicalLons`, `calculateKundali`
- `src/lib/planetaryEvents.ts` — Event scanner (sign transits, retrogrades, eclipses, solstices); exports `computeUpcomingEvents`, `formatCountdownLabel`, `formatEventDateTime`
- `src/lib/festivals.ts` — Festival data (2025–2026), slugs, icons, gradients
- `src/lib/locations.ts` — City database with lat/lng/tzOffset
- `src/components/KundaliWidget.astro` — Kundali chart + table; exposes `window.updateKundaliWidget(lat, lng, city)`
- `src/components/FestivalFeed.astro` — Festival card strip/grid
- `src/components/PlanetaryEventsFeed.astro` — Planetary events timeline list
- `src/pages/index.astro` — Homepage; imports all feed components

### Ayanamsha
Lahiri: `23.85 + 1.3612*T - 0.000136*T²` (T = Julian centuries from J2000)

### Orbital mechanics
Keplerian heliocentric XY → geocentric longitude. Planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn in `ORB` constant. Moon and Rahu use dedicated polynomial formulas.

### Slug format
`slugify(name) + '-' + year` → e.g. `diwali-2025`, `budha-vakri-2026-6`

## Critical Gotchas

- **Apostrophes in TypeScript strings** — must be escaped with backslash (`\'`) inside single-quoted TS strings, or use template literals
- **Google Fonts** — use `<link>` in HTML `<head>`, NOT `@import` in CSS (Tailwind v4 breaks `@import` ordering)
- **Client-side scripts in static Astro** — `<script>` blocks cannot import from TS server modules; orbital math must be duplicated inline (see `KundaliWidget.astro`)
- **`getStaticPaths()`** — required for all dynamic routes (`festivals/[slug].astro`, `events/[id].astro`)
- **`festivals.astro` + `festivals/[slug].astro`** coexist fine — file vs directory have different filesystem names

## Development

Start the dev server in background mode:

```
astro dev --background
```

Manage with `astro dev stop`, `astro dev status`, `astro dev logs`.

TypeScript check: `node_modules/.bin/astro check` (no standalone `tsc` binary installed — use `npm run build` to catch errors).

## Documentation

Full documentation: https://docs.astro.build

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
