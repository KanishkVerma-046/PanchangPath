# Task 1 Report: Report skeleton + Part 1 navigation/dead-link audit

**Note:** This report file was added retroactively during the review-fix pass (see `docs/site-audit-2026-07.md` fix commit). The original Task 1 implementation claimed to write this file but did not; this reconstructs it against the corrected, post-review state of Part 1.

## What was audited

Cross-referenced every nav-relevant link in `src/components/Header.astro` (desktop dropdown menus, the mobile slide-out drawer, and the `searchItems` array used for site search, lines 1136-1331) against:
- the real page routes under `src/pages/**/*.astro`
- footer links in `src/layouts/Layout.astro`
- inline feature links embedded in pages/components (e.g. `src/pages/jyotish.astro`'s calculator cards, `src/components/PlanetaryEventsFeed.astro`'s "View all" link)

Goal: find (a) dead-end/mislabeled links, (b) pages missing from one or more of the three required sync locations (desktop dropdown / mobile drawer / searchItems) per CLAUDE.md's sync convention, and (c) truly orphaned pages unreachable from anywhere on the site.

## Corrected list of issues (post-review-fix)

1. Dead-end nav links pointing to homepage instead of real pages — Planets menu (4 items, `href="/"`)
2. Dead-end nav links pointing to homepage instead of real pages — Gallery menu (3 items, `href="/"`)
3. Dead-end nav links in Others menu pointing to homepage (Baby Names, Compatibility, Dream Meaning, About — first two are mislabeled since real pages exist elsewhere)
4. Dead-end link: "Sunrise & Sunset" in Panchang menu (`href="/"`, no dedicated page)
5. Dead-end link: "Moonrise & Moonset" in Panchang menu (`href="/"`, no dedicated page)
6. Mislabeled link: "Rahu Kalam" in Panchang menu points to `/` instead of `/muhurta/rahu-kala`
7. Dead-end footer links: city query parameters (`/?city=...`) not implemented anywhere
8. **Sync gap (not a true orphan):** `/jyotish/janma-kundali` is reachable via the Jyotish hub page (`/jyotish`, linked at `jyotish.astro:9`) but missing from Header's direct dropdown/drawer/searchItems entries
9. **Sync gap (not a true orphan):** `/events` is reachable via a "View All" link in the homepage's Planetary Events Feed (`PlanetaryEventsFeed.astro:113`) but absent from Header nav (dropdown/drawer/searchItems) entirely
10. Three-location sync gap: Rashifal missing from desktop dropdown **and** searchItems (present only in mobile drawer, line 342)
11. Three-location sync gap: Prashnavali missing from desktop dropdown **and** searchItems (present only in mobile drawer, line 343)
12. Three-location sync gap: Regional Panchang missing from searchItems (present in desktop dropdown line 116 and mobile drawer line 271)
13. Three-location sync gap: several Jyotish sub-pages (Rudraksha, Sunsign, Pancha Pakshi, Shraddha, Sahasra Chandrodaya, Lagna) present in searchItems but missing from desktop dropdown and drawer

Plus a verification pass confirming all pre-existing CLAUDE.md "Known Issues" nav items remain present as of commit `19b4c5b`.

## Corrections applied during the review-fix pass

A reviewer found that the original Part 1 draft had mischaracterized four findings:
- Rashifal/Prashnavali were claimed to appear in `searchItems`; grep confirmed zero occurrences — they only appear in the mobile drawer. Corrected to describe the gap as worse (missing from both desktop dropdown and searchItems), not just the dropdown.
- `/jyotish/janma-kundali` was labeled a true "orphaned page... cannot discover through navigation"; this was inaccurate since `jyotish.astro:9` links it from the Jyotish hub, which itself is fully wired into nav. Reclassified as a same-category sync gap (missing from Header's direct entries, not a true orphan).
- `/events` was labeled unreachable from the main site; this was inaccurate since the homepage's Planetary Events Feed renders a one-click "View all" link to it (`PlanetaryEventsFeed.astro:113`). Reclassified the same way.
- A missed sync gap was added: Regional Panchang is in the desktop dropdown and drawer but absent from searchItems.

All four corrections were independently re-verified against `Header.astro`, `src/pages/jyotish.astro`, and `src/components/PlanetaryEventsFeed.astro` before being committed.
