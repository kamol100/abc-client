import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClientAddMapDialog from "@/components/clients/client-add-map-dialog";

const harness = vi.hoisted(() => ({
    mutateAsync: vi.fn(),
    mutation: null as { url?: string; method?: string; invalidateKeys?: string } | null,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: (options: { url?: string; method?: string; invalidateKeys?: string }) => {
        harness.mutation = options;
        return {
            mutateAsync: harness.mutateAsync,
            isPending: false,
        };
    },
}));

vi.mock("@/components/clients/client-map-preview", () => ({
    default: ({ latitude, longitude }: { latitude: number; longitude: number }) => (
        <div>{`map:${latitude},${longitude}`}</div>
    ),
}));

vi.mock("@/components/my-dialog", () => ({
    MyDialog: ({
        children,
        footer,
        open,
        title,
    }: {
        children?: ReactNode;
        footer?: (props: { close: () => void; loading: boolean }) => ReactNode;
        open?: boolean;
        title?: string;
    }) =>
        open ? (
            <div>
                <h2>{title}</h2>
                {children}
                {footer?.({ close: () => undefined, loading: false })}
            </div>
        ) : null,
}));

function installGeolocation(
    impl: (
        success: PositionCallback,
        error: PositionErrorCallback,
        options?: PositionOptions,
    ) => void,
): void {
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
    Object.defineProperty(navigator, "geolocation", {
        configurable: true,
        value: { getCurrentPosition: impl },
    });
}

describe("ClientAddMapDialog", () => {
    beforeEach(() => {
        harness.mutateAsync.mockReset();
        harness.mutateAsync.mockResolvedValue({});
        harness.mutation = null;
    });

    it("shows a location error and keeps save disabled when GPS is denied", async () => {
        installGeolocation((_success, error) => {
            error({ code: 1 } as GeolocationPositionError);
        });

        render(<ClientAddMapDialog clientId="client-1" open onOpenChange={() => undefined} />);

        expect(await screen.findByRole("alert")).toHaveTextContent("common.get_location_permission_denied");
        expect(screen.getByRole("button", { name: "client.map.submit" })).toBeDisabled();
        expect(screen.queryByText(/map:/)).not.toBeInTheDocument();
        expect(harness.mutateAsync).not.toHaveBeenCalled();
    });

    it("previews the browser coordinates and submits only those values", async () => {
        const user = userEvent.setup();
        installGeolocation((success, _error, options) => {
            expect(options?.enableHighAccuracy).toBe(true);
            success({ coords: { latitude: 23.5, longitude: 90.25 } } as GeolocationPosition);
        });

        render(<ClientAddMapDialog clientId="client-1" open onOpenChange={() => undefined} />);

        expect(await screen.findByText("map:23.5,90.25")).toBeInTheDocument();
        expect(screen.getByText("23.500000")).toBeInTheDocument();
        expect(screen.getByText("90.250000")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "client.map.submit" }));

        await waitFor(() => {
            expect(harness.mutateAsync).toHaveBeenCalledWith({
                adr_latitude: 23.5,
                adr_longitude: 90.25,
            });
        });
        expect(harness.mutation).toMatchObject({
            url: "/clients/client-1/add-client-map",
            method: "POST",
            invalidateKeys: "clients,reseller-clients,client-maps",
        });
    });

    it("does not save when the dialog is cancelled", async () => {
        const user = userEvent.setup();
        installGeolocation((success) => {
            success({ coords: { latitude: 23.5, longitude: 90.25 } } as GeolocationPosition);
        });

        render(<ClientAddMapDialog clientId="client-1" open onOpenChange={() => undefined} />);
        await screen.findByText("map:23.5,90.25");
        await user.click(screen.getByRole("button", { name: "common.cancel" }));

        expect(harness.mutateAsync).not.toHaveBeenCalled();
    });
});
