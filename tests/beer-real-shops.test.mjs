import { test } from 'node:test';
import assert from 'node:assert/strict';
import shops from '../src/data/beer/shops.json' with { type: 'json' };

const TRUSTED_RESERVATION_PROVIDERS = new Set([
  'tabelog',
  'hotpepper',
  'ikyu',
  'rakuten',
]);

test('Jiyugaoka starts with three verified beer venues', () => {
  assert.equal(shops.length, 3);
  assert.deepEqual(
    shops.map((shop) => shop.name).sort(),
    ['Tai Kou Rou JIYUGAOKA', 'とよ田', '自由が丘牛タンいろ葉'].sort(),
  );

  for (const shop of shops) {
    assert.equal(shop.isDemo, false);
    assert.equal(shop.searchAreaId, 'tokyo-jiyugaoka');
    assert.equal(shop.neighborhoodId, 'tokyo-jiyugaoka-1');
    assert.equal(shop.officialCertified, false);
    assert.equal(shop.externalRatings.google.score, null);
    assert.ok(shop.lastVerifiedAt);
    assert.ok(shop.sources.length >= 2);
    assert.ok(shop.googleMapsUrl);
  }

  const extraCold = shops.filter((shop) =>
    ['taikourou-jiyugaoka', 'toyoda-jiyugaoka'].includes(shop.id),
  );
  for (const shop of extraCold) {
    assert.equal(shop.manufacturerId, 'asahi');
    assert.deepEqual(shop.certifications, ['asahi-extra-cold']);
  }

  const iroha = shops.find((shop) => shop.id === 'gyutan-iroha-jiyugaoka');
  assert.equal(iroha.manufacturerId, 'sapporo');
  assert.deepEqual(iroha.certifications, []);
  assert.deepEqual(iroha.brandIds, ['sapporo-black-label']);
  assert.equal(iroha.externalIds.googlePlaceId, 'ChIJ08jGdB_1GGARQSwIDZzd5nQ');
});

test('Google review values are intentionally not stored in repository data', () => {
  for (const shop of shops) {
    const google = shop.externalRatings.google;
    assert.equal(google.score, null);
    assert.equal(google.reviewCount, null);
    assert.equal(google.collectedAt, null);
    assert.equal(google.sourceUrl, null);
  }
});

test('reservation links use only trusted providers and remain affiliate-ready', () => {
  for (const shop of shops) {
    assert.ok(Array.isArray(shop.reservationLinks));
    assert.equal('reservationUrl' in shop, false);
    assert.equal('reservationAvailable' in shop, false);

    for (const link of shop.reservationLinks) {
      assert.ok(TRUSTED_RESERVATION_PROVIDERS.has(link.providerId));
      assert.ok(link.label);
      assert.match(link.url, /^https:\/\//);
      assert.equal(link.affiliateUrl, null);
      assert.equal(link.affiliateNetwork, null);
    }
  }

  const taikourou = shops.find((shop) => shop.id === 'taikourou-jiyugaoka');
  const toyoda = shops.find((shop) => shop.id === 'toyoda-jiyugaoka');
  const iroha = shops.find((shop) => shop.id === 'gyutan-iroha-jiyugaoka');
  assert.equal(taikourou.reservationLinks[0].providerId, 'tabelog');
  assert.deepEqual(toyoda.reservationLinks, []);
  assert.deepEqual(
    iroha.reservationLinks.map((link) => link.providerId),
    ['tabelog', 'hotpepper'],
  );
});
