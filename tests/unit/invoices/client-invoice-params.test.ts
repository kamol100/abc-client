import { describe, expect, it } from "vitest";
import { clientInvoiceQueryParams } from "@/components/invoices/client-invoice-params";

const clientId = "a2f269c6-56ec-4f92-a92c-1570d8372019";

describe("clientInvoiceQueryParams", () => {
    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «scopes the invoice list by client uuid»।
    it("Client invoice history request: scopes the invoice list by client uuid", () => {
        expect(clientInvoiceQueryParams(clientId, null)).toEqual({
            client_uuid: clientId,
        });
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the client scope when filters are applied»।
    it("Client invoice history request: keeps the client scope when filters are applied", () => {
        expect(clientInvoiceQueryParams(clientId, "status=due&track_id=INV-1&client_id=12")).toEqual({
            status: "due",
            track_id: "INV-1",
            trackID: "INV-1",
            client_uuid: clientId,
        });
    });
});
