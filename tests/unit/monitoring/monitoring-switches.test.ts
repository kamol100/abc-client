import { describe, expect, it } from "vitest";
import DeviceFormFieldSchema from "@/components/device/device-form-schema";
import { DeviceFormSchema } from "@/components/device/device-type";
import { monitoringStatus } from "@/components/monitoring/monitoring-format";
import { SETTINGS_SECTION_SCHEMA } from "@/components/settings/settings-form-schema";
import {
    isSettingsSelectKey,
    normalizeSettingValueForForm,
    toSettingsPayloadValue,
} from "@/components/settings/settings-type";
import bn from "@/public/lang/bn.json";
import en from "@/public/lang/en.json";

const device = { name: "Core OLT", network_id: 1, device_type_id: 2 };

describe("monitoring settings section", () => {
    const fields = SETTINGS_SECTION_SCHEMA.monitoring.fields;
    const options = (key: string) => {
        const field = fields.find((item) => item.key === key);
        return field?.kind === "select" ? field.options : [];
    };

    it("offers the intervals the API accepts, with off first", () => {
        expect(options("device_monitor_interval").map((option) => option.value)).toEqual([0, 1, 2, 5, 10, 15, 30, 60]);
        expect(options("device_monitor_fail_threshold").map((option) => option.value)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(fields.every((field) => isSettingsSelectKey(field.key))).toBe(true);
    });

    it("has English and Bengali text for every option, field and the section", () => {
        const labels = fields.flatMap((field) => (field.kind === "select" ? field.options.map((option) => option.label) : []));
        const keys = [
            ...labels,
            SETTINGS_SECTION_SCHEMA.monitoring.title,
            SETTINGS_SECTION_SCHEMA.monitoring.description,
            ...fields.flatMap((field) => [`settings.fields.${field.key}.label`, `settings.fields.${field.key}.placeholder`]),
            "menu.settings.monitoring.title",
            "device.monitor_enabled.label",
            "device.monitor_enabled.tooltip",
            "monitoring.off_hint.device",
            "monitoring.off_hint.company",
            "monitoring.off_hint.devices",
            "monitoring.off_hint.settings",
        ];
        const lookup = (messages: unknown, key: string) =>
            key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], messages);

        for (const key of keys) {
            expect(lookup(en, key), `en ${key}`).toBeTypeOf("string");
            expect(lookup(bn, key), `bn ${key}`).toBeTypeOf("string");
        }
    });

    it("shows checks off and 2 failed checks until the company saves a value", () => {
        expect(normalizeSettingValueForForm("device_monitor_interval", undefined)).toBe(0);
        expect(normalizeSettingValueForForm("device_monitor_interval", "15")).toBe(15);
        expect(normalizeSettingValueForForm("device_monitor_fail_threshold", null)).toBe(2);
        expect(normalizeSettingValueForForm("device_monitor_fail_threshold", "5")).toBe(5);
    });

    it("sends 0 for off, not null", () => {
        expect(toSettingsPayloadValue("device_monitor_interval", 0)).toBe(0);
        expect(toSettingsPayloadValue("device_monitor_fail_threshold", 3)).toBe(3);
    });
});

describe("device form monitor_enabled", () => {
    it("has a switch for it", () => {
        expect(DeviceFormFieldSchema().find((field) => field.name === "monitor_enabled")?.type).toBe("switch");
    });

    it("keeps the value in the payload", () => {
        expect(DeviceFormSchema.parse({ ...device, monitor_enabled: true }).monitor_enabled).toBe(true);
        expect(DeviceFormSchema.parse({ ...device, monitor_enabled: false }).monitor_enabled).toBe(false);
    });
});

describe("monitoring status", () => {
    it("is live only when the device switch and the company interval are both on", () => {
        expect(monitoringStatus(true, true)).toEqual({ deviceOff: false, companyOff: false, live: true });
    });

    it("names the device switch when only it is off", () => {
        expect(monitoringStatus(false, true)).toEqual({ deviceOff: true, companyOff: false, live: false });
    });

    it("names the company interval when only it is off, even with the device switch on", () => {
        expect(monitoringStatus(true, false)).toEqual({ deviceOff: false, companyOff: true, live: false });
    });

    it("names both when both are off", () => {
        expect(monitoringStatus(false, false)).toEqual({ deviceOff: true, companyOff: true, live: false });
    });
});
