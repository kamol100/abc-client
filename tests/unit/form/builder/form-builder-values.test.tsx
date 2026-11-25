import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import FormBuilder from "@/components/form-wrapper/form-builder";
import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { mockApi, renderWithClient, stubBrowserApis, writeRequests } from "./harness";

vi.mock("@/app/actions", () => ({ useFetch: vi.fn() }));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const anyValues = z.object({}).passthrough();

type Props = Partial<ComponentProps<typeof FormBuilder>>;

/**
 * Renders the form with `data`, saves at once, and returns the payload. With a
 * pass-through Zod schema the payload is exactly the form's starting values, so this
 * shows how the builder turned `data` into form values.
 */
async function startingValues(formSchema: FormFieldConfig[], props: Props) {
    renderWithClient(
        <FormBuilder
            formSchema={formSchema}
            schema={anyValues}
            api="/things"
            method="POST"
            mode="edit"
            queryKey="things"
            hydrateOnEdit="never"
            {...props}
        />,
    );
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "common.save" }));
    await waitFor(() => expect(writeRequests()).toHaveLength(1));
    return writeRequests()[0].data as Record<string, unknown>;
}

describe("FormBuilder: turning data into form values", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    describe("edit mode", () => {
        it("keeps every key of the record, including ones with no field", async () => {
            const values = await startingValues([{ type: "text", name: "name" }], {
                data: { id: 5, name: "North", created_at: "2026-01-01", zone: { id: 1 } },
            });

            expect(values).toEqual({ id: 5, name: "North", created_at: "2026-01-01", zone: { id: 1 } });
        });

        it("date: turns a date-only string into a Date at UTC midnight", async () => {
            const values = await startingValues([{ type: "date", name: "paid_at" }], {
                data: { id: 5, paid_at: "2026-11-25" },
            });

            expect(values.paid_at).toBeInstanceOf(Date);
            expect((values.paid_at as Date).toISOString()).toBe("2026-11-25T00:00:00.000Z");
        });

        it("date: reads from valueKey and keeps the source key too", async () => {
            const values = await startingValues([{ type: "date", name: "paid_at", valueKey: "payment_date" }], {
                data: { id: 5, payment_date: "2026-11-25T10:30:00.000Z" },
            });

            expect((values.paid_at as Date).toISOString()).toBe("2026-11-25T10:30:00.000Z");
            expect(values.payment_date).toBe("2026-11-25T10:30:00.000Z");
        });

        it("date: leaves an empty value as it is", async () => {
            const values = await startingValues([{ type: "date", name: "paid_at" }], {
                data: { id: 5, paid_at: null },
            });

            expect(values.paid_at).toBeNull();
        });

        it("dateRange: turns from/to strings into Dates", async () => {
            const values = await startingValues([{ type: "dateRange", name: "period" }], {
                data: { id: 5, period: { from: "2026-11-01", to: "2026-11-30" } },
            });

            const period = values.period as { from: Date; to: Date };
            expect(period.from.toISOString()).toBe("2026-11-01T00:00:00.000Z");
            expect(period.to.toISOString()).toBe("2026-11-30T00:00:00.000Z");
        });

        it("dropdown: with valueKey and valueMapping, takes the id out of the related object", async () => {
            const values = await startingValues(
                [
                    {
                        type: "dropdown",
                        name: "zone_id",
                        valueKey: "zone",
                        valueMapping: { idKey: "id", labelKey: "name" },
                        options: [{ value: 3, label: "North" }],
                    },
                ],
                { data: { id: 5, zone: { id: 3, name: "North" } } },
            );

            expect(values.zone_id).toBe(3);
            expect(values.zone).toEqual({ id: 3, name: "North" });
        });

        it("dropdown: uses a custom idKey", async () => {
            const values = await startingValues(
                [
                    {
                        type: "dropdown",
                        name: "fund_uuid",
                        valueKey: "fund",
                        valueMapping: { idKey: "uuid", labelKey: "name" },
                        options: [],
                    },
                ],
                { data: { id: 5, fund: { id: 1, uuid: "f-1" } } },
            );

            expect(values.fund_uuid).toBe("f-1");
        });

        it("dropdown multi: turns a list of related objects into a list of ids", async () => {
            const values = await startingValues(
                [
                    {
                        type: "dropdown",
                        name: "tag_ids",
                        valueKey: "tags",
                        isMulti: true,
                        valueMapping: { idKey: "id", labelKey: "name" },
                        options: [],
                    },
                ],
                { data: { id: 5, tags: [{ id: 1, name: "a" }, { id: 2, name: "b" }, 7] } },
            );

            expect(values.tag_ids).toEqual([1, 2, 7]);
        });

        it("dropdown: with valueKey but no valueMapping, copies the source value unchanged", async () => {
            const values = await startingValues(
                [{ type: "dropdown", name: "zone_id", valueKey: "zone", options: [] }],
                { data: { id: 5, zone: { id: 3, name: "North" } } },
            );

            expect(values.zone_id).toEqual({ id: 3, name: "North" });
        });

        it("dropdown: with valueMapping and a plain value, keeps the plain value", async () => {
            const values = await startingValues(
                [
                    {
                        type: "dropdown",
                        name: "zone_id",
                        valueMapping: { idKey: "id", labelKey: "name" },
                        options: [],
                    },
                ],
                { data: { id: 5, zone_id: 3 } },
            );

            expect(values.zone_id).toBe(3);
        });

        it("dropdown: does not set the field when the source is null or missing", async () => {
            const values = await startingValues(
                [
                    {
                        type: "dropdown",
                        name: "zone_id",
                        valueKey: "zone",
                        valueMapping: { idKey: "id", labelKey: "name" },
                        options: [],
                    },
                ],
                { data: { id: 5, zone: null } },
            );

            expect("zone_id" in values).toBe(false);
            expect(values.zone).toBeNull();
        });
    });

    describe("create mode", () => {
        it("passes data through unchanged: no date parsing and no id extraction", async () => {
            const values = await startingValues(
                [
                    { type: "date", name: "paid_at" },
                    {
                        type: "dropdown",
                        name: "zone_id",
                        valueKey: "zone",
                        valueMapping: { idKey: "id", labelKey: "name" },
                        options: [],
                    },
                ],
                { mode: "create", data: { paid_at: "2026-11-25", zone: { id: 3 } } },
            );

            expect(values).toEqual({ paid_at: "2026-11-25", zone: { id: 3 } });
        });

        it("starts empty when no data is passed", async () => {
            const values = await startingValues([{ type: "text", name: "name" }], {
                mode: "create",
                data: undefined,
            });

            expect(values).toEqual({});
        });
    });

    describe("defaults from the field config", () => {
        const dropdown: FormFieldConfig = {
            type: "dropdown",
            name: "status",
            defaultValue: 1,
            options: [
                { value: 1, label: "active" },
                { value: 2, label: "inactive" },
            ],
        };
        const radio: FormFieldConfig = {
            type: "radio",
            name: "kind",
            defaultValue: "home",
            options: [
                { value: "home", label: "home" },
                { value: "office", label: "office" },
            ],
        };

        it("create: fills an empty dropdown and an empty radio", async () => {
            const values = await startingValues([dropdown, radio], { mode: "create", data: undefined });

            expect(values).toEqual({ status: 1, kind: "home" });
        });

        it("create: treats null and an empty string as empty", async () => {
            const values = await startingValues([dropdown, radio], {
                mode: "create",
                data: { status: null, kind: "" },
            });

            expect(values).toEqual({ status: 1, kind: "home" });
        });

        it("create: keeps a value that is already set, including 0 and false", async () => {
            const values = await startingValues([dropdown, radio], {
                mode: "create",
                data: { status: 0, kind: false },
            });

            expect(values).toEqual({ status: 0, kind: false });
        });

        it("edit: fills an empty dropdown but not an empty radio", async () => {
            const values = await startingValues([dropdown, radio], { data: { id: 5, status: null, kind: null } });

            expect(values).toEqual({ id: 5, status: 1, kind: null });
        });
    });

    describe("field arrays", () => {
        const items: FormFieldConfig = {
            type: "fieldArray",
            name: "items",
            defaultItem: { label: "", value: 0 },
            itemFields: [
                { type: "text", name: "label" },
                { type: "number", name: "value" },
            ],
        };

        it("edit: keeps the rows of the record, including blank ones", async () => {
            const values = await startingValues([items], {
                data: {
                    id: 5,
                    items: [
                        { label: "Basic", value: 100, extra: "kept" },
                        { label: "", value: 0 },
                    ],
                },
            });

            expect(values.items).toEqual([
                { label: "Basic", value: 100, extra: "kept" },
                { label: "", value: 0 },
            ]);
        });

        it("edit: drops blank rows and non-object rows when omitBlankItems is set", async () => {
            const values = await startingValues([{ ...items, omitBlankItems: true }], {
                data: {
                    id: 5,
                    items: [{ label: "", value: 0 }, null, "text", { label: "Basic", value: 100 }],
                },
            });

            expect(values.items).toEqual([{ label: "Basic", value: 100 }]);
        });

        it("edit: starts with an empty list when the record has no array", async () => {
            const values = await startingValues([items], { data: { id: 5 } });

            expect(values.items).toEqual([]);
        });

        it("edit: starts with minItems copies of defaultItem when the record has no array", async () => {
            const values = await startingValues([{ ...items, minItems: 2 }], { data: { id: 5 } });

            expect(values.items).toEqual([
                { label: "", value: 0 },
                { label: "", value: 0 },
            ]);
        });

        it("edit: parses dates and extracts ids inside rows", async () => {
            const values = await startingValues(
                [
                    {
                        type: "fieldArray",
                        name: "lines",
                        defaultItem: {},
                        itemFields: [
                            { type: "date", name: "due" },
                            {
                                type: "dropdown",
                                name: "product_id",
                                valueKey: "product",
                                valueMapping: { idKey: "id", labelKey: "name" },
                                options: [],
                            },
                        ],
                    },
                ],
                { data: { id: 5, lines: [{ due: "2026-11-25", product: { id: 8, name: "Router" } }] } },
            );

            const [line] = values.lines as Array<Record<string, unknown>>;
            expect((line.due as Date).toISOString()).toBe("2026-11-25T00:00:00.000Z");
            expect(line.product_id).toBe(8);
        });

        it("edit: reads the salary names items_label / items_value from label / value", async () => {
            const values = await startingValues(
                [
                    {
                        type: "fieldArray",
                        name: "salary_items",
                        defaultItem: {},
                        itemFields: [
                            { type: "text", name: "items_label" },
                            { type: "number", name: "items_value" },
                        ],
                    },
                ],
                { data: { id: 5, salary_items: [{ label: "Basic", value: 1000 }] } },
            );

            expect(values.salary_items).toEqual([
                { label: "Basic", value: 1000, items_label: "Basic", items_value: 1000 },
            ]);
        });

        it("create: starts with an empty list and ignores minItems", async () => {
            const values = await startingValues([{ ...items, minItems: 2 }], { mode: "create", data: undefined });

            expect(values.items).toEqual([]);
        });

        it("fills a dropdown default inside each row, and not at the top level", async () => {
            const values = await startingValues(
                [
                    {
                        type: "fieldArray",
                        name: "lines",
                        defaultItem: {},
                        itemFields: [{ type: "dropdown", name: "unit", defaultValue: "pcs", options: [] }],
                    },
                ],
                { data: { id: 5, lines: [{ unit: null }, { unit: "box" }] } },
            );

            expect("unit" in values).toBe(false);
            expect(values.lines).toEqual([{ unit: "pcs" }, { unit: "box" }]);
        });
    });
});
