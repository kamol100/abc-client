import { describe, expect, it } from "vitest";
import { ClientFormSchema } from "@/components/clients/client-type";
import { sanitizeServerActionPayload } from "@/lib/helper/server-action-payload";

const clientPayload = (values: Record<string, unknown>) =>
    sanitizeServerActionPayload(ClientFormSchema.parse(values));

describe("required PPPoE credentials", () => {
    it("uses translation keys when username or password is missing", () => {
        const result = ClientFormSchema.safeParse({
            name: "testuser02",
            pppoe_username: undefined,
            pppoe_password: "",
            network_id: 8,
            package_id: 19,
        });

        expect(result.success).toBe(false);
        if (result.success) return;

        const messages = Object.fromEntries(
            result.error.issues.map((issue) => [issue.path[0], issue.message]),
        );
        expect(messages.pppoe_username).toBe("client.pppoe_username.errors.required");
        expect(messages.pppoe_password).toBe("client.pppoe_password.errors.required");
    });
});

describe("required client dropdowns", () => {
    it("asks for a network and package when those dropdowns are empty", () => {
        const result = ClientFormSchema.safeParse({
            name: "testuser02",
            pppoe_username: "testuser02",
            pppoe_password: "dev-pass-02",
            network_id: undefined,
            package_id: null,
        });

        expect(result.success).toBe(false);
        if (result.success) return;

        const messages = Object.fromEntries(
            result.error.issues.map((issue) => [issue.path[0], issue.message]),
        );
        expect(messages.network_id).toBe("client.network.errors.required");
        expect(messages.package_id).toBe("client.package.errors.required");
    });
});

describe("client update payload", () => {
    it("turns blank fields into null and keeps column types", () => {
        const payload = clientPayload({
            name: "testuser02",
            phone: "01677217129",
            pppoe_username: "testuser02",
            pppoe_password: "dev-pass-02",
            ip_address: undefined,
            zone_id: undefined,
            sub_zone_id: undefined,
            network_id: 8,
            package_id: 19,
            device_id: undefined,
            payment_term: 1,
            payment_deadline: undefined,
            discount: undefined,
            billing_term: "prepaid",
            connection_mode: "1",
            current_address: undefined,
            adr_latitude: undefined,
            adr_longitude: undefined,
            note: undefined,
            status: 1,
            welcome_notification: 1,
            cable_length: "0",
            cable_invoice: 0,
            billing_type: "auto",
            invoice_day: "01",
            reseller_id: null,
            created_by: null,
            upazila_id: undefined,
        });

        expect(payload).toMatchObject({
            name: "testuser02",
            phone: "01677217129",
            pppoe_username: "testuser02",
            pppoe_password: "dev-pass-02",
            ip_address: null,
            zone_id: null,
            sub_zone_id: null,
            network_id: 8,
            package_id: 19,
            device_id: null,
            payment_term: 1,
            payment_deadline: null,
            discount: null,
            billing_term: "prepaid",
            connection_mode: "1",
            current_address: null,
            adr_latitude: null,
            adr_longitude: null,
            note: null,
            status: 1,
            welcome_notification: 1,
            cable_length: 0,
            cable_invoice: 0,
            billing_type: "auto",
            invoice_day: "01",
            reseller_id: null,
        });
        expect(payload).not.toHaveProperty("created_by");
        expect(payload).not.toHaveProperty("upazila_id");
        expect(Object.values(payload)).not.toContain(undefined);
        expect(Object.values(payload)).not.toContain("$undefined");
        expect(payload.reseller_id).not.toBe("null");
    });

    it("accepts the leaked string markers and coerces integer columns", () => {
        const payload = clientPayload({
            name: "testuser02",
            pppoe_username: "testuser02",
            pppoe_password: "dev-pass-02",
            network_id: "8",
            package_id: "19",
            zone_id: "$undefined",
            payment_deadline: "5",
            reseller_id: "null",
            cable_length: "12",
            adr_latitude: 23.75,
            note: "null",
            upazila_id: 4,
            created_by: { id: 9, name: "Staff" },
        });

        expect(payload.zone_id).toBeNull();
        expect(payload.reseller_id).toBeNull();
        expect(payload.payment_deadline).toBe(5);
        expect(payload.network_id).toBe(8);
        expect(payload.package_id).toBe(19);
        expect(payload.cable_length).toBe(12);
        expect(payload.adr_latitude).toBe("23.75");
        expect(payload.note).toBe("null");
        expect(payload.upazila_id).toBe(4);
        expect(payload).not.toHaveProperty("created_by");
        expect(payload.payment_deadline).not.toBe("$undefined");
    });

    it("keeps payment deadline 0 and an assigned reseller", () => {
        const payload = clientPayload({
            name: "testuser02",
            pppoe_username: "testuser02",
            pppoe_password: "dev-pass-02",
            network_id: 8,
            package_id: 19,
            payment_deadline: "0",
            reseller_id: "15",
            status: 0,
            welcome_notification: "0",
        });

        expect(payload.payment_deadline).toBe(0);
        expect(payload.reseller_id).toBe(15);
        expect(payload.status).toBe(0);
        expect(payload.welcome_notification).toBe(0);
    });
});

describe("client create and edit billing defaults", () => {
    it("submits create defaults and keeps an edited billing choice", () => {
        const created = clientPayload({
            name: "testuser02",
            pppoe_username: "testuser02",
            pppoe_password: "dev-pass-02",
            network_id: 8,
            package_id: 19,
            billing_term: "prepaid",
            billing_type: "auto",
            welcome_notification: "1",
            status: 1,
            cable_length: 0,
            payment_deadline: null,
        });

        expect(created.billing_term).toBe("prepaid");
        expect(created.billing_type).toBe("auto");
        expect(created.welcome_notification).toBe(1);
        expect(created.status).toBe(1);
        expect(created.cable_length).toBe(0);
        expect(created.payment_deadline).toBeNull();

        const edited = clientPayload({
            name: "testuser02",
            pppoe_username: "testuser02",
            pppoe_password: "dev-pass-02",
            network_id: 8,
            package_id: 19,
            billing_term: "postpaid",
            billing_type: "manual",
            welcome_notification: 0,
            status: 0,
            cable_length: 0,
        });

        expect(edited.billing_term).toBe("postpaid");
        expect(edited.billing_type).toBe("manual");
        expect(edited.welcome_notification).toBe(0);
        expect(edited.status).toBe(0);
        expect(edited.cable_length).toBe(0);
    });

    it("keeps a missing edit billing value null", () => {
        const payload = clientPayload({
            name: "testuser02",
            pppoe_username: "testuser02",
            pppoe_password: "dev-pass-02",
            network_id: 8,
            package_id: 19,
            billing_term: null,
            billing_type: null,
            welcome_notification: null,
        });

        expect(payload.billing_term).toBeNull();
        expect(payload.billing_type).toBeNull();
        expect(payload.welcome_notification).toBeNull();
    });
});

describe("sanitizeServerActionPayload", () => {
    it("drops undefined keys and replaces the server-action marker", () => {
        const payload = sanitizeServerActionPayload({
            name: "testuser02",
            ip_address: undefined,
            zone_id: "$undefined",
            reseller_id: null,
            nested: { note: undefined, device_id: "$undefined" },
        });

        expect(payload).toEqual({
            name: "testuser02",
            zone_id: null,
            reseller_id: null,
            nested: { device_id: null },
        });
    });
});
