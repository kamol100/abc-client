import { describe, expect, it } from "vitest";
import ClientFilterSchema from "@/components/clients/client-filter-schema";

describe("ClientFilterSchema", () => {
    // ক্লায়েন্টের তথ্য ও নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «filters by the billing_type query the API expects»।
    it("Client filter schema: filters by the billing_type query the API expects", () => {
        const billingType = ClientFilterSchema().find((field) => field.name.trim() === "billing_type");

        expect(billingType).toMatchObject({
            type: "dropdown",
            name: "billing_type",
            placeholder: "client.billing_type.placeholder",
            options: [
                { value: "auto", label: "common.auto" },
                { value: "manual", label: "common.manual" },
                { value: "no_invoice_this_month", label: "common.no_invoice_this_month" },
            ],
        });
    });
});
