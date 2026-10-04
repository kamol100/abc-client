import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Logo from "@/components/logo";

const { profileState } = vi.hoisted(() => ({
    profileState: { profile: null as unknown },
}));

vi.mock("@/context/app-provider", () => ({
    useSafeProfile: () => ({ profile: profileState.profile }),
}));

describe("Logo", () => {
    beforeEach(() => {
        profileState.profile = null;
    });

    it("shows the default logo when expanded and the initial when collapsed if no logo is configured", () => {
        render(<Logo name="acme networks" />);

        const image = screen.getByRole("img");
        expect(image.getAttribute("src")).toBe("/static/logo.png");
        expect(image.className).toContain("group-data-[collapsible=icon]:hidden");
        expect(screen.getByText("A").className).toContain("group-data-[collapsible=icon]:flex");
    });

    it("shows the configured logo in both states without the initial tile", () => {
        profileState.profile = { company: { name: "Zenith ISP", logo: "https://cdn.test/logo.png" } };
        render(<Logo />);

        expect(screen.getByRole("img").getAttribute("src")).toBe("https://cdn.test/logo.png");
        expect(screen.queryByText("Z")).toBeNull();
    });

    it("hides the name when the sidebar is collapsed", () => {
        render(<Logo name="Acme Networks" />);

        const nameWrapper = screen.getByText("Acme Networks").parentElement;
        expect(nameWrapper?.parentElement?.className).toContain("flex-col");
        expect(nameWrapper?.className).toContain("group-data-[collapsible=icon]:hidden");
    });
});
