import { test } from 'node:test';
import assert from 'node:assert/strict';
import shops from '../src/data/beer/shops.json' with { type: 'json' };
import manufacturers from '../src/data/beer/manufacturers.json' with { type: 'json' };
import brands from '../src/data/beer/brands.json' with { type: 'json' };
import certifications from '../src/data/beer/certifications.json' with { type: 'json' };
import areas from '../src/data/beer/areas.json' with { type: 'json' };

const TRUSTED_RESERVATION_PROVIDERS = new Set([
  'tabelog',
  'hotpepper',
  'ikyu',
  'rakuten',
]);

const manufacturerIds = new Set(manufacturers.map((item) => item.id));
const brandById = new Map(brands.map((item) => [item.id, item]));
const certificationById = new Map(
  certifications.map((item) => [item.id, item]),
);
const prefectureIds = new Set(areas.prefectures.map((item) => item.id));
const areaById = new Map(areas.areas.map((item) => [item.id, item]));

function assertHttps(value, label) {
  assert.match(value, /^https:\/\//, `${label} must be an HTTPS URL`);
}

test('shop records satisfy Beer Atlas data invariants', () => {
  assert.ok(shops.length >= 3);

  const ids = new Set();
  const slugs = new Set();

  for (const shop of shops) {
    assert.match(shop.id, /^[a-z0-9-]+$/);
    assert.match(shop.slug, /^[a-z0-9-]+$/);
    assert.equal(ids.has(shop.id), false, `duplicate shop id: ${shop.id}`);
    assert.equal(
      slugs.has(shop.slug),
      false,
      `duplicate shop slug: ${shop.slug}`,
    );
    ids.add(shop.id);
    slugs.add(shop.slug);

    assert.ok(shop.name);
    assert.ok(shop.address);
    assert.equal(typeof shop.latitude, 'number');
    assert.equal(typeof shop.longitude, 'number');
    assert.ok(manufacturerIds.has(shop.manufacturerId));
    assert.equal(shop.isDemo, false);
    assert.ok(shop.lastVerifiedAt);
    assert.ok(Array.isArray(shop.sources));
    assert.ok(shop.sources.length >= 1);
    assert.ok(Array.isArray(shop.brandIds));
    assert.ok(Array.isArray(shop.certifications));
    assert.ok(Array.isArray(shop.reservationLinks));
    assertHttps(shop.googleMapsUrl, `${shop.id}.googleMapsUrl`);

    assert.ok(prefectureIds.has(shop.prefectureId));
    const area = areaById.get(shop.searchAreaId);
    assert.ok(area, `unknown searchAreaId: ${shop.searchAreaId}`);
    assert.equal(area.parentId, shop.prefectureId);
    if (area.neighborhoods.length > 0) {
      assert.ok(
        area.neighborhoods.some((item) => item.id === shop.neighborhoodId),
        `unknown neighborhoodId: ${shop.neighborhoodId}`,
      );
    }

    for (const source of shop.sources) {
      assert.ok(source.label);
      assertHttps(source.url, `${shop.id}.sources[].url`);
    }

    for (const brandId of shop.brandIds) {
      const brand = brandById.get(brandId);
      assert.ok(brand, `unknown brandId: ${brandId}`);
      assert.equal(brand.manufacturerId, shop.manufacturerId);
    }

    for (const certificationId of shop.certifications) {
      const certification = certificationById.get(certificationId);
      assert.ok(certification, `unknown certificationId: ${certificationId}`);
      assert.equal(certification.manufacturerId, shop.manufacturerId);
    }

    if (shop.officialCertified) {
      assert.ok(
        shop.certifications.some(
          (id) => certificationById.get(id)?.isCertification === true,
        ),
        `${shop.id} is officialCertified without an official certification`,
      );
    }
  }
});

test('known Jiyugaoka facts remain intact', () => {
  const taikourou = shops.find((shop) => shop.id === 'taikourou-jiyugaoka');
  const toyoda = shops.find((shop) => shop.id === 'toyoda-jiyugaoka');
  const iroha = shops.find((shop) => shop.id === 'gyutan-iroha-jiyugaoka');

  assert.ok(taikourou);
  assert.ok(toyoda);
  assert.ok(iroha);

  for (const shop of [taikourou, toyoda]) {
    assert.equal(shop.manufacturerId, 'asahi');
    assert.deepEqual(shop.certifications, ['asahi-extra-cold']);
    assert.equal(shop.officialCertified, false);
  }

  assert.equal(iroha.manufacturerId, 'sapporo');
  assert.deepEqual(iroha.certifications, []);
  assert.deepEqual(iroha.brandIds, ['sapporo-black-label']);
  assert.equal(iroha.officialCertified, false);
  assert.equal(iroha.externalIds.googlePlaceId, 'ChIJ08jGdB_1GGARQSwIDZzd5nQ');
});

test('Google review values are intentionally not stored in repository data', () => {
  for (const shop of shops) {
    const google = shop.externalRatings.google;
    assert.equal(google.score, null);
    assert.equal(google.reviewCount, null);
    assert.equal(google.collectedAt, null);
    assert.equal(google.sourceUrl, null);
    assert.equal(google.attribution, null);
    assert.equal(google.expiresAt, null);
  }
});

test('reservation links use only trusted providers and remain affiliate-ready', () => {
  for (const shop of shops) {
    assert.equal('reservationUrl' in shop, false);
    assert.equal('reservationAvailable' in shop, false);

    for (const link of shop.reservationLinks) {
      assert.ok(
        TRUSTED_RESERVATION_PROVIDERS.has(link.providerId),
        `untrusted reservation provider: ${link.providerId}`,
      );
      assert.ok(link.label);
      assertHttps(link.url, `${shop.id}.reservationLinks[].url`);
      assert.equal(/autoreserve/i.test(link.url), false);
      assert.equal(link.affiliateUrl, null);
      assert.equal(link.affiliateNetwork, null);
    }
  }
});
