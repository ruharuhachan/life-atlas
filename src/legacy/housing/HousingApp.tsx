'use client';

import { sitePath } from '../site-path';
import {
  type ChangeEvent,
  type SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import HousingScatter from '../components/HousingScatter';
import {
  PUBLIC_LISTINGS,
  unitPrice as publicUnitPrice,
} from '../data/public-listings';

type Property = {
  id: string;
  selected: boolean;
  name: string;
  condition: string;
  price: number;
  area: number;
  layout: string;
  stationMinutes: number;
  built: string;
  floor: number;
  totalFloors: number;
  direction: string;
  managementFee: number;
  reserveFund: number;
  otherMonthly: number;
  parkingMonthly: number | null;
  parkingNote: string;
  units: number;
  address: string;
  structure: string;
  assetScore: number;
  redevelopment: string;
  features: string[];
  warnings: string[];
  notes: string;
  sourceUrl: string;
  sourceUpdated: string;
};

type WeightKey =
  'purchase' | 'access' | 'newness' | 'monthly' | 'space' | 'asset';
type Weights = Record<WeightKey, number>;
type LoanSettings = {
  interest: number;
  years: number;
  downPayment: number;
  includeParking: boolean;
};

const STORAGE_KEY = 'niigata-mansion-lab:v1';
const SEED_VERSION = 2;
const MIGRATION_PROPERTY_IDS = new Set([
  'the-premier-niigata-bandai-bridge-6500',
]);

const DEFAULT_PROPERTIES: Property[] = [
  {
    id: 'city-tower-niigata-3970',
    selected: true,
    name: 'シティタワー新潟',
    condition: '中古・角住戸',
    price: 3970,
    area: 79.65,
    layout: '3LDK',
    stationMinutes: 5,
    built: '2010-02',
    floor: 6,
    totalFloors: 31,
    direction: '北',
    managementFee: 15460,
    reserveFund: 21410,
    otherMonthly: 929,
    parkingMonthly: 16000,
    parkingNote: '敷地内・空き要確認',
    units: 237,
    address: '新潟県新潟市中央区天神1丁目',
    structure: 'RC・地上31階／地下1階',
    assetScore: 4,
    redevelopment: '駅南再整備の近接既存タワー',
    features: ['角住戸', 'LDK約17帖', '床暖房', 'ペット相談', '駅とデッキ接続'],
    warnings: [
      '契約不適合責任・設備修復義務は免責',
      '修繕積立基金の徴収予定あり',
      '管理費等は2025年9月時点の記載',
    ],
    notes:
      '2025年12月頃にエアコン2台・給湯器交換、ハウスクリーニング実施との掲載。賃貸と売買を同時募集。',
    sourceUrl:
      'https://suumo.jp/ms/chuko/niigata/sc_niigatashichuo/nc_21415553/',
    sourceUpdated: '2026-08-09',
  },
  {
    id: 'iconic-tower-niigata-4990',
    selected: true,
    name: 'アイコニックタワー新潟ステーション',
    condition: '築後未入居・角住戸',
    price: 4990,
    area: 80.75,
    layout: '3LDK',
    stationMinutes: 4,
    built: '2025-06',
    floor: 3,
    totalFloors: 30,
    direction: '北',
    managementFee: 24100,
    reserveFund: 6930,
    otherMonthly: 0,
    parkingMonthly: null,
    parkingNote: '隣接自走式駐車場・空き／料金要確認',
    units: 218,
    address: '新潟県新潟市中央区花園1丁目',
    structure: 'RC・免震・地上30階（計画資料は32階表記）',
    assetScore: 5,
    redevelopment: '都市再生特別地区の住宅棟そのもの',
    features: [
      '免震',
      '築後未入居',
      '食器洗乾燥機',
      '各階ゴミ庫',
      'ペット相談',
    ],
    warnings: [
      '修繕積立金の値上げ予定あり',
      '修繕積立一時金の徴収予定あり',
      '3階・北向き。眺望と日照は現地確認',
      '駐車場の空き・契約条件は要確認',
    ],
    notes:
      '新潟駅南口西地区の複合開発で生まれた住宅棟。2025年6月竣工、即引渡可との掲載。',
    sourceUrl:
      'https://suumo.jp/ms/chuko/niigata/sc_niigatashichuo/nc_78980771/',
    sourceUpdated: '2026-08-15',
  },
  {
    id: 'the-premier-niigata-bandai-bridge-6500',
    selected: true,
    name: 'ザ・プレミア新潟萬代橋',
    condition: '中古・角住戸・2面バルコニー',
    price: 6500,
    area: 88.33,
    layout: '2LDK',
    stationMinutes: 11,
    built: '2017-11',
    floor: 8,
    totalFloors: 14,
    direction: '北西',
    managementFee: 13200,
    reserveFund: 13200,
    otherMonthly: 0,
    parkingMonthly: 1500,
    parkingNote:
      '1階専用ガレージは任意購入。別途、管理費1,000円＋修繕積立金500円／月。購入価格・条件は要確認',
    units: 134,
    address: '新潟県新潟市中央区万代2丁目',
    structure: 'RC・地上14階',
    assetScore: 4,
    redevelopment:
      '万代商業エリアとやすらぎ堤に近い、萬代橋・信濃川沿いの都心居住',
    features: [
      '萬代橋・信濃川眺望',
      '角住戸',
      '2面バルコニー',
      '内廊下',
      '床暖房',
    ],
    warnings: [
      '専用ガレージは任意購入。購入価格・権利・利用条件を別途確認',
      '北西向き。日照・川風・冬季の体感を現地確認',
      '信濃川近接のため、洪水・津波・液状化ハザードと避難動線を確認',
      '管理費・修繕積立金は各13,200円／月。長期修繕計画と改定予定を確認',
    ],
    notes:
      '17.4帖のLDK、12.6帖・8帖の洋室、27.69㎡の2面バルコニー。萬代橋と信濃川を望む北西角住戸として掲載。SUUMO情報提供日は2026年8月11日。',
    sourceUrl:
      'https://suumo.jp/ms/chuko/niigata/sc_niigatashichuo/nc_20418061/',
    sourceUpdated: '2026-08-16',
  },
];

const DEFAULT_WEIGHTS: Weights = {
  purchase: 30,
  access: 15,
  newness: 15,
  monthly: 15,
  space: 10,
  asset: 15,
};

const DEFAULT_LOAN: LoanSettings = {
  interest: 1.0,
  years: 35,
  downPayment: 0,
  includeParking: false,
};

const WEIGHT_META: Record<WeightKey, { label: string; hint: string }> = {
  purchase: { label: '購入価格', hint: '価格と㎡単価' },
  access: { label: '駅距離', hint: '徒歩分数' },
  newness: { label: '築年', hint: '築浅を評価' },
  monthly: { label: '固定費', hint: '管理＋修繕等' },
  space: { label: '広さ', hint: '専有面積' },
  asset: { label: '資産性', hint: '再開発等の手動評価' },
};

const emptyProperty = (): Property => ({
  id: `property-${Date.now()}`,
  selected: true,
  name: '',
  condition: '中古',
  price: 0,
  area: 0,
  layout: '',
  stationMinutes: 0,
  built: '',
  floor: 0,
  totalFloors: 0,
  direction: '',
  managementFee: 0,
  reserveFund: 0,
  otherMonthly: 0,
  parkingMonthly: null,
  parkingNote: '要確認',
  units: 0,
  address: '',
  structure: '',
  assetScore: 3,
  redevelopment: '',
  features: [],
  warnings: [],
  notes: '',
  sourceUrl: '',
  sourceUpdated: new Date().toISOString().slice(0, 10),
});

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));
const yen = (value: number) => `${Math.round(value).toLocaleString('ja-JP')}円`;
const manYen = (value: number) => `${value.toLocaleString('ja-JP')}万円`;
const decimal = (value: number, digits = 1) =>
  value.toLocaleString('ja-JP', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
const unitPrice = (property: Property) =>
  property.area > 0 ? property.price / property.area : 0;
const tsuboPrice = (property: Property) => unitPrice(property) * 3.305785;
const fixedMonthly = (property: Property) =>
  property.managementFee + property.reserveFund + property.otherMonthly;

function ageInYears(built: string) {
  if (!built) return 50;
  const [year, month] = built.split('-').map(Number);
  const now = new Date('2026-08-15T00:00:00+09:00');
  return Math.max(
    0,
    now.getFullYear() - year + (now.getMonth() + 1 - (month || 1)) / 12,
  );
}

function builtLabel(built: string) {
  if (!built) return '要確認';
  const [year, month] = built.split('-');
  const age = ageInYears(built);
  return `${year}年${Number(month || 1)}月（築${age < 1 ? '1年未満' : `${Math.floor(age)}年`}）`;
}

function mortgageMonthly(property: Property, loan: LoanSettings) {
  const principal = Math.max(0, (property.price - loan.downPayment) * 10000);
  const months = Math.max(1, loan.years * 12);
  const rate = loan.interest / 100 / 12;
  if (rate === 0) return principal / months;
  const factor = Math.pow(1 + rate, months);
  return (principal * rate * factor) / (factor - 1);
}

function monthlyTotal(property: Property, loan: LoanSettings) {
  const parking =
    loan.includeParking && property.parkingMonthly
      ? property.parkingMonthly
      : 0;
  return mortgageMonthly(property, loan) + fixedMonthly(property) + parking;
}

function scoreParts(property: Property): Record<WeightKey, number> {
  const priceScore = clamp(110 - property.price / 70);
  const sqmScore = clamp(120 - unitPrice(property));
  return {
    purchase: (priceScore + sqmScore) / 2,
    access: clamp(100 - Math.max(0, property.stationMinutes - 1) * 8),
    newness: clamp(100 - ageInYears(property.built) * 2.5),
    monthly: clamp(100 - fixedMonthly(property) / 700),
    space: clamp((property.area / 90) * 100),
    asset: clamp(property.assetScore * 20),
  };
}

function totalScore(property: Property, weights: Weights) {
  const parts = scoreParts(property);
  const entries = Object.entries(weights) as [WeightKey, number][];
  const totalWeight = entries.reduce((sum, [, value]) => sum + value, 0) || 1;
  return (
    entries.reduce((sum, [key, value]) => sum + parts[key] * value, 0) /
    totalWeight
  );
}

function safeDateLabel(value: string) {
  if (!value) return '未確認';
  return value.replaceAll('-', '.');
}

export default function HousingPage() {
  const [properties, setProperties] = useState<Property[]>(DEFAULT_PROPERTIES);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [loan, setLoan] = useState<LoanSettings>(DEFAULT_LOAN);
  const [hydrated, setHydrated] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Property>(emptyProperty());
  const [sort, setSort] = useState<
    'score' | 'price' | 'unit' | 'monthly' | 'station'
  >('score');
  const [toast, setToast] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (Array.isArray(saved.properties)) {
            const savedIds = new Set(
              saved.properties.map((property: Property) => property.id),
            );
            const migrations =
              Number(saved.seedVersion ?? 1) < SEED_VERSION
                ? DEFAULT_PROPERTIES.filter(
                    (property) =>
                      MIGRATION_PROPERTY_IDS.has(property.id) &&
                      !savedIds.has(property.id),
                  )
                : [];
            setProperties([...saved.properties, ...migrations]);
          }
          if (saved.weights)
            setWeights({ ...DEFAULT_WEIGHTS, ...saved.weights });
          if (saved.loan) setLoan({ ...DEFAULT_LOAN, ...saved.loan });
        }
      } catch {
        // A malformed local backup should not block the seeded comparison.
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ seedVersion: SEED_VERSION, properties, weights, loan }),
    );
  }, [properties, weights, loan, hydrated]);

  const selected = useMemo(
    () => properties.filter((property) => property.selected),
    [properties],
  );
  const ranked = useMemo(() => {
    return [...selected].sort((a, b) => {
      if (sort === 'price') return a.price - b.price;
      if (sort === 'unit') return unitPrice(a) - unitPrice(b);
      if (sort === 'monthly')
        return monthlyTotal(a, loan) - monthlyTotal(b, loan);
      if (sort === 'station') return a.stationMinutes - b.stationMinutes;
      return totalScore(b, weights) - totalScore(a, weights);
    });
  }, [selected, sort, weights, loan]);

  const cheapest = selected.length
    ? [...selected].sort((a, b) => a.price - b.price)[0]
    : null;
  const newest = selected.length
    ? [...selected].sort((a, b) => b.built.localeCompare(a.built))[0]
    : null;
  const lowestFixed = selected.length
    ? [...selected].sort((a, b) => fixedMonthly(a) - fixedMonthly(b))[0]
    : null;
  const topScore = ranked[0] ?? null;

  const pairInsight = useMemo(() => {
    if (selected.length < 2) return null;
    const [a, b] = selected;
    const lower = a.price <= b.price ? a : b;
    const higher = lower.id === a.id ? b : a;
    return {
      lower,
      higher,
      priceGap: higher.price - lower.price,
      areaGap: Math.abs(higher.area - lower.area),
      unitPremium:
        unitPrice(lower) > 0
          ? (unitPrice(higher) / unitPrice(lower) - 1) * 100
          : 0,
    };
  }, [selected]);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyProperty());
    setEditorOpen(true);
  }

  function openEdit(property: Property) {
    setEditingId(property.id);
    setForm({
      ...property,
      features: [...property.features],
      warnings: [...property.warnings],
    });
    setEditorOpen(true);
  }

  function updateForm<K extends keyof Property>(key: K, value: Property[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function saveProperty(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || form.price <= 0 || form.area <= 0) {
      flash('物件名・価格・専有面積を入力してください');
      return;
    }
    if (editingId) {
      setProperties((current) =>
        current.map((property) =>
          property.id === editingId ? form : property,
        ),
      );
      flash('候補を更新しました');
    } else {
      setProperties((current) => [
        ...current,
        { ...form, id: `property-${Date.now()}` },
      ]);
      flash('候補を追加しました');
    }
    setEditorOpen(false);
  }

  function removeProperty(property: Property) {
    if (!window.confirm(`「${property.name}」を候補から削除しますか？`)) return;
    setProperties((current) =>
      current.filter((item) => item.id !== property.id),
    );
    flash('候補を削除しました');
  }

  function toggleSelected(id: string) {
    setProperties((current) =>
      current.map((property) =>
        property.id === id
          ? { ...property, selected: !property.selected }
          : property,
      ),
    );
  }

  function exportData() {
    const payload = JSON.stringify(
      {
        version: 2,
        seedVersion: SEED_VERSION,
        exportedAt: new Date().toISOString(),
        properties,
        weights,
        loan,
      },
      null,
      2,
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `niigata-mansion-comparison-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    flash('バックアップを書き出しました');
  }

  function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result));
        const imported = Array.isArray(payload) ? payload : payload.properties;
        if (
          !Array.isArray(imported) ||
          !imported.every((item) => item.name && typeof item.price === 'number')
        )
          throw new Error('invalid');
        setProperties(
          imported.map((item) => ({
            ...emptyProperty(),
            ...item,
            id: item.id || `property-${Date.now()}-${Math.random()}`,
          })),
        );
        if (payload.weights)
          setWeights({ ...DEFAULT_WEIGHTS, ...payload.weights });
        if (payload.loan) setLoan({ ...DEFAULT_LOAN, ...payload.loan });
        flash('バックアップを読み込みました');
      } catch {
        flash('読み込めないファイルです');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  }

  function resetData() {
    if (
      !window.confirm(
        `追加・編集した内容を消して、初期状態（${DEFAULT_PROPERTIES.length}物件）に戻しますか？`,
      )
    )
      return;
    setProperties(DEFAULT_PROPERTIES);
    setWeights(DEFAULT_WEIGHTS);
    setLoan(DEFAULT_LOAN);
    flash('初期データに戻しました');
  }

  const tableRows: Array<{
    label: string;
    sub?: string;
    value: (property: Property) => React.ReactNode;
    numeric?: (property: Property) => number;
    best?: 'low' | 'high';
  }> = [
    {
      label: '販売価格',
      value: (p) => manYen(p.price),
      numeric: (p) => p.price,
      best: 'low',
    },
    {
      label: '㎡単価',
      sub: '販売価格÷専有面積',
      value: (p) => `${decimal(unitPrice(p), 1)}万円/㎡`,
      numeric: unitPrice,
      best: 'low',
    },
    {
      label: '坪単価',
      value: (p) => `${decimal(tsuboPrice(p), 1)}万円/坪`,
      numeric: tsuboPrice,
      best: 'low',
    },
    {
      label: '専有面積',
      value: (p) => `${decimal(p.area, 2)}㎡`,
      numeric: (p) => p.area,
      best: 'high',
    },
    { label: '間取り', value: (p) => p.layout || '要確認' },
    {
      label: '管理費',
      sub: '月額',
      value: (p) => yen(p.managementFee),
      numeric: (p) => p.managementFee,
      best: 'low',
    },
    {
      label: '修繕積立金',
      sub: '月額・将来改定に注意',
      value: (p) => yen(p.reserveFund),
      numeric: (p) => p.reserveFund,
      best: 'low',
    },
    {
      label: '固定費合計',
      sub: '管理＋修繕＋その他',
      value: (p) => yen(fixedMonthly(p)),
      numeric: fixedMonthly,
      best: 'low',
    },
    {
      label: 'ローン込み月額',
      sub: `金利${loan.interest}%・${loan.years}年${loan.includeParking ? '・駐車場込' : ''}`,
      value: (p) => `約${yen(monthlyTotal(p, loan))}`,
      numeric: (p) => monthlyTotal(p, loan),
      best: 'low',
    },
    {
      label: '新潟駅',
      value: (p) => `徒歩${p.stationMinutes}分`,
      numeric: (p) => p.stationMinutes,
      best: 'low',
    },
    {
      label: '築年月',
      value: (p) => builtLabel(p.built),
      numeric: (p) => ageInYears(p.built),
      best: 'low',
    },
    {
      label: '所在階',
      value: (p) => `${p.floor}階 / ${p.totalFloors}階`,
      numeric: (p) => p.floor,
      best: 'high',
    },
    { label: '向き', value: (p) => p.direction || '要確認' },
    { label: '構造', value: (p) => p.structure || '要確認' },
    { label: '総戸数', value: (p) => (p.units ? `${p.units}戸` : '要確認') },
    {
      label: '駐車場',
      value: (p) => (
        <>
          <span>
            {p.parkingMonthly ? `${yen(p.parkingMonthly)}/月` : '料金要確認'}
          </span>
          <small>{p.parkingNote}</small>
        </>
      ),
    },
    { label: '再開発との関係', value: (p) => p.redevelopment || '未評価' },
    {
      label: '主な注意点',
      value: (p) => (
        <ul className="table-warnings">
          {p.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className="housing-page">
      <nav className="tool-tabs" aria-label="比較ページ内の移動">
        <a href="#database">観測データ</a>
        <a href="#compare">候補を比較</a>
        <a href="#payment">月額試算</a>
        <a href="#redevelopment">再開発</a>
        <button onClick={openAdd}>＋ 候補を追加</button>
      </nav>

      <section className="database-hero" id="database">
        <div className="database-heading">
          <div>
            <p className="database-breadcrumb">
              <a href={sitePath('/')}>新潟トップ</a>
              <span>/</span>住まい公開DB
            </p>
            <div className="eyebrow">
              <span>OPEN HOUSING OBSERVATORY</span>
              <b>NIIGATA CITY</b>
            </div>
            <h2>
              観測した価格から、
              <br />
              街の相場を知る。
            </h2>
          </div>
          <div className="database-intro">
            <p>
              新潟市内の新築・未入居・中古マンションを、公開ページ確認時点のスナップショットとして記録。価格と広さの関係を見ながら、内見前の比較軸をつくります。
            </p>
            <div>
              <b>{String(PUBLIC_LISTINGS.length).padStart(2, '0')}</b>
              <span>
                OBSERVATIONS
                <br />
                <small>掲載終了を含む観測ログ</small>
              </span>
            </div>
          </div>
        </div>

        <HousingScatter listings={PUBLIC_LISTINGS} />

        <div className="database-table-shell">
          <div className="database-table-head">
            <div>
              <p className="kicker">OBSERVATION LOG</p>
              <h2>公開データ一覧</h2>
            </div>
            <p>
              価格・販売状況は変動します。各行の「掲載元」から最新情報を確認してください。
            </p>
          </div>
          <div className="database-table-scroll">
            <table className="database-table">
              <thead>
                <tr>
                  <th>物件 / エリア</th>
                  <th>観測価格</th>
                  <th>面積 / 間取り</th>
                  <th>㎡単価</th>
                  <th>最寄駅</th>
                  <th>築年</th>
                  <th>観測日 / 出典</th>
                </tr>
              </thead>
              <tbody>
                {PUBLIC_LISTINGS.map((listing) => (
                  <tr key={listing.id} id={'listing-' + listing.id}>
                    <th>
                      <b>{listing.name}</b>
                      <small>
                        {listing.listingType}・{listing.neighborhood}
                      </small>
                    </th>
                    <td>
                      <strong>{listing.price.toLocaleString('ja-JP')}</strong>
                      万円
                    </td>
                    <td>
                      {listing.area}㎡<small>{listing.layout}</small>
                    </td>
                    <td>{publicUnitPrice(listing).toFixed(1)}万円</td>
                    <td>
                      {listing.station}駅
                      <small>徒歩{listing.stationMinutes}分</small>
                    </td>
                    <td>{listing.builtYear}年</td>
                    <td>
                      <time dateTime={listing.observedOn}>
                        {listing.observedOn.replaceAll('-', '.')}
                      </time>
                      <a
                        href={listing.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        掲載元 ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="database-disclaimer">
            このデータベースは不動産在庫を網羅するものではなく、公開ページを確認した時点の観測記録です。新築には完成後未入居を含み、同一建物の別住戸も含みます。価格、面積、駅距離等は掲載元表記を整理しています。地図座標は住所の代表点で、売買の勧誘・仲介を目的としません。
          </p>
        </div>
      </section>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow">
            <span>MY SHORTLIST / HOME DECISION</span>
            <b>LOCAL ONLY</b>
          </div>
          <h2>自分の候補を、比較する。</h2>
          <p>
            価格、毎月負担、築年、駅距離、そして再開発。候補を増やしながら、購入判断を同じ物差しで更新できるマンション比較表です。
          </p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={openAdd}>
              候補マンションを追加
            </button>
            <a className="button button-ghost" href="#redevelopment">
              再開発の見方
            </a>
          </div>
          <div className="local-note">
            <span className="pulse" /> 入力内容はこのブラウザに自動保存
          </div>
        </div>

        <div className="hero-ledger" aria-label="現在の比較概要">
          <div className="ledger-top">
            <span>ACTIVE SHORTLIST</span>
            <strong>{selected.length.toString().padStart(2, '0')}</strong>
          </div>
          {selected.slice(0, 3).map((property, index) => (
            <div className="ledger-row" key={property.id}>
              <span className="ledger-index">0{index + 1}</span>
              <div>
                <b>{property.name}</b>
                <small>
                  {property.floor}階・{property.layout}・
                  {decimal(property.area, 2)}㎡
                </small>
              </div>
              <strong>
                {property.price.toLocaleString('ja-JP')}
                <small>万円</small>
              </strong>
            </div>
          ))}
          {selected.length === 0 && (
            <p className="ledger-empty">比較対象を選んでください</p>
          )}
          <div className="ledger-foot">
            候補はいつでも追加・編集・除外できます
          </div>
        </div>
      </section>

      <section className="content-section first-section" id="compare">
        <div className="section-heading">
          <div>
            <span className="section-number">01</span>
            <p className="kicker">DECISION SNAPSHOT</p>
            <h2>まず、差が出るところだけ。</h2>
          </div>
          <div className="section-tools">
            <label className="select-label">
              並び順
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as typeof sort)}
              >
                <option value="score">参考スコア</option>
                <option value="price">販売価格</option>
                <option value="unit">㎡単価</option>
                <option value="monthly">月額試算</option>
                <option value="station">駅徒歩</option>
              </select>
            </label>
          </div>
        </div>

        <div className="signal-grid">
          <article className="signal-card accent-teal">
            <span>価格を抑える</span>
            <b>{cheapest?.name ?? '—'}</b>
            <strong>{cheapest ? manYen(cheapest.price) : '—'}</strong>
            <small>
              {cheapest
                ? `${decimal(unitPrice(cheapest), 1)}万円/㎡`
                : '比較対象なし'}
            </small>
          </article>
          <article className="signal-card accent-gold">
            <span>築浅を取る</span>
            <b>{newest?.name ?? '—'}</b>
            <strong>
              {newest ? newest.built.slice(0, 4) : '—'}
              <i>年</i>
            </strong>
            <small>{newest ? newest.condition : '比較対象なし'}</small>
          </article>
          <article className="signal-card accent-coral">
            <span>現在の固定費が低い</span>
            <b>{lowestFixed?.name ?? '—'}</b>
            <strong>
              {lowestFixed ? yen(fixedMonthly(lowestFixed)) : '—'}
              <i>/月</i>
            </strong>
            <small>将来改定は別途確認</small>
          </article>
          <article className="signal-card accent-ink">
            <span>重みづけ後の首位</span>
            <b>{topScore?.name ?? '—'}</b>
            <strong>
              {topScore ? decimal(totalScore(topScore, weights), 0) : '—'}
              <i>/100</i>
            </strong>
            <small>下の評価軸で調整可能</small>
          </article>
        </div>

        {pairInsight && (
          <div className="decision-callout">
            <div className="callout-label">今回の核心</div>
            <p>
              <b>{pairInsight.higher.name}</b>は<b>{pairInsight.lower.name}</b>
              より<span>{manYen(pairInsight.priceGap)}</span>
              高い一方、専有面積差は
              <span>{decimal(pairInsight.areaGap, 2)}㎡</span>。㎡単価は約
              <span>{decimal(pairInsight.unitPremium, 0)}%</span>
              高く、差額の中心は「広さ」ではなく、築浅・免震・複合再開発へのプレミアムです。
            </p>
          </div>
        )}

        <div className="property-card-grid">
          {ranked.map((property, index) => (
            <article className="property-card" key={property.id}>
              <div className="property-rank">
                #{String(index + 1).padStart(2, '0')}
              </div>
              <div className="property-card-head">
                <div>
                  <span>{property.condition}</span>
                  <h3>{property.name}</h3>
                  <p>{property.address}</p>
                </div>
                <div
                  className="score-ring"
                  style={
                    {
                      '--score': `${totalScore(property, weights) * 3.6}deg`,
                    } as React.CSSProperties
                  }
                >
                  <div>
                    <strong>{decimal(totalScore(property, weights), 0)}</strong>
                    <small>SCORE</small>
                  </div>
                </div>
              </div>
              <div className="price-line">
                <strong>{property.price.toLocaleString('ja-JP')}</strong>
                <span>万円</span>
                <small>{decimal(unitPrice(property), 1)}万円/㎡</small>
              </div>
              <div className="property-facts">
                <div>
                  <small>PLAN / AREA</small>
                  <b>
                    {property.layout}・{decimal(property.area, 2)}㎡
                  </b>
                </div>
                <div>
                  <small>FLOOR</small>
                  <b>
                    {property.floor}F / {property.totalFloors}F・
                    {property.direction}
                  </b>
                </div>
                <div>
                  <small>STATION</small>
                  <b>新潟駅 徒歩{property.stationMinutes}分</b>
                </div>
                <div>
                  <small>MONTHLY FIXED</small>
                  <b>{yen(fixedMonthly(property))}</b>
                </div>
              </div>
              <div className="tag-row">
                {property.features.slice(0, 5).map((feature) => (
                  <span key={feature}>{feature}</span>
                ))}
              </div>
              <div className="risk-box">
                <b>確認ポイント</b>
                <p>
                  {property.warnings[0] ?? '重要事項説明書と管理資料を確認'}
                </p>
              </div>
              <div className="property-actions">
                <a href={property.sourceUrl} target="_blank" rel="noreferrer">
                  掲載元 ↗
                </a>
                <span>更新 {safeDateLabel(property.sourceUpdated)}</span>
                <button onClick={() => openEdit(property)}>編集</button>
              </div>
            </article>
          ))}
        </div>

        <div className="weight-panel">
          <div className="weight-intro">
            <p className="kicker">WEIGHTED VIEW</p>
            <h3>何を重く見るか、動かしてみる。</h3>
            <p>
              スコアは結論ではなく、優先順位を可視化する補助線です。バーを動かすとランキングが即時に変わります。
            </p>
          </div>
          <div className="weight-controls">
            {(Object.keys(weights) as WeightKey[]).map((key) => (
              <label className="weight-control" key={key}>
                <span>
                  <b>{WEIGHT_META[key].label}</b>
                  <small>{WEIGHT_META[key].hint}</small>
                  <strong>{weights[key]}</strong>
                </span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={weights[key]}
                  onChange={(event) =>
                    setWeights((current) => ({
                      ...current,
                      [key]: Number(event.target.value),
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </div>

        <div className="comparison-shell">
          <div className="comparison-title">
            <div>
              <p className="kicker">FULL COMPARISON</p>
              <h3>横並びの比較表</h3>
            </div>
            <small>緑は現在の比較対象内で有利な数値</small>
          </div>
          {selected.length ? (
            <div className="table-scroll">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>比較項目</th>
                    {selected.map((property) => (
                      <th key={property.id}>
                        <span>{property.condition}</span>
                        {property.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => {
                    const values = row.numeric ? selected.map(row.numeric) : [];
                    const bestValue = values.length
                      ? row.best === 'high'
                        ? Math.max(...values)
                        : Math.min(...values)
                      : null;
                    return (
                      <tr key={row.label}>
                        <th>
                          <b>{row.label}</b>
                          {row.sub && <small>{row.sub}</small>}
                        </th>
                        {selected.map((property) => {
                          const isBest =
                            row.numeric &&
                            values.length > 1 &&
                            row.numeric(property) === bestValue;
                          return (
                            <td
                              className={isBest ? 'best-cell' : ''}
                              key={property.id}
                            >
                              {row.value(property)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <b>比較対象がありません</b>
              <p>下の候補管理で、比較したい物件を選んでください。</p>
            </div>
          )}
        </div>
      </section>

      <section className="content-section payment-section" id="payment">
        <div className="section-heading light-heading">
          <div>
            <span className="section-number">02</span>
            <p className="kicker">CASH FLOW</p>
            <h2>買った後の月額まで見る。</h2>
          </div>
          <p className="heading-note">
            元利均等返済の概算。諸費用、固定資産税、保険、金利変動は含みません。
          </p>
        </div>
        <div className="payment-layout">
          <div className="loan-settings">
            <label>
              <span>
                想定金利 <b>{loan.interest}%</b>
              </span>
              <input
                type="range"
                min="0"
                max="4"
                step="0.1"
                value={loan.interest}
                onChange={(event) =>
                  setLoan((current) => ({
                    ...current,
                    interest: Number(event.target.value),
                  }))
                }
              />
            </label>
            <label>
              <span>
                返済期間 <b>{loan.years}年</b>
              </span>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={loan.years}
                onChange={(event) =>
                  setLoan((current) => ({
                    ...current,
                    years: Number(event.target.value),
                  }))
                }
              />
            </label>
            <label className="number-setting">
              <span>頭金</span>
              <div>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={loan.downPayment}
                  onChange={(event) =>
                    setLoan((current) => ({
                      ...current,
                      downPayment: Number(event.target.value),
                    }))
                  }
                />
                <b>万円</b>
              </div>
            </label>
            <label className="switch-setting">
              <input
                type="checkbox"
                checked={loan.includeParking}
                onChange={(event) =>
                  setLoan((current) => ({
                    ...current,
                    includeParking: event.target.checked,
                  }))
                }
              />
              <span aria-hidden="true" />
              <b>駐車場代を含める</b>
            </label>
          </div>
          <div className="payment-cards">
            {selected.map((property) => {
              const mortgage = mortgageMonthly(property, loan);
              const parking =
                loan.includeParking && property.parkingMonthly
                  ? property.parkingMonthly
                  : 0;
              const total = mortgage + fixedMonthly(property) + parking;
              return (
                <article key={property.id}>
                  <div className="payment-card-title">
                    <span>{property.name}</span>
                    <b>概算 月額</b>
                  </div>
                  <strong>約 {yen(total)}</strong>
                  <div className="payment-stack" aria-label="月額内訳">
                    <span style={{ width: `${(mortgage / total) * 100}%` }} />
                    <span
                      style={{
                        width: `${(fixedMonthly(property) / total) * 100}%`,
                      }}
                    />
                    <span style={{ width: `${(parking / total) * 100}%` }} />
                  </div>
                  <dl>
                    <div>
                      <dt>
                        <i className="dot mortgage-dot" />
                        ローン
                      </dt>
                      <dd>{yen(mortgage)}</dd>
                    </div>
                    <div>
                      <dt>
                        <i className="dot fixed-dot" />
                        管理・修繕等
                      </dt>
                      <dd>{yen(fixedMonthly(property))}</dd>
                    </div>
                    {loan.includeParking && (
                      <div>
                        <dt>
                          <i className="dot parking-dot" />
                          駐車場
                        </dt>
                        <dd>
                          {property.parkingMonthly
                            ? yen(property.parkingMonthly)
                            : '要確認・未算入'}
                        </dd>
                      </div>
                    )}
                  </dl>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="content-section redevelopment-section"
        id="redevelopment"
      >
        <div className="section-heading">
          <div>
            <span className="section-number">03</span>
            <p className="kicker">URBAN REGENERATION</p>
            <h2>「新潟駅南口西地区」の正体。</h2>
          </div>
          <div className="status-chip">
            <i /> 2026年2月 全体工事完了
          </div>
        </div>

        <div className="redevelopment-lead">
          <div>
            <p className="large-lead">
              これは将来の再開発予定ではなく、
              <em>アイコニックタワーを含む完成済みの複合開発</em>です。
            </p>
            <p>
              新潟市で初めて都市再生特別地区の適用を受け、従来400%だった容積率を600%へ緩和。低未利用地を住宅・オフィス・学校・駐車場へ高度利用した約0.8haの事業です。
            </p>
          </div>
          <div className="project-stats">
            <div>
              <strong>0.8</strong>
              <span>
                ha
                <br />
                地区面積
              </span>
            </div>
            <div>
              <strong>600</strong>
              <span>
                %<br />
                容積率
              </span>
            </div>
            <div>
              <strong>3</strong>
              <span>
                棟<br />
                複合開発
              </span>
            </div>
          </div>
        </div>

        <div className="timeline" aria-label="新潟駅南口西地区の事業経緯">
          <div>
            <span>2022.05</span>
            <b>都市計画決定</b>
            <small>市内初の都市再生特別地区</small>
          </div>
          <div>
            <span>2025.06</span>
            <b>住宅棟竣工</b>
            <small>アイコニックタワー</small>
          </div>
          <div>
            <span>2025.08</span>
            <b>駐車場棟竣工</b>
            <small>自走式・約500台規模</small>
          </div>
          <div className="timeline-current">
            <span>2026.02</span>
            <b>全体工事完了</b>
            <small>オフィス・学校棟を含む</small>
          </div>
        </div>

        <div className="meaning-grid">
          <article className="meaning-card positive">
            <span>＋</span>
            <h3>購入判断への追い風</h3>
            <ul>
              <li>駅前ランドマークとしての認知</li>
              <li>オフィス・学校・公開空地による日常人口</li>
              <li>駅周辺の回遊性と拠点性の向上</li>
              <li>免震・築浅という明確な商品力</li>
            </ul>
          </article>
          <article className="meaning-card caution">
            <span>!</span>
            <h3>価格に織り込み済みか</h3>
            <ul>
              <li>再開発メリットは販売価格に反映されやすい</li>
              <li>今回住戸は3階・北向きで、タワーの高さを享受しにくい</li>
              <li>218戸内の類似売出しが再販価格を比較しやすくする</li>
              <li>修繕積立金の増額・一時金が明記されている</li>
            </ul>
          </article>
          <article className="meaning-card verify">
            <span>?</span>
            <h3>契約前に取る資料</h3>
            <ul>
              <li>長期修繕計画と段階増額の年次・金額</li>
              <li>修繕積立一時金の予定額と徴収時期</li>
              <li>駐車場の確保条件・月額・承継可否</li>
              <li>北向き3階の採光・騒音・視線・眺望</li>
            </ul>
          </article>
        </div>

        <div className="district-interpretation">
          <div className="district-label">
            SUUMOの「その他制限事項」表記について
          </div>
          <div>
            <h3>買主に新しい費用を課す、という意味ではない。</h3>
            <p>
              「都市再生特別地区（新潟駅南口西地区）」は、この敷地で用途・容積率・高さ等を個別に定めた都市計画の表示です。今回の住戸に特別な税や管理費を追加する記載ではありません。ただし、公開空地や複合用途を含む建物全体の管理区分・費用負担は、管理規約と重要事項説明書で確認が必要です。
            </p>
          </div>
        </div>

        <div className="building-compare">
          <article>
            <span>既存タワーを割安に買う</span>
            <h3>シティタワー新潟</h3>
            <p>
              販売価格は1,020万円低く、今回住戸は6階・角住戸。築16年のため、価格優位と引き換えに大規模修繕実績、今後の基金徴収、設備免責を精査する案件です。
            </p>
          </article>
          <div className="versus">VS</div>
          <article>
            <span>再開発の完成品を買う</span>
            <h3>アイコニックタワー</h3>
            <p>
              築浅・免震・複合開発が強み。ただし今回住戸は3階・北向き。新築プレミアムと将来の積立増額を含めても価格差に納得できるかが焦点です。
            </p>
          </article>
        </div>

        <aside className="floor-note">
          <b>階数表記の差</b>
          <p>
            新潟市の計画概要は住宅棟「地上32階」、現在の流通資料は「地上30階」と表記しています。比較表は流通資料に合わせ30階としましたが、契約時は確認申請・登記事項・重要事項説明書で正式表記を確認してください。
          </p>
        </aside>
      </section>

      <section className="content-section shortlist-section">
        <div className="section-heading">
          <div>
            <span className="section-number">04</span>
            <p className="kicker">SHORTLIST MANAGER</p>
            <h2>候補を増やして、育てる。</h2>
          </div>
          <button className="button button-primary" onClick={openAdd}>
            ＋ 新しい候補
          </button>
        </div>
        <div className="shortlist-table">
          {properties.map((property) => (
            <div className="shortlist-row" key={property.id}>
              <label className="compare-check">
                <input
                  type="checkbox"
                  checked={property.selected}
                  onChange={() => toggleSelected(property.id)}
                />
                <span />
                比較
              </label>
              <div className="shortlist-name">
                <b>{property.name}</b>
                <small>{property.address}</small>
              </div>
              <div>
                <small>価格</small>
                <b>{manYen(property.price)}</b>
              </div>
              <div>
                <small>面積</small>
                <b>{decimal(property.area, 2)}㎡</b>
              </div>
              <div>
                <small>駅</small>
                <b>徒歩{property.stationMinutes}分</b>
              </div>
              <div className="shortlist-actions">
                <button onClick={() => openEdit(property)}>編集</button>
                <button
                  className="danger"
                  onClick={() => removeProperty(property)}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
          {properties.length === 0 && (
            <div className="empty-state">
              <b>候補がありません</b>
              <button className="button button-primary" onClick={openAdd}>
                最初の候補を追加
              </button>
            </div>
          )}
        </div>
        <div className="data-tools">
          <div>
            <b>データの持ち運び</b>
            <p>
              このブラウザには自動保存されます。別端末でも使う場合はJSONでバックアップしてください。
            </p>
          </div>
          <div>
            <button className="button button-ghost" onClick={exportData}>
              JSONを書き出す
            </button>
            <button
              className="button button-ghost"
              onClick={() => importRef.current?.click()}
            >
              JSONを読み込む
            </button>
            <button className="text-button" onClick={resetData}>
              初期状態に戻す
            </button>
            <input
              ref={importRef}
              className="visually-hidden"
              type="file"
              accept="application/json"
              onChange={importData}
            />
          </div>
        </div>
      </section>

      <section className="sources-section">
        <div>
          <p className="kicker">SOURCES & NOTES</p>
          <h2>情報源と注意事項</h2>
        </div>
        <div className="sources-grid">
          <a
            href="https://suumo.jp/ms/chuko/niigata/sc_niigatashichuo/nc_21415553/"
            target="_blank"
            rel="noreferrer"
          >
            <span>01</span>
            <b>SUUMO｜シティタワー新潟</b>
            <small>価格・住戸・管理費等</small>
          </a>
          <a
            href="https://suumo.jp/ms/chuko/niigata/sc_niigatashichuo/nc_78980771/"
            target="_blank"
            rel="noreferrer"
          >
            <span>02</span>
            <b>SUUMO｜アイコニックタワー</b>
            <small>価格・住戸・管理費等</small>
          </a>
          <a
            href="https://suumo.jp/ms/chuko/niigata/sc_niigatashichuo/nc_20418061/"
            target="_blank"
            rel="noreferrer"
          >
            <span>03</span>
            <b>SUUMO｜ザ・プレミア新潟萬代橋</b>
            <small>価格・住戸・管理費・駐車場等</small>
          </a>
          <a
            href="https://www.city.niigata.lg.jp/shisei/tokei/kaihatsuseibi/saikaihatsu/saikaihatsuchu/toshinyuuken-MGN.html"
            target="_blank"
            rel="noreferrer"
          >
            <span>04</span>
            <b>新潟市｜新潟駅南口西地区</b>
            <small>事業概要・スケジュール</small>
          </a>
          <a
            href="https://www.city.niigata.lg.jp/kurashi/bosai/hinanjo/kouzui_hinanchizu/sougou_map/bosai_03sougouR8.html"
            target="_blank"
            rel="noreferrer"
          >
            <span>05</span>
            <b>新潟市｜中央区ハザードマップ</b>
            <small>洪水・津波・浸水等</small>
          </a>
          <a
            href="https://www.city.niigata.lg.jp/kurashi/bosai/hinanjo/kouzui_hinanchizu/bosai_ekijyoka.html"
            target="_blank"
            rel="noreferrer"
          >
            <span>06</span>
            <b>新潟市｜液状化ハザードマップ</b>
            <small>地盤リスクの確認</small>
          </a>
        </div>
        <p className="disclaimer">
          掲載情報を2026年8月16日時点で整理した比較補助です。売出し状況・価格・管理費等は変動します。購入判断は最新の販売図面、重要事項説明書、管理規約、長期修繕計画、総会議事録、ハザード情報、住宅ローン審査結果を確認して行ってください。
        </p>
      </section>

      {editorOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditorOpen(false);
          }}
        >
          <section
            className="editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editor-title"
          >
            <div className="editor-header">
              <div>
                <p className="kicker">PROPERTY EDITOR</p>
                <h2 id="editor-title">
                  {editingId ? '候補を編集' : '候補を追加'}
                </h2>
              </div>
              <button
                className="close-button"
                onClick={() => setEditorOpen(false)}
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            <form onSubmit={saveProperty}>
              <fieldset>
                <legend>基本情報</legend>
                <div className="form-grid">
                  <label className="span-2">
                    <span>物件名 *</span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      placeholder="例：ザ・サーパスタワー新潟万代シテイ"
                    />
                  </label>
                  <label>
                    <span>状態</span>
                    <input
                      value={form.condition}
                      onChange={(e) => updateForm('condition', e.target.value)}
                      placeholder="中古・角住戸"
                    />
                  </label>
                  <label>
                    <span>間取り</span>
                    <input
                      value={form.layout}
                      onChange={(e) => updateForm('layout', e.target.value)}
                      placeholder="3LDK"
                    />
                  </label>
                  <NumberField
                    label="販売価格（万円）*"
                    value={form.price}
                    onChange={(value) => updateForm('price', value)}
                  />
                  <NumberField
                    label="専有面積（㎡）*"
                    value={form.area}
                    step="0.01"
                    onChange={(value) => updateForm('area', value)}
                  />
                  <label>
                    <span>築年月</span>
                    <input
                      type="month"
                      value={form.built}
                      onChange={(e) => updateForm('built', e.target.value)}
                    />
                  </label>
                  <NumberField
                    label="新潟駅 徒歩（分）"
                    value={form.stationMinutes}
                    onChange={(value) => updateForm('stationMinutes', value)}
                  />
                  <NumberField
                    label="所在階"
                    value={form.floor}
                    onChange={(value) => updateForm('floor', value)}
                  />
                  <NumberField
                    label="建物階数"
                    value={form.totalFloors}
                    onChange={(value) => updateForm('totalFloors', value)}
                  />
                  <label>
                    <span>向き</span>
                    <input
                      value={form.direction}
                      onChange={(e) => updateForm('direction', e.target.value)}
                      placeholder="南西"
                    />
                  </label>
                  <NumberField
                    label="総戸数"
                    value={form.units}
                    onChange={(value) => updateForm('units', value)}
                  />
                  <label className="span-2">
                    <span>住所</span>
                    <input
                      value={form.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                    />
                  </label>
                  <label className="span-2">
                    <span>構造・免震等</span>
                    <input
                      value={form.structure}
                      onChange={(e) => updateForm('structure', e.target.value)}
                      placeholder="RC・免震・地上30階"
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend>毎月の費用</legend>
                <div className="form-grid">
                  <NumberField
                    label="管理費（円）"
                    value={form.managementFee}
                    onChange={(value) => updateForm('managementFee', value)}
                  />
                  <NumberField
                    label="修繕積立金（円）"
                    value={form.reserveFund}
                    onChange={(value) => updateForm('reserveFund', value)}
                  />
                  <NumberField
                    label="その他月額（円）"
                    value={form.otherMonthly}
                    onChange={(value) => updateForm('otherMonthly', value)}
                  />
                  <label>
                    <span>駐車場（円・不明なら空欄）</span>
                    <input
                      type="number"
                      min="0"
                      value={form.parkingMonthly ?? ''}
                      onChange={(e) =>
                        updateForm(
                          'parkingMonthly',
                          e.target.value === '' ? null : Number(e.target.value),
                        )
                      }
                    />
                  </label>
                  <label className="span-2">
                    <span>駐車場メモ</span>
                    <input
                      value={form.parkingNote}
                      onChange={(e) =>
                        updateForm('parkingNote', e.target.value)
                      }
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend>評価とメモ</legend>
                <div className="form-grid">
                  <label>
                    <span>資産性の手動評価（1〜5）</span>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={form.assetScore}
                      onChange={(e) =>
                        updateForm(
                          'assetScore',
                          clamp(Number(e.target.value), 1, 5),
                        )
                      }
                    />
                  </label>
                  <label>
                    <span>情報確認日</span>
                    <input
                      type="date"
                      value={form.sourceUpdated}
                      onChange={(e) =>
                        updateForm('sourceUpdated', e.target.value)
                      }
                    />
                  </label>
                  <label className="span-2">
                    <span>再開発との関係</span>
                    <input
                      value={form.redevelopment}
                      onChange={(e) =>
                        updateForm('redevelopment', e.target.value)
                      }
                    />
                  </label>
                  <label className="span-2">
                    <span>特徴（改行区切り）</span>
                    <textarea
                      rows={3}
                      value={form.features.join('\n')}
                      onChange={(e) =>
                        updateForm(
                          'features',
                          e.target.value
                            .split('\n')
                            .map((item) => item.trim())
                            .filter(Boolean),
                        )
                      }
                    />
                  </label>
                  <label className="span-2">
                    <span>注意点（改行区切り）</span>
                    <textarea
                      rows={4}
                      value={form.warnings.join('\n')}
                      onChange={(e) =>
                        updateForm(
                          'warnings',
                          e.target.value
                            .split('\n')
                            .map((item) => item.trim())
                            .filter(Boolean),
                        )
                      }
                    />
                  </label>
                  <label className="span-2">
                    <span>メモ</span>
                    <textarea
                      rows={4}
                      value={form.notes}
                      onChange={(e) => updateForm('notes', e.target.value)}
                    />
                  </label>
                  <label className="span-2">
                    <span>掲載URL</span>
                    <input
                      type="url"
                      value={form.sourceUrl}
                      onChange={(e) => updateForm('sourceUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </label>
                </div>
              </fieldset>
              <div className="editor-actions">
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setEditorOpen(false)}
                >
                  キャンセル
                </button>
                <button type="submit" className="button button-primary">
                  {editingId ? '変更を保存' : '候補に追加'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = '1',
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
}) {
  return (
    <label>
      <span>{label}</span>
      <input
        type="number"
        min="0"
        step={step}
        value={value || ''}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
