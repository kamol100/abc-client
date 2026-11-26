import { describe, expect, it } from "vitest";
import { apiErrorKey, apiErrorText, serverFieldErrors } from "@/lib/helper/helper";
import { addressDeniedResult, testPassed } from "@/components/olt/olt-test-result";
import { DeviceFormSchema } from "@/components/device/device-type";

const t = (key: string, options?: Record<string, unknown>) =>
    key === "olt.address.denied" ? `denied ${options?.address} (${options?.reason})` : key === "common.too_many_attempts" ? "slow down" : String(options?.defaultValue ?? key);

const denied = {
    success: false,
    status: 422,
    error: {
        message: "The OLT's Device IP 169.254.169.254 is not allowed (a link-local address).",
        message_key: "olt.address.denied",
        params: { address: "169.254.169.254", reason: "a link-local address" },
    },
};

describe("API error helpers", () => {
    // OLT-এর প্রবেশাধিকার ও পরীক্ষার ফল যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «reads message_key + params and translates them»।
    it("OLT errors: reads message_key + params and translates them", () => {
        expect(apiErrorKey(denied)).toMatchObject({ key: "olt.address.denied", params: { address: "169.254.169.254" } });
        expect(apiErrorText(denied, t)).toBe("denied 169.254.169.254 (a link-local address)");
        expect(apiErrorKey({ success: false, error: { message: "Configure OLT access first." } })).toBeNull();
    });

    // OLT-এর প্রবেশাধিকার ও পরীক্ষার ফল যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «turns Laravel's throttle body into a friendly text and keeps other messages»।
    it("OLT errors: turns Laravel's throttle body into a friendly text and keeps other messages", () => {
        expect(apiErrorText({ message: "Too Many Attempts." }, t)).toBe("slow down");
        expect(apiErrorText({ success: false, error: { message: "Configure OLT access first." } }, t)).toBe("Configure OLT access first.");
        expect(apiErrorText({}, t, "olt.test.request_failed")).toBe("olt.test.request_failed");
    });

    // OLT-এর প্রবেশাধিকার ও পরীক্ষার ফল যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «maps 422 field errors to their first message»।
    it("OLT errors: maps 422 field errors to their first message", () => {
        expect(serverFieldErrors({ message: "x", errors: { device_ip: ["Only users who may manage OLT access…", "second"] } })).toEqual({
            device_ip: "Only users who may manage OLT access…",
        });
        expect(serverFieldErrors(denied)).toEqual({});
    });
});

describe("addressDeniedResult", () => {
    // OLT-এর প্রবেশাধিকার ও পরীক্ষার ফল যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a refused Device IP as a failed test with one Device IP step»।
    it("OLT errors: shows a refused Device IP as a failed test with one Device IP step", () => {
        const result = addressDeniedResult(apiErrorKey(denied), "2026-10-13T08:15:02+00:00");
        expect(testPassed(result)).toBe(false);
        expect(result?.steps).toEqual([
            expect.objectContaining({ key: "address", status: "fail", message_key: "olt.address.denied", params: { address: "169.254.169.254", reason: "a link-local address" } }),
        ]);
        expect(addressDeniedResult(apiErrorKey({ error: { message: "x", message_key: "olt.poll.retest_required" } }))).toBeNull();
        expect(addressDeniedResult(null)).toBeNull();
    });
});

describe("device form OLT credentials", () => {
    const device = { name: "OLT-1", network_id: 1, device_type_id: 2 };

    // OLT-এর প্রবেশাধিকার ও পরীক্ষার ফল যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «applies the community and printable-ASCII rules»।
    it("OLT errors: applies the community and printable-ASCII rules", () => {
        expect(DeviceFormSchema.safeParse({ ...device, snmp_community: "public", cli_username: "admin", cli_password: "p w" }).success).toBe(true);
        expect(DeviceFormSchema.safeParse({ ...device, snmp_community: "pub lic" }).success).toBe(false);
        expect(DeviceFormSchema.safeParse({ ...device, snmp_community: "x".repeat(65) }).success).toBe(false);
        expect(DeviceFormSchema.safeParse({ ...device, cli_password: "pw\n" }).success).toBe(false);
        expect(DeviceFormSchema.safeParse({ ...device, cli_username: "ইউজার" }).success).toBe(false);
    });
});
