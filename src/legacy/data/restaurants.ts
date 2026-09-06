export type RestaurantArea = '古町' | '新潟駅・駅南' | '西蒲・岩室';
export type RestaurantScene =
  'ひとり・軽く' | '日常使い' | 'デート' | '記念日' | '目的地';

export type RestaurantResearch = {
  id: string;
  name: string;
  nameEn: string;
  area: RestaurantArea;
  cuisine: string;
  budget: '¥' | '¥¥' | '¥¥¥' | '¥¥¥¥';
  scenes: RestaurantScene[];
  lead: string;
  chefStory: string;
  tasteRead: string;
  urbanLens: string;
  address: string;
  longitude: number;
  latitude: number;
  officialUrl: string;
  officialLabel: string;
  researchUrl: string;
  researchLabel: string;
  sourceType: '取材記事' | '公式情報' | '審査員評';
  observedOn: string;
  visited?: boolean;
};

/**
 * 公開された取材・公式情報・審査員評を起点にした編集データです。
 * 営業日時・価格・予約条件は変わるため、訪問前に公式情報を確認してください。
 */
export const RESTAURANTS: RestaurantResearch[] = [
  {
    id: 'kozara-chuka-non',
    name: '小皿中華 non-',
    nameEn: 'KOZARA CHUKA NON',
    area: '古町',
    cuisine: '中華 / ナチュラルワイン',
    budget: '¥',
    scenes: ['ひとり・軽く', '日常使い', 'デート'],
    lead: 'ホテル中華の技術で、無化調を“物足りなさ”にしない。',
    chefStory:
      'ホテルオークラで中華料理長を経験した尾川シェフが料理を担当。全料理・調味料で化学調味料や酵母エキスを使わない方針を掲げ、古町8番町で小皿と自然派ワインを合わせます。',
    tasteRead:
      '強い調味で一口目を作るのではなく、香味・火入れ・素材の旨味が後から重なる設計。小皿だから、一人でも味のレンジを広く試せるのが強い。',
    urbanLens:
      '東京のナチュラルワイン酒場の軽快さに、ホテル中国料理の型が入る。価格ではなく“技術と気軽さの同居”が都会の人に刺さる店。',
    address: '新潟市中央区古町通8番町1503',
    longitude: 139.045135,
    latitude: 37.924313,
    officialUrl: 'https://www.instagram.com/non_kozara_chuka/',
    officialLabel: '公式Instagram',
    researchUrl: 'https://gatachira.com/local/open-close/89546/',
    researchLabel: 'ガタチラ｜開業背景と尾川シェフ',
    sourceType: '取材記事',
    observedOn: '2026-08-16',
    visited: true,
  },
  {
    id: 'kyodai-sushi',
    name: '兄弟寿し',
    nameEn: 'KYODAI SUSHI',
    area: '古町',
    cuisine: '鮨',
    budget: '¥¥¥¥',
    scenes: ['記念日', '目的地'],
    lead: '銀座の鮨と比べるのではなく、“新潟前”を食べに行く。',
    chefStory:
      '1960年創業。本間龍史料理長は県内産を徹底し、地魚を熟成などの技法で引き出します。2023年に東堀通8番町へ移転し、カウンター中心の空間へ更新しました。',
    tasteRead:
      '地物の甘さを、酸味の輪郭があるシャリで締める。南蛮エビのような新潟らしいネタだけでなく、米・水・熟成を含めた一貫全体で土地を表現する鮨。',
    urbanLens:
      '高級鮨の価格帯でも、東京の代替ではありません。江戸前の技術を土台に、魚も米も酒も新潟へ寄せ切る思想にお金を払う店です。',
    address: '新潟市中央区東堀通8番町1427-2',
    longitude: 139.046249,
    latitude: 37.924114,
    officialUrl: 'https://kyoudaizusi.com/',
    officialLabel: '公式サイト',
    researchUrl:
      'https://www.niigata-gastronomy-award.jp/award2026_inshoku/%E5%85%84%E5%BC%9F%E5%AF%BF%E3%81%97',
    researchLabel: '新潟ガストロノミーアワード｜審査員評',
    sourceType: '審査員評',
    observedOn: '2026-08-16',
  },
  {
    id: 'restaurant-iso',
    name: 'Restaurant ISO',
    nameEn: 'RESTAURANT ISO',
    area: '新潟駅・駅南',
    cuisine: '現代フランス料理',
    budget: '¥¥¥',
    scenes: ['デート', '記念日', '目的地'],
    lead: '新潟の食材を、少人数ガストロノミーの密度で組み立てる。',
    chefStory:
      '長岡市出身の磯部冬人シェフによる予約制レストラン。新潟駅万代口から徒歩圏の日本家屋で、県産ワイン・日本酒を含むペアリングにも対応します。',
    tasteRead:
      '旨味・香り・食感を別々に立ち上げ、一皿の中で立体的に合流させるタイプ。素材名を並べる地産地消ではなく、構成力で記憶に残す料理です。',
    urbanLens:
      '都心のカウンター・ガストロノミーに慣れた人が、サービスや構成の密度を落とさず新潟の季節へ切り替えられる一軒。',
    address: '新潟市中央区春日町7-13',
    longitude: 139.052979,
    latitude: 37.91235,
    officialUrl: 'https://restaurant-iso.jp/',
    officialLabel: '公式サイト',
    researchUrl:
      'https://www.niigata-gastronomy-award.jp/award2026_inshoku/restaurant-iso',
    researchLabel: '新潟ガストロノミーアワード｜審査員評',
    sourceType: '審査員評',
    observedOn: '2026-08-16',
  },
  {
    id: 'kokajiya',
    name: '灯りの食邸 KOKAJIYA',
    nameEn: 'KOKAJIYA',
    area: '西蒲・岩室',
    cuisine: 'ローカルガストロノミー',
    budget: '¥¥¥',
    scenes: ['記念日', '目的地'],
    lead: '料理だけでなく、岩室へ移動する時間までコースにする。',
    chefStory:
      '岩室温泉の国登録有形文化財・旧高島家住宅を舞台に、西蒲の農作物、ジビエ、海産物へイタリア料理の技法を取り入れます。毎朝の仕入れから日々のメニューを組み立てるコース専門店です。',
    tasteRead:
      '山・海・田んぼが近接する西蒲の食材を、保存・発酵・火入れで一本の風景にする。食後に“何を食べたか”より“どこにいたか”が残る強さがあります。',
    urbanLens:
      '都心では買えないのは、古民家風の内装ではなく風土との距離。岩室温泉と組み合わせて、半日を一つの食体験にできます。',
    address: '新潟市西蒲区岩室温泉666',
    longitude: 138.837845,
    latitude: 37.737873,
    officialUrl: 'https://kokajiya.com/',
    officialLabel: '公式サイト',
    researchUrl: 'https://kokajiya.com/',
    researchLabel: '公式｜風土・料理・文化財の考え方',
    sourceType: '公式情報',
    observedOn: '2026-08-16',
  },
  {
    id: 'armonia',
    name: '新潟“食”実験レストラン armonia',
    nameEn: 'ARMONIA',
    area: '古町',
    cuisine: 'イタリアン / 食の実験',
    budget: '¥¥',
    scenes: ['日常使い', 'デート', '目的地'],
    lead: '古民家、県産食材、工芸を“新潟っぽさ”で終わらせない。',
    chefStory:
      '真保元成シェフは都内で基礎を学び、湘南で料理長を務めた後にUターン。大正期の古民家で、食材だけでなくカトラリーや座布団まで新潟の作り手と組みます。',
    tasteRead:
      'イタリア料理を完成形として持ち込まず、和の要素や旬の食材との反応を試す料理。整いすぎない発見を、古民家の距離感で楽しめます。',
    urbanLens:
      'サステナブルやローカルを掲げる東京の店と共通言語がありつつ、生産者・工芸・古町の建物が近い。思想が借り物に見えないのが魅力。',
    address: '新潟市中央区西堀前通4番町729',
    longitude: 139.042404,
    latitude: 37.91869,
    officialUrl: 'https://armonia-niigata.com/',
    officialLabel: '公式サイト',
    researchUrl: 'https://iju.niigata.jp/voice/shinbo/',
    researchLabel: 'HAPPYターン｜真保シェフのUターン取材',
    sourceType: '取材記事',
    observedOn: '2026-08-16',
  },
  {
    id: 'bistro-marque',
    name: 'BISTRO MARQUE',
    nameEn: 'BISTRO MARQUE',
    area: '古町',
    cuisine: 'フレンチビストロ',
    budget: '¥¥',
    scenes: ['ひとり・軽く', '日常使い', 'デート'],
    lead: 'シェ・イノで磨いたクラシックを、古町の日常へ下ろす。',
    chefStory:
      '渡邉シェフはホテルや東京の名店「シェ・イノ」で研鑽。本格フレンチを食堂感覚で使えることを掲げ、鮮魚、季節野菜、蝦夷鹿などを一から手作りします。',
    tasteRead:
      'ソースと火入れの古典的な基礎があるから、奇をてらわず満足度が出る。旬の魚やジビエを、ワインと一緒に皿単位で選びたい店です。',
    urbanLens:
      '東京の老舗フレンチの技法を知る料理人が、肩肘を張らない価格と空気へ翻訳。移住後の“ちゃんとした普段使い”の候補になります。',
    address: '新潟市中央区東堀前通5番町417-1',
    longitude: 139.045395,
    latitude: 37.919434,
    officialUrl: 'https://bistromarque.com/',
    officialLabel: '公式サイト',
    researchUrl: 'https://bistromarque.com/policy/',
    researchLabel: '公式｜渡邉シェフの経歴と店の方針',
    sourceType: '公式情報',
    observedOn: '2026-08-16',
  },
  {
    id: 'kazahana',
    name: '和食酒場 風花',
    nameEn: 'KAZAHANA',
    area: '新潟駅・駅南',
    cuisine: '和食 / 酒場',
    budget: '¥',
    scenes: ['ひとり・軽く', '日常使い', 'デート'],
    lead: '新潟駅に着いた夜、地物を雑に選びたくない人へ。',
    chefStory:
      '長吉和幸さんは東京・築地の料亭で約4年修業し、帰郷後に2014年開業。新潟食材の目利きと、県内の酒を合わせる和食酒場を駅南で営みます。',
    tasteRead:
      '旬の魚介や野菜を、酒場の速度感を保ったまま和食の下処理で底上げする。朝採れ枝豆のような“単純だから差が出るもの”を頼みたい。',
    urbanLens:
      '出張者向けの郷土料理店ではなく、築地で得た目利きを新潟の仕入れに戻した店。駅近でもローカルの解像度を落とさず使えます。',
    address: '新潟市中央区米山2-7-20',
    longitude: 139.057922,
    latitude: 37.908249,
    officialUrl: 'https://www.nvcb.or.jp/feature/edamame',
    officialLabel: '新潟市公式観光ガイド掲載',
    researchUrl: 'https://gatachira.com/local/recommend/10193844/',
    researchLabel: 'ガタチラ｜長吉さんインタビュー',
    sourceType: '取材記事',
    observedOn: '2026-08-16',
  },
];
