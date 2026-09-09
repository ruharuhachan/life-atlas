---
applyTo: 'src/data/beer/**,src/components/beer/**,src/pages/beer/**,tests/beer-*.test.mjs'
---

# Beer Atlas path-specific instructions

- Preserve the distinction between manufacturer certification, serving method, served brand, third-party review information, and Life Atlas editorial content.
- Never infer certification from a served brand or from equipment/serving availability.
- Keep Google review values out of repository data. Google Maps links and Place IDs may be stored; Google rating, review count, review text, and cached review payloads must not be stored.
- New-store editorial screening normally requires a user-confirmed Google Maps rating of at least 4.0, but that number is not a Beer Atlas score and must not be rendered from repository data.
- `reservationLinks` may contain only trusted providers: `tabelog`, `hotpepper`, `ikyu`, `rakuten`.
- Do not introduce AutoReserve links.
- Keep affiliate fields null unless an approved affiliate URL/network is explicitly provided. Affiliate status must not affect listing order or evaluation.
- Use `未確認` for facts that are not evidenced. Do not convert missing evidence into a negative evaluation.
- Every store must have a stable unique `id` and `slug`, an address, latitude/longitude, manufacturer reference, sources, verification date, area references, Google Maps URL, controls object, reservationLinks array, and brand/certification arrays.
- Master references must exist and match the same manufacturer.
- Brand-master `sourceUrl` values must point to manufacturer-official product or brand pages. Store menus, reservation sites, map listings, and review sites belong only in store-specific evidence and must not be used as brand-master provenance.
- New certification-program masters require manufacturer-official evidence; third-party listings alone are insufficient.
- Tests should validate invariants and known historical facts without fixing the total number of stores, so routine additions do not require rewriting expected store counts.
