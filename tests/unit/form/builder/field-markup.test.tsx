/**
 * Markup snapshots for every field type.
 *
 * The form builder refactor moves how fields are drawn into a registry. These snapshots
 * record the exact HTML each field produces today, in a form and in a filter, so a
 * structural change can be shown to leave the markup (classes, ids, labels, errors)
 * untouched. Update a snapshot only for a change that is meant to alter the markup.
 */
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import AccordionFormBuilder from "@/components/form-wrapper/accordion-form-builder";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormFilter from "@/components/form-wrapper/form-filter";
import type { FieldConfig, FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { fieldById, mockApi, renderWithClient, stubBrowserApis } from "./harness";

vi.mock("@/app/actions", () => ({ useFetch: vi.fn() }));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const options = [
    { value: 1, label: "option.one" },
    { value: 2, label: "option.two" },
];

const label = (name: string) => ({ labelText: `thing.${name}`, mandatory: true, tooltip: `thing.${name}.tip` });

const everyField: FormFieldConfig[] = [
    { type: "text", name: "text", label: label("text"), placeholder: "thing.text.hint" },
    { type: "email", name: "email", label: label("email") },
    { type: "number", name: "number", label: label("number"), disabled: true },
    { type: "tel", name: "tel", label: label("tel"), readOnly: true },
    { type: "password", name: "password", label: label("password") },
    { type: "textarea", name: "textarea", label: label("textarea"), rows: 3, className: "col-span-full" },
    { type: "dropdown", name: "dropdown", label: label("dropdown"), options, placeholder: "thing.dropdown.hint" },
    { type: "dropdown", name: "multi", label: label("multi"), options, isMulti: true, isClearable: false },
    { type: "radio", name: "radio", label: label("radio"), options, direction: "row" },
    { type: "switch", name: "switch", label: label("switch") },
    { type: "checkbox", name: "checkbox", label: label("checkbox"), options },
    { type: "checkbox", name: "single", label: label("single"), single: true },
    { type: "date", name: "date", label: label("date"), placeholder: "thing.date.hint" },
    { type: "dateRange", name: "range", label: label("range") },
    {
        type: "geolocation",
        name: "location",
        latitudeName: "latitude",
        longitudeName: "longitude",
        latitudeLabel: label("latitude"),
        longitudeLabel: label("longitude"),
    },
    { type: "text", name: "conditional", label: label("conditional"), visibleWhen: { field: "text" } },
    {
        type: "fieldArray",
        name: "rows",
        label: { labelText: "thing.rows" },
        defaultItem: {},
        grids: 2,
        allowReorder: true,
        itemFields: [
            { type: "text", name: "label", label: label("row_label") },
            { type: "dropdown", name: "kind", options },
        ],
    },
];

const everyValue = {
    text: "Router",
    email: "a@example.com",
    number: 5,
    tel: "01712345678",
    password: "secret",
    textarea: "Note",
    dropdown: 2,
    multi: [1, 2],
    radio: 2,
    switch: true,
    checkbox: [1],
    single: true,
    date: new Date(2026, 10, 25),
    range: { from: new Date(2026, 10, 1), to: new Date(2026, 10, 30) },
    latitude: "23.7",
    longitude: "90.4",
    conditional: "shown",
    rows: [{ label: "A", kind: 1 }, { label: "B", kind: 2 }],
};

/** A schema that rejects every field, so each one shows an error message. */
const everyFieldInvalid = z
    .object({})
    .passthrough()
    .superRefine((_values, context) => {
        const names = [
            "text", "email", "number", "tel", "password", "textarea", "dropdown", "multi", "radio",
            "switch", "checkbox", "single", "date", "range", "latitude", "longitude",
        ];
        names.forEach((name) => {
            context.addIssue({ code: z.ZodIssueCode.custom, path: [name], message: `thing.${name}.invalid` });
        });
        context.addIssue({ code: z.ZodIssueCode.custom, path: ["rows", 0, "label"], message: "thing.row.invalid" });
    });

const GENERATED_ID = /^(radix-|_r_|:r)|(_r_\w+_)/;

/**
 * A copy of the DOM with generated ids replaced by a fixed word. Radix builds ids
 * from React's id counter, which shifts when the component tree changes shape, and
 * that is not a markup change.
 */
function stableDom(root: HTMLElement): HTMLElement {
    const copy = root.cloneNode(true) as HTMLElement;
    copy.querySelectorAll("*").forEach((element) => {
        for (const attribute of Array.from(element.attributes)) {
            if (["id", "for", "aria-controls", "aria-labelledby", "aria-describedby"].includes(attribute.name)) {
                if (GENERATED_ID.test(attribute.value)) element.setAttribute(attribute.name, "generated-id");
            }
        }
    });
    return copy;
}

async function dropdownsReady(names: string[]) {
    await waitFor(() => names.forEach((name) => expect(fieldById(name)).toBeInTheDocument()));
}

describe("field markup", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    it("FormBuilder: every field type, empty", async () => {
        const { container } = renderWithClient(
            <FormBuilder
                formSchema={everyField}
                schema={z.object({}).passthrough()}
                api="/things"
                method="POST"
                mode="create"
                grids={2}
                hydrateOnEdit="never"
            />,
        );
        await dropdownsReady(["dropdown", "multi"]);

        expect(stableDom(container)).toMatchSnapshot();
    });

    it("FormBuilder: every field type, filled", async () => {
        const { container } = renderWithClient(
            <FormBuilder
                formSchema={everyField}
                schema={z.object({}).passthrough()}
                api="/things"
                method="POST"
                mode="create"
                grids={2}
                data={everyValue}
                hydrateOnEdit="never"
            />,
        );
        await dropdownsReady(["dropdown", "multi", "rows.0.kind", "rows.1.kind"]);

        expect(stableDom(container)).toMatchSnapshot();
    });

    it("FormBuilder: every field type, with a validation error", async () => {
        const { container } = renderWithClient(
            <FormBuilder
                formSchema={everyField}
                schema={everyFieldInvalid}
                api="/things"
                method="POST"
                mode="create"
                grids={2}
                data={everyValue}
                hydrateOnEdit="never"
            />,
        );
        await dropdownsReady(["dropdown", "multi", "rows.0.kind", "rows.1.kind"]);
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "common.save" }));
        await screen.findByText("thing.text.invalid");

        expect(stableDom(container)).toMatchSnapshot();
    });

    it("AccordionFormBuilder: sections with a slot", async () => {
        const { container } = renderWithClient(
            <AccordionFormBuilder
                formSchema={[
                    { name: "thing.section.one", form: everyField.slice(0, 7) },
                    {
                        name: "thing.section.two",
                        form: [{ type: "slot", name: "images", slot: "images", className: "col-span-full" }],
                    },
                ]}
                sectionSlots={{ images: <p>images</p> }}
                schema={z.object({}).passthrough()}
                api="/things"
                method="POST"
                mode="create"
                grids={2}
                hydrateOnEdit="never"
            />,
        );
        await dropdownsReady(["dropdown"]);

        expect(stableDom(container)).toMatchSnapshot();
    });

    describe("FormFilter", () => {
        const filterFields: FieldConfig[] = [
            { type: "text", name: "search", placeholder: "thing.search" },
            { type: "email", name: "email", label: { labelText: "thing.email" } },
            { type: "number", name: "amount", placeholder: "thing.amount" },
            { type: "tel", name: "phone", placeholder: "thing.phone" },
            { type: "dropdown", name: "status", options, placeholder: "thing.status" },
            { type: "date", name: "paid_at", placeholder: "thing.paid_at" },
            { type: "dateRange", name: "period", placeholder: "thing.period" },
            { type: "radio", name: "kind", options },
            { type: "text", name: "hidden", permission: false },
        ];

        it("every filter field type, in one grid row", async () => {
            const { container } = renderWithClient(
                <FormFilter formSchema={filterFields} grids={4} forceOpen searchButton />,
            );
            await dropdownsReady(["status"]);

            expect(stableDom(container)).toMatchSnapshot();
        });

        it("every filter field type, in flexible rows", async () => {
            const { container } = renderWithClient(
                <FormFilter formSchema={filterFields} filterRows={2} forceOpen hideTrigger resultCount={12} />,
            );
            await dropdownsReady(["status"]);

            expect(stableDom(container)).toMatchSnapshot();
        });

        it("a text filter with a value shows its clear button", async () => {
            const { container } = renderWithClient(
                <FormFilter formSchema={filterFields.slice(0, 1)} forceOpen hideTrigger />,
            );
            const user = userEvent.setup();
            await user.type(fieldById("search") as HTMLElement, "abc");

            expect(stableDom(container)).toMatchSnapshot();
        });
    });
});

describe("FormFilter idPrefix", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    it("keeps filter ids apart from a form with the same field names", () => {
        renderWithClient(
            <>
                <FormFilter formSchema={[{ type: "text", name: "name" }]} forceOpen hideTrigger idPrefix="filter" />
                <FormBuilder
                    formSchema={[{ type: "text", name: "name" }]}
                    schema={z.object({}).passthrough()}
                    api="/things"
                    method="POST"
                    mode="create"
                />
            </>,
        );

        expect(document.querySelectorAll("#name")).toHaveLength(1);
        expect(fieldById("filter-name")).toBeInTheDocument();
    });
});
