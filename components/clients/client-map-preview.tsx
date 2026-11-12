"use client";

import "leaflet/dist/leaflet.css";

import { ensureLeafletDefaultIcon, mapIcons } from "@/components/maps/map-utils";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useTranslation } from "react-i18next";

type ClientMapPreviewProps = {
    latitude: number;
    longitude: number;
};

export default function ClientMapPreview({ latitude, longitude }: ClientMapPreviewProps) {
    const { t } = useTranslation();
    ensureLeafletDefaultIcon();
    const position: [number, number] = [latitude, longitude];

    return (
        <MapContainer
            center={position}
            zoom={16}
            scrollWheelZoom={false}
            className="h-48 w-full rounded-md border border-border"
        >
            <TileLayer
                attribution={t("map_common.tile_attribution")}
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={mapIcons.clientActive} />
        </MapContainer>
    );
}
