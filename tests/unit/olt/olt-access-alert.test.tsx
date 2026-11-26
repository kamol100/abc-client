import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OltAccessAlert from "@/components/olt/olt-access-alert";

const i18n = vi.hoisted(() => ({
    i18n: { language: "en" },
    t: (key: string, options?: Record<string, unknown>) => (options && "time" in options ? `${key}|${options.time}` : key),
}));
vi.mock("react-i18next", () => ({ useTranslation: () => i18n }));

const restricted = {
    configured: true,
    restricted: true,
    last_poll_at: new Date().toISOString(),
    last_poll_failed: false,
    last_poll_error_key: null,
    last_test_at: null,
    last_test_ok: null,
    retest_required: false,
};

describe("OltAccessAlert", () => {
    // OLT-এর প্রবেশাধিকার ও পরীক্ষার ফল যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «renders nothing when all is well, also for the restricted shape»।
    it("OLT access alert: renders nothing when all is well, also for the restricted shape", () => {
        const { container } = render(<OltAccessAlert access={restricted} />);
        expect(container).toBeEmptyDOMElement();
    });

    // OLT-এর প্রবেশাধিকার ও পরীক্ষার ফল যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a generic failed poll and failed test for restricted users»।
    it("OLT access alert: shows a generic failed poll and failed test for restricted users", () => {
        render(<OltAccessAlert access={{ ...restricted, last_poll_failed: true, last_poll_error_key: "olt.poll.failed", last_test_ok: false }} />);
        expect(screen.getByText(/^olt.alert.poll_failed/)).toBeInTheDocument();
        expect(screen.getByText(/^olt.alert.test_failed/)).toBeInTheDocument();
        expect(screen.queryByText("olt.alert.details")).not.toBeInTheDocument(); // no access card details for them
    });

    // OLT-এর প্রবেশাধিকার ও পরীক্ষার ফল যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «asks for a Test connection after the Device IP changed, without repeating the poll error»।
    it("OLT access alert: asks for a Test connection after the Device IP changed, without repeating the poll error", () => {
        const onTest = vi.fn();
        render(
            <OltAccessAlert
                access={{ ...restricted, restricted: false, retest_required: true, last_poll_failed: true, last_poll_error_key: "olt.poll.retest_required", last_poll_error: "Polling and ONU reboot are paused…" }}
                onTest={onTest}
            />
        );
        expect(screen.getByText("olt.alert.retest_title")).toBeInTheDocument();
        expect(screen.queryByText(/^olt.alert.poll_failed/)).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /olt.test.button/ }));
        expect(onTest).toHaveBeenCalledTimes(1);
    });

    // OLT-এর প্রবেশাধিকার ও পরীক্ষার ফল যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «translates internal poll errors and keeps the reference text»।
    it("OLT access alert: translates internal poll errors and keeps the reference text", () => {
        render(
            <OltAccessAlert
                access={{ ...restricted, restricted: false, last_poll_failed: true, last_poll_error_key: "olt.poll.internal_error", last_poll_error: "Internal error while polling (reference AB12CD34)." }}
            />
        );
        expect(screen.getByText("olt.poll.internal_error")).toBeInTheDocument();
        expect(screen.getByText("Internal error while polling (reference AB12CD34).")).toBeInTheDocument();
    });
});
