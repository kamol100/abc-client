import { describe, expect, it } from "vitest";
import {
    paymentFundAccess,
    resolveAssignedFundId,
} from "@/components/invoices/payment-fund-access";

describe("resolveAssignedFundId", () => {
    it("accepts a positive integer fund id", () => {
        expect(resolveAssignedFundId({ id: 4, name: "cash" })).toBe(4);
        expect(resolveAssignedFundId({ id: "12" })).toBe(12);
    });

    it("rejects missing and invalid fund ids", () => {
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
    it("locks a non-admin to their assigned fund", () => {
        expect(
            paymentFundAccess({
                roles: ["Staff"],
                staff: { fund: { id: 4, name: "cash" } },
            }),
        ).toEqual({
            canChooseFund: false,
            assignedFundId: 4,
            lockFund: true,
            blockSubmit: false,
            showUnassignedWarning: false,
        });
    });

    it("blocks a non-admin who has no assigned fund", () => {
        expect(
            paymentFundAccess({
                roles: ["Manager"],
                staff: { fund: null },
            }),
        ).toMatchObject({
            assignedFundId: null,
            lockFund: true,
            blockSubmit: true,
            showUnassignedWarning: true,
        });
    });

    it("lets an admin choose a fund with or without a personal assignment", () => {
        expect(
            paymentFundAccess({
                roles: ["Admin"],
                staff: { fund: { id: 4 } },
            }),
        ).toMatchObject({
            canChooseFund: true,
            assignedFundId: 4,
            lockFund: false,
            blockSubmit: false,
            showUnassignedWarning: false,
        });

        expect(
            paymentFundAccess({
                roles: ["Super Admin"],
                staff: null,
            }),
        ).toMatchObject({
            canChooseFund: true,
            assignedFundId: null,
            lockFund: false,
            blockSubmit: false,
            showUnassignedWarning: false,
        });
    });

    it("does not select a fund or show the unassigned warning while the profile is incomplete", () => {
        expect(
            paymentFundAccess({
                roles: undefined,
                staff: { fund: { id: 4 } },
            }),
        ).toEqual({
            canChooseFund: false,
            assignedFundId: null,
            lockFund: true,
            blockSubmit: true,
            showUnassignedWarning: false,
        });

        expect(
            paymentFundAccess({
                roles: ["Staff"],
                staff: {},
            }),
        ).toMatchObject({
            assignedFundId: null,
            blockSubmit: true,
            showUnassignedWarning: false,
        });
    });
});
