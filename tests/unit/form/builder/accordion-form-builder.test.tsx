import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import AccordionFormBuilder from "@/components/form-wrapper/accordion-form-builder";
import type { AccordionSection } from "@/components/form-wrapper/form-builder-type";
import { fieldById, inputById, mockApi, renderWithClient, stubBrowserApis, writeRequests } from "./harness";

vi.mock("@/app/actions", () => ({ useFetch: vi.fn() }));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const anyValues = z.object({}).passthrough();

const sections: AccordionSection[] = [
    {
        name: "client.sections.basic",
        form: [
            { type: "text", name: "name" },
            { type: "text", name: "secret", permission: false },
            { type: "text", name: "company", className: "col-span-full", visibleWhen: { field: "name", equals: "biz" } },
        ],
    },
    {
        name: "client.sections.address",
        form: [
            { type: "text", name: "address" },
            { type: "slot", name: "images", slot: "images", className: "image-slot" },
        ],
    },
];

type Props = Partial<ComponentProps<typeof AccordionFormBuilder>>;

function renderAccordion(props: Props = {}) {
    return renderWithClient(
        <AccordionFormBuilder
            formSchema={sections}
            schema={anyValues}
            api="/clients"
            method="POST"
            mode="create"
            queryKey="clients"
            hydrateOnEdit="never"
            {...props}
        />,
    );
}

describe("AccordionFormBuilder", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    it("draws one trigger per section, titled with the section name", () => {
        renderAccordion();

        expect(screen.getByRole("button", { name: "client.sections.basic" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "client.sections.address" })).toBeInTheDocument();
    });

    it("opens the first section and does not mount the fields of closed sections", () => {
        renderAccordion();

        expect(fieldById("name")).toBeInTheDocument();
        expect(fieldById("address")).toBeNull();
    });

    it("opens another section on click and closes the first (one open at a time)", async () => {
        renderAccordion();
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "client.sections.address" }));

        expect(fieldById("address")).toBeInTheDocument();
        expect(fieldById("name")).toBeNull();
    });

    it("lays the open section out with the grid classes for `grids`", () => {
        renderAccordion({ grids: 3 });

        expect(inputById("name").closest(".grid")).toHaveClass("grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3");
    });

    it("applies permission and visibleWhen to section fields", async () => {
        renderAccordion();
        const user = userEvent.setup();

        expect(fieldById("secret")).toBeNull();
        expect(fieldById("company")).toBeNull();
        await user.type(inputById("name"), "biz");
        expect(inputById("company").parentElement?.parentElement).toHaveClass("col-span-full");
    });

    it("draws the matching sectionSlots entry for a slot field, inside the field's wrapper", async () => {
        const { container } = renderAccordion({ sectionSlots: { images: <p>image uploader</p> } });
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "client.sections.address" }));

        expect(container.querySelector(".image-slot")).toHaveTextContent("image uploader");
    });

    it("keeps the values of a closed section and sends them", async () => {
        renderAccordion();
        const user = userEvent.setup();
        await user.type(inputById("name"), "Karim");
        await user.click(screen.getByRole("button", { name: "client.sections.address" }));
        await user.type(inputById("address"), "Dhaka");
        await user.click(screen.getByRole("button", { name: "common.save" }));

        await waitFor(() => expect(writeRequests()).toHaveLength(1));
        expect(writeRequests()[0]).toEqual({
            url: "/clients",
            method: "POST",
            data: { name: "Karim", company: null, address: "Dhaka" },
        });
    });

    it("keeps the Save button outside the sections, so it shows whichever section is open", async () => {
        renderAccordion();
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "client.sections.address" }));

        expect(screen.getByRole("button", { name: "common.save" })).toBeInTheDocument();
    });
});
