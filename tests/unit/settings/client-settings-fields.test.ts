import { describe, expect, it } from "vitest";
import { sectionKeys } from "@/components/settings/registry/sections";

const CLIENT_SETTINGS_FIELDS = [
    "payment_deadline",
    "auto_inactive_client_invoice_due",
    "auto_inactive_client_time",
    "client_view_open_on_new_tab",
    "client_edit_open_on_new_tab",
    "create_invoice_billing_type_auto",
] as const;

describe("client settings fields", () => {
    it("keeps the client fields from general settings in that order", () => {
        expect(sectionKeys("clients")).toEqual([...CLIENT_SETTINGS_FIELDS]);
        expect(sectionKeys("general")).toEqual(expect.arrayContaining([...CLIENT_SETTINGS_FIELDS]));
        expect(sectionKeys("clients")).not.toContain("invoice_prefix");
    });

    it.each([
        "invoice_prefix",
        "pid_prefix",
        "expense_id_prefix",
        "product_code_prefix",
        "ticket_code_prefix",
    ] as const)("keeps %s available from general settings and its own dialog", (key) => {
        expect(sectionKeys("general")).toContain(key);
        expect(sectionKeys(key)).toEqual([key]);
    });
});
