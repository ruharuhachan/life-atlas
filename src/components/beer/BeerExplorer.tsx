import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import shops from '@/data/beer/shops.json';
import makers from '@/data/beer/manufacturers.json';
import certifications from '@/data/beer/certifications.json';
import areas from '@/data/beer/areas.json';
import brands from '@/data/beer/brands.json';
import {
  certificationsForManufacturer,
  brandsForManufacturer,
  matchesBeerSelection,
  matchesArea,
  regionForArea,
  changeManufacturer,
} from '@/data/beer/search';
import {
  fetchLiveGoogleRating,
  googlePlacesConfigured,
  type LiveGoogleRating,
} from '@/lib/googlePlaces';

type Shop = (typeof shops)[number];
type RatingStatus = 'loading' | 'ready' | 'unconfigured' | 'error';
const DEFAULT_AREA_ID = 'tokyo-jiyugaoka-1';

export default function BeerExplorer() {
  const [maker, setMaker] = useState('');
  const [cert, setCert] = useState('');
  const [area, setArea] = useState(DEFAULT_AREA_ID);
  const [rating, setRating] = useState('');
  const [query, setQuery] = useState('');
  const [booking, setBooking] = useState(false);
  const [article, setArticle] = useState(false);
  const [official, setOfficial] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    shops[0]?.id ?? null,
  );
  const [liveRatings, setLiveRatings] = useState<
    Record<string, LiveGoogleRating>
  >({});
  const [ratingStatus, setRatingStatus] = useState<RatingStatus>(
    googlePlacesConfigured ? 'loading' : 'unconfigured',
  );
  const mapRef = useRef<SVGSVGElement>(null);

  const region = regionForArea(area);
  const areaHasShops = shops.some((s) => matchesArea(s, area));
  const availableCertifications = certificationsForManufacturer(maker);
  const availableBrands = brandsForManufacturer(maker);

  function selectMaker(id: string) {
    const next = changeManufacturer(id);
    setMaker(next.manufacturerId);
    setCert(next.certificationId);
  }

  useEffect(() => {
    if (!googlePlacesConfigured) return;
    let cancelled = false;

    Promise.all(
      shops.map(async (shop) => {
        try {
          const live = await fetchLiveGoogleRating({
            placeId: shop.externalIds.googlePlaceId,
            name: shop.name,
            address: shop.address,
            latitude: shop.latitude,
            longitude: shop.longitude,
            fallbackMapsUrl: shop.googleMapsUrl,
          });
          return [shop.id, live] as const;
        } catch {
          return [shop.id, null] as const;
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      const next: Record<string, LiveGoogleRating> = {};
      for (const [id, live] of entries) {
        if (live) next[id] = live;
      }
      setLiveRatings(next);
      setRatingStatus(Object.keys(next).length > 0 ? 'ready' : 'error');
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      shops.filter((s) => {
        const liveScore = liveRatings[s.id]?.score;
        return (
          (!maker || s.manufacturerId === maker) &&
          matchesBeerSelection(s, cert) &&
          matchesArea(s, area) &&
          (!rating || (liveScore != null && liveScore >= Number(rating))) &&
          (!booking || s.reservationAvailable) &&
          (!article || s.articleSlug) &&
          (!official || s.officialCertified) &&
          (!query || (s.name + s.address).includes(query.trim()))
        );
      }),
    [
      maker,
      cert,
      area,
      rating,
      query,
      booking,
      article,
      official,
      liveRatings,
    ],
  );

  const selected = filtered.find((s) => s.id === selectedId) ?? filtered[0];
  const selectedRating = selected ? liveRatings[selected.id] : null;

  function reset() {
    setMaker('');
    setCert('');
    setArea(DEFAULT_AREA_ID);
    setRating('');
    setQuery('');
    setBooking(false);
    setArticle(false);
    setOfficial(false);
  }

  useEffect(() => {
    if (!mapRef.current) return;
    const svg = d3.select(mapRef.current);
    svg.selectAll('*').remove();

    const projection = d3.geoMercator().fitExtent(
      [
        [60, 60],
        [740, 410],
      ],
      { type: 'MultiPoint', coordinates: region.extent },
    );
    const path = d3.geoPath(projection);
    const grid = d3
      .geoGraticule()
      .extent([
        [region.extent[0][0], region.extent[0][1]],
        [region.extent[1][0], region.extent[1][1]],
      ])
      .step(region.id === 'JP-13' ? [0.05, 0.05] : [0.005, 0.005]);

    svg
      .append('path')
      .datum(grid())
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#344042')
      .attr('stroke-width', 0.6);

    region.landmarks.forEach((p) => {
      const [x, y] = projection([p.coordinates[0], p.coordinates[1]])!;
      svg
        .append('text')
        .attr('x', x)
        .attr('y', y - 28)
        .attr('text-anchor', 'middle')
        .attr('fill', '#aab5b4')
        .attr('font-size', 16)
        .text(p.name);
    });

    const points = svg
      .selectAll<SVGGElement, Shop>('g.pin')
      .data(filtered)
      .join('g')
      .attr('class', 'pin')
      .attr(
        'transform',
        (s) => `translate(${projection([s.longitude, s.latitude])})`,
      )
      .attr('role', 'button')
      .attr('tabindex', 0)
      .attr('aria-label', (s) => `${s.name}の情報を見る`)
      .attr('aria-pressed', (s) => String(selected?.id === s.id))
      .on('click', (_e, s) => setSelectedId(s.id))
      .on('keydown', (e: KeyboardEvent, s) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelectedId(s.id);
        }
      });

    points
      .append('circle')
      .attr('r', 23)
      .attr('fill', (s) => (s.id === selected?.id ? '#eebf68' : '#fafafa'))
      .attr('stroke', '#172022')
      .attr('stroke-width', 4);

    points
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.36em')
      .attr('fill', '#172022')
      .attr('font-size', 15)
      .attr('font-weight', 700)
      .text((s) => String(shops.indexOf(s) + 1).padStart(2, '0'));
  }, [filtered, selected, region]);

  return (
    <section className="beer-explorer" aria-label="店舗検索">
      <div className="beer-filterbar">
        <div className="beer-makers" role="group" aria-label="メーカーで絞る">
          <button aria-pressed={!maker} onClick={() => selectMaker('')}>
            すべて
          </button>
          {makers.map((m) => (
            <button
              key={m.id}
              aria-pressed={maker === m.id}
              onClick={() => selectMaker(m.id)}
            >
              <span>{m.english}</span>
              {m.name}
            </button>
          ))}
        </div>

        <div className="beer-fields">
          <label>
            店名・エリア
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="店名・街の名前…"
            />
          </label>

          <label>
            銘柄・認定
            <select
              value={cert}
              disabled={!maker}
              onChange={(e) => setCert(e.target.value)}
            >
              <option value="">
                {maker ? 'このメーカーのすべて' : 'メーカーを選択してください'}
              </option>
              {availableBrands.length > 0 && (
                <optgroup label="銘柄">
                  {availableBrands.map((b) => (
                    <option key={b.id} value={'brand:' + b.id}>
                      {b.name}
                      {b.limitedRegion ? `（${b.limitedRegion}限定）` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="認定・品質提供">
                {availableCertifications.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          <label>
            エリア
            <select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="JP-13">東京都の登録エリアすべて</option>
              {areas.areas.map((a) =>
                a.neighborhoods.length ? (
                  <optgroup key={a.id} label={a.name}>
                    <option value={a.id}>{a.name}・すべて</option>
                    {a.neighborhoods.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </optgroup>
                ) : (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            Google口コミ
            <select
              value={rating}
              disabled={ratingStatus !== 'ready'}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="">
                {ratingStatus === 'ready'
                  ? '指定なし'
                  : ratingStatus === 'loading'
                    ? 'Google Mapsから読込中…'
                    : ratingStatus === 'unconfigured'
                      ? 'Google連携の設定待ち'
                      : '現在取得できません'}
              </option>
              {ratingStatus === 'ready' && (
                <>
                  <option value="4">4.0以上</option>
                  <option value="4.3">4.3以上</option>
                  <option value="4.5">4.5以上</option>
                </>
              )}
            </select>
          </label>
        </div>

        <div className="beer-options">
          <label>
            <input
              type="checkbox"
              checked={official}
              onChange={(e) => setOfficial(e.target.checked)}
            />
            公式認定あり
          </label>
          <label>
            <input
              type="checkbox"
              checked={booking}
              onChange={(e) => setBooking(e.target.checked)}
            />
            ネット予約可
          </label>
          <label>
            <input
              type="checkbox"
              checked={article}
              onChange={(e) => setArticle(e.target.checked)}
            />
            記事あり
          </label>
          <button onClick={reset}>条件をクリア</button>
        </div>
      </div>

      <div className="beer-result-head">
        <p aria-live="polite">
          <strong>{filtered.length}</strong> 件 <span>／ 実店舗</span>
        </p>
        <span>
          地図の番号を選ぶと店舗情報を表示 · 口コミデータ: Google Maps
        </span>
      </div>

      <div className="beer-workspace">
        <div className="beer-map">
          <div className="beer-map-title">
            <span>{region.english}</span>
            <span>位置図 / N ↑</span>
          </div>
          <svg
            ref={mapRef}
            viewBox="0 0 800 470"
            role="group"
            aria-label={`${region.name}の掲載店舗位置図`}
          />
          <div className="beer-map-caption">
            住所をもとにした案内用の位置図です。提供状況は確認日をご確認ください。
          </div>
        </div>

        <aside
          className="beer-selection"
          aria-label="選択中の店舗"
          aria-live="polite"
        >
          {selected ? (
            <>
              <p className="beer-kicker">
                SELECTED /{' '}
                {String(shops.indexOf(selected) + 1).padStart(2, '0')}
              </p>
              <p className="beer-meta">
                {selected.area} ·{' '}
                {makers.find((m) => m.id === selected.manufacturerId)?.name}
              </p>
              <h2>{selected.name}</h2>
              <p className="beer-demo-label">
                実店舗 · {selected.lastVerifiedAt ?? '未確認'} 確認
              </p>

              <div className="beer-tags">
                {selected.brandIds.map((id) => (
                  <span key={id}>{brands.find((b) => b.id === id)?.name}</span>
                ))}
                {selected.certifications.map((id) => (
                  <span key={id}>
                    {certifications.find((c) => c.id === id)?.name}
                  </span>
                ))}
              </div>

              <div className="beer-rating">
                <div>
                  <span>Google口コミ</span>
                  <strong>
                    {selectedRating?.score != null
                      ? selectedRating.score.toFixed(1)
                      : ratingStatus === 'loading'
                        ? '読込中'
                        : ratingStatus === 'unconfigured'
                          ? '設定待ち'
                          : '未取得'}
                    {selectedRating?.score != null && <small> / 5</small>}
                  </strong>
                </div>
                <p>
                  {selectedRating?.reviewCount != null &&
                    `${selectedRating.reviewCount}件 · `}
                  ビール品質の点数とは別の指標です。{' '}
                  <a
                    href={selectedRating?.sourceUrl ?? selected.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Google Maps ↗
                  </a>
                </p>
                {selectedRating?.attributions.map((item) => (
                  <p key={`${item.provider}-${item.providerURI ?? ''}`}>
                    提供元:{' '}
                    {item.providerURI ? (
                      <a href={item.providerURI} target="_blank" rel="noreferrer">
                        {item.provider}
                      </a>
                    ) : (
                      item.provider
                    )}
                  </p>
                ))}
              </div>

              <dl className="beer-facts">
                <div>
                  <dt>提供情報</dt>
                  <dd>{selected.controls.temperature}</dd>
                </div>
                <div>
                  <dt>ネット予約</dt>
                  <dd>{selected.reservationAvailable ? '可' : '未確認'}</dd>
                </div>
                <div>
                  <dt>最終確認日</dt>
                  <dd>{selected.lastVerifiedAt ?? '未確認'}</dd>
                </div>
              </dl>

              <a className="beer-button" href={`/beer/shops/${selected.slug}/`}>
                店舗の評価・詳細を見る <span>↗</span>
              </a>
              {selected.articleSlug && (
                <a
                  className="beer-article-link"
                  href={`/beer/articles/${selected.articleSlug}/`}
                >
                  記事を読む ↗
                </a>
              )}
            </>
          ) : (
            <div className="beer-empty">
              <h2>
                {areaHasShops
                  ? '条件に合う店舗がありません'
                  : 'このエリアは店舗情報を準備中です'}
              </h2>
              <p>
                {areaHasShops
                  ? 'メーカーや銘柄・認定の条件を減らしてみてください。'
                  : '現在は自由が丘の実店舗から掲載を始めています。'}
              </p>
              <button className="beer-button" onClick={reset}>
                自由が丘の実店舗を見る
              </button>
            </div>
          )}
        </aside>
      </div>

      <div className="beer-list" aria-label="検索結果一覧">
        {filtered.map((s) => {
          const live = liveRatings[s.id];
          return (
            <article
              className={s.id === selected?.id ? 'is-selected' : ''}
              key={s.id}
            >
              <button
                className="beer-shop-select"
                aria-pressed={s.id === selected?.id}
                onClick={() => setSelectedId(s.id)}
              >
                <span className="beer-number">
                  {String(shops.indexOf(s) + 1).padStart(2, '0')}
                </span>
                <span>
                  <small>
                    {s.area} /{' '}
                    {makers.find((m) => m.id === s.manufacturerId)?.name}
                  </small>
                  <strong>{s.name}</strong>
                  <small>
                    Google Maps口コミ{' '}
                    {live?.score != null
                      ? `${live.score.toFixed(1)}${live.reviewCount != null ? `（${live.reviewCount}件）` : ''}`
                      : ratingStatus === 'loading'
                        ? '読み込み中…'
                        : ratingStatus === 'unconfigured'
                          ? '連携設定待ち'
                          : '未取得'}
                  </small>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
              <a href={`/beer/shops/${s.slug}/`}>店舗詳細</a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
