# SEO baseline — 16 August 2026

Snapshot taken the day three changes shipped, so their effect can be read later
without guessing. GSC window is **17 Jul – 13 Aug 2026** (28 days, finalised).

The site is in a pre-existing decline that is **not** caused by these changes:
impressions grew ~60% over 90 days (873/day in May → ~1,450/day in Aug) while
clicks stayed flat at ~175/day, so CTR fell 18% → 11%. Cause is AI Overviews on
informational queries. Do not read that trend as a verdict on the work below —
measure each change on its own metric.

## Sitewide

| Metric | Baseline |
|---|---|
| Clicks (28d) | 4,742 |
| Impressions (28d) | 42,636 |
| CTR | 11.1% |
| Homepage share of clicks | 4,365 / 4,742 = **92%** |
| Mobile / desktop CTR | 14.48% / 5.66% |

## 1. Canonical URL consolidation (commit 36550a8)

Non-slash duplicates should decay to zero impressions as Google recrawls and
sees the 308. **Measure this, not total traffic.**

| URL | Impressions (28d) | Position |
|---|---|---|
| `/faraid-adik-beradik` (no slash) | 752 | 6.1 |
| `/faraid-adik-beradik/` | 646 | 7.9 |

Over 120 days the duplicate pairs were larger: `/panduan-faraid` 2,363 vs
`/panduan-faraid/` 1,883; `/faraid-ibu-meninggal` 1,375 vs `/faraid-ibu-meninggal/`
4,995; `/faraid-ayah-meninggal` 323 vs `/faraid-ayah-meninggal/` 984.

**Success = the no-slash rows go to zero and the slash rows absorb them.**
Total impressions should be roughly flat; this is consolidation, not growth.

## 2. Carta images (commit 87846d5)

Baseline for **Search type: Image** — 223 impressions, **0 clicks**, position ~50.
That is the generic og-image surfacing weakly; there were no content images at all.

| Page | Image impressions | Position |
|---|---|---|
| `/` | 107 | 46.1 |
| `/faraid-suami-meninggal/` | 19 | 51.4 |
| `/pembahagian-harta-mengikut-faraid/` | 19 | 52.1 |
| `/faraid-ibu-meninggal/` | 14 | 47.1 |
| `/jadual-pembahagian-faraid/` | 6 | 58.7 |

Target queries (web search, all at **0 clicks** today):

| Query | Impressions | Position |
|---|---|---|
| `carta pembahagian faraid` | 124 | 6.7 |
| `carta pembahagian faraid isteri meninggal` | 77 | 6.2 |
| `carta pembahagian faraid suami meninggal` | 72 | 4.1 |
| `carta faraid` | 24 | 11.6 |
| **Total carta queries** | **311** | — |

**Success = image impressions rise well above 223 and average image position
moves from ~50 toward the top 20.** Secondary: the carta queries stop returning
0 clicks.

## 3. Schema graph (commit 95d978d)

Not measurable in GSC. Verify with the Rich Results Test / Schema Markup
Validator instead. Before: 4 unlinked `Organization` nodes per page (76 sitewide).
After: 1 per page sharing `@id` `https://www.kirafaraid.my/#organization`, and a
single `WebApplication` `#calculator` shared by 12 pages.

## SERP context (DataforSEO, mobile, Malaysia, 16 Aug 2026)

Positions here are **absolute** (counting SERP features); GSC reports organic-only,
which is why they differ.

| Query | AI Overview | Image pack | Our organic | Our absolute |
|---|---|---|---|---|
| `faraid calculator` | **No** | No | 2 | 2 |
| `kalkulator faraid` | **No** | at abs 9 | 2 | 2 |
| `pembahagian faraid` | **Yes, abs 1** | at abs 2 | 6 | **10** |
| `carta pembahagian faraid` | Yes, abs 3 | **abs 1** | 5 | **9** |

Two findings worth preserving:

- On `pembahagian faraid` **we are cited twice inside the AI Overview** — the
  homepage carries the tool recommendation ("Anda boleh membuat anggaran … 
  [Kalkulator Faraid Malaysia]") and `/faraid-ibu-meninggal/` is cited as a
  source. That citation is worth more than moving 6 → 3 on a zero-click SERP.
- On `carta pembahagian faraid` that same recommendation slot goes to MAIS and
  as-Salihin, both of which were cited in the AIO body first. Body citation
  appears to precede the recommendation, which is why strengthening
  `/jadual-pembahagian-faraid/` (currently position 16.5) is the lever there.

## Re-check schedule

- **Days 1–3** — request indexing for the 3 carta pages; image discovery is slow otherwise.
- **Days 3–7** — URL Inspection on a no-slash URL should report "Page with redirect".
- **Weeks 2–4** — first image impressions; no-slash rows starting to decay.
- **Weeks 4–8** — consolidation largely done; judge the carta images by then, not sooner.
