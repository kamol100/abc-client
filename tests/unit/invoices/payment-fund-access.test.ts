import { describe, expect, it } from "vitest";
import {
    paymentFundAccess,
    resolveAssignedFundId,
} from "@/components/invoices/payment-fund-access";

describe("resolveAssignedFundId", () => {
    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «accepts a positive integer fund id»।
    it("Payment fund access: accepts a positive integer fund id", () => {
        expect(resolveAssignedFundId({ id: 4, name: "cash" })).toBe(4);
        expect(resolveAssignedFundId({ id: "12" })).toBe(12);
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «rejects missing and invalid fund ids»।
    it("Payment fund access: rejects missing and invalid fund ids", () => {
        expect(resolveAssignedFundId(null)).toBeNull();
        expect(resolveAssignedFundId(undefined)).toBeNull();
        expect(resolveAssignedFundId({ id: 0 })).toBeNull();
        expect(resolveAssignedFundId({ id: -3 })).toBeNull();
        expect(resolveAssignedFundId({ id: 1.5 })).toBeNull();
        expect(resolveAssignedFundId({ id: "cash" })).toBeNull();
        expect(resolveAssignedFundId({ id: "" })).toBeNull();
        expect(resolveAssignedFundId({ id: true })).toBeNull();
    });
});

describe("paymentFundAccess", () => {
    const own = { fund: { id: 4, name: "cash" } };

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «locks a staff member without either permission to their own fund»।
    it("Payment fund access: locks a staff member without either permission to their own fund", () => {
        expect(paymentFundAccess({ staff: own })).toEqual({
            canChooseFund: false,
            assignedFundId: 4,
            lockFund: true,
            blockSubmit: false,
            showUnassignedWarning: false,
        });
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «blocks a staff member without either permission or an own fund»।
    it("Payment fund access: blocks a staff member without either permission or an own fund", () => {
        expect(paymentFundAccess({ staff: { fund: null } })).toMatchObject({
            assignedFundId: null,
            lockFund: true,
            blockSubmit: true,
            showUnassignedWarning: true,
        });
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «lets invoices.change-fund choose any fund, with or without an own fund»।
    it("Payment fund access: lets invoices.change-fund choose any fund, with or without an own fund", () => {
        expect(paymentFundAccess({ staff: own, canChangeFund: true })).toEqual({
            canChooseFund: true,
            assignedFundId: 4,
            lockFund: false,
            blockSubmit: false,
            showUnassignedWarning: false,
        });
        expect(paymentFundAccess({ staff: { fund: null }, canChangeFund: true })).toMatchObject({
            canChooseFund: true,
            assignedFundId: null,
            lockFund: false,
            blockSubmit: false,
        });
        expect(paymentFundAccess({ staff: null, canChangeFund: true })).toMatchObject({
            lockFund: false,
            blockSubmit: false,
        });
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «lets invoices.bkash-fund-access choose between the own and bKash funds»।
    it("Payment fund access: lets invoices.bkash-fund-access choose between the own and bKash funds", () => {
        expect(paymentFundAccess({ staff: own, canUseBkashFund: true })).toEqual({
            canChooseFund: true,
            assignedFundId: 4,
            lockFund: false,
            blockSubmit: false,
            showUnassignedWarning: false,
        });
        // No own fund: the bKash fund is still allowed, so nothing is blocked.
        expect(paymentFundAccess({ staff: { fund: null }, canUseBkashFund: true })).toMatchObject({
            assignedFundId: null,
            lockFund: false,
            blockSubmit: false,
            showUnassignedWarning: false,
        });
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «ignores roles: an admin without the permission is locked like anyone else»।
    it("Payment fund access: ignores roles: an admin without the permission is locked like anyone else", () => {
        // Roles are no longer an input; access comes only from the permissions.
        expect(paymentFundAccess({ staff: own }).lockFund).toBe(true);
    });

    // ইনভয়েস ও পেমেন্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not select a fund or show the unassigned warning while the profile is incomplete»।
    it("Payment fund access: does not select a fund or show the unassigned warning while the profile is incomplete", () => {
        expect(paymentFundAccess({ staff: {} })).toEqual({
            canChooseFund: false,
            assignedFundId: null,
            lockFund: true,
            blockSubmit: true,
            showUnassignedWarning: false,
        });
        expect(paymentFundAccess({ staff: {}, canUseBkashFund: true })).toMatchObject({
            blockSubmit: true,
            showUnassignedWarning: false,
        });
    });
});
