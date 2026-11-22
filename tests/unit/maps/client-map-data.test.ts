import { describe, expect, it } from "vitest";
import { parseClientMapData } from "@/components/maps/client-map-data";

const client = (id: string, location: unknown = ["23.81", "90.41"]) => ({
  id,
  location,
  status: "active",
  info: { name: `client ${id}`, status: "active", address: null, phone: null },
});

const device = (id: string, clients: unknown[]) => ({
  id,
  location: ["23.80", "90.40"],
  status: "active",
  color: "#3498db",
  info: { name: `device ${id}`, status: "active", type: null },
  client: clients,
});

describe("parseClientMapData", () => {
  it("returns devices with their clients and clients without a device", () => {
    const result = parseClientMapData({
      devices: [device("d1", [client("c1")])],
      clients: [client("c2"), client("c3")],
    });

    expect(result.devices.map((row) => row.id)).toEqual(["d1"]);
    expect(result.devices[0].client.map((row) => row.id)).toEqual(["c1"]);
    expect(result.clients.map((row) => row.id)).toEqual(["c2", "c3"]);
    expect(result.clients[0].location).toEqual([23.81, 90.41]);
  });

  it("still reads the older payload: a plain array of devices", () => {
    const result = parseClientMapData([device("d1", [client("c1")])]);

    expect(result.devices.map((row) => row.id)).toEqual(["d1"]);
    expect(result.clients).toEqual([]);
  });

  it("drops entries that do not match instead of failing the map", () => {
    const result = parseClientMapData({
      devices: [null, "x", device("d1", [client("bad", "not-a-location"), client("c1")])],
      clients: [client("c2"), client("bad", ["x"])],
    });

    expect(result.devices.map((row) => row.id)).toEqual(["d1"]);
    expect(result.devices[0].client.map((row) => row.id)).toEqual(["c1"]);
    expect(result.clients.map((row) => row.id)).toEqual(["c2"]);
  });

  it("returns empty lists for a missing or unexpected payload", () => {
    for (const payload of [undefined, null, "oops", {}]) {
      expect(parseClientMapData(payload)).toEqual({ devices: [], clients: [] });
    }
  });
});
