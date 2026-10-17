import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FormFilter from "@/components/form-wrapper/form-filter";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

vi.mock("@/components/ui/sidebar", () => ({
    useSidebar: () => ({ isMobile: false }),
}));

const fields: FieldConfig[] = Array.from({ length: 8 }, (_, index) => ({
    type: "text",
    name: `field_${index}`,
    placeholder: `field.${index}`,
}));

function renderFilter(filterRows?: number) {
    const { container } = render(
        <FormFilter
            formSchema={fields}
            grids={fields.length}
            forceOpen
            hideTrigger
            filterRows={filterRows}
        />,
    );
    return {
        html: container.innerHTML,
        root: container.firstElementChild?.className ?? "",
    };
}

describe("FormFilter filter rows", () => {
    it("uses flexible rows when filter_row is set", () => {
        const { html, root } = renderFilter(2);
        expect(html.match(/flex-wrap/g)).toHaveLength(2);
        expect(html).toContain("sm:min-w-[12rem]");
        expect(html).not.toContain("lg:grid-cols-8");
        expect(root).toContain("h-auto");
        expect(root).not.toContain("h-9");
    });

    it("keeps the single-row grid when filter_row is omitted", () => {
        const { html, root } = renderFilter();
        expect(html).toContain("lg:grid-cols-8");
        expect(root).toContain("h-9");
    });
});
