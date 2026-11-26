import { getHighAccuracyGeolocation } from "@/lib/helper/helper";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("getHighAccuracyGeolocation", () => {
    const getCurrentPosition = vi.fn();

    beforeEach(() => {
        getCurrentPosition.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function installGeolocation(): void {
        Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
        Object.defineProperty(navigator, "geolocation", {
            configurable: true,
            value: { getCurrentPosition },
        });
    }

    // সাধারণ সহায়ক ফাংশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «returns the browser fix from a high-accuracy request»।
    it("High accuracy geolocation: returns the browser fix from a high-accuracy request", async () => {
        installGeolocation();
        getCurrentPosition.mockImplementation((success: PositionCallback) => {
            success({ coords: { latitude: 23.5, longitude: 90.25 } } as GeolocationPosition);
        });

        await expect(getHighAccuracyGeolocation()).resolves.toEqual({
            latitude: 23.5,
            longitude: 90.25,
        });
        expect(getCurrentPosition).toHaveBeenCalledTimes(1);
        expect(getCurrentPosition.mock.calls[0]?.[2]).toMatchObject({
            enableHighAccuracy: true,
            maximumAge: 0,
        });
    });

    // সাধারণ সহায়ক ফাংশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not fall back to a low-accuracy fix when GPS fails»।
    it("High accuracy geolocation: does not fall back to a low-accuracy fix when GPS fails", async () => {
        installGeolocation();
        getCurrentPosition.mockImplementation((_success: PositionCallback, error: PositionErrorCallback) => {
            error({ code: 2 } as GeolocationPositionError);
        });

        await expect(getHighAccuracyGeolocation()).rejects.toMatchObject({ code: 2 });
        expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    });

    // সাধারণ সহায়ক ফাংশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «rejects when the browser has no geolocation API»।
    it("High accuracy geolocation: rejects when the browser has no geolocation API", async () => {
        Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
        Object.defineProperty(navigator, "geolocation", { configurable: true, value: undefined });

        await expect(getHighAccuracyGeolocation()).rejects.toThrow(/not supported/);
        expect(getCurrentPosition).not.toHaveBeenCalled();
    });
});
