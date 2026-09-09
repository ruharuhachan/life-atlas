# Life Atlas / GitHub Copilot instructions

## Repository basics
- This repository is an Astro site using React and D3.
- Use Node.js 24 and pnpm 11 as declared by the repository.
- Before finishing a change, run `pnpm ci`. If formatting fails, run `pnpm format` and then rerun `pnpm ci`.
- Keep changes narrowly scoped. Do not rewrite unrelated pages or data.
- Never invent facts, URLs, certifications, ratings, coordinates, store details, or source evidence. If evidence is insufficient, stop and state exactly what is missing.

## Beer Atlas core rules
- Beer Atlas store data lives in `src/data/beer/shops.json` and its master data is under `src/data/beer/`.
- One physical store is one store record. IDs and slugs must be stable, lowercase ASCII kebab-case.
- Manufacturer, brand, certification, area and neighborhood references must use existing master IDs unless there is strong source evidence and the task explicitly requires a master-data addition.
- A beer being served does not mean the store is manufacturer-certified.
- A serving method or equipment category does not automatically mean certification. In particular, Asahi Extra Cold is a serving/temperature category and must not be treated as an official quality certification.
- `officialCertified` may be `true` only when source evidence proves that the specific store is officially certified under a master entry whose `isCertification` is `true`.
- Google Maps reviews are used only as a manual editorial screening signal. Never call Google Places/Maps APIs, scrape Google Maps, or store Google rating/review counts in repository data. All `externalRatings.google` value fields must remain `null`.
- New-store screening uses a manually checked Google Maps rating of 4.0 or higher as the normal editorial threshold. The rating itself is not stored in `shops.json`.
- Keep a normal Google Maps external link for the store when supplied.
- Trusted reservation providers are currently: Tabelog, Hot Pepper Gourmet, Ikyu Restaurant, and Rakuten-related reservation services. Do not add AutoReserve or another unapproved reservation service.
- Reservation affiliate support already exists. Do not populate `affiliateUrl` or `affiliateNetwork` unless real approved affiliate values are explicitly supplied.
- Advertising, affiliate status, sponsorship, and reservation availability must not change manufacturer facts, editorial ranking, or certification status.
- Do not copy third-party review text, photos, or copyrighted descriptions into Beer Atlas.

## Store-addition workflow
For routine Beer Atlas store additions, prefer the repository custom agent in `.github/agents/beer-atlas-store.agent.md` and the structured issue form under `.github/ISSUE_TEMPLATE/beer-atlas-shop.yml`.

When adding a store:
1. Read the current `shops.json`, `manufacturers.json`, `brands.json`, `certifications.json`, and `areas.json` before editing.
2. Validate the supplied factual evidence and map it to existing master IDs.
3. Add the minimum store record needed. Keep unknown controls as `未確認` rather than guessing.
4. Add only trusted reservation links.
5. Keep Google rating/count fields null.
6. Run `pnpm ci` and fix all failures.
7. In the pull request summary, list the evidence used, what was intentionally left unverified, and any editorial assumptions.
