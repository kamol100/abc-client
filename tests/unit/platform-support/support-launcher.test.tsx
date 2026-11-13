import { SupportRuntime } from "@/components/platform-support/support-launcher";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const access = vi.hoisted(() => ({ names: ["platform-support.access"] }));

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

describe("platform support launcher", () => {
    beforeEach(() => {
        access.names = ["platform-support.access"];
    });

    it("opens one help button without tickets or notification access", async () => {
        const user = userEvent.setup();
        render(<SupportRuntime><div>Staff page</div></SupportRuntime>);

        expect(screen.getAllByTestId("platform-support-launcher")).toHaveLength(1);
        await user.click(screen.getByTestId("platform-support-launcher"));

        expect(screen.getByTestId("platform-support-report")).toHaveAttribute("href", "/platform-support?kind=issue&compose=issue");
        expect(screen.getByTestId("platform-support-chat")).toHaveAttribute("href", "/platform-support?kind=chat&compose=chat");
        expect(screen.getByTestId("platform-support-requests")).toHaveAttribute("href", "/platform-support");
        expect(screen.queryByRole("link", { name: /documentation|help centre|help center/i })).not.toBeInTheDocument();
    });

    it("stays hidden without platform-support.access", () => {
        access.names = ["tickets.access", "notifications.access"];
        render(<SupportRuntime><div>Staff page</div></SupportRuntime>);
        expect(screen.queryByTestId("platform-support-launcher")).not.toBeInTheDocument();
    });
});
