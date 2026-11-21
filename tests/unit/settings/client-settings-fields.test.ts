import { describe, expect, it } from "vitest";
import { selectSettingsFields } from "@/components/settings/settings-form-schema";

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
        const fields = selectSettingsFields("general", CLIENT_SETTINGS_FIELDS);

        expect(fields.map((field) => field.key)).toEqual([...CLIENT_SETTINGS_FIELDS]);
        expect(fields.some((field) => field.key === "invoice_prefix")).toBe(false);
    });

    it.each([
        "invoice_prefix",
        "pid_prefix",
        "expense_id_prefix",
        "product_code_prefix",
        "ticket_code_prefix",
    ] as const)("keeps %s available from general settings", (key) => {
        expect(selectSettingsFields("general", [key]).map((field) => field.key)).toEqual([key]);
    });
});
