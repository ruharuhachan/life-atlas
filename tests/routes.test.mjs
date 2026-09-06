import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('dist');
const htmlFiles = fs
  .readdirSync(root, { recursive: true })
  .filter((f) => f.endsWith('.html'));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
function targetFor(url) {
  let p = decodeURIComponent(url.pathname);
  return p.endsWith('/')
    ? p.slice(1) + 'index.html'
    : path.extname(p)
      ? p.slice(1)
      : p.slice(1) + '/index.html';
}
test('region entries and recovered routes are built', () => {
  for (const file of [
    'index.html',
    'niigata/index.html',
    'niigata/map/index.html',
    'niigata/housing/index.html',
    'niigata/food/index.html',
    'niigata/relocation/index.html',
    'niigata/support/index.html',
    'hakodate/index.html',
    'hakodate/food/index.html',
    'hakodate/housing/index.html',
  ])
    assert.ok(fs.existsSync(path.join(root, file)), file);
  assert.match(read('index.html'), /NIIGATA/);
  assert.match(read('index.html'), /HAKODATE/);
  assert.match(read('niigata/map/index.html'), /PlaceAtlas/);
  assert.match(read('niigata/housing/index.html'), /HousingApp/);
  assert.match(read('niigata/food/index.html'), /RestaurantResearch/);
});
test('all internal navigation and fragment targets resolve', () => {
  for (const file of htmlFiles) {
    const source = read(file);
    const route = '/' + file.replace(/index.html$/, '');
    for (const match of source.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      const raw = match[1].replaceAll('&amp;', '&');
      const u = new URL(raw, 'https://life-atlas.jp' + route);
      if (u.origin !== 'https://life-atlas.jp') continue;
      const target = targetFor(u);
      assert.ok(fs.existsSync(path.join(root, target)), file + ' -> ' + raw);
      if (u.hash) {
        const body = read(target);
        const id = decodeURIComponent(u.hash.slice(1));
        assert.ok(
          body.includes('id="' + id + '"'),
          file + ' -> missing #' + id + ' in ' + target,
        );
      }
    }
  }
});
test('local images, fonts and island modules are present', () => {
  for (const file of htmlFiles)
    for (const match of read(file).matchAll(
      /(?:src|component-url|renderer-url)="(\/[^"]+)"/g,
    )) {
      const u = new URL(match[1], 'https://life-atlas.jp');
      assert.ok(
        fs.existsSync(path.join(root, u.pathname.slice(1))),
        file + ' -> ' + u.pathname,
      );
    }
  assert.ok(fs.statSync(path.join(root, 'fonts/anton.ttf')).size > 1000);
});
test('public UI preserves requested removals and historical data labels', () => {
  for (const file of htmlFiles) {
    assert.doesNotMatch(read(file), /href="https:\/\/github.com\/ruharuhachan/);
    assert.doesNotMatch(read(file), /最初の地域は、新潟/);
  }
  assert.match(read('niigata/housing/index.html'), /観測記録/);
  assert.match(read('hakodate/housing/index.html'), /0件/);
  assert.equal(fs.readFileSync('public/CNAME', 'utf8').trim(), 'life-atlas.jp');
});
