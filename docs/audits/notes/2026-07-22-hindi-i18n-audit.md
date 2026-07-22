# Hindi/English i18n Coverage Audit — 2026-07-22

Investigation into inconsistent Hindi translation coverage across the site,
prompted by four user-reported symptoms (homepage hero, Panchang data table
values, Ghati/Pal/Vipal widget, Lagna Kundali widget). **Audit only — no
`src/` files were modified.**

## Method

1. Grepped for i18n patterns (`t(`, `translate`, `i18n`, `lang ===`,
   `data-hi`, `en-text`/`hi-text`, `langchange`) to locate the mechanism(s).
2. Read `LanguagePicker.astro`, `Header.astro`, `index.astro`,
   `calendar.astro`, `PanchangSummaryCard.astro`, `VedicClock.astro`,
   `KundaliWidget.astro`, and representative `jyotish/*`/`muhurta/*`
   calculators end-to-end.
3. Verified all four reported symptoms empirically with Playwright against
   a local dev server (`astro dev --background`), not just static reading,
   including a reload test simulating a returning visitor with a stored
   Hindi preference.
4. Confirmed root causes via targeted greps (e.g. `dataset.lang` / `data-lang`
   usage across `src/`) rather than assumption.

## The i18n mechanism

There is no central `t()`/dictionary file. The site runs **two independent
mechanisms**, both triggered by `LanguagePicker.astro` dispatching
`document.dispatchEvent(new CustomEvent('langchange', {...}))` on click, and
once more on page load via a `setTimeout(..., 80)` if a Hindi preference is
already stored in `localStorage['pp-lang']` (`LanguagePicker.astro:119-128`).

- **Mechanism A — `[data-hi]` attribute swap.** Elements carry
  `data-hi="हिन्दी टेक्स्ट"`; a listener does
  `el.textContent = hindi ? el.dataset.hi : el.dataset.en`
  (`Header.astro:1006-1017`, copied per-page in most `jyotish/*`/`muhurta/*`
  calculators as `applyPageLang()`). **`Header.astro` also reads
  `localStorage` directly at script init** (`Header.astro:1353`:
  `if (localStorage.getItem('pp-lang') === 'hi') applyHeaderLang(true);`),
  so it doesn't depend on catching the `langchange` event at all — this is
  why the nav bar translates reliably even on a fresh page load.
- **Mechanism B — `.en-text`/`.hi-text` sibling-span toggle.** Every
  translatable value is server-rendered twice
  (`<span class="en-text">…</span><span class="hi-text" style="display:none">…</span>`);
  a listener flips `display`. Used by `index.astro`, `calendar.astro`,
  `festivals.astro`, `rashifal/*`, `events/*`, `prashnavali.astro`,
  `about.astro`/`privacy.astro`/`terms.astro`, `BlogDetail.astro`. **This
  mechanism has no init-time `localStorage` read anywhere** — it only works
  if it catches the `langchange` event.

`src/lib/panchang-i18n.ts` is a **separate, unrelated system** — it only
drives the 11 regional-calendar-tradition pages (`panchang/[region].astro`)
and month/year naming per tradition, not the general UI language toggle.

Calculator pages (`jyotish/kundali.astro`, `jyotish/janma-kundali.astro`,
most `muhurta/*.astro`) instead use a small local closure —
`function t(en, hi) { return LANG_HI ? hi : en; }` — scoped to that one
file's client script, combined with a full re-render of the calculated
output on `langchange`.

## Category A — Correctly wired to translation system

Static chrome across nearly the whole site: `Header.astro` (nav, dropdowns,
drawer, search placeholder), `PanchangSummaryCard.astro` (row labels),
`VedicClock.astro` (badge/section labels + explainer paragraph),
`FestivalFeed.astro`, `PlanetaryEventsFeed.astro`, `RashifalFeed.astro`,
`DevotionalDetail.astro`, `DevotionalIndexGrid.astro`, `LocationPicker.astro`,
`ErrorState.astro`, `StaticPage.astro`, `about.astro`, `privacy.astro`,
`terms.astro`, `contact.astro`.

