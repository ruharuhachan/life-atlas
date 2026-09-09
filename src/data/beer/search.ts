import brands from './brands.json' with { type: 'json' };
import areas from './areas.json' with { type: 'json' };
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

export function brandsForManufacturer(manufacturerId: string) {
  return brands.filter((b) => b.manufacturerId === manufacturerId);
}
export function matchesBeerSelection(
  shop: { certifications: string[]; brandIds: string[] },
  value: string,
) {
  if (!value) return true;
  return value.startsWith('brand:')
    ? shop.brandIds.includes(value.slice(6))
    : shop.certifications.includes(value);
}
export function matchesArea(
  shop: { prefectureId: string; searchAreaId: string; neighborhoodId: string },
  areaId: string,
) {
  return (
    areaId === shop.prefectureId ||
    areaId === shop.searchAreaId ||
    areaId === shop.neighborhoodId
  );
}
export function regionForArea(areaId: string) {
  return (
    areas.areas.find(
      (a) => a.id === areaId || a.neighborhoods.some((n) => n.id === areaId),
    ) ?? areas.overview
  );
}
