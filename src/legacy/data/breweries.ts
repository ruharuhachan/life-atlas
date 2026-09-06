export type SakeBrewery = {
  id: string;
  name: string;
  area: string;
  beverage: '日本酒';
  founded: number;
  lead: string;
  address: string;
  longitude: number;
  latitude: number;
  visitNote: string;
  sourceUrl: string;
  sourceLabel: string;
  observedOn: string;
};

/**
 * 公式サイト・新潟県酒造組合の公開情報を起点にした初期データです。
 * 見学日時や予約条件は変わるため、訪問前に各蔵の公式情報を確認してください。
 */
export const BREWERIES: SakeBrewery[] = [
  {
    id: 'imayotsukasa',
    name: '今代司酒造',
    area: '沼垂・新潟駅東',
    beverage: '日本酒',
    founded: 1767,
    lead: '新潟駅から歩いて酒造りの現場へ。沼垂の発酵文化を、見学と試飲から読む入口。',
    address: '新潟県新潟市中央区鏡が岡1-1',
    longitude: 139.071457,
    latitude: 37.915646,
    visitNote: '酒蔵見学あり。回数・予約条件は公式案内で要確認',
    sourceUrl: 'https://imayotsukasa.co.jp/brewery/',
    sourceLabel: '公式｜酒蔵見学',
    observedOn: '2026-08-16',
  },
  {
    id: 'shiokawa',
    name: '塩川酒造',
    area: '内野',
    beverage: '日本酒',
    founded: 1912,
    lead: '砂丘地帯で濾過された地下水と、海外醸造にも向き合う実験性を同じ蔵に持つ。',
    address: '新潟県新潟市西区内野町662',
    longitude: 138.940369,
    latitude: 37.859741,
    visitNote: '見学情報あり。実施日・予約条件は公式情報で要確認',
    sourceUrl: 'https://www.niigata-sake.or.jp/kuramoto/shiokawa/',
    sourceLabel: '新潟県酒造組合｜蔵元紹介',
    observedOn: '2026-08-16',
  },
  {
    id: 'sasaiwai',
    name: '笹祝酒造',
    area: '西蒲・松野尾',
    beverage: '日本酒',
    founded: 1899,
    lead: '西蒲で日常的に愛される地酒を軸に、麹の教室や蔵見学まで地域との接点を開く。',
    address: '新潟県新潟市西蒲区松野尾3249',
    longitude: 138.872025,
    latitude: 37.797695,
    visitNote: '直売所あり。製造蔵の見学は予約案内を確認',
    sourceUrl: 'https://www.sasaiwai.com/access/',
    sourceLabel: '公式｜アクセス・見学案内',
    observedOn: '2026-08-16',
  },
  {
    id: 'takarayama',
    name: 'たからやま醸造',
    area: '西蒲・岩室',
    beverage: '日本酒',
    founded: 1885,
    lead: '岩室温泉の山側で、米の旨味と酸を食中酒へつなぐ。温泉・食・酒蔵を一つの移動で考えたい。',
    address: '新潟県新潟市西蒲区石瀬1380',
    longitude: 138.838867,
    latitude: 37.724602,
    visitNote: '通年の見学案内あり・要予約',
    sourceUrl: 'https://www.niigata-sake.or.jp/kuramoto/takarayama/',
    sourceLabel: '新潟県酒造組合｜蔵元紹介',
    observedOn: '2026-08-16',
  },
];
