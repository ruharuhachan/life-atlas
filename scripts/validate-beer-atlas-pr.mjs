import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const baseSha = process.env.BASE_SHA?.trim();
const prBody = (process.env.PR_BODY ?? '').replaceAll('[X]', '[x]');

if (!baseSha) {
  throw new Error('BASE_SHA is required');
}

function readJsonAtBase(path) {
  return JSON.parse(
    execFileSync('git', ['show', `${baseSha}:${path}`], {
      encoding: 'utf8',
    }),
  );
}

const path = 'src/data/beer/shops.json';
const baseShops = readJsonAtBase(path);
const currentShops = JSON.parse(readFileSync(path, 'utf8'));
const baseIds = new Set(baseShops.map((shop) => shop.id));
const addedShops = currentShops.filter((shop) => !baseIds.has(shop.id));

if (addedShops.length === 0) {
  console.log('No new Beer Atlas shops detected; PR metadata gate skipped.');
  process.exit(0);
}

const standardRatingGate = '- [x] Google Maps評価4.0以上を人間が手動確認';
const exceptionRatingGate =
  '- [x] Google Maps評価4.0未満だが例外掲載を人間が明示承認';

const requiredMarkers = [
  '- [x] Google評価点・口コミ件数をDBに保存していない',
  '- [x] 提供銘柄とメーカー認定を分離して確認',
  '- [x] 予約リンクは許可プロバイダーのみ',
  '- [x] pnpm ci 成功',
];

const failures = [];

if (
  !prBody.includes(standardRatingGate) &&
  !prBody.includes(exceptionRatingGate)
) {
  failures.push(
    `PR本文に「${standardRatingGate}」または例外掲載承認のチェックが必要です。`,
  );
}

for (const marker of requiredMarkers) {
  if (!prBody.includes(marker)) {
    failures.push(`PR本文に「${marker}」が必要です。`);
  }
}

for (const shop of addedShops) {
  if (!prBody.includes(shop.name)) {
    failures.push(`追加店舗名「${shop.name}」をPR本文に明記してください。`);
  }
}

if (failures.length > 0) {
  console.error('Beer Atlas store-addition PR gate failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Beer Atlas PR metadata gate passed for: ${addedShops.map((shop) => shop.name).join(', ')}`,
);
