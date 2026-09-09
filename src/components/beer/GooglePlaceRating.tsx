import { useEffect, useState } from 'react';
import {
  fetchLiveGoogleRating,
  googlePlacesConfigured,
  type LiveGoogleRating,
} from '@/lib/googlePlaces';
import '@/styles/google-places.css';

interface Props {
  placeId: string | null;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  fallbackMapsUrl: string | null;
}

type Status = 'loading' | 'ready' | 'unconfigured' | 'error';

export default function GooglePlaceRating(props: Props) {
  const [status, setStatus] = useState<Status>(
    googlePlacesConfigured ? 'loading' : 'unconfigured',
  );
  const [rating, setRating] = useState<LiveGoogleRating | null>(null);

  useEffect(() => {
    if (!googlePlacesConfigured) return;
    let cancelled = false;

    fetchLiveGoogleRating(props)
      .then((result) => {
        if (cancelled) return;
        setRating(result);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [props.placeId, props.name, props.address, props.latitude, props.longitude]);

  const sourceUrl = rating?.sourceUrl ?? props.fallbackMapsUrl;

  return (
    <div className="google-rating-live" aria-live="polite">
      {status === 'loading' && <span>読み込み中…</span>}
      {status === 'unconfigured' && <span>Google連携の設定待ち</span>}
      {status === 'error' && <span>現在取得できません</span>}
      {status === 'ready' && (
        <>
          <strong>
            {rating?.score == null ? '評価なし' : rating.score.toFixed(1)}
          </strong>
          {rating?.reviewCount != null && <span>（{rating.reviewCount}件）</span>}
        </>
      )}
      <div className="google-maps-attribution">
        {sourceUrl ? (
          <a href={sourceUrl} target="_blank" rel="noreferrer">
            Google Maps ↗
          </a>
        ) : (
          <span>Google Maps</span>
        )}
        {rating?.attributions.map((item) =>
          item.providerURI ? (
            <a
              key={`${item.provider}-${item.providerURI}`}
              href={item.providerURI}
              target="_blank"
              rel="noreferrer"
            >
              {item.provider}
            </a>
          ) : (
            <span key={item.provider}>{item.provider}</span>
          ),
        )}
      </div>
    </div>
  );
}
