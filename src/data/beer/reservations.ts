export interface ReservationLink {
  providerId: string;
  label: string;
  url: string;
  affiliateUrl: string | null;
  affiliateNetwork: string | null;
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
