import { describe, expect, it } from "vitest";
import { readSetting as normalizeSettingValueForForm } from "@/components/settings/core/values";
import { fieldOf } from "@/components/settings/registry/fields";
import { sectionKeys as getSectionFieldKeys } from "@/components/settings/registry/sections";

describe("expense id prefix setting", () => {
    it("sits with the other id prefixes on the general settings form", () => {
        expect(getSectionFieldKeys("general")).toEqual([
            "invoice_prefix",
            "pid_prefix",
            "expense_id_prefix",
            "product_code_prefix",
            "ticket_code_prefix",
            "payment_deadline",
            "auto_inactive_client_invoice_due",
            "auto_inactive_client_time",
            "client_view_open_on_new_tab",
            "client_edit_open_on_new_tab",
            "create_invoice_billing_type_auto",
        ]);
        expect(getSectionFieldKeys("general")[2]).toBe("expense_id_prefix");
        expect(fieldOf("expense_id_prefix").kind).toBe("text");
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

describe("ticket code prefix setting", () => {
    it("shows TKT when the company has not saved a prefix", () => {
        expect(normalizeSettingValueForForm("ticket_code_prefix", undefined)).toBe("TKT");
        expect(normalizeSettingValueForForm("ticket_code_prefix", null)).toBe("TKT");
        expect(normalizeSettingValueForForm("ticket_code_prefix", "")).toBe("TKT");
        expect(normalizeSettingValueForForm("ticket_code_prefix", "   ")).toBe("TKT");
    });

    it("keeps a saved prefix", () => {
        expect(normalizeSettingValueForForm("ticket_code_prefix", "SUP")).toBe("SUP");
        expect(normalizeSettingValueForForm("ticket_code_prefix", " tkt ")).toBe("tkt");
    });
});
