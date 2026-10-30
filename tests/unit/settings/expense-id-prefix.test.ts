import { describe, expect, it } from "vitest";
import { getSectionFieldKeys, SETTINGS_SECTION_SCHEMA } from "@/components/settings/settings-form-schema";
import { normalizeSettingValueForForm } from "@/components/settings/settings-type";

describe("expense id prefix setting", () => {
    it("sits with the other id prefixes on the general settings form", () => {
        expect(getSectionFieldKeys("general")).toEqual([
            "invoice_prefix",
            "pid_prefix",
            "expense_id_prefix",
            "product_code_prefix",
            "auto_inactive_client_invoice_due",
            "client_view_open_on_new_tab",
            "client_edit_open_on_new_tab",
        ]);
        expect(SETTINGS_SECTION_SCHEMA.general.fields[2]).toEqual({
            kind: "text",
            key: "expense_id_prefix",
        });
    });

    it("shows EXP when the company has not saved a prefix", () => {
        expect(normalizeSettingValueForForm("expense_id_prefix", undefined)).toBe("EXP");
        expect(normalizeSettingValueForForm("expense_id_prefix", null)).toBe("EXP");
        expect(normalizeSettingValueForForm("expense_id_prefix", "")).toBe("EXP");
        expect(normalizeSettingValueForForm("expense_id_prefix", "   ")).toBe("EXP");
    });

    it("keeps a saved prefix", () => {
        expect(normalizeSettingValueForForm("expense_id_prefix", "BILL")).toBe("BILL");
        expect(normalizeSettingValueForForm("expense_id_prefix", " exp ")).toBe("exp");
    });
});

describe("product code prefix setting", () => {
    it("shows PRO when the company has not saved a prefix", () => {
        expect(normalizeSettingValueForForm("product_code_prefix", undefined)).toBe("PRO");
        expect(normalizeSettingValueForForm("product_code_prefix", null)).toBe("PRO");
        expect(normalizeSettingValueForForm("product_code_prefix", "")).toBe("PRO");
        expect(normalizeSettingValueForForm("product_code_prefix", "   ")).toBe("PRO");
    });

    it("keeps a saved prefix", () => {
        expect(normalizeSettingValueForForm("product_code_prefix", "SKU")).toBe("SKU");
        expect(normalizeSettingValueForForm("product_code_prefix", " pro ")).toBe("pro");
    });
});
