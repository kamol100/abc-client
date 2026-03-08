"use client";

import "leaflet/dist/leaflet.css";

import { cn } from "@/lib/utils";
import type { LatLngTuple } from "leaflet";
import { Fragment } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { useTranslation } from "react-i18next";
import type { TjBoxMapRow } from "@/components/maps/maps-type";
import { ensureLeafletDefaultIcon, mapIcons, normalizeStatus, toLatLngTuple } from "@/components/maps/map-utils";

type Props = {
  data: TjBoxMapRow[];
  center: LatLngTuple;
  className?: string;
};

const DEFAULT_MAP_CLASS =
  "h-[60vh] min-h-[420px] w-full rounded-md border border-border";

export default function TjBoxMapsCanvas({ data, center, className }: Props) {
  const { t } = useTranslation();

  ensureLeafletDefaultIcon();

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom
      className={cn(DEFAULT_MAP_CLASS, className)}
    >
      <TileLayer
        attribution={t("map_common.tile_attribution")}
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <CircleMarker
        center={center}
        radius={12}
        pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 1 }}
      >
        <Popup>{t("tj_box_map.office")}</Popup>
      </CircleMarker>

      {data.map((marker, markerIndex) => {
        const boxLocation = toLatLngTuple(marker.geocode);
        if (!boxLocation) return null;

        const status = normalizeStatus(marker.info?.status ?? marker.status);
        const statusLabelKey =
          status === "active"
            ? "tj_box_map.status.active"
            : status === "inactive"
              ? "tj_box_map.status.inactive"
              : "tj_box_map.status.unknown";

        const deviceLocation = toLatLngTuple(marker.device?.geocode);
        const deviceStatus = normalizeStatus(marker.device?.status);
        const deviceStatusLabelKey =
          deviceStatus === "active"
            ? "tj_box_map.status.active"
            : deviceStatus === "inactive"
              ? "tj_box_map.status.inactive"
              : "tj_box_map.status.unknown";

        return (
          <Fragment key={`tj-box-${String(marker.id ?? markerIndex)}-${markerIndex}`}>
            <Marker position={boxLocation} icon={mapIcons.tjBox}>
              <Popup>
                <div className="space-y-1 text-sm">
                  <div className="font-semibold">
                    {t("tj_box_map.box.name")}:{" "}
                    {marker.info?.name ?? t("map_common.not_available")}
                  </div>
                  <div>
                    {t("tj_box_map.box.status")}: {t(statusLabelKey)}
                  </div>
                </div>
              </Popup>
            </Marker>

            {deviceLocation ? (
              <>
                <Marker position={deviceLocation} icon={mapIcons.device}>
                  <Popup>
                    <div className="space-y-1 text-sm">
                      <div className="font-semibold">
                        {t("tj_box_map.device.name")}:{" "}
                        {marker.device?.name ?? t("map_common.not_available")}
                      </div>
                      <div>
                        {t("tj_box_map.device.status")}: {t(deviceStatusLabelKey)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
                <Polyline
                  positions={[boxLocation, deviceLocation]}
                  pathOptions={{
                    color: deviceStatus === "active" ? "#16a34a" : "#dc2626",
                    weight: 3,
                  }}
                />
              </>
            ) : null}
          </Fragment>
        );
      })}
    </MapContainer>
  );
}
