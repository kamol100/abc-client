import ZoneFormFieldSchema from "@/components/zones/zone-form-schema";

describe("ZoneFormFieldSchema", () => {
  it("returns the expected zone form field list", () => {
    const fields = ZoneFormFieldSchema();

    expect(fields).toHaveLength(3);
    expect(fields.map((field) => field.name)).toEqual(["name", "lat", "lon"]);
    expect(fields.map((field) => field.type)).toEqual(["text", "number", "number"]);
  });

  it("marks name as mandatory and keeps coordinate fields optional", () => {
    const fields = ZoneFormFieldSchema();
    const nameField = fields[0];
    const latitudeField = fields[1];
    const longitudeField = fields[2];

    expect(nameField.label?.mandatory).toBe(true);
    expect(nameField.label?.labelText).toBe("zone.name.label");
    expect(latitudeField.label?.mandatory).toBeUndefined();
    expect(longitudeField.label?.mandatory).toBeUndefined();
  });
});
