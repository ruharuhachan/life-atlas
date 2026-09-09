export interface ReservationLink {
  providerId: string;
  label: string;
  url: string;
  affiliateUrl: string | null;
  affiliateNetwork: string | null;
}

export const TRUSTED_RESERVATION_PROVIDER_IDS = [
  'tabelog',
  'hotpepper',
  'ikyu',
  'rakuten',
] as const;

export type TrustedReservationProviderId =
  (typeof TRUSTED_RESERVATION_PROVIDER_IDS)[number];

export function isTrustedReservationProvider(providerId: string) {
  return (TRUSTED_RESERVATION_PROVIDER_IDS as readonly string[]).includes(
    providerId,
  );
}

export function trustedReservationLinks(
  links: readonly ReservationLink[],
): ReservationLink[] {
  return links.filter((link) => isTrustedReservationProvider(link.providerId));
}

export function reservationHref(link: ReservationLink) {
  return link.affiliateUrl?.trim() || link.url;
}

export function isAffiliateReservation(link: ReservationLink) {
  return Boolean(link.affiliateUrl?.trim());
}

export function reservationRel(link: ReservationLink) {
  return isAffiliateReservation(link) ? 'sponsored noreferrer' : 'noreferrer';
}
