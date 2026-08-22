# Devotional Library Cross-Link Candidates

> **Status: FULLY IMPLEMENTED, 2026-08-22.** Every pair below has been wired via `DevotionalDetail.astro`'s `relatedLinks` prop and verified live on production (panchangpath.com, cache-busted). Nothing outstanding — this file is kept only as a record of what was built and why, in case a future Devotional Library expansion (new deities/categories) wants to extend the pattern.
>
> The mechanism: each `[slug].astro` template that wants related links defines a `RELATED: Record<string, {label, labelHi?, href}[]>` map keyed by slug and passes `relatedLinks={RELATED[item.slug]}` to `DevotionalDetail`. See `src/pages/devotional/{aarti,chalisa,vrat-katha,puja-vidhi,mantra,yantra}/[slug].astro`. `mantra` and `yantra` didn't carry the `RELATED` map/prop before this session — it was added there for the first time, following the exact existing pattern (no changes to `DevotionalDetail.astro` or to `DevotionalItem`/`CATEGORY_META` were needed).

## Why this exists

The Devotional Library on-page SEO pass ran across a flagship tier (Task 8, 2026-08-22) plus three light-pass batches (Task 8B, Batches 1–3, same day). Each pass noticed pages in different categories that clearly belong together (same deity, same festival, same mantra/yantra pairing) but weren't linked to each other on the page itself. Cross-linking was explicitly out of scope for every one of those passes — this file is where those findings landed, and this cross-linking session (also 2026-08-22) built all of it.

## Tier A — high-confidence pairs (all wired, bidirectional)

**Already wired pre-session (Task 8 flagship tier), re-verified live this session:**
- Ganesh Chalisa ↔ Jai Ganesh Deva Aarti
- Lakshmi Chalisa ↔ Om Jai Lakshmi Mata Aarti
- Satyanarayan Vrat Katha ↔ Satyanarayan Puja Vidhi

**Wired this session — Vrat Katha ↔ Puja Vidhi, same festival:**
- Karva Chauth Vrat Katha ↔ Karva Chauth Puja Vidhi
- Ganesh Chaturthi Vrat Katha ↔ Ganesh Chaturthi Puja Vidhi
- Janmashtami Vrat Katha ↔ Janmashtami Puja Vidhi
- Ram Navami Vrat Katha ↔ Ram Navami Puja Vidhi
- Navratri Vrat Katha ↔ Navratri/Durga Puja Vidhi

**Wired this session — Aarti ↔ Chalisa, same deity:**
- Durga: Jai Ambe Gauri Aarti ↔ Durga Chalisa
- Shiva: Om Jai Shiv Omkara Aarti ↔ Shiv Chalisa
- Krishna: Aarti Kunj Bihari Ki ↔ Krishna Chalisa
- Sai: Sai Baba Aarti ↔ Sai Chalisa
- Kali: Aarti Shri Kali ji Ki ↔ Kali Chalisa
- Ram: Aarti Shri Ramchandra ji Ki ↔ Ram Chalisa
- Hanuman: Aarti Kije Hanuman Lala Ki ↔ Hanuman Chalisa
- Saraswati: Jai Saraswati Mata Aarti ↔ Saraswati Chalisa
- Vaishno Devi: Vaishno Devi Aarti ↔ Vaishno Devi Chalisa

**Wired this session — Mantra ↔ Yantra, same deity** (required adding the `RELATED` map + `relatedLinks` prop to both `[slug].astro` templates for the first time):
- Ganesh Mantra ↔ Ganesh Yantra
- Lakshmi Mantra ↔ Lakshmi Yantra
- Saraswati Mantra ↔ Saraswati Yantra
- Durga/Devi Mantra ↔ Durga Yantra
- Hanuman Mantra ↔ Hanuman Yantra
- Kuber Mantra ↔ Kuber Yantra
- Mahamrityunjaya Mantra ↔ Mahamrityunjaya Yantra
- Navgraha Mantras ↔ Navgraha Yantra, **and** Navgraha Mantras ↔ Shani Yantra (Shani has no standalone mantra page — its mantra is one line inside the Navgraha Mantras entry — so that page carries two related links, and Shani Yantra links back to Navgraha Mantras with a label clarifying the shared source)

## Tier B — softer deity-cluster candidates (all wired, one-directional light touch)

Implemented as **one outbound link per source page** (Vrat Katha/Puja Vidhi → the same-deity page in another category), not reciprocal. The target pages (Chalisa/Namavali) already carry their own Tier A related-link card in most cases; adding a reverse link there would dilute it rather than help, so those weren't touched.

- Mangalwar (Tuesday) Vrat Katha → Hanuman Chalisa
- Budhwar (Wednesday) Vrat Katha → Ganesh Chalisa
- Shanivar (Saturday) Vrat Katha → **Shani Chalisa** (substituted for the originally-proposed Shani Ashtottara Shatanamavali — Shani Chalisa exists and keeps the weekday-vrat-katha trio pointing at the same target type instead of mixing Chalisa/Namavali)
- Pradosh Vrat Katha → Rudrabhishek Puja Vidhi
- Sankashti Chaturthi Vrat Katha → Ganesh Ashtottara Shatanamavali (deliberately different target than Budhwar's, to avoid two Vrat Katha pages pointing at the same Ganesh Chalisa page)
- Saraswati Puja Vidhi → Saraswati Ashtottara Shatanamavali
- Diwali Lakshmi Puja Vidhi → Lakshmi Ashtottara Shatanamavali
- Maha Shivratri Puja Vidhi → Shiva Ashtottara Shatanamavali

No candidates were skipped — all read as natural connections once implemented one-directionally at a single link each.

## If the library grows further

`relatedLinks` stayed a hand-maintained per-slug `RELATED` map in each `[slug].astro` file — fine at the current scale (143 leaf pages across 9 built categories, Nama Ramayanam still not built). If the library roughly doubles, revisit whether a generated/derived mapping is worth the complexity; no need to act on this now.
