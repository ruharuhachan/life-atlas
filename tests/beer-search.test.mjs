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
