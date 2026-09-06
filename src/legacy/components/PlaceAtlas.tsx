'use client';

import * as d3 from 'd3';
import { sitePath } from '../site-path';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MAP_CATEGORY_META,
  type MapCategory,
  type MapPlace,
} from '../data/places';

const TILE_SIZE = 256;
const BASE_ZOOM = 11;
const MAP_ORIGIN: [number, number] = [138.99, 37.86];
const CATEGORY_ORDER: MapCategory[] = ['housing', 'brewery', 'food'];

function worldPixel(
  longitude: number,
  latitude: number,
  zoom: number,
): [number, number] {
  const scale = TILE_SIZE * 2 ** zoom;
  const sinLatitude = Math.sin((latitude * Math.PI) / 180);
  return [
    ((longitude + 180) / 360) * scale,
    (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) *
      scale,
  ];
}

const originPixel = worldPixel(MAP_ORIGIN[0], MAP_ORIGIN[1], BASE_ZOOM);

function projectPlace(place: MapPlace): [number, number] {
  const [x, y] = worldPixel(place.longitude, place.latitude, BASE_ZOOM);
  return [x - originPixel[0], y - originPixel[1]];
}

function fitTransform(places: MapPlace[], width: number, height: number) {
  if (!places.length) return d3.zoomIdentity.translate(width / 2, height / 2);
  const coordinates = places.map(projectPlace);
  const xExtent = d3.extent(coordinates, (point) => point[0]) as [
    number,
    number,
  ];
  const yExtent = d3.extent(coordinates, (point) => point[1]) as [
    number,
    number,
  ];
  const padding = width < 680 ? 52 : 72;
  const spanX = Math.max(42, xExtent[1] - xExtent[0]);
  const spanY = Math.max(42, yExtent[1] - yExtent[0]);
  const scale = Math.max(
    0.55,
    Math.min(
      9,
      Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY),
    ),
  );
  const centerX = (xExtent[0] + xExtent[1]) / 2;
  const centerY = (yExtent[0] + yExtent[1]) / 2;
  return d3.zoomIdentity
    .translate(width / 2 - scale * centerX, height / 2 - scale * centerY)
    .scale(scale);
}

function spreadMarkers(
  places: MapPlace[],
  transform: d3.ZoomTransform,
  width: number,
  height: number,
) {
  const occupied: [number, number][] = [];
  return places.map((place, index) => {
    const target = transform.apply(projectPlace(place));
    let position: [number, number] = [target[0], target[1]];
    const conflicts = (candidate: [number, number]) =>
      occupied.some(
        (point) =>
          Math.hypot(point[0] - candidate[0], point[1] - candidate[1]) < 37,
      );

    if (conflicts(position)) {
      const phase = (index % 7) * 0.39;
      outer: for (const radius of [34, 52, 70]) {
        for (let step = 0; step < 16; step += 1) {
          const angle = phase + (step / 16) * Math.PI * 2;
          const candidate: [number, number] = [
            Math.max(
              23,
              Math.min(width - 23, target[0] + Math.cos(angle) * radius),
            ),
            Math.max(
              23,
              Math.min(height - 23, target[1] + Math.sin(angle) * radius),
            ),
          ];
          if (!conflicts(candidate)) {
            position = candidate;
            break outer;
          }
        }
      }
    }

    occupied.push(position);
    return { place, target, position };
  });
}

