import { describe, expect, it } from "vitest";
import expected from "./fixtures/setting-values.json";
import { RAW_INPUTS } from "./setting-inputs";
import { readSetting, toPayload } from "@/components/settings/core/values";
import { SETTING_KEYS, type SettingKey } from "@/components/settings/registry/fields";

// The fixture holds what the settings screens showed and saved before the
// registry refactor (22 Nov 2026). Any change here changes production behavior.
const golden = expected as Record<string, { read: unknown[]; payload: unknown[] }>;

describe("setting values", () => {
  // অ্যাপের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «covers every registered setting»।
  it("Setting value conversion: cover every registered setting in the expected-value fixture", () => {
    expect([...SETTING_KEYS].sort()).toEqual(Object.keys(golden).sort());
  });

  for (const key of Object.keys(golden) as SettingKey[]) {
    // অ্যাপের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «reads and saves ${key} as before»।
    it(`Setting value conversion: Read and save ${key}: return the expected normalized input and request value`, () => {
      RAW_INPUTS.forEach((raw, index) => {
        expect(readSetting(key, raw) ?? null, `read ${key} ${String(raw)}`).toEqual(golden[key].read[index]);
        expect(toPayload(key, raw), `payload ${key} ${String(raw)}`).toEqual(golden[key].payload[index]);
      });
    });
  }
});
