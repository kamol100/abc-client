import { describe, expect, it } from "vitest";
import {
    calculateClientRechargeBalance,
    calculateRechargeCost,
    hasSufficientWalletBalance,
    parsePositiveAmount,
} from "@/components/wallets/reseller-recharge-cost";
import { ResellerClientRechargeFormSchema } from "@/components/wallets/wallet-type";

describe("calculateRechargeCost", () => {
    it("charges buying price divided by 30 for each day", () => {
        expect(calculateRechargeCost(60, 1)).toBe(2);
        expect(calculateRechargeCost(60, 5)).toBe(10);
        expect(calculateRechargeCost(60, 10)).toBe(20);
        expect(calculateRechargeCost(60, 15)).toBe(30);
        expect(calculateRechargeCost(60, 30)).toBe(60);
    });

    it("rounds a fractional daily cost to currency cents", () => {
        expect(calculateRechargeCost(100, 1)).toBe(3.33);
        expect(calculateRechargeCost("60", "1.5")).toBe(3);
    });

    it("returns null for missing or invalid buying price and days", () => {
        expect(calculateRechargeCost(null, 1)).toBeNull();
        expect(calculateRechargeCost(undefined, 1)).toBeNull();
        expect(calculateRechargeCost("", 1)).toBeNull();
        expect(calculateRechargeCost(0, 1)).toBeNull();
        expect(calculateRechargeCost(-60, 1)).toBeNull();
        expect(calculateRechargeCost(Number.NaN, 1)).toBeNull();
        expect(calculateRechargeCost(Number.POSITIVE_INFINITY, 1)).toBeNull();
        expect(calculateRechargeCost(60, 0)).toBeNull();
        expect(calculateRechargeCost(60, -5)).toBeNull();
        expect(calculateRechargeCost(60, "")).toBeNull();
        expect(calculateRechargeCost(60, "abc")).toBeNull();
        expect(calculateRechargeCost(60, Number.POSITIVE_INFINITY)).toBeNull();
    });
});

describe("calculateClientRechargeBalance", () => {
    it("converts days into the package price amount the api expects", () => {
        expect(calculateClientRechargeBalance(60, 30)).toBe(60);
        expect(calculateClientRechargeBalance(100, 1)).toBe(3.33);
    });

    it("returns null when the package price cannot be used", () => {
        expect(calculateClientRechargeBalance(null, 1)).toBeNull();
        expect(calculateClientRechargeBalance(0, 5)).toBeNull();
        expect(calculateClientRechargeBalance(90, "")).toBeNull();
    });
});

describe("hasSufficientWalletBalance", () => {
    it("allows a cost that is within the wallet balance", () => {
        expect(hasSufficientWalletBalance(10, 10)).toBe(true);
        expect(hasSufficientWalletBalance(10, 10.004)).toBe(true);
    });

    it("blocks a cost above the wallet balance and invalid amounts", () => {
        expect(hasSufficientWalletBalance(10.01, 10)).toBe(false);
        expect(hasSufficientWalletBalance(null, 100)).toBe(false);
        expect(hasSufficientWalletBalance(10, null)).toBe(false);
        expect(hasSufficientWalletBalance(10, Number.NaN)).toBe(false);
    });
});

describe("ResellerClientRechargeFormSchema", () => {
    it("accepts a positive day count", () => {
        const parsed = ResellerClientRechargeFormSchema.safeParse({
            clientUuid: "client-1",
            days: "5",
        });

        expect(parsed.success).toBe(true);
        expect(parsePositiveAmount("5")).toBe(5);
    });

    it("rejects empty, zero, negative, and non-numeric days", () => {
        expect(
            ResellerClientRechargeFormSchema.safeParse({
                clientUuid: "client-1",
                days: "",
            }).success,
        ).toBe(false);
        expect(
            ResellerClientRechargeFormSchema.safeParse({
                clientUuid: "client-1",
                days: 0,
            }).success,
        ).toBe(false);
        expect(
            ResellerClientRechargeFormSchema.safeParse({
                clientUuid: "client-1",
                days: -2,
            }).success,
        ).toBe(false);
        expect(
            ResellerClientRechargeFormSchema.safeParse({
                clientUuid: "client-1",
                days: "abc",
            }).success,
        ).toBe(false);
    });
});
