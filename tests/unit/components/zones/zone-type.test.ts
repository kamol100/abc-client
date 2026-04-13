import { ZoneFormSchema, ZoneRowSchema } from "@/components/zones/zone-type";

describe("ZoneRowSchema", () => {
  it("parses zone row with coerced numeric values", () => {
    const parsed = ZoneRowSchema.parse({
      id: "7",
      name: "North Zone",
      lat: "23.8103",
      lon: "90.4125",
      subZone: [
        { id: "11", name: "A Block" },
        { id: 12, name: "B Block" },
      ],
    });

    expect(parsed.id).toBe(7);
    expect(parsed.lat).toBeCloseTo(23.8103);
    expect(parsed.lon).toBeCloseTo(90.4125);
    expect(parsed.subZone?.[0]?.id).toBe(11);
  });

  it("keeps unknown keys because schema is passthrough", () => {
    const parsed = ZoneRowSchema.parse({
      id: 1,
      name: "Central",
      custom_flag: true,
    });

    expect(parsed.custom_flag).toBe(true);
  });
});

describe("ZoneFormSchema", () => {
  it("parses valid payload and applies defaults", () => {
    const parsed = ZoneFormSchema.parse({
      name: "Zone East",
      lat: null,
      lon: "91.2",
    });

    expect(parsed).toEqual({
      name: "Zone East",
      name_bn: "",
      lat: null,
      lon: 91.2,
    });
  });

  it("rejects too-short zone name", () => {
    const result = ZoneFormSchema.safeParse({
      name: "A",
      lat: null,
      lon: null,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("zone.name.errors.min");
    }
  });
});
