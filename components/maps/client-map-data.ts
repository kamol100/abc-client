/**
 * Turns the `client-maps` API payload into what the map draws:
 *
 * - devices: each device with its clients (marker + line from the device).
 * - clients: clients without a device, drawn on their own (marker only).
 *
 * The API sends `{ devices, clients }`. A plain array (the older payload,
 * devices only) is still accepted. Rows or clients that do not match the
 * schema are dropped instead of failing the whole map.
 */

import {
  ClientMapClientSchema,
  ClientMapRowSchema,
  type ClientMapClient,
  type ClientMapRow,
} from "@/components/maps/maps-type";

export type ClientMapData = {
  devices: ClientMapRow[];
  clients: ClientMapClient[];
};

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function parseClients(value: unknown): ClientMapClient[] {
  return asArray(value).flatMap((client) => {
    const parsed = ClientMapClientSchema.safeParse(client);
    return parsed.success ? [parsed.data] : [];
  });
}

function parseDevices(value: unknown): ClientMapRow[] {
  return asArray(value).flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const parsed = ClientMapRowSchema.safeParse({
      ...row,
      client: parseClients((row as { client?: unknown }).client),
    });
    return parsed.success ? [parsed.data] : [];
  });
}

export function parseClientMapData(data: unknown): ClientMapData {
  if (Array.isArray(data)) return { devices: parseDevices(data), clients: [] };
  if (!data || typeof data !== "object") return { devices: [], clients: [] };

  const payload = data as { devices?: unknown; clients?: unknown };
  return { devices: parseDevices(payload.devices), clients: parseClients(payload.clients) };
}
