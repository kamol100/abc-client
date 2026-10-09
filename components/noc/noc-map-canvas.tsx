"use client";

import "leaflet/dist/leaflet.css";

import { latLngBounds, type LatLngTuple } from "leaflet";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { useTranslation } from "react-i18next";

export interface NocMapMarker {
    id: string;
    name: string;
    position: LatLngTuple;
    text: string;
}

/** Leaflet map of the down devices (red circles), same OSM tiles as the client map. */
export default function NocMapCanvas({ markers }: { markers: NocMapMarker[] }) {
    const { t } = useTranslation();

    // One device: centre on it; several: fit them all (MapContainer reads these once, on mount).
    const view =
        markers.length > 1
            ? { bounds: latLngBounds(markers.map((marker) => marker.position)).pad(0.2) }
            : { center: markers[0]?.position, zoom: 15 };

    return (
        <MapContainer {...view} scrollWheelZoom={false} className="h-[340px] w-full rounded-md border border-border">
            <TileLayer
                attribution={t("map_common.tile_attribution")}
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker) => (
                <CircleMarker
                    key={marker.id}
                    center={marker.position}
                    radius={9}
                    pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.35, weight: 2 }}
                >
                    <Popup>
                        <div className="text-sm">
                            <div className="font-semibold">{marker.name}</div>
                            <div>{marker.text}</div>
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
}
