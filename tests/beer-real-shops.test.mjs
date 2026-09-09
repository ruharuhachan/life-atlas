import { test } from 'node:test';
import assert from 'node:assert/strict';
import shops from '../src/data/beer/shops.json' with { type: 'json' };

test('Jiyugaoka starts with the two verified Extra Cold venues', () => {
  assert.equal(shops.length, 2);
  assert.deepEqual(
    shops.map((shop) => shop.name).sort(),
    ['Tai Kou Rou JIYUGAOKA', 'とよ田'].sort(),
  );
  for (const shop of shops) {
    assert.equal(shop.isDemo, false);
    assert.equal(shop.searchAreaId, 'tokyo-jiyugaoka');
    assert.equal(shop.neighborhoodId, 'tokyo-jiyugaoka-1');
    assert.equal(shop.manufacturerId, 'asahi');
    assert.deepEqual(shop.certifications, ['asahi-extra-cold']);
    assert.equal(shop.officialCertified, false);
    assert.equal(shop.externalRatings.google.score, null);
    assert.ok(shop.lastVerifiedAt);
    assert.ok(shop.sources.length >= 2);
    assert.ok(shop.googleMapsUrl);
  }
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
