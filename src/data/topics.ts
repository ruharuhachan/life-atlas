export type Topic = {
  slug: string;
  label: string;
  english: string;
  description: string;
  lead: string;
  number: string;
  color: 'lime' | 'coral' | 'sky' | 'sand' | 'violet';
  points: Array<{ title: string; description: string }>;
};

export const topics: Topic[] = [
  {
    slug: 'housing',
    label: '住まい',
    english: 'HOUSING',
    description:
      '家賃や価格だけでなく、雪、駐車場、徒歩圏、将来の売りやすさまで。',
    lead: '物件単体ではなく、毎日の動線と地域の変化を重ねて住まいを読みます。',
    number: '01',
    color: 'lime',
    points: [
      {
        title: 'マンション比較',
        description: '価格、広さ、築年、管理、駅距離を同じ軸で比較します。',
      },
      {
        title: '生活動線',
        description: 'スーパー、医療、学校、公共交通への近さを可視化します。',
      },
      {
        title: '新潟の気候',
        description: '冬の移動、駐車場、結露など、現地特有の条件を確認します。',
      },
    ],
  },
  {
    slug: 'food',
    label: '食べる',
    english: 'FOOD',
    description: '観光名物より一歩深く、日常の店と新潟らしい食文化を記録。',
    lead: '日々使える店、つくり手、酒との組み合わせから、暮らしの豊かさを捉えます。',
    number: '02',
    color: 'coral',
    points: [
      {
        title: '普段使い',
        description: '日常の買い物、惣菜、ランチを生活者の目線で整理します。',
      },
      {
        title: '新潟の一皿',
        description: '背景やつくり手まで含めて、地域の味を紹介します。',
      },
      {
        title: 'ペアリング',
        description: 'ビール・日本酒と新潟の食を、条件付きで検証します。',
      },
    ],
  },
  {
    slug: 'work',
    label: '働く',
    english: 'WORK',
    description: '産業、通勤、リモート環境から、移住後の働き方を考える。',
    lead: '求人だけでは見えない産業の厚みと、東京との距離を現地から読み解きます。',
    number: '03',
    color: 'sky',
    points: [
      {
        title: '地域産業',
        description: '港、製造、食、観光、ITなど主要産業の集積を見ます。',
      },
      {
        title: '通勤と出張',
        description: '市内移動と新幹線・空港アクセスを実時間で考えます。',
      },
      {
        title: '複業と事業',
        description: 'リモートワーク、副業、地域事業の始め方を整理します。',
      },
    ],
  },
  {
    slug: 'support',
    label: '支援制度',
    english: 'SUPPORT',
    description: '移住支援金、住宅、子育て。条件と期限を公式情報から確認。',
    lead: '使えるかもしれない制度を、対象条件・必要書類・申請時期に分けて整理します。',
    number: '04',
    color: 'sand',
    points: [
      {
        title: '対象条件',
        description: '居住地、就業、世帯などの要件を一つずつ確認します。',
      },
      {
        title: '申請時期',
        description: '移住前に必要な準備と、移住後の期限を時系列で示します。',
      },
      {
        title: '一次情報',
        description: '自治体の公式ページと確認日を必ず表示します。',
      },
    ],
  },
  {
    slug: 'run',
    label: '走る',
    english: 'RUN',
    description:
      'ランニングで街を読む。景色、路面、距離、立ち寄り先を一つの地図に。',
    lead: '観光ルートではなく、実際に走って見つけた新潟の生活圏と産業を記録します。',
    number: '05',
    color: 'violet',
    points: [
      {
        title: 'コース',
        description: '距離、信号、路面、夜間の明るさを含めて紹介します。',
      },
      {
        title: '街の観察',
        description: '港、商業、行政、住宅地を走りながら読み解きます。',
      },
      {
        title: '季節',
        description: '暑さ、風、雨、冬季の安全性を記録します。',
      },
    ],
  },
];