Calculators with a correctly wired local `t()`/`LANG_HI` pattern that
**re-renders computed output** on toggle (verified `applyPageLang()` both
swaps `[data-hi]` text and re-runs the calc function):
`jyotish/kundali.astro` (:107-108, :299-310), `jyotish/janma-kundali.astro`
(:107-108, :319-330), `muhurta/choghadiya.astro` (:100-102, :235-247), and
(via grep for the same `applyPageLang`/`langchange` pattern, not individually
line-verified) the rest of `muhurta/*.astro` (hora, rahu-kala, panchaka,
lagna, vivah, griha-pravesh, shubha-dates, abhijit) and most `jyotish/*.astro`.

## Category B — Hardcoded strings bypassing translation entirely

Ordered by user-facing prominence:

1. **`src/components/KundaliWidget.astro`** (homepage Lagna Kundali widget)
   — ~10 hardcoded strings, zero `data-hi`/`en-text` anywhere in the
   markup: `"Lagna Kundali"` (:19), `"North"`/`"South"` tabs (:25-26),
   `"Graha"/"Rashi"/"Deg"/"Motion"` table headers (:51-54), `"Lagna:"`
   (:40), `"Lahiri Ayanamsha · Tropical-to-Sidereal"` (:84),
   `"Full Kundali →"` (:85), popup labels `"Rashi"/"Degree"/"Motion"/
   "Visibility"` (:522-525).
2. **`src/pages/calendar.astro`** — the per-day mini Tithi/Nakshatra text
   (`quickPanchang()`, :111-134) uses English-only `NAKSHATRAS`/`TITHIS`
   const arrays with **no Hindi counterpart defined in this file at all**
   (unlike `index.astro`'s equivalent arrays) — these labels can never show
   Hindi regardless of language state.
3. **`src/components/VedicClock.astro`** — the "Ghati"/"Pal"/"Vipal" unit
   labels under the big numbers (:54-69, `.vc-unit-lbl` + `.vc-unit-hi`) are
   two permanently-visible sibling spans, not a toggle — English and Hindi
   both show simultaneously, always, regardless of language state.
4. Minor/non-core: `Tooltip.astro`, `Welcome.astro`, `BreadcrumbSchema.astro`,
   `404.astro`, `500.astro` have zero i18n hooks — decorative/utility, not
   part of the reported symptoms.
5. Devotional Library pages (`devotional/*/*.astro`, `blog/*.astro`) have
   zero i18n hooks — appears to be **by design** (primary content is
   already Devanagari lyrics shown alongside English transliteration/meaning
   as content, not behind a language toggle), not a bug.

## Category C — Translation mechanism invoked but broken/disconnected

The more interesting bug class: dictionary/logic already exists but isn't
reached.

- **`KundaliWidget.astro`'s planet table and Lagna sign** (:476-478, :499,
  :510) branch on `document.documentElement.dataset.lang === 'hi'`, and
  `nameHi`/`signNameHi` data is present and ready. **Nothing anywhere in the
  codebase ever sets `document.documentElement.dataset.lang`** — confirmed
  via `grep -rn "dataset.lang\|data-lang" src/`, matches only inside
  `KundaliWidget.astro` itself. Also, the `langchange` listener re-renders
  the table via `renderTable(currentData, false)` (:612) with `isHindi`
  hardcoded `false`. Playwright: after toggling to Hindi, `#kw-tbody`'s
  first row still reads `"Surya"` (not सूर्य) and `#kw-lagna-sign` still
  reads `"Dhanu"`.
