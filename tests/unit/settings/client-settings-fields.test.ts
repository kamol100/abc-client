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
    it("keeps the client fields from general settings in that order, then the filter position", () => {
        expect(sectionKeys("list_clients")).toEqual([...CLIENT_SETTINGS_FIELDS, "filter_position_clients"]);
        expect(sectionKeys("general")).toEqual(expect.arrayContaining([...CLIENT_SETTINGS_FIELDS]));
        expect(sectionKeys("list_clients")).not.toContain("invoice_prefix");
    });

    it.each([
        ["invoice_prefix", "list_invoices", "filter_position_invoices"],
        ["pid_prefix", "list_payments", "filter_position_payments"],
        ["expense_id_prefix", "list_expenses", "filter_position_expenses"],
        ["product_code_prefix", "list_products", "filter_position_products"],
        ["ticket_code_prefix", "list_tickets", "filter_position_tickets"],
    ] as const)("keeps %s available from general settings and its list's ⚙ dialog", (key, section, position) => {
        expect(sectionKeys("general")).toContain(key);
        expect(sectionKeys(section)).toEqual([key, position]);
    });
});
