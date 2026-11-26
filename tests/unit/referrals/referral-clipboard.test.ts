import { afterEach, describe, expect, it, vi } from "vitest";
import { copyTextToClipboard } from "@/lib/helper/helper";

const referralLink = "http://app.isp.test/demo-request?ref=SELLER123";

afterEach(() => {
    document.body.replaceChildren();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

function mockCommand(result = true) {
    const command = vi.fn(() => result);
    Object.defineProperty(document, "execCommand", { configurable: true, value: command });
    return command;
}

describe("referral link clipboard", () => {
    // রেফারেল ও সেলার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «copies the full link using the secure clipboard API»।
    it("Referral clipboard: copies the full link using the secure clipboard API", async () => {
        vi.stubGlobal("isSecureContext", true);
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal("navigator", { clipboard: { writeText } });
        const command = mockCommand();

        expect(await copyTextToClipboard(referralLink)).toBe(true);
        expect(writeText).toHaveBeenCalledWith(referralLink);
        expect(command).not.toHaveBeenCalled();
    });

    // রেফারেল ও সেলার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «copies on HTTP without the Clipboard API and restores focus without scrolling»।
    it("Referral clipboard: copies on HTTP without the Clipboard API and restores focus without scrolling", async () => {
        vi.stubGlobal("isSecureContext", false);
        vi.stubGlobal("navigator", {});
        const button = document.createElement("button");
        document.body.appendChild(button);
        button.focus();
        const focus = vi.spyOn(button, "focus");
        const command = mockCommand();
        command.mockImplementation(() => {
            expect(document.querySelector("textarea")?.value).toBe(referralLink);
            return true;
        });

        expect(await copyTextToClipboard(referralLink)).toBe(true);
        expect(command).toHaveBeenCalledWith("copy");
        expect(document.querySelector("textarea")).toBeNull();
        expect(document.activeElement).toBe(button);
        expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    });

    // রেফারেল ও সেলার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «falls back when browser clipboard permission is denied»।
    it("Referral clipboard: falls back when browser clipboard permission is denied", async () => {
        vi.stubGlobal("isSecureContext", true);
        vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
        const command = mockCommand();

        expect(await copyTextToClipboard(referralLink)).toBe(true);
        expect(command).toHaveBeenCalledWith("copy");
    });

    // রেফারেল ও সেলার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «reports failure when the browser refuses both copy methods»।
    it("Referral clipboard: reports failure when the browser refuses both copy methods", async () => {
        vi.stubGlobal("isSecureContext", false);
        mockCommand(false);

        expect(await copyTextToClipboard(referralLink)).toBe(false);
        expect(document.querySelector("textarea")).toBeNull();
    });

    // রেফারেল ও সেলার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «cleans up when the legacy copy command throws»।
    it("Referral clipboard: cleans up when the legacy copy command throws", async () => {
        vi.stubGlobal("isSecureContext", false);
        mockCommand().mockImplementation(() => { throw new Error("unavailable"); });

        expect(await copyTextToClipboard(referralLink)).toBe(false);
        expect(document.querySelector("textarea")).toBeNull();
    });
});
