import { BREWERIES } from './breweries';
import { PUBLIC_LISTINGS, unitPrice } from './public-listings';
import { RESTAURANTS } from './restaurants';

export type MapCategory = 'housing' | 'brewery' | 'food';

export type MapPlace = {
  id: string;
  kind: MapCategory;
  name: string;
  area: string;
  address: string;
  longitude: number;
  latitude: number;
  lead: string;
  facts: { label: string; value: string }[];
  sourceUrl: string;
  sourceLabel: string;
  observedOn: string;
  detailUrl: string;
};

export const MAP_CATEGORY_META: Record<
  MapCategory,
  { label: string; short: string; color: string }
> = {
  housing: { label: 'マンション', short: '住', color: '#0b716a' },
  brewery: { label: '酒蔵', short: '蔵', color: '#9a6a16' },
  food: { label: '飲食店', short: '食', color: '#9a3d35' },
};

const housingGroups = new Map<string, typeof PUBLIC_LISTINGS>();

for (const listing of PUBLIC_LISTINGS) {
  const key = `${listing.name}|${listing.address}`;
  const group = housingGroups.get(key) ?? [];
  group.push(listing);
  housingGroups.set(key, group);
}

const housingPlaces: MapPlace[] = [...housingGroups.entries()].map(
  ([key, listings]) => {
    const latest = [...listings].sort((a, b) =>
      b.observedOn.localeCompare(a.observedOn),
    )[0];
    const listingTypes = [
      ...new Set(listings.map((listing) => listing.listingType)),
    ].join('・');
    const prices = listings.map((listing) => listing.price);
    const unitPrices = listings.map(unitPrice);
    const priceLabel =
      Math.min(...prices) === Math.max(...prices)
        ? `${Math.min(...prices).toLocaleString('ja-JP')}万円`
        : `${Math.min(...prices).toLocaleString('ja-JP')}–${Math.max(...prices).toLocaleString('ja-JP')}万円`;
    const unitLabel =
      Math.min(...unitPrices) === Math.max(...unitPrices)
        ? `${Math.min(...unitPrices).toFixed(1)}万円/㎡`
        : `${Math.min(...unitPrices).toFixed(1)}–${Math.max(...unitPrices).toFixed(1)}万円/㎡`;

    return {
      id: `housing-${key.split('|')[0]}`,
      kind: 'housing',
      name: latest.name,
      area: latest.neighborhood,
      address: latest.address,
      longitude: latest.longitude,
      latitude: latest.latitude,
      lead: `${listingTypes}の公開売出し情報。最寄りの${latest.station}、築年、価格を観測ログとして比較。`,
      facts: [
        { label: '種別', value: listingTypes },
        { label: '観測価格', value: priceLabel },
        { label: '㎡単価', value: unitLabel },
        {
          label: '築年 / 観測',
          value: `${latest.builtYear}年・${listings.length}件`,
        },
      ],
      sourceUrl: latest.sourceUrl,
      sourceLabel: '公開売出し情報',
      observedOn: latest.observedOn,
      detailUrl: '/housing/#listing-' + latest.id,
    };
  },
);

const restaurantPlaces: MapPlace[] = RESTAURANTS.map((restaurant) => ({
  id: `food-${restaurant.id}`,
  kind: 'food',
  name: restaurant.name,
  area: restaurant.area,
  address: restaurant.address,
  longitude: restaurant.longitude,
  latitude: restaurant.latitude,
  lead: restaurant.lead,
  facts: [
    { label: '料理', value: restaurant.cuisine },
    { label: '価格感', value: restaurant.budget },
    { label: '場面', value: restaurant.scenes.slice(0, 2).join('・') },
  ],
  sourceUrl: restaurant.researchUrl,
  sourceLabel: restaurant.researchLabel,
  observedOn: restaurant.observedOn,
  detailUrl: '/food/#restaurant-' + restaurant.id,
}));

const breweryPlaces: MapPlace[] = BREWERIES.map((brewery) => ({
  id: `brewery-${brewery.id}`,
  kind: 'brewery',
  name: brewery.name,
  area: brewery.area,
  address: brewery.address,
  longitude: brewery.longitude,
  latitude: brewery.latitude,
  lead: brewery.lead,
  facts: [
    { label: '酒類', value: brewery.beverage },
    { label: '創業', value: `${brewery.founded}年` },
    { label: '訪問', value: brewery.visitNote },
  ],
  sourceUrl: brewery.sourceUrl,
  sourceLabel: brewery.sourceLabel,
  observedOn: brewery.observedOn,
  detailUrl: brewery.sourceUrl,
}));

export const MAP_PLACES: MapPlace[] = [
  ...housingPlaces,
  ...breweryPlaces,
  ...restaurantPlaces,
];
