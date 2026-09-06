'use client';

import { useMemo, useState } from 'react';
import type {
  RestaurantArea,
  RestaurantResearch,
  RestaurantScene,
} from '../data/restaurants';

type AreaFilter = RestaurantArea | 'すべて';
type SceneFilter = RestaurantScene | 'すべて';

const AREA_FILTERS: AreaFilter[] = [
  'すべて',
  '古町',
  '新潟駅・駅南',
  '西蒲・岩室',
];
const SCENE_FILTERS: SceneFilter[] = [
  'すべて',
  'ひとり・軽く',
  '日常使い',
  'デート',
  '記念日',
  '目的地',
];

export default function RestaurantResearch({
  restaurants,
}: {
  restaurants: RestaurantResearch[];
}) {
  const [area, setArea] = useState<AreaFilter>('すべて');
  const [scene, setScene] = useState<SceneFilter>('すべて');

  const visible = useMemo(
    () =>
      restaurants.filter((restaurant) => {
        const matchesArea = area === 'すべて' || restaurant.area === area;
        const matchesScene =
          scene === 'すべて' || restaurant.scenes.includes(scene);
        return matchesArea && matchesScene;
      }),
    [area, restaurants, scene],
  );

  return (
    <section className="food-research" id="research">
      <div className="food-research-heading">
        <div>
          <p className="kicker">RESEARCH INDEX / 02</p>
          <h2>
            誰と、どこで、
            <br />
            何を確かめるか。
          </h2>
        </div>
        <p>
          ランキングではありません。公開された背景を読み、実際に足を運ぶ理由が立つ店を、シーンとエリアから探せます。
        </p>
      </div>

      <div className="food-filters" aria-label="店の絞り込み">
        <div>
          <span>AREA</span>
          {AREA_FILTERS.map((item) => (
            <button
              aria-pressed={area === item}
              className={area === item ? 'active' : ''}
              key={item}
              onClick={() => setArea(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div>
          <span>SCENE</span>
          {SCENE_FILTERS.map((item) => (
            <button
              aria-pressed={scene === item}
              className={scene === item ? 'active' : ''}
              key={item}
              onClick={() => setScene(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <p role="status" aria-live="polite">
          <b>{String(visible.length).padStart(2, '0')}</b> /{' '}
          {String(restaurants.length).padStart(2, '0')} PLACES
        </p>
      </div>

      <div className="restaurant-grid">
        {visible.map((restaurant, index) => (
          <article
            className={`restaurant-card ${restaurant.visited ? 'restaurant-visited' : ''}`}
            key={restaurant.id}
            id={'restaurant-' + restaurant.id}
          >
            <div className="restaurant-card-top">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <small>
                {restaurant.area} / {restaurant.cuisine}
              </small>
              {restaurant.visited && <b>実食済</b>}
            </div>
            <p className="restaurant-en">{restaurant.nameEn}</p>
            <h3>{restaurant.name}</h3>
            <p className="restaurant-lead">{restaurant.lead}</p>

            <details>
              <summary>料理人の背景と訪問メモ</summary>
              <div className="restaurant-story">
                <div>
                  <span>BACKGROUND</span>
                  <p>{restaurant.chefStory}</p>
                </div>
                <div>
                  <span>TASTE READ</span>
                  <p>{restaurant.tasteRead}</p>
                </div>
                <div className="urban-lens">
                  <span>FOR CITY DINERS</span>
                  <p>{restaurant.urbanLens}</p>
                </div>
              </div>
            </details>
            <div className="restaurant-meta">
              <div>
                <span>BUDGET</span>
                <b>{restaurant.budget}</b>
              </div>
              <div>
                <span>SCENE</span>
                <b>{restaurant.scenes.join(' / ')}</b>
              </div>
              <div>
                <span>ADDRESS</span>
                <b>{restaurant.address}</b>
              </div>
            </div>

            <div className="restaurant-sources">
              <span>
                {restaurant.sourceType} / 確認{' '}
                {restaurant.observedOn.replaceAll('-', '.')}
              </span>
              <a href={restaurant.researchUrl} target="_blank" rel="noreferrer">
                参照：{restaurant.researchLabel} ↗
              </a>
              <a href={restaurant.officialUrl} target="_blank" rel="noreferrer">
                {restaurant.officialLabel} ↗
              </a>
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="food-empty">
          <b>この組み合わせは、まだ調査中です。</b>
          <p>フィルターを変えると掲載店が表示されます。</p>
        </div>
      )}
    </section>
  );
}
