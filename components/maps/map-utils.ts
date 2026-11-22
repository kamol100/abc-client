import * as L from "leaflet";
import { Icon } from "leaflet";

export {
  DEFAULT_MAP_CENTER,
  getSettingString,
  normalizeStatus,
  resolveMapCenter,
  toLatLngTuple,
} from "@/components/maps/map-geo";

const DEFAULT_MARKER_SHADOW_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png";

const COLOR_MARKER_BASE_URL =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-";

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

const DEVICE_ICON_FALLBACK_COLOR = "#64748b";
const deviceIconCache = new Map<string, L.DivIcon>();

/**
 * Device marker: a router symbol on a rounded square in the device's line
 * colour, so a device and its client lines match. The colour comes from the
 * API, so only a plain hex value is used. The background is set inline
 * because each device has its own colour (a Leaflet HTML string, not JSX).
 */
export function deviceIcon(color: string | null | undefined): L.DivIcon {
  const safeColor = color && /^#[0-9a-f]{3,8}$/i.test(color) ? color : DEVICE_ICON_FALLBACK_COLOR;
  const cached = deviceIconCache.get(safeColor);
  if (cached) return cached;

  const icon = L.divIcon({
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    html: `<div class="flex size-8 items-center justify-center rounded-lg border-2 border-white shadow-md" style="background-color:${safeColor}">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6.01 18H6"/><path d="M10.01 18H10"/><path d="M15 10v4"/><path d="M17.84 7.17a4 4 0 0 0-5.66 0"/><path d="M20.66 4.34a8 8 0 0 0-11.31 0"/>
      </svg>
    </div>`,
  });
  deviceIconCache.set(safeColor, icon);
  return icon;
}
