import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import ClientZoneAddressCell from "@/components/clients/client-zone-address-cell";
import { ClientRow } from "@/components/clients/client-type";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) =>
            key === "client.address.show_more"
                ? "Show more"
                : key === "client.address.show_less"
                    ? "Show less"
                    : key === "client.address.directions"
                        ? "Directions on map"
                        : key,
    }),
}));

const client = (address: string | null, location: Partial<ClientRow> = {}): ClientRow => ({
    name: "Kamol",
    status: 1,
    current_address: address,
    ...location,
    zone: { id: 1, name: "Mirpur" },
    network: { id: 2, name: "Core" },
});

describe("ClientZoneAddressCell", () => {
    const scrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");
    const clientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
    const clientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");

    beforeAll(() => {
        Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
            configurable: true,
            get() {
                return (this.textContent?.length ?? 0) > 40 ? 48 : 16;
            },
        });
        Object.defineProperty(HTMLElement.prototype, "clientHeight", {
            configurable: true,
            get() {
                return 16;
            },
        });
        Object.defineProperty(HTMLElement.prototype, "clientWidth", {
            configurable: true,
            get() {
                return 140;
            },
        });
    });

    afterAll(() => {
        if (scrollHeight) Object.defineProperty(HTMLElement.prototype, "scrollHeight", scrollHeight);
        if (clientHeight) Object.defineProperty(HTMLElement.prototype, "clientHeight", clientHeight);
        if (clientWidth) Object.defineProperty(HTMLElement.prototype, "clientWidth", clientWidth);
    });

    it("shows a short address without a toggle", () => {
        render(<ClientZoneAddressCell client={client("Road 5, Mirpur")} />);

        expect(screen.getByText("Road 5, Mirpur")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
    });

    it("shows a dash when the address is empty", () => {
        render(<ClientZoneAddressCell client={client(null)} />);

        expect(screen.getAllByText("—").length).toBeGreaterThan(0);
        expect(screen.queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
    });

    it("expands a clamped address and collapses it again", async () => {
        const user = userEvent.setup();
        const address = "House 12, Road 5, Block C, Mirpur 10, Dhaka 1216, beside the mosque";

        render(<ClientZoneAddressCell client={client(address)} />);

        const showMore = screen.getByRole("button", { name: "Show more" });
        expect(showMore.querySelector("svg")).toBeInTheDocument();
        expect(showMore).toHaveAttribute("aria-expanded", "false");
        expect(screen.getByText(address)).toHaveClass("line-clamp-1");

        await user.click(showMore);

        expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByText(address)).not.toHaveClass("line-clamp-1");

        await user.click(screen.getByRole("button", { name: "Show less" }));

        expect(screen.getByRole("button", { name: "Show more" })).toHaveAttribute("aria-expanded", "false");
        expect(screen.getByText(address)).toHaveClass("line-clamp-1");
    });

    it("links to map directions when the client has a location", async () => {
        const user = userEvent.setup();
        const rowClick = vi.fn();

        render(
            <div onClick={rowClick}>
                <ClientZoneAddressCell client={client("Road 5, Mirpur", { adr_latitude: "23.8103", adr_longitude: "90.4125" })} />
            </div>,
        );

        const link = screen.getByRole("link", { name: "Directions on map" });
        expect(link).toHaveAttribute("href", "https://www.google.com/maps/dir/?api=1&destination=23.8103,90.4125");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");

        link.addEventListener("click", (event) => event.preventDefault());
        await user.click(link);
        expect(rowClick).not.toHaveBeenCalled();
    });

    it("shows no directions link without a usable location", () => {
        const { rerender } = render(<ClientZoneAddressCell client={client("Road 5, Mirpur")} />);
        expect(screen.queryByRole("link", { name: "Directions on map" })).not.toBeInTheDocument();

        rerender(<ClientZoneAddressCell client={client("Road 5, Mirpur", { adr_latitude: "", adr_longitude: "" })} />);
        expect(screen.queryByRole("link", { name: "Directions on map" })).not.toBeInTheDocument();

        rerender(<ClientZoneAddressCell client={client("Road 5, Mirpur", { adr_latitude: "abc", adr_longitude: "90.4" })} />);
        expect(screen.queryByRole("link", { name: "Directions on map" })).not.toBeInTheDocument();
    });
});
