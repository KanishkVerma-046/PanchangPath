# Draft: Raksha Bandhan 2026 festival-page content enrichment

**Status: DRAFT — awaiting owner approval. Not wired into `src/lib/festivals.ts` or any page. No commit made.**

Source page: `/festivals/raksha-bandhan-2026` (`src/pages/festivals/[slug].astro`, data in `src/lib/festivals.ts` line 62).

## Current state (confirmed live, 2026-08-15)

The page's "About this Festival" section renders `f.longDesc ?? f.description`. The 2026 entry has no `longDesc`, so it falls back to the same one-line card blurb used in feeds/nav: "Sisters tie rakhi on brothers' wrists, brothers vow to protect them." There is no Tithi timing, no Bhadra Kaal / Muhurat window, and no regional-variation content anywhere on the page. (The 2025 entry does have a `longDesc`, but it's also generic — no timing/Bhadra/regional content either.)

## Sourcing for the facts below

Cross-checked against two independent aggregations of the current Hindu-calendar-software ecosystem's published values (not the audit's own number, and not a single source) — both converge tightly on the same figures:
- Search set 1: rudraksha-ratna.com, giva.co, academyofvedicvidya.com, shubhdivas.in, astrozindagi.in, artofpuja.com, rakhi.com
- Search set 2: magicdecor.in, giva.co, gemsmantra.com, vedictemple.in, daanyam.com, astrozindagi.in

A direct drikpanchang.com fetch for this specific page 404'd (URL pattern didn't resolve), so that particular source could not be added as a third leg this session — flagging that rather than silently dropping it.

Figures (IST, New Delhi reference):
- Purnima Tithi begins ~9:08 AM on 27 August 2026, ends ~9:48 AM on 28 August 2026.
- Bhadra Kaal falls entirely within 27 August (~9:08 AM – ~9:32/9:48 PM) — it ends well before sunrise on the 28th, so the 28th carries **no Bhadra Kaal conflict at all** this year.
- Shubh Muhurat for tying rakhi on 28 August 2026: **5:57 AM – 9:48 AM IST** (~3h51m — essentially sunrise to the moment Purnima Tithi ends). This matches the audit's stated window, independently re-derived rather than copied from it.

These are the same category of claim CLAUDE.md asks to be flagged before commit (factual/astronomical), and Bhadra/Tithi timings shift by city — the copy below states the window as "for Delhi/pan-India reference" rather than implying it's universal, consistent with how the rest of the site handles location-dependent timings.

## Draft copy (English)

### Tithi & Timing

> Raksha Bandhan falls on the Shravana Purnima — the full moon of the lunar month of Shravana. In 2026, Purnima Tithi begins around 9:08 AM on 27 August and runs through to about 9:48 AM on 28 August, which is why the festival itself is observed on the 28th (Friday) rather than the 27th: by convention, Raksha Bandhan is celebrated on whichever day the Purnima Tithi prevails at daytime/pradosh, and here that's the 28th.

### Bhadra Kaal & Shubh Muhurat

> Rakhi is traditionally avoided during Bhadra Kaal, an inauspicious period ruled by Vishti Karana that Hindu tradition holds unsuitable for auspicious beginnings. In most years this forces families to wait until Bhadra clears before tying rakhi — but 2026 is unusually favorable: Bhadra Kaal falls entirely on 27 August and ends by around 9:32 PM that night, well before the Purnima Tithi (and the festival) begins on the 28th. That leaves the **entire morning of 28 August free of Bhadra**, with the auspicious window running from sunrise (~5:57 AM) to the end of Purnima Tithi (~9:48 AM) — about 3 hours 51 minutes. (Timings are for Delhi/pan-India reference; Tithi and Bhadra boundaries shift by a few minutes depending on your city — check this site's own Panchang for your location before finalizing a muhurat.)

### Significance

> Raksha Bandhan's central symbol — a thread tied at the wrist as a vow of protection — draws on several layered stories rather than one single origin myth:
>
> - **Indra and Indrani**: in the Bhavishya Purana, Indra's wife Sachi (Indrani) is said to have tied a protective thread on Indra's wrist before his battle against the demon king Bali, an act credited with turning the fight in the Devas' favor. This is the story most often cited for the thread's protective power.
> - **Krishna and Draupadi**: in the Mahabharata, Draupadi tears a strip from her sari to bandage Krishna's bleeding finger; Krishna in turn vows to protect her, a debt many traditions say he repays during her humiliation in the Kaurava court.
> - **Yama and Yamuna**: the god of death Yama is said to have granted his sister Yamuna a boon of immortality after she tied a rakhi on his wrist — the basis of the sibling-protection theme, and the reason the related custom of Bhai Dooj (which also honors the Yama–Yamuna bond) sits a few months later on the calendar.
>
> A later, historically disputed legend holds that Rani Karnavati of Mewar sent a rakhi to the Mughal emperor Humayun in the 16th century asking for protection against an invading army — a story popular in retellings but not treated as settled history by most scholars, so it's worth stating as legend rather than fact.

### Regional Variations

> While the rakhi-tying custom is pan-Indian, the same Shravana Purnima carries different names and observances by region:
>
> - **Maharashtra & the Konkan coast**: celebrated as **Narali Purnima** ("coconut full moon") — fishing communities offer coconuts to the sea god Varuna to mark the end of the monsoon and the reopening of the fishing season, alongside (not instead of) rakhi-tying.
> - **Andhra Pradesh, Karnataka & parts of South India**: coincides with **Avani Avittam** (Upakarma) — Brahmin men change their sacred thread (yajnopavita) and recite the Rigveda in a ritual renewal ceremony, distinct from the sibling rakhi custom observed the same day.
> - **West Bengal & Odisha**: historically tied to **Jhulan Purnima** and, in Bengal specifically, to Rabindranath Tagore's 1905 Rakhi Utsav — Tagore had Hindus and Muslims tie rakhis on each other during the British partition of Bengal, turning the festival into a symbol of communal unity that some Bengali observances still reference.
> - **Rajasthan & parts of North India**: an additional **Lumba Rakhi** is tied by sisters-in-law rather than sisters, extending the protection theme to the wife's side of the family.

## Owner decision needed (per session brief, not decided here)

Is this depth (Tithi timing + Bhadra/Muhurat + sourced mythology + regional variation, ~500 words) meant to become the standard template applied to all major festival pages, or is it a one-off enrichment for Raksha Bandhan specifically? This connects to the homepage-marketing-copy gap flagged in Task 8 — the homepage currently promises "Tithi timings, significance, regional variations" for festival pages generally, which today only the enriched version above would actually deliver.
