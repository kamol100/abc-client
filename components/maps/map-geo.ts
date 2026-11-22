/**
 * Map helpers with no Leaflet import, so pages can use them during server
 * rendering. Leaflet itself touches `window` when it loads; keep it in
 * map-utils.ts and in the map canvases (loaded with `ssr: false`).
 */

import type { LatLngTuple } from "leaflet";

export const DEFAULT_MAP_CENTER: LatLngTuple = [23.8103, 90.4125];
const LATITUDE_MIN = -90;
const LATITUDE_MAX = 90;
const LONGITUDE_MIN = -180;
const LONGITUDE_MAX = 180;

function toFiniteNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isValidLatitude(value: number): boolean {
  return value >= LATITUDE_MIN && value <= LATITUDE_MAX;
}

function isValidLongitude(value: number): boolean {
  return value >= LONGITUDE_MIN && value <= LONGITUDE_MAX;
}

export function toLatLngTuple(value: unknown): LatLngTuple | null {
  if (!Array.isArray(value) || value.length < 2) return null;

  const first = toFiniteNumber(value[0]);
  const second = toFiniteNumber(value[1]);

  if (first === null || second === null) return null;

  if (isValidLatitude(first) && isValidLongitude(second)) {
    return [first, second];
  }

  // Some APIs occasionally return [lng, lat] instead of [lat, lng].
  if (isValidLongitude(first) && isValidLatitude(second)) {
    return [second, first];
  }

  return null;
}

export function resolveMapCenter(lat: unknown, lon: unknown): LatLngTuple {
  const latValue = toFiniteNumber(lat);
  const lonValue = toFiniteNumber(lon);

  if (latValue === null || lonValue === null) return DEFAULT_MAP_CENTER;
  if (!isValidLatitude(latValue) || !isValidLongitude(lonValue)) {
    return DEFAULT_MAP_CENTER;
  }
  return [latValue, lonValue];
}

export function normalizeStatus(value: unknown): "active" | "inactive" | "unknown" {
  if (typeof value === "number") {
    if (value === 1) return "active";
    if (value === 0) return "inactive";
  }

  if (typeof value !== "string") return "unknown";

  const normalized = value.trim().toLowerCase();

  if (normalized === "1" || normalized === "active" || normalized === "online") {
    return "active";
  }

  if (normalized === "0" || normalized === "inactive" || normalized === "offline") {
    return "inactive";
  }

  return "unknown";
}

export function getSettingString(
  source: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}