- **`index.astro`'s main Panchang grid (`#pancha-grid`) auxiliary fields**
  — `vara-lord`, `tithi-type`, `yoga-type`, `nakshatra-meta` are set by
  `updateUI(p)`, called from `renderWithLoc()` (date/location change) but
  **not** from `applyLang()` (language change, :566-579). Playwright:
  toggling to Hindi leaves `#yoga-type` showing `"Auspicious"` and
  `#nakshatra-meta` showing `"2 · Rahu"` until the next date/location
  change, at which point they correctly flip to Hindi.
- **`#date-display`'s weekday/month string** is hardcoded to
  `toLocaleDateString('en-IN', {...})` (:24, :725/586) and never localizes.

## Category D — Dynamic values: same system or separate?

**Separate, and duplicated inconsistently across files.** Tithi/Nakshatra/
Yoga/Karana/Vara names have Hindi variants server-side in
`src/lib/panchang.ts` (`nameHi` fields, ~:97-122) and are reused correctly
by `PanchangSummaryCard.astro`. But `index.astro`'s **client-side** script
re-implements its own copies — `TITHIS`, `TITHIS_HI`, `NAKSHATRAS`,
`NAKSHATRAS_HI`, `YOGAS`, `YOGAS_HI`, `KARANAS`, `KARANAS_HI`, `VARAS`,
`VARAS_HI`, `SAMVATSARA_CL`, `AMANTA_CL` (:361-466) — rather than importing
from `panchang.ts`. Currently in sync but a duplication risk.

