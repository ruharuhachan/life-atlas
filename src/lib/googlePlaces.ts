export interface GooglePlaceAttribution {
  provider: string;
  providerURI: string | null;
}

export interface LiveGoogleRating {
  score: number | null;
  reviewCount: number | null;
  sourceUrl: string | null;
  attributions: GooglePlaceAttribution[];
  placeId: string | null;
}

interface GooglePlaceLike {
  id?: string;
  rating?: number | null;
  userRatingCount?: number | null;
  googleMapsURI?: string | null;
  attributions?: Array<{
    provider?: string | null;
    providerURI?: string | null;
  }>;
  fetchFields(options: { fields: string[] }): Promise<void>;
}

interface GooglePlaceConstructor {
  new (options: {
    id: string;
    requestedLanguage?: string;
    requestedRegion?: string;
  }): GooglePlaceLike;
  searchByText(options: {
    textQuery: string;
    fields: string[];
    language?: string;
    region?: string;
    maxResultCount?: number;
    locationBias?: { lat: number; lng: number };
  }): Promise<{ places: GooglePlaceLike[] }>;
}

interface GoogleMapsLike {
  importLibrary(name: 'places'): Promise<{ Place: GooglePlaceConstructor }>;
}

declare global {
  interface Window {
    google?: {
      maps?: GoogleMapsLike;
    };
  }
}

const apiKey = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';
export const googlePlacesConfigured = apiKey.length > 0;

let loaderPromise: Promise<GoogleMapsLike> | null = null;

function loadGoogleMaps(): Promise<GoogleMapsLike> {
  if (!apiKey) {
    return Promise.reject(
      new Error('Google Maps browser API key is not configured'),
    );
  }
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error('Google Maps can only be loaded in a browser'),
    );
  }
  if (window.google?.maps?.importLibrary) {
    return Promise.resolve(window.google.maps);
  }
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const finish = () => {
      if (window.google?.maps?.importLibrary) {
        resolve(window.google.maps);
      } else {
        reject(
          new Error('Google Maps JavaScript API loaded without importLibrary'),
        );
      }
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-life-atlas-google-maps]',
    );
    if (existing) {
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load Google Maps JavaScript API')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.dataset.lifeAtlasGoogleMaps = 'true';
    script.async = true;
    script.src =
      'https://maps.googleapis.com/maps/api/js' +
      `?key=${encodeURIComponent(apiKey)}` +
      '&v=weekly&loading=async&libraries=places&language=ja&region=JP';
    script.addEventListener('load', finish, { once: true });
    script.addEventListener(
      'error',
      () => reject(new Error('Failed to load Google Maps JavaScript API')),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return loaderPromise;
}

export async function fetchLiveGoogleRating(input: {
  placeId: string | null;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  fallbackMapsUrl: string | null;
}): Promise<LiveGoogleRating> {
  const maps = await loadGoogleMaps();
  const { Place } = await maps.importLibrary('places');

  let place: GooglePlaceLike | undefined;
  if (input.placeId) {
    place = new Place({
      id: input.placeId,
      requestedLanguage: 'ja',
      requestedRegion: 'JP',
    });
    await place.fetchFields({
      fields: ['rating', 'userRatingCount', 'googleMapsURI'],
    });
  } else {
    const result = await Place.searchByText({
      textQuery: `${input.name} ${input.address}`,
      fields: ['id', 'rating', 'userRatingCount', 'googleMapsURI'],
      language: 'ja',
      region: 'jp',
      maxResultCount: 1,
      locationBias: { lat: input.latitude, lng: input.longitude },
    });
    place = result.places[0];
  }

  if (!place) {
    return {
      score: null,
      reviewCount: null,
      sourceUrl: input.fallbackMapsUrl,
      attributions: [],
      placeId: input.placeId,
    };
  }

  return {
    score: place.rating ?? null,
    reviewCount: place.userRatingCount ?? null,
    sourceUrl: place.googleMapsURI ?? input.fallbackMapsUrl,
    attributions: (place.attributions ?? [])
      .filter((item) => item.provider)
      .map((item) => ({
        provider: item.provider ?? '',
        providerURI: item.providerURI ?? null,
      })),
    placeId: place.id ?? input.placeId,
  };
}
