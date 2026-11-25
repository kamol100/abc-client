import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import FormBuilder from "@/components/form-wrapper/form-builder";
import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import {
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

const statusOptions = [
    { value: 1, label: "status.active" },
    { value: 2, label: "status.inactive" },
];

describe("FormBuilder fields", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    describe("what each type draws", () => {
        it.each(["text", "email", "number", "tel"] as const)(
            "%s: an input whose id is the field name, with label and placeholder",
            (type) => {
                renderFields([
                    { type, name: "value", label: { labelText: "thing.value" }, placeholder: "thing.value.hint" },
                ]);

                const input = inputById("value");
                expect(input).toHaveAttribute("type", type);
                expect(input).toHaveAttribute("placeholder", "thing.value.hint");
                expect(screen.getByText("thing.value").closest("label")).toHaveAttribute("for", "value");
            },
        );

        it("tel: uses the phone keypad", () => {
            renderFields([{ type: "tel", name: "phone" }]);

            expect(inputById("phone")).toHaveAttribute("inputmode", "tel");
        });

        it("password: a password input with a show/hide button", async () => {
            renderFields([{ type: "password", name: "password" }]);
            const user = userEvent.setup();

            expect(inputById("password")).toHaveAttribute("type", "password");
            await user.click(screen.getByRole("button", { name: "common.show_password" }));
            expect(inputById("password")).toHaveAttribute("type", "text");
        });

        it("textarea: a textarea with the given rows (4 by default)", () => {
            renderFields([
                { type: "textarea", name: "note" },
                { type: "textarea", name: "long_note", rows: 8 },
            ]);

            expect(fieldById("note")?.tagName).toBe("TEXTAREA");
            expect(fieldById("note")).toHaveAttribute("rows", "4");
            expect(fieldById("long_note")).toHaveAttribute("rows", "8");
        });

        it("dropdown: a react-select whose input id is the field name", async () => {
            const { container } = renderFields([
                { type: "dropdown", name: "status", options: statusOptions, placeholder: "thing.status.hint" },
            ]);

            await waitFor(() => expect(fieldById("status")).toHaveAttribute("role", "combobox"));
            expect(container.querySelector(".select__control")).toBeInTheDocument();
            expect(screen.getByText("thing.status.hint")).toBeInTheDocument();
        });

        it("radio: one radio per option, with id name-value", () => {
            renderFields([{ type: "radio", name: "kind", options: statusOptions }]);

            expect(screen.getAllByRole("radio")).toHaveLength(2);
            expect(fieldById("kind-1")).toHaveAttribute("role", "radio");
            expect(screen.getByText("status.inactive")).toHaveAttribute("for", "kind-2");
        });

        it("switch: a switch with id switch-name", () => {
            renderFields([{ type: "switch", name: "is_active", label: { labelText: "thing.active" } }]);

            expect(screen.getByRole("switch")).toHaveAttribute("id", "switch-is_active");
            expect(screen.getByText("thing.active").closest("label")).toHaveAttribute("for", "switch-is_active");
        });

        it("switch: clicking the label flips it", async () => {
            renderFields([{ type: "switch", name: "is_active", label: { labelText: "thing.active" } }]);
            const user = userEvent.setup();
            await user.click(screen.getByText("thing.active"));

            expect(screen.getByRole("switch")).toBeChecked();
        });

        it("checkbox: one checkbox per option, or a single one with id name", () => {
            renderFields([
                { type: "checkbox", name: "days", options: statusOptions },
                { type: "checkbox", name: "agree", single: true, label: { labelText: "thing.agree" } },
            ]);

            expect(fieldById("days-1")).toHaveAttribute("role", "checkbox");
            expect(fieldById("days-2")).toHaveAttribute("role", "checkbox");
            expect(fieldById("agree")).toHaveAttribute("role", "checkbox");
            expect(screen.getByText("thing.agree")).toHaveAttribute("for", "agree");
        });

        it("date and dateRange: a button with id name that shows the placeholder", () => {
            renderFields([
                { type: "date", name: "paid_at", placeholder: "thing.paid_at.hint" },
                { type: "dateRange", name: "period", placeholder: "thing.period.hint" },
            ]);

            expect(fieldById("paid_at")?.tagName).toBe("BUTTON");
            expect(fieldById("paid_at")).toHaveTextContent("thing.paid_at.hint");
            expect(fieldById("period")).toHaveTextContent("thing.period.hint");
        });

        it("date: shows a saved date month-first (MM/dd/yyyy) by default", () => {
            renderFields([{ type: "date", name: "paid_at" }], { data: { paid_at: new Date(2026, 10, 25) } });

            expect(fieldById("paid_at")).toHaveTextContent("11/25/2026");
        });

        it("geolocation: two inputs named by latitudeName and longitudeName", () => {
            renderFields([
                {
                    type: "geolocation",
                    name: "location",
                    latitudeName: "latitude",
                    longitudeName: "longitude",
                    latitudeLabel: { labelText: "thing.lat" },
                },
            ]);

            expect(inputById("latitude")).toHaveAttribute("type", "text");
            expect(inputById("longitude")).toHaveAttribute("type", "text");
            expect(fieldById("location")).toBeNull();
            expect(screen.getByRole("button", { name: "common.get_current_location" })).toBeInTheDocument();
        });
    });

    describe("layout and visibility", () => {
        it("draws fields in schema order inside a grid with the column classes for `grids`", () => {
            const { container } = renderFields(
                [
                    { type: "text", name: "first" },
                    { type: "text", name: "second" },
                ],
                { grids: 2 },
            );

            const grid = container.querySelector("form > div");
            expect(grid).toHaveClass("grid", "gap-4", "grid-cols-1", "sm:grid-cols-2", "w-full");
            expect(Array.from(container.querySelectorAll("input[type=text]")).map((input) => input.id)).toEqual([
                "first",
                "second",
            ]);
        });

        it("puts the field className on the wrapper around the field", () => {
            renderFields([{ type: "text", name: "note", className: "col-span-full" }]);

            expect(inputById("note").parentElement?.parentElement).toHaveClass("col-span-full");
        });

        it("leaves out a field with permission false", () => {
            renderFields([
                { type: "text", name: "shown" },
                { type: "text", name: "secret", permission: false },
            ]);

            expect(fieldById("shown")).toBeInTheDocument();
            expect(fieldById("secret")).toBeNull();
        });

        it("draws an empty wrapper for a slot field in the plain builder", () => {
            const { container } = renderFields([
                { type: "slot", name: "images", slot: "images", className: "slot-wrapper" },
            ]);

            const wrapper = container.querySelector(".slot-wrapper");
            expect(wrapper).toBeInTheDocument();
            expect(wrapper).toBeEmptyDOMElement();
        });

        it("passes disabled and readOnly to a text input", () => {
            renderFields([
                { type: "text", name: "locked", disabled: true },
                { type: "text", name: "fixed", readOnly: true },
            ]);

            expect(inputById("locked")).toBeDisabled();
            expect(inputById("fixed")).toHaveAttribute("readonly");
        });
    });

    describe("custom layout with the children function", () => {
        const fields: FormFieldConfig[] = [
            { type: "text", name: "first" },
            { type: "text", name: "hidden_by_permission", permission: false },
            { type: "text", name: "second", className: "ignored-class" },
        ];

        it("draws only what the function returns, with no default grid", () => {
            const { container } = renderFields(fields, {
                children: (renderField) => <section data-testid="custom">{renderField(fields[2])}</section>,
            });

            expect(screen.getByTestId("custom")).toContainElement(inputById("second"));
            expect(fieldById("first")).toBeNull();
            expect(container.querySelector(".grid")).toBeNull();
        });

        it("does not apply permission or className; the caller must do that", () => {
            const { container } = renderFields(fields, {
                children: (renderField) => <>{fields.map((field) => <div key={field.name}>{renderField(field)}</div>)}</>,
            });

            expect(fieldById("hidden_by_permission")).toBeInTheDocument();
            expect(container.querySelector(".ignored-class")).toBeNull();
        });

        it("still submits through the builder", async () => {
            renderFields(fields, { children: (renderField) => renderField(fields[0]) });
            const user = userEvent.setup();
            await user.type(inputById("first"), "A");

            expect(await saveAndReadPayload(user)).toEqual({ first: "A" });
        });
    });

    describe("what each type stores", () => {
        it("text stores a string and number stores a string too", async () => {
            renderFields([
                { type: "text", name: "name" },
                { type: "number", name: "amount" },
            ]);
            const user = userEvent.setup();
            await user.type(inputById("name"), "Router");
            await user.type(inputById("amount"), "12");

            expect(await saveAndReadPayload(user)).toEqual({ name: "Router", amount: "12" });
        });

        it("tel removes a typed +88 on blur", async () => {
            renderFields([{ type: "tel", name: "phone" }]);
            const user = userEvent.setup();
            await user.type(inputById("phone"), "+8801712345678");
            await user.tab();

            expect(inputById("phone")).toHaveValue("01712345678");
        });

        it("an untouched field is not in the payload", async () => {
            renderFields([
                { type: "text", name: "name" },
                { type: "textarea", name: "note" },
            ]);
            const user = userEvent.setup();
            await user.type(inputById("name"), "A");

            expect(await saveAndReadPayload(user)).toEqual({ name: "A" });
        });

        it("dropdown stores the option value, and null after clear", async () => {
            const { container } = renderFields([{ type: "dropdown", name: "status", options: statusOptions }]);
            const user = userEvent.setup();
            await user.click(await screen.findByRole("combobox"));
            await user.click(await screen.findByText("status.inactive"));

            await user.click(screen.getByRole("button", { name: "common.save" }));
            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            expect(writeRequests()[0].data).toEqual({ status: 2 });
        });

        it("dropdown clear stores null", async () => {
            const { container } = renderFields([{ type: "dropdown", name: "status", options: statusOptions }], {
                data: { status: 1 },
                resetOnSuccess: false,
            });
            const user = userEvent.setup();
            await screen.findByText("status.active");
            await user.click(container.querySelector(".select__clear-indicator") as HTMLElement);

            expect(await saveAndReadPayload(user)).toEqual({ status: null });
        });

        it("a multi dropdown stores an array of values", async () => {
            renderFields([{ type: "dropdown", name: "tags", options: statusOptions, isMulti: true }]);
            const user = userEvent.setup();
            await user.click(await screen.findByRole("combobox"));
            await user.click(await screen.findByText("status.active"));
            await user.click(screen.getByRole("combobox"));
            await user.click(await screen.findByText("status.inactive"));

            expect(await saveAndReadPayload(user)).toEqual({ tags: [1, 2] });
        });

        it("dropdown matches a saved value to an option as a string (\"2\" selects 2)", async () => {
            renderFields([{ type: "dropdown", name: "status", options: statusOptions }], { data: { status: "2" } });

            expect(await screen.findByText("status.inactive")).toBeInTheDocument();
        });

        it("dropdown shows a saved value that has no option as the value itself, and keeps it", async () => {
            const { container } = renderFields(
                [{ type: "dropdown", name: "status", options: statusOptions, placeholder: "pick" }],
                { data: { status: 99 } },
            );
            const user = userEvent.setup();

            await waitFor(() => expect(container.querySelector(".select__single-value")).toHaveTextContent("99"));
            expect(await saveAndReadPayload(user)).toEqual({ status: 99 });
        });

        it("dropdown shows nothing for a missing option while its options are loading", async () => {
            let release: (value: unknown) => void = () => {};
            mockApi((request) =>
                request.url === "/dropdown-zones"
                    ? new Promise((resolve) => {
                          release = resolve;
                      })
                    : undefined,
            );
            const { container } = renderFields(
                [{ type: "dropdown", name: "zone_id", api: "/dropdown-zones", placeholder: "pick" }],
                { data: { zone_id: 3 } },
            );

            expect(await screen.findByText("pick")).toBeInTheDocument();
            expect(container.querySelector(".select__single-value")).toBeNull();

            release({ success: true, data: [{ id: 3, name: "North" }] });
            expect(await screen.findByText("North")).toBeInTheDocument();
        });

        it("a multi dropdown keeps the order of the saved values and shows a missing one as itself", async () => {
            const { container } = renderFields(
                [{ type: "dropdown", name: "tags", options: statusOptions, isMulti: true }],
                { data: { tags: [2, 99, 1] } },
            );

            await waitFor(() =>
                expect(
                    Array.from(container.querySelectorAll(".select__multi-value__label")).map((node) => node.textContent),
                ).toEqual(["status.inactive", "99", "status.active"]),
            );
        });

        it("radio stores the option value as a string, even for a number option", async () => {
            renderFields([{ type: "radio", name: "kind", options: statusOptions }]);
            const user = userEvent.setup();
            await user.click(fieldById("kind-2") as HTMLElement);

            expect(await saveAndReadPayload(user)).toEqual({ kind: "2" });
        });

        it("switch stores true or false", async () => {
            renderFields([{ type: "switch", name: "is_active" }]);
            const user = userEvent.setup();
            await user.click(screen.getByRole("switch"));

            expect(await saveAndReadPayload(user)).toEqual({ is_active: true });
        });

        it("a switch with saveOnChange saves the form each time it is flipped", async () => {
            renderFields([
                { type: "text", name: "name" },
                { type: "switch", name: "is_active", saveOnChange: true },
            ], { resetOnSuccess: false });
            const user = userEvent.setup();
            await user.type(inputById("name"), "Router");
            await user.click(screen.getByRole("switch"));

            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            expect(writeRequests()[0].data).toEqual({ name: "Router", is_active: true });

            await user.click(screen.getByRole("switch"));
            await waitFor(() => expect(writeRequests()).toHaveLength(2));
            expect(writeRequests()[1].data).toEqual({ name: "Router", is_active: false });
        });

        it("a switch with saveOnChange does not save an invalid form", async () => {
            renderFields([{ type: "switch", name: "is_active", saveOnChange: true }], {
                schema: z.object({ name: z.string({ required_error: "name.required" }) }).passthrough(),
            });
            const user = userEvent.setup();
            await user.click(screen.getByRole("switch"));
            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(writeRequests()).toHaveLength(0);
        });

        it("checkbox stores an array of values, and a single checkbox stores a boolean", async () => {
            renderFields([
                { type: "checkbox", name: "days", options: statusOptions },
                { type: "checkbox", name: "agree", single: true },
            ]);
            const user = userEvent.setup();
            await user.click(fieldById("days-2") as HTMLElement);
            await user.click(fieldById("days-1") as HTMLElement);
            await user.click(fieldById("agree") as HTMLElement);

            expect(await saveAndReadPayload(user)).toEqual({ days: [2, 1], agree: true });
        });
    });

    describe("dropdown options from the API", () => {
        it("loads options from `api` and uses item.name as the label and item.id as the value", async () => {
            mockApi((request) =>
                request.url === "/dropdown-zones"
                    ? { success: true, data: [{ id: 3, name: "North" }, { id: 4, name: "South" }] }
                    : undefined,
            );
            renderFields([{ type: "dropdown", name: "zone_id", api: "/dropdown-zones" }]);
            const user = userEvent.setup();
            await user.click(await screen.findByRole("combobox"));
            await user.click(await screen.findByText("South"));

            expect(await saveAndReadPayload(user)).toEqual({ zone_id: 4 });
        });

        it("uses valueMapping.idKey as the option value and labelKey as the label", async () => {
            mockApi((request) =>
                request.url === "/dropdown-funds"
                    ? {
                          success: true,
                          data: [
                              { id: 1, uuid: "f-1", name: "Cash", title: "Cash title" },
                              { id: 2, uuid: "f-2", name: "No title, so it is dropped" },
                          ],
                      }
                    : undefined,
            );
            renderFields([
                {
                    type: "dropdown",
                    name: "fund_uuid",
                    api: "/dropdown-funds",
                    valueMapping: { idKey: "uuid", labelKey: "title" },
                },
            ]);
            const user = userEvent.setup();
            await user.click(await screen.findByRole("combobox"));

            expect(await screen.findByText("Cash title")).toBeInTheDocument();
            expect(screen.queryByText("Cash")).not.toBeInTheDocument();
            expect(screen.queryByText("No title, so it is dropped")).not.toBeInTheDocument();

            await user.click(screen.getByText("Cash title"));
            expect(await saveAndReadPayload(user)).toEqual({ fund_uuid: "f-1" });
        });

        it("says so in the menu when the options fail to load, and tries again when it is opened", async () => {
            mockApi((request) =>
                request.url === "/dropdown-zones" ? { success: false, message: "boom", status: 500 } : undefined,
            );
            renderFields([{ type: "dropdown", name: "zone_id", api: "/dropdown-zones" }]);
            const user = userEvent.setup();
            await user.click(await screen.findByRole("combobox"));
            expect(await screen.findByText("common.failed_to_load_data")).toBeInTheDocument();

            mockApi((request) =>
                request.url === "/dropdown-zones" ? { success: true, data: [{ id: 3, name: "North" }] } : undefined,
            );
            await user.keyboard("{Escape}");
            await user.click(screen.getByRole("combobox"));

            expect(await screen.findByText("North")).toBeInTheDocument();
        });

        it("says \"no options\" in the app language for an empty list", async () => {
            renderFields([{ type: "dropdown", name: "zone_id", options: [] }]);
            const user = userEvent.setup();
            await user.click(await screen.findByRole("combobox"));

            expect(await screen.findByText("common.no_options")).toBeInTheDocument();
        });

        it("turns typing off with isSearchable false", async () => {
            renderFields([
                { type: "dropdown", name: "plain", options: statusOptions },
                { type: "dropdown", name: "fixed", options: statusOptions, isSearchable: false },
            ]);

            await waitFor(() => expect(fieldById("fixed")).toBeInTheDocument());
            // react-select swaps the text input for one that takes no typing.
            expect(fieldById("plain")).toHaveAttribute("type", "text");
            expect(fieldById("fixed")).toHaveAttribute("inputmode", "none");
        });
    });
});