Two confirmed **gaps in the underlying data model** (the Hindi string
doesn't exist anywhere, not just a wiring issue):

- **`SAMVATSARA_NAMES`** (60-year Vikrama-Samvatsara cycle name, e.g.
  "Saumya", "Prabhava") — `panchang.ts:420`, duplicated as `SAMVATSARA_CL`
  in `index.astro:459-466` — **English-only in both places, no `_HI` array
  exists.** This is the "Saumya" from the user report; Playwright confirms
  `#ps-vs-name` still reads `"Saumya"` in Hindi mode.
- **Tithi `type`** field (`Nanda`/`Bhadra`/`Jaya`/`Rikta`/`Purna`),
  `panchang.ts:97` — plain string, no Hindi counterpart anywhere.

Ghati/Pal/Vipal labels: the *explainer paragraph* in `VedicClock.astro` is
Category A (correctly regenerated every tick via `vcSet("vc-explainer", ...)`
driven by `vcIsHindi`); the static unit labels are Category B (above).

## Confirmation of the 4 user-reported symptoms

All four reproduced empirically with Playwright, not just static reading.

**1. Homepage hero stays English while nav translates.**
Confirmed, but only on reload with a *stored* Hindi preference — a live
in-session click toggles the hero correctly. **Root cause (Category C):**
`Header.astro` applies Hindi from `localStorage` directly at script init
(:1353); `index.astro` has no equivalent — `applyLang()` (:566) is only ever
invoked from the `langchange` listener (:753), never called directly using
the `isHindi`/`currentLang` values already read from `localStorage` at
:384-385. It depends entirely on catching `LanguagePicker.astro`'s one-shot
restoration event, fired via a race-prone fixed `setTimeout(80)`
(`LanguagePicker.astro:123-128`) — easily lost by `index.astro`'s heavier
`type="module"` script, which must resolve its `../lib/panchang` →
`astro-core.ts` import chain before it can even register the listener.

**2. Panchang table: labels translate, values ("Saumya", "Ashadha",
"Wednesday") stay English.**
Partially confirmed, category-mixed. "Saumya" — confirmed, Category D, no
Hindi string exists at all. "Ashadha" and "Wednesday" toggle correctly on
their own elements in `PanchangSummaryCard.astro` (subject to the same
reload race as symptom 1), but the sibling `#vara-lord` field ("Mercury")
never refreshes on language toggle — only on date change — because
`applyLang()` never calls `updateUI()` (Category C).

**3. Ghati/Pal/Vipal widget: headers translate, PAL/VIPAL labels don't,
paragraph does.**
Confirmed exactly. Badge/paragraph are Category A; the "PAL"/"VIPAL" unit
labels are two permanently-visible spans never wired to any toggle
(Category B) — `.vc-unit-lbl`/`.vc-unit-hi` are referenced nowhere in the
`<script>` block.

**4. Lagna Kundali widget has no Hindi translation at all.**
Confirmed, two stacked bugs. Chrome ("Lagna Kundali", "GRAHA", "RASHI",
"North"/"South", "Full Kundali") is Category B — zero `data-hi` anywhere.
Table/lagna-sign values are Category C — real Hindi-branching logic exists
but reads `document.documentElement.dataset.lang`, which is never set
anywhere in the codebase, so it's permanently `false`; the re-render call
also hardcodes `isHindi` to `false` (:612). Playwright confirms `#kw-tbody`
stays `"Surya"` and `#kw-lagna-sign` stays `"Dhanu"` post-toggle.

## Prioritized fix list

**A. New dictionary data needed (not just wiring):**
- `SAMVATSARA_NAMES` (`panchang.ts:420`, `index.astro:459-466`) — add Hindi
  array.
- Tithi `type` field (`panchang.ts:97`) — add Hindi counterpart.

**B. Hardcoded strings to convert to the translation system (traffic order):**
1. `KundaliWidget.astro` — homepage widget, ~10 strings.
2. `calendar.astro` — per-day mini Tithi/Nakshatra text, no `_HI` arrays.
3. `VedicClock.astro` — Ghati/Pal/Vipal unit labels (dual-always-visible →
   needs a real toggle).
4. Low priority: `Tooltip.astro`, `404.astro`/`500.astro`.

**C. Wiring bugs (dictionary/logic exists, just disconnected):**
1. `LanguagePicker.astro`'s racy `setTimeout(80)` restoration broadcast —
   affects every Mechanism-B page (`index.astro`, `calendar.astro`,
   festivals, rashifal, events, prashnavali). Fixing this once benefits all
   of them.
2. `index.astro`: `applyLang()` doesn't call `updateUI()` — auxiliary
   fields (`vara-lord`, `yoga-type`, `nakshatra-meta`) don't refresh on
   toggle.
3. `calendar.astro`: `currentLang` hardcoded to `'en'` at init (:140),
   never reads `localStorage`.
4. `KundaliWidget.astro`: `document.documentElement.dataset.lang` checked
   but never set; `renderTable(currentData, false)` hardcodes Hindi off on
   re-render (:612).

## Key files for follow-up fix work

- `src/components/LanguagePicker.astro` — racy `setTimeout(80)`
  restoration broadcast, :119-128.
- `src/components/Header.astro` — working reference pattern (localStorage
  read at init, :1353; `[data-hi]` swap, :1006-1017).
- `src/pages/index.astro` — `applyLang()` never called at init (:566/753);
  `updateUI` never called from `applyLang`; `SAMVATSARA_CL` has no Hindi,
  :459-466.
- `src/lib/panchang.ts` — `SAMVATSARA_NAMES` :420, tithi `type` field :97 —
  no Hindi anywhere.
- `src/components/KundaliWidget.astro` — no `data-hi` chrome; broken
  `document.documentElement.dataset.lang` check, :478/499/510;
  `renderTable(currentData, false)` hardcoded false, :612.
- `src/components/VedicClock.astro` — always-dual unit labels, :54-69.
- `src/pages/calendar.astro` — `currentLang` hardcoded `'en'` at init,
  :140; no Hindi Tithi/Nakshatra arrays, :111-112.
- `src/components/PanchangSummaryCard.astro` — working reference for the
  `en-text`/`hi-text` pattern.
- Working reference for a correctly-wired local calculator toggle:
  `src/pages/jyotish/kundali.astro` (:107-108, :299-310),
  `src/pages/jyotish/janma-kundali.astro` (:107-108, :319-330),
  `src/pages/muhurta/choghadiya.astro` (:100-102, :235-247).
