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
