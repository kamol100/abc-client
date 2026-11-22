"use client";

import "leaflet/dist/leaflet.css";

import { cn } from "@/lib/utils";
import type { LatLngTuple } from "leaflet";
import { Fragment, useEffect, useState } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { useTranslation } from "react-i18next";
import type { ClientMapClient, ClientMapRow } from "@/components/maps/maps-type";
import { ensureLeafletDefaultIcon, mapIcons, normalizeStatus, toLatLngTuple } from "@/components/maps/map-utils";

type Props = {
  /** Devices, each with its clients (marker + line from the device). */
  devices: ClientMapRow[];
  /** Clients without a device: marker only. */
  clients: ClientMapClient[];
  center: LatLngTuple;
  companyName: string;
  companyAddress?: string | null;
  className?: string;
};

const DEFAULT_MAP_CLASS =
  "h-[60vh] min-h-[420px] w-full rounded-md border border-border";

export default function ClientMapsCanvas({
  devices,
  clients,
  center,
  companyName,
  companyAddress,
  className,
}: Props) {
  const { t } = useTranslation();
  const [mapReady, setMapReady] = useState(false);

  ensureLeafletDefaultIcon();

  useEffect(() => {
    setMapReady(true);
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom
      className={cn(DEFAULT_MAP_CLASS, className)}
    >
      {mapReady && (
        <>
          <TileLayer
            attribution={t("map_common.tile_attribution")}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <CircleMarker
            center={center}
            radius={12}
            pathOptions={{ color: "#16a34a", fillColor: "#16a34a", fillOpacity: 1 }}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <div className="font-semibold">
                  {t("client_map.company.label")}: {companyName}
                </div>
                {companyAddress ? (
                  <div>
                    {t("client_map.company.address")}: {companyAddress}
                  </div>
                ) : null}
              </div>
            </Popup>
          </CircleMarker>

          {devices.map((olt, oltIndex) => {
            const oltLocation = toLatLngTuple(olt.location);
            if (!oltLocation) return null;

            const oltColor = olt.color ?? "#64748b";

            return (
              <Fragment key={`olt-${String(olt.id)}-${oltIndex}`}>
                <CircleMarker
                  center={oltLocation}
                  radius={9}
                  pathOptions={{ color: oltColor, fillColor: oltColor, fillOpacity: 1 }}
                >
                  <Popup>
                    <div className="text-sm">
                      {t("client_map.olt.device")}:{" "}
                      {olt.info?.name ?? t("map_common.not_available")}
                    </div>
                  </Popup>
                </CircleMarker>

                <Polyline
                  positions={[center, oltLocation]}
                  pathOptions={{ color: "#64748b", dashArray: "5,5", weight: 2 }}
                />

                {olt.client.map((client, clientIndex) => {
                  const clientLocation = toLatLngTuple(client.location);
                  if (!clientLocation) return null;

                  return (
                    <Fragment
                      key={`client-${String(olt.id)}-${String(client.id)}-${clientIndex}`}
                    >
                      <ClientMarker client={client} position={clientLocation} />

                      <Polyline
                        positions={[oltLocation, clientLocation]}
                        pathOptions={{ color: oltColor, weight: 2 }}
                      />
                    </Fragment>
                  );
                })}
              </Fragment>
            );
          })}

          {clients.map((client, clientIndex) => {
            const clientLocation = toLatLngTuple(client.location);
            if (!clientLocation) return null;

            return (
              <ClientMarker
                key={`client-${String(client.id)}-${clientIndex}`}
                client={client}
                position={clientLocation}
              />
            );
          })}
        </>
      )}
    </MapContainer>
  );
}

/** One client: active/inactive pin with name, status, address and phone. */
function ClientMarker({ client, position }: { client: ClientMapClient; position: LatLngTuple }) {
  const { t } = useTranslation();
  const status = normalizeStatus(client.info?.status ?? client.status);
  const statusLabelKey =
    status === "active"
      ? "client_map.status.active"
      : status === "inactive"
        ? "client_map.status.inactive"
        : "client_map.status.unknown";

  return (
    <Marker
      position={position}
      icon={status === "active" ? mapIcons.clientActive : mapIcons.clientInactive}
    >
      <Popup>
        <div className="space-y-1 text-sm">
          <div className="font-semibold">
            {t("client_map.client.label")}:{" "}
            {client.info?.name ?? t("map_common.not_available")}
          </div>
          <div>
            {t("client_map.client.status")}: {t(statusLabelKey)}
          </div>
          {client.info?.address ? (
            <div>
              {t("client_map.client.address")}: {client.info.address}
            </div>
          ) : null}
          {client.info?.phone ? (
            <div>
              {t("client_map.client.phone")}: {client.info.phone}
            </div>
          ) : null}
        </div>
      </Popup>
    </Marker>
  );
}
