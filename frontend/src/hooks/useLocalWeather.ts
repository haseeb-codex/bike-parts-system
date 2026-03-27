import { useEffect, useMemo, useState } from 'react';

interface OpenMeteoCurrentResponse {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
  current_weather?: {
    temperature?: number;
    weathercode?: number;
  };
  timezone?: string;
}

interface BigDataCloudResponse {
  locality?: string;
  city?: string;
  principalSubdivision?: string;
  countryName?: string;
}

interface NominatimResponse {
  address?: {
    suburb?: string;
    neighbourhood?: string;
    village?: string;
    town?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

interface MapsCoReverseResponse {
  address?: {
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    village?: string;
    town?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface WeatherState {
  loading: boolean;
  locationLabel: string | null;
  temperatureC: number | null;
  conditionLabel: string | null;
  debugCode: string;
}

interface IpGeoResponse {
  success?: boolean;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
}

interface IpApiCoResponse {
  latitude?: number;
  longitude?: number;
  city?: string;
  country_name?: string;
}

function mapWeatherCodeToText(code?: number): string {
  if (code === undefined) return 'Unknown';
  if (code === 0) return 'Clear';
  if (code === 1 || code === 2 || code === 3) return 'Cloudy';
  if (code === 45 || code === 48) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Thunderstorm';
  return 'Weather';
}

function mapLanguageToApi(language: string): string {
  if (language === 'nl') return 'nl';
  if (language === 'ur') return 'ur';
  if (language === 'ar') return 'ar';
  return 'en';
}

function getAreaFromTimezone(timezone?: string): string | null {
  if (!timezone) return null;

  const region = timezone.split('/').pop();
  if (!region) return null;

  return region.replace(/_/g, ' ');
}

function joinLocationParts(parts: Array<string | undefined | null>): string | null {
  const cleaned = Array.from(new Set(parts.filter(Boolean).map((part) => String(part).trim())));
  if (cleaned.length === 0) return null;
  return cleaned.join(', ');
}

export function useLocalWeather(language: string) {
  const [state, setState] = useState<WeatherState>({
    loading: true,
    locationLabel: null,
    temperatureC: null,
    conditionLabel: null,
    debugCode: 'init',
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchDetailedAreaName(latitude: number, longitude: number, lang: string) {
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${lang}`
        );

        if (response.ok) {
          const data = (await response.json()) as BigDataCloudResponse;
          const label = joinLocationParts([data.locality, data.city, data.countryName]);
          if (label) {
            return { label, debugCode: 'area-bigdatacloud-ok' };
          }
        }
      } catch {
        // Continue to the next provider.
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1&accept-language=${lang}`
        );

        if (response.ok) {
          const data = (await response.json()) as NominatimResponse;
          const label = joinLocationParts([
            data.address?.suburb || data.address?.neighbourhood || data.address?.village,
            data.address?.city || data.address?.town || data.address?.county || data.address?.state,
            data.address?.country,
          ]);

          if (label) {
            return { label, debugCode: 'area-nominatim-ok' };
          }
        }
      } catch {
        // Continue to existing open-meteo/cached fallbacks.
      }

      try {
        const response = await fetch(
          `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`
        );

        if (response.ok) {
          const data = (await response.json()) as MapsCoReverseResponse;
          const label = joinLocationParts([
            data.address?.suburb ||
              data.address?.neighbourhood ||
              data.address?.quarter ||
              data.address?.village,
            data.address?.city || data.address?.town || data.address?.state,
            data.address?.country,
          ]);

          if (label) {
            return { label, debugCode: 'area-mapsco-ok' };
          }
        }
      } catch {
        // Continue to existing open-meteo/cached fallbacks.
      }

      return null;
    }

    async function fetchIpApproximateLocation() {
      try {
        const response = await fetch('https://ipwho.is/');
        if (!response.ok) {
          if (!cancelled) {
            setState((previous) => ({ ...previous, debugCode: 'ipwho-http-failed' }));
          }
          return null;
        }

        const data = (await response.json()) as IpGeoResponse;
        if (
          !data.success ||
          typeof data.latitude !== 'number' ||
          typeof data.longitude !== 'number'
        ) {
          if (!cancelled) {
            setState((previous) => ({ ...previous, debugCode: 'ipwho-invalid-payload' }));
          }
          return null;
        }

        const city = data.city || 'Current area';
        const country = data.country;

        return {
          latitude: data.latitude,
          longitude: data.longitude,
          locationLabel: country ? `${city}, ${country}` : city,
        };
      } catch {
        if (!cancelled) {
          setState((previous) => ({ ...previous, debugCode: 'ipwho-fetch-failed' }));
        }
        // Try second provider when ipwho.is is blocked or unavailable.
        try {
          const response = await fetch('https://ipapi.co/json/');
          if (!response.ok) {
            if (!cancelled) {
              setState((previous) => ({ ...previous, debugCode: 'ipapi-http-failed' }));
            }
            return null;
          }

          const data = (await response.json()) as IpApiCoResponse;
          if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
            if (!cancelled) {
              setState((previous) => ({ ...previous, debugCode: 'ipapi-invalid-payload' }));
            }
            return null;
          }

          const city = data.city || 'Current area';
          const country = data.country_name;

          return {
            latitude: data.latitude,
            longitude: data.longitude,
            locationLabel: country ? `${city}, ${country}` : city,
          };
        } catch {
          if (!cancelled) {
            setState((previous) => ({ ...previous, debugCode: 'ipapi-fetch-failed' }));
          }
          return null;
        }
      }
    }

    async function loadWeatherByCoordinates(
      latitude: number,
      longitude: number,
      fallbackLocationLabel?: string
    ) {
      const lang = mapLanguageToApi(language);

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;
      const weatherFallbackUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;

      try {
        if (!cancelled) {
          setState((previous) => ({ ...previous, debugCode: 'weather-fetching' }));
        }

        let weatherRes = await fetch(weatherUrl);
        if (!weatherRes.ok) {
          weatherRes = await fetch(weatherFallbackUrl);
        }

        if (!weatherRes.ok) {
          if (!cancelled) {
            setState((previous) => ({ ...previous, debugCode: 'weather-http-failed' }));
          }
          throw new Error('Failed weather request');
        }

        const weatherJson = (await weatherRes.json()) as OpenMeteoCurrentResponse;

        if (cancelled) return;

        let locationLabel = fallbackLocationLabel || null;

        // Prime a reliable fallback from IP city/country before fine-grained reverse geocoding.
        if (!locationLabel) {
          const ipLocation = await fetchIpApproximateLocation();
          if (ipLocation) {
            locationLabel = ipLocation.locationLabel;
            if (!cancelled) {
              setState((previous) => ({ ...previous, debugCode: 'area-ip-fallback-ok' }));
            }
          }
        }

        const detailedArea = await fetchDetailedAreaName(latitude, longitude, lang);
        if (detailedArea) {
          locationLabel = detailedArea.label;
          if (!cancelled) {
            setState((previous) => ({ ...previous, debugCode: detailedArea.debugCode }));
          }
        }

        const temperatureRaw =
          weatherJson.current?.temperature_2m ?? weatherJson.current_weather?.temperature;
        const weatherCode =
          weatherJson.current?.weather_code ?? weatherJson.current_weather?.weathercode;

        if (!locationLabel) {
          locationLabel = getAreaFromTimezone(weatherJson.timezone);
        }

        if (!locationLabel) {
          locationLabel = `Lat ${latitude.toFixed(2)}, Lon ${longitude.toFixed(2)}`;
        }

        if (temperatureRaw === undefined && weatherCode === undefined) {
          if (!cancelled) {
            setState((previous) => ({ ...previous, debugCode: 'weather-empty-payload' }));
          }
        }

        setState({
          loading: false,
          locationLabel,
          temperatureC: typeof temperatureRaw === 'number' ? Math.round(temperatureRaw) : null,
          conditionLabel: mapWeatherCodeToText(weatherCode),
          debugCode: 'weather-ok',
        });
      } catch {
        if (cancelled) return;
        setState({
          loading: false,
          locationLabel: fallbackLocationLabel || 'Current area',
          temperatureC: null,
          conditionLabel: null,
          debugCode: 'weather-catch-failed',
        });
      }
    }

    async function loadFromIpFallback() {
      const ipLocation = await fetchIpApproximateLocation();
      if (!ipLocation) {
        if (cancelled) return;
        setState({
          loading: false,
          locationLabel: 'Current area',
          temperatureC: null,
          conditionLabel: null,
          debugCode: 'ip-fallback-failed',
        });
        return;
      }

      if (!cancelled) {
        setState((previous) => ({ ...previous, debugCode: 'ip-fallback-success' }));
      }

      await loadWeatherByCoordinates(
        ipLocation.latitude,
        ipLocation.longitude,
        ipLocation.locationLabel
      );
    }

    if (!navigator.geolocation) {
      if (!cancelled) {
        setState((previous) => ({ ...previous, debugCode: 'geolocation-unavailable' }));
      }
      void loadFromIpFallback();
      return () => {
        cancelled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!cancelled) {
          setState((previous) => ({ ...previous, debugCode: 'geolocation-success' }));
        }
        void loadWeatherByCoordinates(position.coords.latitude, position.coords.longitude);
      },
      () => {
        if (!cancelled) {
          setState((previous) => ({ ...previous, debugCode: 'geolocation-denied-or-timeout' }));
        }
        void loadFromIpFallback();
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
      }
    );

    return () => {
      cancelled = true;
    };
  }, [language]);

  const weatherText = useMemo(() => {
    if (state.loading) return 'Loading weather...';
    if (state.temperatureC === null && !state.conditionLabel) {
      return 'Weather unavailable';
    }

    const location = state.locationLabel || 'Current area';
    const temperature = state.temperatureC !== null ? `${state.temperatureC}°C` : null;
    const condition = state.conditionLabel || 'Weather';

    return [location, temperature, condition].filter(Boolean).join(' • ');
  }, [state.conditionLabel, state.loading, state.locationLabel, state.temperatureC]);

  return {
    ...state,
    weatherText,
    debugCode: state.debugCode,
  };
}
