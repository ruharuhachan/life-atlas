import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import shops from '@/data/beer/shops.json';
import makers from '@/data/beer/manufacturers.json';
import certifications from '@/data/beer/certifications.json';
type Shop = (typeof shops)[number];
export default function BeerExplorer() {
  const [maker, setMaker] = useState('');
  const [cert, setCert] = useState('');
  const [area, setArea] = useState('');
  const [rating, setRating] = useState('');
  const [query, setQuery] = useState('');
  const [booking, setBooking] = useState(false);
  const [article, setArticle] = useState(false);
  const [official, setOfficial] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(shops[0].id);
  const mapRef = useRef<SVGSVGElement>(null);
  const filtered = useMemo(
    () =>
      shops.filter(
        (s) =>
          (!maker || s.manufacturerId === maker) &&
          (!cert || s.certifications.includes(cert)) &&
          (!area || s.area === area) &&
          (!rating ||
            (s.externalRatings.google.score !== null &&
              s.externalRatings.google.score >= Number(rating))) &&
          (!booking || s.reservationAvailable) &&
          (!article || s.articleSlug) &&
          (!official || s.officialCertified) &&
          (!query || (s.name + s.address).includes(query.trim())),
      ),
    [maker, cert, area, rating, query, booking, article, official],
  );
  const selected = filtered.find((s) => s.id === selectedId) ?? filtered[0];
  function reset() {
    setMaker('');
    setCert('');
    setArea('');
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
    const projection = d3
      .geoMercator()
      .center([139.052, 37.918])
      .scale(630000)
      .translate([400, 235]);
    const path = d3.geoPath(projection);
    const grid = d3
      .geoGraticule()
      .extent([
        [139.015, 37.895],
        [139.09, 37.94],
      ])
      .step([0.005, 0.005]);
    svg
      .append('path')
      .datum(grid())
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#344042')
      .attr('stroke-width', 0.6);
    // Geographic orientation landmarks only; no invented street or shoreline geometry.
    [
      { name: '古町', coordinates: [139.044, 37.926] },
      { name: '万代', coordinates: [139.055, 37.918] },
      { name: '新潟駅', coordinates: [139.061, 37.912] },
    ].forEach((p) => {
      const [x, y] = projection([p.coordinates[0], p.coordinates[1]])!;
      svg
        .append('text')
        .attr('x', x + 20)
        .attr('y', y - 28)
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
      .attr('aria-label', (s) => `${s.name}（サンプル）の評価を見る`)
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
  }, [filtered, selected]);
  return (
    <section className="beer-explorer" aria-label="店舗検索">
      <div className="beer-filterbar">
        <div className="beer-makers" role="group" aria-label="メーカーで絞る">
          <button aria-pressed={!maker} onClick={() => setMaker('')}>
            すべて
          </button>
          {makers.map((m) => (
            <button
              key={m.id}
              aria-pressed={maker === m.id}
              onClick={() => setMaker(m.id)}
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
              placeholder="万代、古町…"
            />
          </label>
          <label>
            認定・提供品質
            <select value={cert} onChange={(e) => setCert(e.target.value)}>
              <option value="">すべての区分</option>
              {certifications.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            エリア
            <select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">新潟市・全エリア</option>
              {['古町', '万代', '新潟駅南'].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label>
            口コミ評価
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="">指定なし</option>
              <option value="4">4.0以上</option>
              <option value="4.3">4.3以上</option>
              <option value="4.5">4.5以上</option>
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
          <strong>{filtered.length}</strong> 件 <span>／ サンプル店舗</span>
        </p>
        <span>地図の番号を選ぶと、店舗の評価が表示されます</span>
      </div>
      <div className="beer-workspace">
        <div className="beer-map">
          <div className="beer-map-title">
            <span>NIIGATA CITY</span>
            <span>位置図 / N ↑</span>
          </div>
          <svg
            ref={mapRef}
            viewBox="0 0 800 470"
            role="group"
            aria-label="新潟市のサンプル店舗位置図"
          />
          <div className="beer-map-caption">
            緯度・経度に基づく位置図。店舗・所在地は架空です。
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
              <p className="beer-demo-label">架空のサンプル店舗</p>
              <div className="beer-tags">
                {selected.certifications.map((id) => (
                  <span key={id}>
                    {certifications.find((c) => c.id === id)?.name}
                  </span>
                ))}
              </div>
              <div className="beer-rating">
                <div>
                  <span>口コミ評価（サンプル）</span>
                  <strong>
                    {selected.externalRatings.google.score?.toFixed(1) ?? '—'}
                    <small> / 5</small>
                  </strong>
                </div>
                <p>ビール品質の点数とは別の指標です。</p>
              </div>
              <dl className="beer-facts">
                <div>
                  <dt>共通基準への適合</dt>
                  <dd>未評価</dd>
                </div>
                <div>
                  <dt>ネット予約</dt>
                  <dd>
                    {selected.reservationAvailable
                      ? '可（サンプル）'
                      : '未確認'}
                  </dd>
                </div>
                <div>
                  <dt>最終確認日</dt>
                  <dd>未確認</dd>
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
                  サンプル記事を読む ↗
                </a>
              )}
            </>
          ) : (
            <div className="beer-empty">
              <h2>条件に合う店舗がありません</h2>
              <p>メーカーやエリアの条件を減らしてみてください。</p>
              <button className="beer-button" onClick={reset}>
                すべての店舗を表示
              </button>
            </div>
          )}
        </aside>
      </div>
      <div className="beer-list" aria-label="検索結果一覧">
        {filtered.map((s) => (
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
                  サンプル · 口コミ{' '}
                  {s.externalRatings.google.score?.toFixed(1) ?? '未取得'}
                </small>
              </span>
              <span aria-hidden="true">↗</span>
            </button>
            <a href={`/beer/shops/${s.slug}/`}>店舗詳細</a>
          </article>
        ))}
      </div>
    </section>
  );
}
