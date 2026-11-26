import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { useFormContext } from "react-hook-form";
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
    useTranslation: () => ({
        t: (key: string, values?: Record<string, unknown>) =>
            values && "index" in values ? `${key} ${values.index}` : key,
        i18n: { language: "en" },
    }),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const anyValues = z.object({}).passthrough();

type Props = Partial<ComponentProps<typeof FormBuilder>>;

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

async function saveAndReadPayload(user = userEvent.setup()) {
    await user.click(screen.getByRole("button", { name: "common.save" }));
    await waitFor(() => expect(writeRequests()).toHaveLength(1));
    return writeRequests()[0].data as Record<string, unknown>;
}

const number = (value: unknown) => Number(value) || 0;

describe("computed field", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    const fields: FormFieldConfig[] = [
        { type: "number", name: "amount" },
        { type: "number", name: "quantity" },
        {
            type: "computed",
            name: "total",
            label: { labelText: "thing.total" },
            compute: ({ row }) => number(row.amount) * number(row.quantity),
        },
    ];

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a read-only value worked out from other fields, and updates it as they change»।
    it("Dependent and calculated form fields: shows a read-only value worked out from other fields, and updates it as they change", async () => {
        renderFields(fields, { data: { amount: 5, quantity: 2 } });
        const user = userEvent.setup();

        expect(inputById("total")).toHaveValue(10);
        expect(inputById("total")).toHaveAttribute("readonly");

        await user.clear(inputById("quantity"));
        await user.type(inputById("quantity"), "4");
        await waitFor(() => expect(inputById("total")).toHaveValue(20));
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the value in the form, so it is sent»।
    it("Dependent and calculated form fields: keeps the value in the form, so it is sent", async () => {
        renderFields(fields, { data: { amount: 5, quantity: 2 } });

        expect(await saveAndReadPayload()).toEqual({ amount: 5, quantity: 2, total: 10 });
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «overwrites a stale saved value»।
    it("Dependent and calculated form fields: overwrites a stale saved value", async () => {
        renderFields(fields, { mode: "edit", data: { id: 1, amount: 5, quantity: 2, total: 999 } });

        expect(await saveAndReadPayload()).toEqual({ id: 1, amount: 5, quantity: 2, total: 10 });
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «inside a row, works from that row only»।
    it("Dependent and calculated form fields: calculate a repeated row value using only that row", async () => {
        renderFields(
            [
                {
                    type: "fieldArray",
                    name: "lines",
                    defaultItem: {},
                    itemFields: fields as FieldArrayConfig["itemFields"],
                },
            ],
            { data: { lines: [{ amount: 5, quantity: 2 }, { amount: 3, quantity: 3 }] } },
        );
        const user = userEvent.setup();

        expect(inputById("lines.0.total")).toHaveValue(10);
        expect(inputById("lines.1.total")).toHaveValue(9);

        await user.clear(inputById("lines.1.amount"));
        await user.type(inputById("lines.1.amount"), "10");
        await waitFor(() => expect(inputById("lines.1.total")).toHaveValue(30));
        expect(inputById("lines.0.total")).toHaveValue(10);
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «can read the rest of the form through getFormValues»।
    it("Dependent and calculated form fields: can read the rest of the form through getFormValues", () => {
        renderFields(
            [
                {
                    type: "fieldArray",
                    name: "lines",
                    defaultItem: {},
                    itemFields: [
                        { type: "number", name: "amount" },
                        {
                            type: "computed",
                            name: "with_rate",
                            compute: ({ row, getFormValues }) => number(row.amount) * number(getFormValues().rate),
                        },
                    ],
                },
            ],
            { data: { rate: 3, lines: [{ amount: 5 }] } },
        );

        expect(inputById("lines.0.with_rate")).toHaveValue(15);
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not make an edit form fetch its record»।
    it("Dependent and calculated form fields: does not make an edit form fetch its record", async () => {
        renderFields(fields, { mode: "edit", hydrateOnEdit: "ifNeeded", data: { id: 1, amount: 5, quantity: 2 } });
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(apiRequests("GET")).toHaveLength(0);
    });
});

describe("custom field", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    function Doubler({ name }: { name: string }) {
        const { setValue, watch } = useFormContext();
        return (
            <button type="button" onClick={() => setValue(name, number(watch(name)) * 2)}>
                double {name}: {String(watch(name) ?? "")}
            </button>
        );
    }

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «draws your component in the field's place, with the field wrapper around it»।
    it("Dependent and calculated form fields: draws your component in the field's place, with the field wrapper around it", () => {
        const { container } = renderFields([
            { type: "custom", name: "summary", className: "col-span-full", render: () => <p>my summary</p> },
        ]);

        expect(screen.getByText("my summary").parentElement).toHaveClass("col-span-full");
        expect(container.querySelector("form")).toContainElement(screen.getByText("my summary"));
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «gets its form path, also inside a row, and can read and write the form»।
    it("Dependent and calculated form fields: gets its form path, also inside a row, and can read and write the form", async () => {
        renderFields(
            [
                {
                    type: "fieldArray",
                    name: "lines",
                    defaultItem: {},
                    itemFields: [{ type: "custom", name: "points", render: ({ name }) => <Doubler name={name} /> }],
                },
            ],
            { data: { lines: [{ points: 2 }, { points: 5 }] } },
        );
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "double lines.1.points: 5" }));

        expect(await saveAndReadPayload(user)).toEqual({ lines: [{ points: 2 }, { points: 10 }] });
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «applies permission and visibleWhen like any other field»।
    it("Dependent and calculated form fields: applies permission and visibleWhen like any other field", async () => {
        renderFields([
            { type: "text", name: "kind" },
            { type: "custom", name: "secret", permission: false, render: () => <p>secret</p> },
            { type: "custom", name: "extra", visibleWhen: { field: "kind", equals: "x" }, render: () => <p>extra</p> },
        ]);
        const user = userEvent.setup();

        expect(screen.queryByText("secret")).not.toBeInTheDocument();
        expect(screen.queryByText("extra")).not.toBeInTheDocument();
        await user.type(inputById("kind"), "x");
        expect(screen.getByText("extra")).toBeInTheDocument();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «makes an edit form fetch only for the record keys it names»।
    it("Dependent and calculated form fields: makes an edit form fetch only for the record keys it names", async () => {
        const custom = (sourceKeys?: string[]): FormFieldConfig[] => [
            { type: "custom", name: "widget", sourceKeys, render: () => <p>widget</p> },
        ];

        const noKeys = renderFields(custom(), { mode: "edit", hydrateOnEdit: "ifNeeded", data: { id: 1 } });
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(apiRequests("GET")).toHaveLength(0);
        noKeys.unmount();

        renderFields(custom(["events"]), { mode: "edit", hydrateOnEdit: "ifNeeded", data: { id: 1 } });
        await waitFor(() => expect(apiRequests("GET")).toHaveLength(1));
    });
});

describe("disabledWhen", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «disables a field while the rule passes»।
    it("Dependent and calculated form fields: disables a field while the rule passes", async () => {
        renderFields([
            { type: "text", name: "kind" },
            { type: "text", name: "detail", disabledWhen: { field: "kind", equals: "locked" } },
        ]);
        const user = userEvent.setup();

        expect(inputById("detail")).toBeEnabled();
        await user.type(inputById("kind"), "locked");
        expect(inputById("detail")).toBeDisabled();
        await user.type(inputById("kind"), "!");
        expect(inputById("detail")).toBeEnabled();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «with `when`, can disable a field until another one is filled»।
    it("Dependent and calculated form fields: with `when`, can disable a field until another one is filled", async () => {
        renderFields([
            { type: "text", name: "network" },
            { type: "text", name: "command", disabledWhen: { field: "network", when: (value) => !value } },
        ]);
        const user = userEvent.setup();

        expect(inputById("command")).toBeDisabled();
        await user.type(inputById("network"), "1");
        expect(inputById("command")).toBeEnabled();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps a field disabled that is disabled in its config»।
    it("Dependent and calculated form fields: keeps a field disabled that is disabled in its config", () => {
        renderFields([
            { type: "text", name: "detail", disabled: true, disabledWhen: { field: "kind", equals: "locked" } },
        ]);

        expect(inputById("detail")).toBeDisabled();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «inside a row, reads the field of the same row»।
    it("Dependent and calculated form fields: inside a row, reads the field of the same row", () => {
        renderFields(
            [
                {
                    type: "fieldArray",
                    name: "lines",
                    defaultItem: {},
                    itemFields: [
                        { type: "text", name: "kind" },
                        { type: "text", name: "detail", disabledWhen: { field: "kind", equals: "locked" } },
                    ],
                },
            ],
            { data: { lines: [{ kind: "locked" }, { kind: "open" }] } },
        );

        expect(inputById("lines.0.detail")).toBeDisabled();
        expect(inputById("lines.1.detail")).toBeEnabled();
    });
});

describe("field array as a table", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    const lines = (overrides: Partial<FieldArrayConfig> = {}): FieldArrayConfig => ({
        type: "fieldArray",
        name: "lines",
        minItems: 1,
        defaultItem: { description: "", amount: 0 },
        addButtonLabel: "thing.lines.add",
        table: {
            title: "thing.lines.title",
            rowLabel: "thing.lines.item",
            removeLabel: "thing.lines.remove",
            columns: { description: 8, amount: { span: 3, align: "right" } },
        },
        itemFields: [
            { type: "text", name: "description", label: { labelText: "thing.description" } },
            { type: "number", name: "amount", label: { labelText: "thing.amount" } },
        ],
        ...overrides,
    });

    const twoLines = { lines: [{ description: "A", amount: 1 }, { description: "B", amount: 2 }] };

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «draws a heading with the Add button, a header row of column names, and one row per item»।
    it("Dependent and calculated form fields: draws a heading with the Add button, a header row of column names, and one row per item", () => {
        const { container } = renderFields([lines()], { data: twoLines });

        expect(screen.getByRole("heading", { name: "thing.lines.title" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "thing.lines.add" })).toHaveAttribute("type", "button");

        const header = container.querySelector(".md\\:grid.grid-cols-12") as HTMLElement;
        expect(Array.from(header.children).map((cell) => [cell.textContent, cell.className])).toEqual([
            ["thing.description", "col-span-8"],
            ["thing.amount", "col-span-3 text-right"],
            ["common.actions", "col-span-1 text-right"],
        ]);

        expect(inputById("lines.0.description")).toHaveValue("A");
        expect(inputById("lines.1.amount")).toHaveValue(2);
        expect(inputById("lines.0.description").parentElement?.parentElement).toHaveClass("md:col-span-8");
        expect(screen.getByText("thing.lines.item 2")).toBeInTheDocument();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «adds a row with defaultItem and removes a row, without submitting»।
    it("Dependent and calculated form fields: adds a row with defaultItem and removes a row, without submitting", async () => {
        renderFields([lines()], { data: twoLines });
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "thing.lines.add" }));
        expect(inputById("lines.2.amount")).toHaveValue(0);

        await user.click(screen.getAllByRole("button", { name: "thing.lines.remove" })[0]);
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(fieldById("lines.2.description")).toBeNull();
        expect(inputById("lines.0.description")).toHaveValue("B");
        expect(writeRequests()).toHaveLength(0);
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «disables the remove buttons at minItems, and hides Add at maxItems»।
    it("Dependent and calculated form fields: disables the remove buttons at minItems, and hides Add at maxItems", () => {
        renderFields([lines({ maxItems: 1 })], { data: { lines: [{ description: "A", amount: 1 }] } });

        screen
            .getAllByRole("button", { name: "thing.lines.remove" })
            .forEach((button) => expect(button).toBeDisabled());
        expect(screen.queryByRole("button", { name: "thing.lines.add" })).not.toBeInTheDocument();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «reserveErrorSpace keeps a line free under every row field»।
    it("Dependent and calculated form fields: reserveErrorSpace keeps a line free under every row field", () => {
        const { container } = renderFields(
            [{ type: "text", name: "outside" }, lines({ reserveErrorSpace: true })],
            { data: twoLines },
        );

        // Two rows of two fields; the field outside the rows is not affected.
        expect(container.querySelectorAll(".min-h-\\[1\\.25rem\\]:not([aria-hidden])")).toHaveLength(4);
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «leaves out a row field with permission false, from the header and the rows»।
    it("Dependent and calculated form fields: leaves out a row field with permission false, from the header and the rows", () => {
        const { container } = renderFields(
            [
                lines({
                    itemFields: [
                        { type: "text", name: "description", label: { labelText: "thing.description" } },
                        { type: "number", name: "amount", label: { labelText: "thing.amount" }, permission: false },
                    ],
                }),
            ],
            { data: twoLines },
        );

        const header = container.querySelector(".md\\:grid.grid-cols-12") as HTMLElement;
        expect(header).not.toHaveTextContent("thing.amount");
        expect(fieldById("lines.0.amount")).toBeNull();
    });
});

describe("conditions on more than one field", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «visibleWhen all: shown only while every rule passes»।
    it("Dependent and calculated form fields: visibleWhen all: shown only while every rule passes", async () => {
        renderFields([
            { type: "text", name: "kind" },
            { type: "text", name: "plan" },
            {
                type: "text",
                name: "extra",
                visibleWhen: { all: [{ field: "kind", equals: "a" }, { field: "plan", equals: "b" }] },
            },
        ]);
        const user = userEvent.setup();

        await user.type(inputById("kind"), "a");
        expect(fieldById("extra")).toBeNull();
        await user.type(inputById("plan"), "b");
        expect(fieldById("extra")).toBeInTheDocument();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «visibleWhen any: shown while at least one rule passes, and reset when none does»।
    it("Dependent and calculated form fields: visibleWhen any: shown while at least one rule passes, and reset when none does", async () => {
        renderFields(
            [
                { type: "text", name: "status" },
                {
                    type: "text",
                    name: "fund",
                    visibleWhen: {
                        any: [{ field: "status", equals: "paid" }, { field: "status", equals: "partial" }],
                        resetValue: "",
                    },
                },
            ],
            { data: { status: "partial", fund: "cash" } },
        );
        const user = userEvent.setup();

        expect(inputById("fund")).toHaveValue("cash");
        await user.clear(inputById("status"));
        await user.type(inputById("status"), "due");

        expect(fieldById("fund")).toBeNull();
        expect(await saveAndReadPayload(user)).toEqual({ status: "due", fund: "" });
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «disabledWhen any: disabled while at least one rule passes»।
    it("Dependent and calculated form fields: disabledWhen any: disabled while at least one rule passes", () => {
        renderFields(
            [
                {
                    type: "text",
                    name: "detail",
                    disabledWhen: { any: [{ field: "locked", equals: 1 }, { field: "archived", equals: 1 }] },
                },
            ],
            { data: { locked: 0, archived: 1 } },
        );

        expect(inputById("detail")).toBeDisabled();
    });
});

describe("onChange effect", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    const fields: FormFieldConfig[] = [
        { type: "text", name: "product", onChange: { set: { lot: null, serials: [] } } },
        { type: "text", name: "lot" },
    ];

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «writes the given values into other fields when the user changes the field»।
    it("Dependent and calculated form fields: writes the given values into other fields when the user changes the field", async () => {
        renderFields(fields, { data: { product: "a", lot: "L1", serials: ["s1"] } });
        const user = userEvent.setup();
        await user.type(inputById("product"), "b");

        await waitFor(() => expect(inputById("lot")).toHaveValue(""));
        expect(await saveAndReadPayload(user)).toEqual({ product: "ab", lot: null, serials: [] });
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not fire when the form opens with values»।
    it("Dependent and calculated form fields: does not fire when the form opens with values", async () => {
        renderFields(fields, { data: { product: "a", lot: "L1", serials: ["s1"] } });
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(await saveAndReadPayload()).toEqual({ product: "a", lot: "L1", serials: ["s1"] });
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not fire when an edit record arrives»।
    it("Dependent and calculated form fields: does not fire when an edit record arrives", async () => {
        mockApi((request) =>
            request.url === "/things/5"
                ? { success: true, data: { id: 5, product: "a", lot: "L1", serials: ["s1"] } }
                : undefined,
        );
        renderFields(fields, { mode: "edit", hydrateOnEdit: "always", data: { id: 5, product: "", lot: "" } });

        await waitFor(() => expect(inputById("lot")).toHaveValue("L1"));
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(inputById("lot")).toHaveValue("L1");
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «fires when the user changes the field away and back»।
    it("Dependent and calculated form fields: fires when the user changes the field away and back", async () => {
        renderFields(fields, { data: { product: "a", lot: "L1" } });
        const user = userEvent.setup();
        await user.type(inputById("product"), "b");
        await waitFor(() => expect(inputById("lot")).toHaveValue(""));
        await user.type(inputById("lot"), "L2");
        await user.type(inputById("product"), "{Backspace}");

        await waitFor(() => expect(inputById("lot")).toHaveValue(""));
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «inside a row, changes the fields of that row only; a leading slash names a top-level field»।
    it("Dependent and calculated form fields: inside a row, changes the fields of that row only; a leading slash names a top-level field", async () => {
        renderFields(
            [
                { type: "text", name: "note" },
                {
                    type: "fieldArray",
                    name: "lines",
                    defaultItem: {},
                    itemFields: [
                        { type: "text", name: "product", onChange: { set: { lot: null, "/note": "changed" } } },
                        { type: "text", name: "lot" },
                    ],
                },
            ],
            { data: { note: "", lines: [{ product: "a", lot: "L1" }, { product: "b", lot: "L2" }] } },
        );
        const user = userEvent.setup();
        await user.type(inputById("lines.1.product"), "x");

        await waitFor(() => expect(inputById("lines.1.lot")).toHaveValue(""));
        expect(inputById("lines.0.lot")).toHaveValue("L1");
        expect(inputById("note")).toHaveValue("changed");
    });
});

describe("field array with its own render", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    const lines: FieldArrayConfig = {
        type: "fieldArray",
        name: "lines",
        minItems: 1,
        maxItems: 3,
        defaultItem: { name: "new", qty: 1 },
        itemFields: [
            { type: "text", name: "name", className: "name-cell" },
            { type: "number", name: "qty", visibleWhen: { field: "name", when: (value) => value !== "hide" } },
        ],
        render: ({ rows, addRow, canAppend, canRemove }) => (
            <section data-testid="custom-lines">
                {canAppend && (
                    <button type="button" onClick={addRow}>
                        add line
                    </button>
                )}
                {rows.map((row) => (
                    <article key={row.key} data-path={row.path}>
                        <span>row {row.index + 1}</span>
                        {row.field("name")}
                        {row.field("qty")}
                        {row.field("not a field")}
                        <button type="button" disabled={!canRemove} onClick={row.remove}>
                            remove {row.index + 1}
                        </button>
                    </article>
                ))}
            </section>
        ),
    };

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «draws your markup, with the fields of itemFields placed by name»।
    it("Dependent and calculated form fields: draws your markup, with the fields of itemFields placed by name", () => {
        renderFields([lines], { data: { lines: [{ name: "A", qty: 2 }] } });

        const article = screen.getByText("row 1").parentElement as HTMLElement;
        expect(article).toHaveAttribute("data-path", "lines.0");
        expect(inputById("lines.0.name")).toHaveValue("A");
        expect(inputById("lines.0.name").parentElement?.parentElement).toHaveClass("name-cell");
        expect(inputById("lines.0.qty")).toHaveValue(2);
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the fields' rules working, per row»।
    it("Dependent and calculated form fields: keeps the fields' rules working, per row", async () => {
        renderFields([lines], { data: { lines: [{ name: "A", qty: 2 }, { name: "hide", qty: 3 }] } });

        expect(fieldById("lines.0.qty")).toBeInTheDocument();
        expect(fieldById("lines.1.qty")).toBeNull();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «adds and removes rows through addRow and row.remove, within minItems and maxItems»।
    it("Dependent and calculated form fields: adds and removes rows through addRow and row.remove, within minItems and maxItems", async () => {
        renderFields([lines], { data: { lines: [{ name: "A", qty: 2 }] } });
        const user = userEvent.setup();

        expect(screen.getByRole("button", { name: "remove 1" })).toBeDisabled();
        await user.click(screen.getByRole("button", { name: "add line" }));
        await user.click(screen.getByRole("button", { name: "add line" }));
        expect(inputById("lines.2.name")).toHaveValue("new");
        expect(screen.queryByRole("button", { name: "add line" })).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "remove 1" }));
        expect(inputById("lines.0.name")).toHaveValue("new");
        expect(fieldById("lines.2.name")).toBeNull();
    });
});

describe("smaller field options", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «step and reserveErrorSpace reach a number input»।
    it("Dependent and calculated form fields: step and reserveErrorSpace reach a number input", () => {
        const { container } = renderFields([
            { type: "number", name: "price", step: "any", reserveErrorSpace: true },
            { type: "number", name: "count" },
        ]);

        expect(inputById("price")).toHaveAttribute("step", "any");
        expect(inputById("count")).not.toHaveAttribute("step");
        expect(container.querySelectorAll(".min-h-\\[1\\.25rem\\]")).toHaveLength(1);
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «a computed field with `display` draws that in place of the input, and still stores the value»।
    it("Dependent and calculated form fields: a computed field with `display` draws that in place of the input, and still stores the value", async () => {
        renderFields(
            [
                { type: "number", name: "amount" },
                {
                    type: "computed",
                    name: "double",
                    compute: ({ row }) => number(row.amount) * 2,
                    display: (value) => <output>twice: {value}</output>,
                },
            ],
            { data: { amount: 4 } },
        );

        expect(screen.getByText("twice: 8")).toBeInTheDocument();
        expect(fieldById("double")).toBeNull();
        expect(await saveAndReadPayload()).toEqual({ amount: 4, double: 8 });
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «dependsOn.isSet decides when the parent counts as chosen»।
    it("Dependent and calculated form fields: dependsOn.isSet decides when the parent counts as chosen", async () => {
        mockApi((request) =>
            request.url === "/dropdown-lots/3" ? { success: true, data: [{ id: 9, name: "Lot 9" }] } : undefined,
        );
        const fields = (productId: number): [FormFieldConfig[], Props] => [
            [
                {
                    type: "dropdown",
                    name: "lot_id",
                    dependsOn: {
                        field: "product_id",
                        buildApi: (id) => `/dropdown-lots/${id}`,
                        isSet: (value) => Number(value) > 0,
                    },
                },
            ],
            { data: { product_id: productId } },
        ];

        const none = renderFields(...fields(0));
        await waitFor(() => expect(fieldById("lot_id")).toBeInTheDocument());
        expect(fieldById("lot_id")?.closest(".basic-single")).toHaveClass("select--is-disabled");
        expect(apiRequests("GET")).toHaveLength(0);
        none.unmount();

        renderFields(...fields(3));
        await waitFor(() => expect(apiRequests("GET").map((request) => request.url)).toEqual(["/dropdown-lots/3"]));
    });
});
