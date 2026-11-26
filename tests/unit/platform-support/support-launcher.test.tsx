import { SupportLauncher, SupportRuntime } from "@/components/platform-support/support-launcher";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const access = vi.hoisted(() => ({ names: ["platform-support.access", "platform-support.create"] }));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

vi.mock("next/link", () => ({
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: (name: string) => access.names.includes(name),
    }),
    useProfile: () => ({ profile: { id: "user-1", name: "Ari", reseller: null } }),
}));

vi.mock("@/hooks/use-api-query", () => ({
    default: () => ({
        data: { success: true, data: { unread_messages: 2 } },
        error: null,
        isError: false,
    }),
}));

vi.mock("@/hooks/use-mobile", () => ({
    useIsMobile: () => false,
}));

vi.mock("next/navigation", () => ({
    usePathname: () => "/clients",
    useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

describe("platform support launcher", () => {
    beforeEach(() => {
        vi.stubGlobal("matchMedia", vi.fn(() => ({
            matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
        })));
        access.names = ["platform-support.access", "platform-support.create"];
        vi.stubGlobal("fetch", vi.fn(async () => ({
            ok: true,
            json: async () => ({ data: { matched: false, page: [], related: [], general: [] } }),
        })));
    });

    // প্ল্যাটফর্ম সাপোর্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «opens one help button without tickets or notification access»।
    it("Support launcher: opens one help button without tickets or notification access", async () => {
        const user = userEvent.setup();
        render(<SupportRuntime><div>Staff page</div><SupportLauncher /></SupportRuntime>);

        expect(screen.getAllByTestId("platform-support-launcher")).toHaveLength(1);
        await user.click(screen.getByTestId("platform-support-launcher"));

        expect(screen.getByTestId("platform-support-report")).toHaveAttribute("href", "/platform-support?kind=issue&compose=issue");
        expect(screen.getByTestId("platform-support-chat")).toHaveAttribute("href", "/platform-support?kind=chat&compose=chat");
        expect(screen.getByTestId("platform-support-requests")).toHaveAttribute("href", "/platform-support");
        expect(screen.getByTestId("help-centre-link")).toHaveAttribute("href", "/help");
    });

    // প্ল্যাটফর্ম সাপোর্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps requests available without showing actions that create a conversation»।
    it("Support launcher: keeps requests available without showing actions that create a conversation", async () => {
        access.names = ["platform-support.access"];
        const user = userEvent.setup();
        render(<SupportRuntime><div>Staff page</div><SupportLauncher /></SupportRuntime>);
        await user.click(screen.getByTestId("platform-support-launcher"));
        expect(screen.getByTestId("platform-support-requests")).toBeInTheDocument();
        expect(screen.queryByTestId("platform-support-report")).not.toBeInTheDocument();
        expect(screen.queryByTestId("platform-support-chat")).not.toBeInTheDocument();
    });

    // প্ল্যাটফর্ম সাপোর্ট যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps Help available when platform support is not granted»।
    it("Support launcher: keeps Help available when platform support is not granted", async () => {
        const user = userEvent.setup();
        access.names = ["tickets.access", "notifications.access"];
        render(<SupportRuntime><div>Staff page</div><SupportLauncher /></SupportRuntime>);
        expect(screen.getByTestId("platform-support-launcher")).toBeInTheDocument();
        await user.click(screen.getByTestId("platform-support-launcher"));
        expect(screen.getByTestId("help-centre-link")).toHaveAttribute("href", "/help");
        expect(screen.queryByTestId("platform-support-report")).not.toBeInTheDocument();
        expect(screen.queryByTestId("platform-support-chat")).not.toBeInTheDocument();
    });
});
