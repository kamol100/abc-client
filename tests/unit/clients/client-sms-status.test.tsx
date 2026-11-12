import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ClientSmsStatus from "@/components/clients/client-sms-status";

const query = vi.hoisted(() => ({
    options: null as null | {
        url: string;
        enabled?: boolean;
        queryKey: unknown[];
        retry?: boolean;
    },
    data: undefined as
        | {
              success: boolean;
              data: {
                  invoice_due: { status: string; sent_at: string | null; failure_reason: string | null };
                  invoice_due_reminder: { status: string; sent_at: string | null; failure_reason: string | null } | null;
              };
          }
        | undefined,
}));

const permissions = vi.hoisted(() => ({ show: true, sms: false }));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: (name: string) =>
            (name === "clients.show" && permissions.show) || (name === "clients.sms-status" && permissions.sms),
    }),
}));

vi.mock("@/hooks/use-api-query", () => ({
    default: (options: NonNullable<typeof query.options>) => {
        query.options = options;
        return { data: query.data, isLoading: false, isFetching: false, isError: false };
    },
}));

describe("ClientSmsStatus", () => {
    it("shows the generic icon and skips the request until a client id is available", () => {
        query.data = undefined;
        permissions.show = true;
        render(<ClientSmsStatus />);

        expect(screen.getByRole("button", { name: "client.sms_status.unknown" })).toBeInTheDocument();
        expect(query.options?.enabled).toBe(false);
        expect(query.options?.retry).toBe(false);
    });

    it("requests sms status for one client without blocking on a loading icon", () => {
        query.data = undefined;
        render(<ClientSmsStatus clientId="client-1" />);

        expect(query.options?.url).toBe("clients/client-1/sms-status");
        expect(query.options?.enabled).toBe(true);
        expect(query.options?.queryKey).toEqual(["clients", "client-1", "sms-status"]);
        expect(screen.getByRole("button", { name: "client.sms_status.unknown" })).toHaveClass("h-4", "w-4");
    });

    it("keeps the generic icon when the request fails", () => {
        query.data = undefined;
        render(<ClientSmsStatus clientId="client-1" />);

        expect(screen.getByRole("button", { name: "client.sms_status.unknown" })).toBeInTheDocument();
    });

    it("shows a success mark and the sent time", () => {
        query.data = {
            success: true,
            data: {
                invoice_due: { status: "success", sent_at: "2026-11-05 10:30:00", failure_reason: null },
                invoice_due_reminder: null,
            },
        };

        render(<ClientSmsStatus clientId="client-1" />);
        fireEvent.click(screen.getByRole("button", { name: "client.sms_status.success" }));

        expect(screen.getByText("client.sms_status.invoice_due")).toBeInTheDocument();
        expect(screen.getByText(/05 Nov 2026, 10:30 AM/)).toBeInTheDocument();
        expect(screen.queryByText("client.sms_status.invoice_due_reminder")).not.toBeInTheDocument();
    });

    it("shows a failure mark with the reason and the reminder separately", () => {
        query.data = {
            success: true,
            data: {
                invoice_due: { status: "success", sent_at: "2026-11-05 10:30:00", failure_reason: null },
                invoice_due_reminder: {
                    status: "failed",
                    sent_at: "2026-11-18 09:00:00",
                    failure_reason: "Invalid phone number",
                },
            },
        };

        render(<ClientSmsStatus clientId="client-1" />);
        const button = screen.getByRole("button", { name: "client.sms_status.failed" });
        expect(button).toHaveClass("h-4", "w-4");
        fireEvent.click(button);

        expect(screen.getByText("client.sms_status.invoice_due")).toBeInTheDocument();
        expect(screen.getByText("client.sms_status.invoice_due_reminder")).toBeInTheDocument();
        expect(screen.getByText(/Invalid phone number/)).toBeInTheDocument();
        expect(screen.getByText(/18 Nov 2026, 9:00 AM/)).toBeInTheDocument();
    });

    it("does not request sms status without permission", () => {
        permissions.show = false;
        permissions.sms = false;
        query.data = {
            success: true,
            data: {
                invoice_due: { status: "success", sent_at: "2026-11-05 10:30:00", failure_reason: null },
                invoice_due_reminder: null,
            },
        };

        render(<ClientSmsStatus clientId="client-1" />);

        expect(query.options?.enabled).toBe(false);
        expect(screen.getByRole("button", { name: "client.sms_status.unknown" })).toBeInTheDocument();
        permissions.show = true;
    });
});
