import { describe, expect, it } from "vitest";
import PaymentFilterSchema, { paymentListParams } from "@/components/payments/payment-filter-schema";

describe("payment list scope", () => {
    // পেমেন্টের তালিকা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «limits the request to the signed-in staff when they cannot view every collection»।
    it("Payment list params: limits the request to the signed-in staff when they cannot view every collection", () => {
        expect(paymentListParams("track_id=INV-1", false, "staff-uuid")).toEqual({
            track_id: "INV-1",
            staff_id: "staff-uuid",
        });
        expect(paymentListParams("staff_id=99", false, "staff-uuid")).toEqual({
            staff_id: "staff-uuid",
        });
        expect(paymentListParams(null, false, null)).toEqual({ staff_id: "0" });
    });

    // পেমেন্টের তালিকা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «leaves the collector filter off when the staff can view every collection»।
    it("Payment list params: leaves the collector filter off when the staff can view every collection", () => {
        expect(paymentListParams(null, true, "staff-uuid")).toBeUndefined();
        expect(paymentListParams("staff_id=15&zone_id=3", true, "staff-uuid")).toEqual({
            staff_id: "15",
            zone_id: "3",
        });
    });

    // পেমেন্টের তালিকা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «disables the collector dropdown without payments.view.all»।
    it("Payment list params: disables the collector dropdown without payments.view.all", () => {
        const locked = PaymentFilterSchema(false).find((field) => field.name === "staff_id");
        const open = PaymentFilterSchema(true).find((field) => field.name === "staff_id");

        expect(locked).toMatchObject({ name: "staff_id", isDisabled: true });
        expect(locked && "permission" in locked && locked.permission === false).toBe(false);
        expect(open).toMatchObject({ name: "staff_id", isDisabled: false });
    });
});
