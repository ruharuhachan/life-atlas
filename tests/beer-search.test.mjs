import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  certificationsForManufacturer,
  changeManufacturer,
  googleRating,
  meetsGoogleRating,
} from '../src/data/beer/search.ts';
import shops from '../src/data/beer/shops.json' with { type: 'json' };
import certifications from '../src/data/beer/certifications.json' with { type: 'json' };
test('manufacturer changes clear incompatible certification and only expose owned options', () => {
  assert.deepEqual(certificationsForManufacturer(''), []);
  for (const id of ['asahi', 'kirin', 'sapporo', 'suntory']) {
    const next = changeManufacturer(id);
    assert.equal(next.certificationId, '');
    const options = certificationsForManufacturer(next.manufacturerId);
    assert.ok(options.length > 0);
    assert.ok(options.every((c) => c.manufacturerId === id));
  }
  for (const shop of shops)
    for (const id of shop.certifications) {
      assert.equal(
        certifications.find((c) => c.id === id)?.manufacturerId,
        shop.manufacturerId,
      );
    }
});
test('Google only: other provider scores cannot satisfy Google minimum; missing scores remain unknown', () => {
  const other = { externalRatings: { future: { score: 5 } } };
  assert.equal(googleRating(other), null);
  assert.equal(meetsGoogleRating(other, '4'), false);
  assert.equal(meetsGoogleRating(other, ''), true);
  assert.equal(
    meetsGoogleRating({ externalRatings: { google: { score: 4.3 } } }, '4.3'),
    true,
  );
  assert.equal(
    meetsGoogleRating({ externalRatings: { google: { score: 4.2 } } }, '4.3'),
    false,
  );
  for (const shop of shops) assert.equal(meetsGoogleRating(shop, '4'), false);
});

test('brand availability never grants certification and options stay manufacturer-scoped', async () => {
  const { brandsForManufacturer, matchesBeerSelection } =
    await import('../src/data/beer/search.ts');
  const brandOnly = { brandIds: ['sapporo-yebisu'], certifications: [] };
  assert.equal(matchesBeerSelection(brandOnly, 'brand:sapporo-yebisu'), true);
  assert.equal(matchesBeerSelection(brandOnly, 'sapporo-yebisu'), false);
  assert.equal(matchesBeerSelection(brandOnly, 'brand:sapporo-classic'), false);
  assert.ok(
    brandsForManufacturer('sapporo').some((b) => b.name === '白穂乃香'),
  );
  assert.equal(brandsForManufacturer('asahi').length, 0);
  assert.ok(
    certificationsForManufacturer('sapporo').some(
      (c) => c.name === 'パーフェクト風味爽快ニシテ',
    ),
  );
});
test('area selection covers prefecture, district, neighborhood and empty Tokyo districts', async () => {
  const { matchesArea, regionForArea } =
    await import('../src/data/beer/search.ts');
  for (const s of shops) {
    assert.equal(matchesArea(s, 'JP-13'), true);
    assert.equal(matchesArea(s, s.searchAreaId), true);
    assert.equal(matchesArea(s, s.neighborhoodId), true);
    assert.equal(matchesArea(s, 'tokyo-shinjuku'), false);
    assert.equal(regionForArea(s.neighborhoodId).id, s.searchAreaId);
  }
  assert.equal(regionForArea('tokyo-shinjuku').english, 'SHINJUKU');
  assert.equal(regionForArea('JP-13').english, 'TOKYO');
});
