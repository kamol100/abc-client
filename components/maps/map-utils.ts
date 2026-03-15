import * as L from "leaflet";
import { Icon, type LatLngTuple } from "leaflet";

const DEFAULT_MARKER_SHADOW_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png";

const COLOR_MARKER_BASE_URL =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-";

export const DEFAULT_MAP_CENTER: LatLngTuple = [23.8103, 90.4125];
const LATITUDE_MIN = -90;
const LATITUDE_MAX = 90;
const LONGITUDE_MIN = -180;
const LONGITUDE_MAX = 180;

let defaultIconConfigured = false;

function createColorMarker(
  color: "blue" | "green" | "red" | "violet",
  iconSize: [number, number] = [25, 41],
): Icon {
  return new Icon({
    iconUrl: `${COLOR_MARKER_BASE_URL}${color}.png`,
    shadowUrl: DEFAULT_MARKER_SHADOW_URL,
    iconSize,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

export const mapIcons = {
  clientActive: createColorMarker("blue"),
  clientInactive: createColorMarker("red"),
  tjBox: createColorMarker("violet", [26, 42]),
  device: createColorMarker("green", [26, 42]),
};

export function ensureLeafletDefaultIcon(): void {
  if (defaultIconConfigured) return;

  delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  defaultIconConfigured = true;
}

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
