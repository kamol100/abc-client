import { describe, expect, it } from "vitest";
import { clientInvoiceQueryParams } from "@/components/invoices/client-invoice-params";

const clientId = "a2f269c6-56ec-4f92-a92c-1570d8372019";

describe("clientInvoiceQueryParams", () => {
    it("scopes the invoice list by client uuid", () => {
        expect(clientInvoiceQueryParams(clientId, null)).toEqual({
            client_uuid: clientId,
        });
    });

    it("keeps the client scope when filters are applied", () => {
        expect(clientInvoiceQueryParams(clientId, "status=due&track_id=INV-1&client_id=12")).toEqual({
            status: "due",
            track_id: "INV-1",
            trackID: "INV-1",
            client_uuid: clientId,
        });
    });
});
