'use client';

import * as d3 from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';
import { type PublicListing, unitPrice } from '../data/public-listings';

type ChartMode = 'station' | 'value';
type Neighborhood = PublicListing['neighborhood'] | 'すべて';

const COLORS: Record<PublicListing['neighborhood'], string> = {
  駅前: '#0b716a',
  駅南: '#d96549',
  万代: '#d5a72d',
  関屋: '#526c82',
  '古町・白山': '#7c5b92',
  '上所・女池': '#bb6b4a',
  東区: '#4f7897',
  西区: '#568069',
  江南区: '#a06b2d',
};

const shortName = (name: string) =>
  name
    .replace('アイコニックタワー新潟ステーション', 'アイコニックタワー')
    .replace('ダイアパレスシアース万代', 'シアース万代')
    .replace('ザ・サーパスタワー新潟万代シテイ', 'サーパスタワー万代')
    .replace('ユートピアレジデンス南紫竹B棟', 'ユートピア南紫竹')
    .replace('グリーンタウン東新潟壱号館', 'グリーンタウン東新潟')
    .replace('アパガーデンプレイス新潟駅', 'アパガーデンプレイス');

export default function HousingScatter({
  listings,
}: {
  listings: PublicListing[];
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<ChartMode>('station');
  const [neighborhood, setNeighborhood] = useState<Neighborhood>('すべて');
  const [hovered, setHovered] = useState<PublicListing | null>(null);
  const [width, setWidth] = useState(760);

  const visible = useMemo(
    () =>
      neighborhood === 'すべて'
        ? listings
        : listings.filter((item) => item.neighborhood === neighborhood),
    [listings, neighborhood],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(320, entry.contentRect.width)),
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const compact = width < 620;
    const height = compact ? 470 : 540;
    const margin = compact
      ? { top: 28, right: 20, bottom: 70, left: 62 }
      : { top: 34, right: 42, bottom: 72, left: 82 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('role', 'img');
    svg
      .append('title')
      .text(
        mode === 'station'
          ? '最寄駅からの徒歩分数と平方メートル単価の散布図'
          : '専有面積と販売価格の散布図',
      );

    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    const xValue =
      mode === 'station'
        ? (d: PublicListing) => d.stationMinutes
        : (d: PublicListing) => d.area;
    const yValue =
      mode === 'station'
        ? (d: PublicListing) => unitPrice(d)
        : (d: PublicListing) => d.price;

    const xExtent = d3.extent(visible, xValue) as [number, number];
    const yExtent = d3.extent(visible, yValue) as [number, number];
    const xPad = Math.max(
      (xExtent[1] - xExtent[0]) * 0.16,
      mode === 'station' ? 1 : 4,
    );
    const yPad = Math.max(
      (yExtent[1] - yExtent[0]) * 0.16,
      mode === 'station' ? 4 : 350,
    );
    const x = d3
      .scaleLinear()
      .domain([Math.max(0, xExtent[0] - xPad), xExtent[1] + xPad])
      .nice()
      .range([0, innerWidth]);
    const y = d3
      .scaleLinear()
      .domain([Math.max(0, yExtent[0] - yPad), yExtent[1] + yPad])
      .nice()
      .range([innerHeight, 0]);
    const radius = d3
      .scaleSqrt()
      .domain(d3.extent(listings, (d) => d.area) as [number, number])
      .range(compact ? [7, 14] : [9, 18]);

    chart
      .append('g')
      .attr('class', 'd3-grid')
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickSize(-innerWidth)
          .tickFormat(() => ''),
      );

    chart
      .append('g')
      .attr('class', 'd3-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(compact ? 5 : 7));
    chart
      .append('g')
      .attr('class', 'd3-axis')
      .call(
        d3
          .axisLeft(y)
          .ticks(6)
          .tickFormat((value) => Number(value).toLocaleString('ja-JP')),
      );

    chart
      .append('text')
      .attr('class', 'd3-axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 53)
      .attr('text-anchor', 'middle')
      .text(mode === 'station' ? '最寄駅から徒歩（分）' : '専有面積（㎡）');
    chart
      .append('text')
      .attr('class', 'd3-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -54)
      .attr('text-anchor', 'middle')
      .text(mode === 'station' ? '㎡単価（万円）' : '販売価格（万円）');

    const points = chart
      .selectAll<SVGGElement, PublicListing>('.d3-point')
      .data(visible, (d) => d.id)
      .join('g')
      .attr('class', 'd3-point')
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr(
        'aria-label',
        (d) =>
          `${d.listingType}、${d.name}、${d.price.toLocaleString('ja-JP')}万円、${d.area}平方メートル`,
      )
      .attr('transform', (d) => `translate(${x(xValue(d))},${y(yValue(d))})`)
      .on('mouseenter focus', (_, d) => setHovered(d))
      .on('mouseleave blur', () => setHovered(null));

    points
      .append('circle')
      .attr('r', 0)
      .attr('fill', (d) => COLORS[d.neighborhood])
      .attr('stroke', '#fffdf7')
      .attr('stroke-width', 3)
      .attr('opacity', 0.92)
      .transition()
      .duration(420)
      .ease(d3.easeCubicOut)
      .attr('r', (d) => radius(d.area));

    if (!compact) {
      points
        .append('text')
        .attr('class', 'd3-point-label')
        .attr('x', (d) => radius(d.area) + 7)
        .attr('y', 4)
        .text((d) => shortName(d.name));
    }
  }, [listings, mode, visible, width]);

  const neighborhoods: Neighborhood[] = [
    'すべて',
    ...(Object.keys(COLORS) as PublicListing['neighborhood'][]),
  ];

  return (
    <div className="d3-shell">
      <div className="d3-toolbar">
        <div>
          <span className="d3-toolbar-label">VIEW</span>
          <button
            className={mode === 'station' ? 'active' : ''}
            onClick={() => setMode('station')}
          >
            駅距離 × ㎡単価
          </button>
          <button
            className={mode === 'value' ? 'active' : ''}
            onClick={() => setMode('value')}
          >
            広さ × 価格
          </button>
        </div>
        <div>
          <span className="d3-toolbar-label">AREA</span>
          {neighborhoods.map((item) => (
            <button
              className={neighborhood === item ? 'active' : ''}
              key={item}
              onClick={() => setNeighborhood(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="d3-stage" ref={hostRef}>
        <svg ref={svgRef} />
        <div
          className={`d3-tooltip ${hovered ? 'visible' : ''}`}
          aria-live="polite"
        >
          {hovered && (
            <>
              <span>
                {hovered.listingType}・{hovered.neighborhood} /{' '}
                {hovered.observedOn.replaceAll('-', '.')}
              </span>
              <b>{hovered.name}</b>
              <strong>{hovered.price.toLocaleString('ja-JP')}万円</strong>
              <small>
                {hovered.layout}・{hovered.area}㎡・{hovered.station}駅 徒歩
                {hovered.stationMinutes}分<br />
                {unitPrice(hovered).toFixed(1)}万円/㎡・築{hovered.builtYear}年
              </small>
            </>
          )}
        </div>
      </div>

      <div className="d3-legend" aria-label="エリア色分け">
        {(Object.keys(COLORS) as PublicListing['neighborhood'][]).map(
          (item) => (
            <span key={item}>
              <i style={{ background: COLORS[item] }} />
              {item}
            </span>
          ),
        )}
        <small>円の大きさ＝専有面積</small>
      </div>
    </div>
  );
}
