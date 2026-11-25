import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import FormBuilder from "@/components/form-wrapper/form-builder";
import type { FieldArrayConfig, FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import {
    apiRequests,
    fieldById,
    inputById,
    mockApi,
    renderWithClient,
    stubBrowserApis,
    writeRequests,
} from "./harness";

vi.mock("@/app/actions", () => ({ useFetch: vi.fn() }));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const anyValues = z.object({}).passthrough();

type Props = Partial<ComponentProps<typeof FormBuilder>>;

const items = (overrides: Partial<FieldArrayConfig> = {}): FieldArrayConfig => ({
    type: "fieldArray",
    name: "items",
    label: { labelText: "salary.items" },
    defaultItem: { label: "", value: "" },
    itemFields: [
        { type: "text", name: "label", label: { labelText: "salary.item_label" } },
        { type: "number", name: "value" },
    ],
    ...overrides,
});

const twoRows = { items: [{ label: "Basic", value: "100" }, { label: "Bonus", value: "20" }] };

function renderFields(formSchema: FormFieldConfig[], props: Props = {}) {
    return renderWithClient(
        <FormBuilder
            formSchema={formSchema}
            schema={anyValues}
            api="/things"
            method="POST"
            mode="create"
            queryKey="things"
            hydrateOnEdit="never"
            {...props}
        />,
    );
}

/** One element per row. A row is the bordered box around its fields and buttons. */
function rows(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(".border.rounded-md.p-3"));
}

/** The buttons of a row, in order. They have icons only, so they are found by position. */
function rowButtons(row: HTMLElement): HTMLButtonElement[] {
    return within(row).queryAllByRole("button") as HTMLButtonElement[];
}

const addButton = () => screen.getByRole("button", { name: "Add" });
const labels = (container: HTMLElement) =>
    rows(container).map((_, index) => inputById(`items.${index}.label`).value);

async function settle() {
    await new Promise((resolve) => setTimeout(resolve, 50));
}