export default function PlaceAtlas({ places }: { places: MapPlace[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const fitRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const [width, setWidth] = useState(960);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(
    places[0]?.id ?? null,
  );
  const [activeKinds, setActiveKinds] = useState<Record<MapCategory, boolean>>({
    housing: true,
    brewery: true,
    food: true,
  });

  useEffect(() => {
    const category = new URLSearchParams(window.location.search).get(
      'category',
    ) as MapCategory | null;
    if (!category || !CATEGORY_ORDER.includes(category)) return;
    const timer = window.setTimeout(() => {
      setActiveKinds({
        housing: category === 'housing',
        brewery: category === 'brewery',
        food: category === 'food',
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ja');
    return places.filter((place) => {
      if (!activeKinds[place.kind]) return false;
      if (!normalized) return true;
      return [place.name, place.area, place.address, place.lead]
        .join(' ')
        .toLocaleLowerCase('ja')
        .includes(normalized);
    });
  }, [activeKinds, places, query]);

  const effectiveSelectedId = visible.some((place) => place.id === selectedId)
    ? selectedId
    : (visible[0]?.id ?? null);
  const selected =
    visible.find((place) => place.id === effectiveSelectedId) ?? null;
  const height = width < 680 ? 550 : 660;

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
    const svgNode = svgRef.current;
    if (!svgNode) return;
    const svg = d3.select<SVGSVGElement, unknown>(svgNode);
    svg.selectAll('*').remove();
    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr(
        'aria-label',
        '新潟市のマンション、酒蔵、飲食店を切り替えて探索する地図',
      );
    svg.append('title').text('NIIGATA LIFE ATLAS 生活地点マップ');

    const tileLayer = svg.append('g').attr('class', 'atlas-tile-layer');
    const leaderLayer = svg.append('g').attr('class', 'atlas-leader-layer');
    const markerLayer = svg.append('g').attr('class', 'atlas-marker-layer');

    const markers = markerLayer
      .selectAll<SVGGElement, MapPlace>('g')
      .data(visible, (place) => place.id)
      .join('g')
      .attr('class', 'place-marker')
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr(
        'aria-label',
        (place) =>
          `${MAP_CATEGORY_META[place.kind].label}、${place.name}、${place.area}`,
      )
      .on('click', (_, place) => setSelectedId(place.id))
      .on('keydown', (event: KeyboardEvent, place) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setSelectedId(place.id);
        }
      });

    markers.append('circle').attr('class', 'place-marker-ring').attr('r', 21);
    markers
      .append('path')
      .attr('class', 'place-marker-shape')
      .attr(
        'd',
        (place) =>
          d3
            .symbol()
            .type(
              place.kind === 'housing'
                ? d3.symbolSquare
                : place.kind === 'brewery'
                  ? d3.symbolDiamond
                  : d3.symbolCircle,
            )
            .size(place.kind === 'brewery' ? 540 : 470)() ?? '',
      )
      .attr('fill', (place) => MAP_CATEGORY_META[place.kind].color);
    markers
      .append('text')
      .attr('class', 'place-marker-glyph')
      .attr('text-anchor', 'middle')
      .attr('dy', '.34em')
      .text((place) => MAP_CATEGORY_META[place.kind].short);

    const leaders = leaderLayer
      .selectAll<SVGLineElement, MapPlace>('line')
      .data(visible, (place) => place.id)
      .join('line')
      .attr('class', 'place-marker-leader');

    const renderTiles = (transform: d3.ZoomTransform) => {
      const tileZoom = Math.max(
        5,
        Math.min(18, Math.round(BASE_ZOOM + Math.log2(transform.k))),
      );
      const zoomRatio = 2 ** (tileZoom - BASE_ZOOM);
      const topLeft = transform.invert([0, 0]);
      const bottomRight = transform.invert([width, height]);
      const minGlobalX =
        (Math.min(topLeft[0], bottomRight[0]) + originPixel[0]) * zoomRatio;
      const maxGlobalX =
        (Math.max(topLeft[0], bottomRight[0]) + originPixel[0]) * zoomRatio;
      const minGlobalY =
        (Math.min(topLeft[1], bottomRight[1]) + originPixel[1]) * zoomRatio;
      const maxGlobalY =
        (Math.max(topLeft[1], bottomRight[1]) + originPixel[1]) * zoomRatio;
      const maxTile = 2 ** tileZoom;
      const tiles: {
        key: string;
        x: number;
        y: number;
        urlX: number;
        urlY: number;
      }[] = [];

      for (
        let tileX = Math.floor(minGlobalX / TILE_SIZE) - 1;
        tileX <= Math.floor(maxGlobalX / TILE_SIZE) + 1;
        tileX += 1
      ) {
        for (
          let tileY = Math.floor(minGlobalY / TILE_SIZE) - 1;
          tileY <= Math.floor(maxGlobalY / TILE_SIZE) + 1;
          tileY += 1
        ) {
          if (tileY < 0 || tileY >= maxTile) continue;
          const wrappedX = ((tileX % maxTile) + maxTile) % maxTile;
          const baseX = (tileX * TILE_SIZE) / zoomRatio - originPixel[0];
          const baseY = (tileY * TILE_SIZE) / zoomRatio - originPixel[1];
          const screenPoint = transform.apply([baseX, baseY]);
          tiles.push({
            key: `${tileZoom}/${tileX}/${tileY}`,
            x: screenPoint[0],
            y: screenPoint[1],
            urlX: wrappedX,
            urlY: tileY,
          });
        }
      }

      const tileSize = (TILE_SIZE / zoomRatio) * transform.k + 0.65;
      tileLayer
        .selectAll<SVGImageElement, (typeof tiles)[number]>('image')
        .data(tiles, (tile) => tile.key)
        .join('image')
        .attr(
          'href',
          (tile) =>
            `https://cyberjapandata.gsi.go.jp/xyz/pale/${tileZoom}/${tile.urlX}/${tile.urlY}.png`,
        )
        .attr('x', (tile) => tile.x)
        .attr('y', (tile) => tile.y)
        .attr('width', tileSize)
        .attr('height', tileSize)
        .attr('preserveAspectRatio', 'none');
    };

    const positionMarkers = (transform: d3.ZoomTransform) => {
      const layout = spreadMarkers(visible, transform, width, height);
      const byId = new Map(layout.map((item) => [item.place.id, item]));
      markers.attr('transform', (place) => {
        const item = byId.get(place.id)!;
        return `translate(${item.position[0]},${item.position[1]})`;
      });
      leaders
        .attr('x1', (place) => byId.get(place.id)!.target[0])
        .attr('y1', (place) => byId.get(place.id)!.target[1])
        .attr('x2', (place) => byId.get(place.id)!.position[0])
        .attr('y2', (place) => byId.get(place.id)!.position[1])
        .attr('opacity', (place) => {
          const item = byId.get(place.id)!;
          return Math.hypot(
            item.target[0] - item.position[0],
            item.target[1] - item.position[1],
          ) > 5
            ? 1
            : 0;
        });
    };

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.45, 24])
      .filter((event) => event.type !== 'wheel' || event.ctrlKey)
      .on('zoom', (event) => {
        renderTiles(event.transform);
        positionMarkers(event.transform);
      });

    zoomRef.current = zoom;
    fitRef.current = fitTransform(visible, width, height);
    svg.call(zoom).call(zoom.transform, fitRef.current);

    return () => {
      svg.on('.zoom', null);
      zoomRef.current = null;
    };
  }, [height, visible, width]);

  useEffect(() => {
    d3.select(svgRef.current)
      .selectAll<SVGGElement, MapPlace>('.place-marker')
      .classed('is-selected', (place) => place.id === effectiveSelectedId);
  }, [effectiveSelectedId]);

  const focusPlace = (place: MapPlace) => {
    setSelectedId(place.id);
    const svgNode = svgRef.current;
    const zoom = zoomRef.current;
    if (!svgNode || !zoom) return;
    const current = d3.zoomTransform(svgNode);
    const scale = Math.max(current.k, 5);
    const [x, y] = projectPlace(place);
    const target = d3.zoomIdentity
      .translate(width / 2 - scale * x, height / 2 - scale * y)
      .scale(scale);
    d3.select(svgNode).transition().duration(430).call(zoom.transform, target);
  };

  const zoomBy = (factor: number) => {
    const svgNode = svgRef.current;
    const zoom = zoomRef.current;
    if (!svgNode || !zoom) return;
    d3.select(svgNode).transition().duration(220).call(zoom.scaleBy, factor);
  };

  const resetMap = () => {
    const svgNode = svgRef.current;
    const zoom = zoomRef.current;
    if (!svgNode || !zoom) return;
    d3.select(svgNode)
      .transition()
      .duration(430)
      .call(zoom.transform, fitRef.current);
  };

  const allKindsActive = CATEGORY_ORDER.every((kind) => activeKinds[kind]);

  return (
    <div className="place-atlas">
      <div className="atlas-toolbar">
        <div className="atlas-kind-filter" aria-label="地点カテゴリ">
          <span>LAYERS</span>
          <button
            className={allKindsActive ? 'active' : ''}
            onClick={() =>
              setActiveKinds({ housing: true, brewery: true, food: true })
            }
          >
            すべて <b>{places.length}</b>
          </button>
          {CATEGORY_ORDER.map((kind) => {
            const meta = MAP_CATEGORY_META[kind];
            const count = places.filter((place) => place.kind === kind).length;
            return (
              <button
                aria-pressed={activeKinds[kind]}
                className={
                  activeKinds[kind] ? `active kind-${kind}` : `kind-${kind}`
                }
                key={kind}
                onClick={() =>
                  setActiveKinds((current) => ({
                    ...current,
                    [kind]: !current[kind],
                  }))
                }
              >
                <i style={{ background: meta.color }} />
                {meta.label} <b>{count}</b>
              </button>
            );
          })}
        </div>
        <label className="atlas-search">
          <span>SEARCH</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="店名・住所・エリアで絞る"
          />
        </label>
        <div className="atlas-result-count">
          <b>{String(visible.length).padStart(2, '0')}</b>
          <span>
            PLACES
            <br />
            VISIBLE
          </span>
        </div>
      </div>

      <div className="atlas-workbench">
        <div className="atlas-map-card" ref={hostRef}>
          <svg ref={svgRef} />
          <div className="atlas-map-controls" aria-label="地図操作">
            <button onClick={() => zoomBy(1.7)} aria-label="拡大">
              ＋
            </button>
            <button onClick={() => zoomBy(1 / 1.7)} aria-label="縮小">
              −
            </button>
            <button className="atlas-reset" onClick={resetMap}>
              全域
            </button>
          </div>
          <div className="atlas-map-guide">
            <span>DRAG TO MOVE</span>
            <span>CTRL + SCROLL TO ZOOM</span>
          </div>
          <div className="atlas-attribution">
            背景：
            <a
              href="https://maps.gsi.go.jp/development/ichiran.html"
              target="_blank"
              rel="noreferrer"
            >
              地理院タイル（淡色地図）
            </a>
          </div>
          {!visible.length && (
            <div className="atlas-map-empty">
              <b>該当地点がありません</b>
              <span>検索語かレイヤーを変更してください</span>
            </div>
          )}
        </div>

        <aside className="atlas-rail" aria-label="地点情報">
          <div className="atlas-selected">
            {selected ? (
              <>
                <div className="atlas-selected-top">
                  <span
                    style={{ color: MAP_CATEGORY_META[selected.kind].color }}
                  >
                    {MAP_CATEGORY_META[selected.kind].label}
                  </span>
                  <time>{selected.observedOn.replaceAll('-', '.')}</time>
                </div>
                <p>{selected.area}</p>
                <h2>{selected.name}</h2>
                <p className="atlas-selected-lead">{selected.lead}</p>
                <div className="atlas-selected-facts">
                  {selected.facts.map((fact) => (
                    <div key={fact.label}>
                      <span>{fact.label}</span>
                      <b>{fact.value}</b>
                    </div>
                  ))}
                </div>
                <address>{selected.address}</address>
                <div className="atlas-selected-links">
                  <a
                    href={sitePath(selected.detailUrl)}
                    target={
                      selected.detailUrl.startsWith('http')
                        ? '_blank'
                        : undefined
                    }
                    rel={
                      selected.detailUrl.startsWith('http')
                        ? 'noreferrer'
                        : undefined
                    }
                  >
                    詳しく見る →
                  </a>
                  <a href={selected.sourceUrl} target="_blank" rel="noreferrer">
                    参照元 ↗
                  </a>
                </div>
              </>
            ) : (
              <div className="atlas-selected-empty">
                <b>地点を選んでください</b>
                <p>地図の点か、下の一覧から選択できます。</p>
              </div>
            )}
          </div>

          <div className="atlas-place-list">
            {visible.map((place, index) => (
              <button
                className={place.id === effectiveSelectedId ? 'selected' : ''}
                key={place.id}
                onClick={() => focusPlace(place)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <i
                  style={{ background: MAP_CATEGORY_META[place.kind].color }}
                />
                <div>
                  <b>{place.name}</b>
                  <small>
                    {MAP_CATEGORY_META[place.kind].label} / {place.area}
                  </small>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
