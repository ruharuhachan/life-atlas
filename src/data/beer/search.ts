import certifications from './certifications.json' with { type: 'json' };
export function certificationsForManufacturer(manufacturerId: string) {
  return manufacturerId
    ? certifications.filter((c) => c.manufacturerId === manufacturerId)
    : [];
}
export function changeManufacturer(manufacturerId: string) {
  return { manufacturerId, certificationId: '' };
}
export interface ExternalRating {
  score: number | null;
  reviewCount?: number | null;
  collectedAt?: string | null;
  sourceUrl?: string | null;
  attribution?: string | null;
  expiresAt?: string | null;
}
// Provider-keyed records retain room for future sources; current UI uses Google only.
export function googleRating(shop: {
  externalRatings: Record<string, ExternalRating>;
}) {
  return shop.externalRatings.google ?? null;
}
export function meetsGoogleRating(
  shop: { externalRatings: Record<string, ExternalRating> },
  minimum: string,
) {
  const score = googleRating(shop)?.score;
  return !minimum || (score != null && score >= Number(minimum));
}