describe("FormBuilder field array", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    describe("rows", () => {
        it("draws one row per item, with ids like items.0.label", () => {
            const { container } = renderFields([items()], { data: twoRows });

            expect(rows(container)).toHaveLength(2);
            expect(inputById("items.0.label")).toHaveValue("Basic");
            expect(inputById("items.1.value")).toHaveValue(20);
            expect(screen.getByText("salary.items")).toBeInTheDocument();
        });

        it("draws no rows when there is no data, only the Add button", () => {
            const { container } = renderFields([items()]);

            expect(rows(container)).toHaveLength(0);
            expect(addButton()).toBeInTheDocument();
        });

        it("spans the full grid width by default, or uses className", () => {
            const first = renderFields([items()]);
            expect(addButton().parentElement).toHaveClass("col-span-full", "space-y-4");
            first.unmount();

            renderFields([items({ className: "custom-rows" })]);
            expect(addButton().parentElement).toHaveClass("custom-rows");
            expect(addButton().parentElement).not.toHaveClass("col-span-full");
        });

        it("lays the row fields out with the array's own `grids`", () => {
            const { container } = renderFields([items({ grids: 2 })], { data: twoRows });

            expect(rows(container)[0].firstElementChild).toHaveClass("grid", "sm:grid-cols-2");
        });

        it("leaves out a row field with permission false", () => {
            renderFields(
                [
                    items({
                        itemFields: [
                            { type: "text", name: "label" },
                            { type: "number", name: "value", permission: false },
                        ],
                    }),
                ],
                { data: twoRows },
            );

            expect(fieldById("items.0.label")).toBeInTheDocument();
            expect(fieldById("items.0.value")).toBeNull();
        });

        it("sends the edited rows as a list", async () => {
            renderFields([items()], { data: twoRows });
            const user = userEvent.setup();
            await user.clear(inputById("items.1.label"));
            await user.type(inputById("items.1.label"), "Allowance");
            await user.click(screen.getByRole("button", { name: "common.save" }));

            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            expect(writeRequests()[0].data).toEqual({
                items: [
                    { label: "Basic", value: "100" },
                    { label: "Allowance", value: "20" },
                ],
            });
        });
    });

    describe("add, remove, reorder", () => {
        it("Add appends a copy of defaultItem", async () => {
            const { container } = renderFields([items({ defaultItem: { label: "New", value: "0" } })], {
                data: twoRows,
            });
            const user = userEvent.setup();
            await user.click(addButton());

            expect(labels(container)).toEqual(["Basic", "Bonus", "New"]);
        });

        it("uses addButtonLabel as the Add button text", () => {
            renderFields([items({ addButtonLabel: "salary.add_item" })]);

            expect(screen.getByRole("button", { name: "salary.add_item" })).toBeInTheDocument();
        });

        it("the row button removes that row", async () => {
            const { container } = renderFields([items()], { data: twoRows });
            const user = userEvent.setup();
            await user.click(rowButtons(rows(container)[0])[0]);

            expect(labels(container)).toEqual(["Bonus"]);
        });

        it("hides the remove button at minItems, and shows it again above it", async () => {
            const { container } = renderFields([items({ minItems: 2 })], { data: twoRows });
            const user = userEvent.setup();

            expect(rowButtons(rows(container)[0])).toHaveLength(0);
            await user.click(addButton());
            expect(rowButtons(rows(container)[0])).toHaveLength(1);
        });

        it("hides the Add button at maxItems", async () => {
            const { container } = renderFields([items({ maxItems: 3 })], { data: twoRows });
            const user = userEvent.setup();
            await user.click(addButton());

            expect(rows(container)).toHaveLength(3);
            expect(screen.queryByRole("button", { name: "Add" })).not.toBeInTheDocument();
        });

        it("hides Add with allowAppend false and remove with allowRemove false", () => {
            const { container } = renderFields([items({ allowAppend: false, allowRemove: false })], {
                data: twoRows,
            });

            expect(screen.queryByRole("button", { name: "Add" })).not.toBeInTheDocument();
            expect(rowButtons(rows(container)[0])).toHaveLength(0);
        });

        it("with allowReorder, shows up on every row but the first and down on every row but the last", async () => {
            const { container } = renderFields([items({ allowReorder: true, allowRemove: false })], {
                data: { items: [{ label: "A" }, { label: "B" }, { label: "C" }] },
            });
            const user = userEvent.setup();

            expect(rows(container).map((row) => rowButtons(row).length)).toEqual([1, 2, 1]);

            await user.click(rowButtons(rows(container)[0])[0]);
            expect(labels(container)).toEqual(["B", "A", "C"]);

            await user.click(rowButtons(rows(container)[2])[0]);
            expect(labels(container)).toEqual(["B", "C", "A"]);
        });
    });

    // Known problems from the audit, written down as they behave today. The refactor
    // must change these tests in the same commit that fixes each problem.
    describe("known problems", () => {
        it("Add does not submit, because it sets type=\"button\"", async () => {
            const { container } = renderFields([items()], { data: twoRows });
            const user = userEvent.setup();

            expect(addButton()).toHaveAttribute("type", "button");
            await user.click(addButton());
            await settle();

            expect(rows(container)).toHaveLength(3);
            expect(writeRequests()).toHaveLength(0);
        });

        it("remove does not submit, because it sets type=\"button\"", async () => {
            const { container } = renderFields([items()], { data: twoRows });
            const user = userEvent.setup();
            const remove = rowButtons(rows(container)[0])[0];

            expect(remove).toHaveAttribute("type", "button");
            await user.click(remove);
            await settle();

            expect(labels(container)).toEqual(["Bonus"]);
            expect(writeRequests()).toHaveLength(0);
        });

        it("the reorder buttons do not submit, because they set type=\"button\"", async () => {
            const { container } = renderFields([items({ allowReorder: true, allowRemove: false })], {
                data: twoRows,
            });
            const user = userEvent.setup();
            await user.click(rowButtons(rows(container)[1])[0]);
            await settle();

            expect(labels(container)).toEqual(["Bonus", "Basic"]);
            expect(writeRequests()).toHaveLength(0);
        });

        it("B8: visibleWhen on a row field is ignored; the field is always drawn", () => {
            renderFields(
                [
                    items({
                        itemFields: [
                            { type: "text", name: "label" },
                            { type: "text", name: "extra", visibleWhen: { field: "label", equals: "never" } },
                        ],
                    }),
                ],
                { data: twoRows },
            );

            expect(fieldById("items.0.extra")).toBeInTheDocument();
        });

        it("B8: dependsOn on a row field watches the top-level field of that name, not the row's field", async () => {
            mockApi((request) => {
                if (request.url === "/dropdown-products") return { success: true, data: [{ id: 1, name: "Router" }] };
                if (request.url === "/dropdown-lots/1") return { success: true, data: [{ id: 9, name: "Lot 9" }] };
                return undefined;
            });
            const lines: FieldArrayConfig = {
                type: "fieldArray",
                name: "lines",
                defaultItem: {},
                itemFields: [
                    { type: "dropdown", name: "product_id", api: "/dropdown-products" },
                    {
                        type: "dropdown",
                        name: "lot_id",
                        dependsOn: { field: "product_id", buildApi: (id) => `/dropdown-lots/${id}` },
                    },
                ],
            };

            // The row has a product, but there is no top-level product_id: the lot stays disabled.
            const rowOnly = renderFields([lines], { data: { lines: [{ product_id: 1 }] } });
            await screen.findByText("Router");
            expect(fieldById("lines.0.lot_id")?.closest(".basic-single")).toHaveClass("select--is-disabled");
            expect(apiRequests("GET").map((request) => request.url)).not.toContain("/dropdown-lots/1");
            rowOnly.unmount();

            // A top-level product_id enables the lot of every row, whatever the row's own product is.
            renderFields([lines], { data: { product_id: 1, lines: [{ product_id: null }] } });
            await waitFor(() =>
                expect(apiRequests("GET").map((request) => request.url)).toContain("/dropdown-lots/1"),
            );
            expect(fieldById("lines.0.lot_id")?.closest(".basic-single")).not.toHaveClass("select--is-disabled");
        });
    });

    describe("populate inside a row", () => {
        it("fills the target field of the same row", async () => {
            mockApi((request) =>
                request.url === "/dropdown-lots"
                    ? { success: true, data: [{ id: 9, name: "Lot 9", unit_sell_price: 450 }] }
                    : undefined,
            );
            renderFields(
                [
                    {
                        type: "fieldArray",
                        name: "lines",
                        defaultItem: {},
                        itemFields: [
                            {
                                type: "dropdown",
                                name: "lot_id",
                                api: "/dropdown-lots",
                                populate: [{ field: "unit_price", from: "unit_sell_price" }],
                            },
                            { type: "number", name: "unit_price" },
                        ],
                    },
                ],
                { data: { lines: [{}, {}] } },
            );
            const user = userEvent.setup();
            await waitFor(() => expect(fieldById("lines.1.lot_id")).toBeInTheDocument());
            await user.click(fieldById("lines.1.lot_id") as HTMLElement);
            await user.click(await screen.findByText("Lot 9"));

            expect(inputById("lines.1.unit_price")).toHaveValue(450);
            expect(inputById("lines.0.unit_price")).toHaveValue(null);
        });
    });
});
