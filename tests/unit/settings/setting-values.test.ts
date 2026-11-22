import { describe, expect, it } from "vitest";
import expected from "./fixtures/setting-values.json";
import { RAW_INPUTS } from "./setting-inputs";
import { readSetting, toPayload } from "@/components/settings/core/values";
import { SETTING_KEYS, type SettingKey } from "@/components/settings/registry/fields";

// The fixture holds what the settings screens showed and saved before the
// registry refactor (22 Nov 2026). Any change here changes production behavior.
const golden = expected as Record<string, { read: unknown[]; payload: unknown[] }>;

describe("setting values", () => {
  it("covers every registered setting", () => {
    expect([...SETTING_KEYS].sort()).toEqual(Object.keys(golden).sort());
  });

  for (const key of Object.keys(golden) as SettingKey[]) {
    it(`reads and saves ${key} as before`, () => {
      RAW_INPUTS.forEach((raw, index) => {
        expect(readSetting(key, raw) ?? null, `read ${key} ${String(raw)}`).toEqual(golden[key].read[index]);
        expect(toPayload(key, raw), `payload ${key} ${String(raw)}`).toEqual(golden[key].payload[index]);
      });
    });
  }
});
