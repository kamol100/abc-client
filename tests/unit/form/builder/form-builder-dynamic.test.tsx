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

    it("shows a read-only value worked out from other fields, and updates it as they change", async () => {
        renderFields(fields, { data: { amount: 5, quantity: 2 } });
        const user = userEvent.setup();

        expect(inputById("total")).toHaveValue(10);
        expect(inputById("total")).toHaveAttribute("readonly");

        await user.clear(inputById("quantity"));
        await user.type(inputById("quantity"), "4");
        await waitFor(() => expect(inputById("total")).toHaveValue(20));
    });

    it("keeps the value in the form, so it is sent", async () => {
        renderFields(fields, { data: { amount: 5, quantity: 2 } });

        expect(await saveAndReadPayload()).toEqual({ amount: 5, quantity: 2, total: 10 });
    });

    it("overwrites a stale saved value", async () => {
        renderFields(fields, { mode: "edit", data: { id: 1, amount: 5, quantity: 2, total: 999 } });

        expect(await saveAndReadPayload()).toEqual({ id: 1, amount: 5, quantity: 2, total: 10 });
    });

    it("inside a row, works from that row only", async () => {
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

    it("can read the rest of the form through getFormValues", () => {
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

    it("does not make an edit form fetch its record", async () => {
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

    it("draws your component in the field's place, with the field wrapper around it", () => {
        const { container } = renderFields([
            { type: "custom", name: "summary", className: "col-span-full", render: () => <p>my summary</p> },
        ]);

        expect(screen.getByText("my summary").parentElement).toHaveClass("col-span-full");
        expect(container.querySelector("form")).toContainElement(screen.getByText("my summary"));
    });

    it("gets its form path, also inside a row, and can read and write the form", async () => {
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

    it("applies permission and visibleWhen like any other field", async () => {
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

    it("makes an edit form fetch only for the record keys it names", async () => {
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

    it("disables a field while the rule passes", async () => {
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

    it("with `when`, can disable a field until another one is filled", async () => {
        renderFields([
            { type: "text", name: "network" },
            { type: "text", name: "command", disabledWhen: { field: "network", when: (value) => !value } },
        ]);
        const user = userEvent.setup();

        expect(inputById("command")).toBeDisabled();
        await user.type(inputById("network"), "1");
        expect(inputById("command")).toBeEnabled();
    });

    it("keeps a field disabled that is disabled in its config", () => {
        renderFields([
            { type: "text", name: "detail", disabled: true, disabledWhen: { field: "kind", equals: "locked" } },
        ]);

        expect(inputById("detail")).toBeDisabled();
    });

    it("inside a row, reads the field of the same row", () => {
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

    it("draws a heading with the Add button, a header row of column names, and one row per item", () => {
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

    it("adds a row with defaultItem and removes a row, without submitting", async () => {
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

    it("disables the remove buttons at minItems, and hides Add at maxItems", () => {
        renderFields([lines({ maxItems: 1 })], { data: { lines: [{ description: "A", amount: 1 }] } });

        screen
            .getAllByRole("button", { name: "thing.lines.remove" })
            .forEach((button) => expect(button).toBeDisabled());
        expect(screen.queryByRole("button", { name: "thing.lines.add" })).not.toBeInTheDocument();
    });

    it("reserveErrorSpace keeps a line free under every row field", () => {
        const { container } = renderFields(
            [{ type: "text", name: "outside" }, lines({ reserveErrorSpace: true })],
            { data: twoLines },
        );

        // Two rows of two fields; the field outside the rows is not affected.
        expect(container.querySelectorAll(".min-h-\\[1\\.25rem\\]:not([aria-hidden])")).toHaveLength(4);
    });

    it("leaves out a row field with permission false, from the header and the rows", () => {
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
