import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import FormBuilder from "@/components/form-wrapper/form-builder";
import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
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

/** The react-select wrapper of the dropdown whose input id is `name`. */
function selectRoot(name: string): HTMLElement {
    const root = fieldById(name)?.closest(".basic-single");
    if (!(root instanceof HTMLElement)) throw new Error(`No dropdown "${name}"`);
    return root;
}

async function pickOption(user: ReturnType<typeof userEvent.setup>, name: string, label: string) {
    await waitFor(() => expect(fieldById(name)).toBeInTheDocument());
    await user.click(fieldById(name) as HTMLElement);
    await user.click(await screen.findByText(label));
}

describe("FormBuilder visibleWhen", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    it("equals: shows the field only while the other field has that value", async () => {
        renderFields([
            { type: "text", name: "kind" },
            { type: "text", name: "company", visibleWhen: { field: "kind", equals: "business" } },
        ]);
        const user = userEvent.setup();

        expect(fieldById("company")).toBeNull();
        await user.type(inputById("kind"), "business");
        expect(fieldById("company")).toBeInTheDocument();
        await user.type(inputById("kind"), "x");
        expect(fieldById("company")).toBeNull();
    });

    it("equals: compares as text, so the number 1 matches \"1\"", () => {
        renderFields(
            [
                { type: "text", name: "kind" },
                { type: "text", name: "extra", visibleWhen: { field: "kind", equals: 1 } },
            ],
            { data: { kind: "1" } },
        );

        expect(fieldById("extra")).toBeInTheDocument();
    });

    it("when: uses the function and ignores equals", () => {
        renderFields(
            [
                { type: "text", name: "kind" },
                {
                    type: "text",
                    name: "extra",
                    visibleWhen: { field: "kind", equals: "never", when: (value) => value === "a" || value === "b" },
                },
            ],
            { data: { kind: "b" } },
        );

        expect(fieldById("extra")).toBeInTheDocument();
    });

    it("with neither: shows the field while the other field is filled", async () => {
        renderFields([
            { type: "text", name: "agent" },
            { type: "text", name: "commission", visibleWhen: { field: "agent" } },
        ]);
        const user = userEvent.setup();

        expect(fieldById("commission")).toBeNull();
        await user.type(inputById("agent"), "7");
        expect(fieldById("commission")).toBeInTheDocument();
        await user.clear(inputById("agent"));
        expect(fieldById("commission")).toBeNull();
    });

    it("with neither: an empty list counts as not filled, and 0 and false count as filled", () => {
        renderFields(
            [
                { type: "text", name: "by_list", visibleWhen: { field: "list" } },
                { type: "text", name: "by_zero", visibleWhen: { field: "zero" } },
                { type: "text", name: "by_false", visibleWhen: { field: "no" } },
            ],
            { data: { list: [], zero: 0, no: false } },
        );

        expect(fieldById("by_list")).toBeNull();
        expect(fieldById("by_zero")).toBeInTheDocument();
        expect(fieldById("by_false")).toBeInTheDocument();
    });

    it("keeps the field className on the wrapper", () => {
        renderFields(
            [{ type: "text", name: "extra", className: "col-span-full", visibleWhen: { field: "kind", equals: "a" } }],
            { data: { kind: "a" } },
        );

        expect(inputById("extra").parentElement?.parentElement).toHaveClass("col-span-full");
    });

    it("writes null into a field that starts hidden", async () => {
        renderFields([
            { type: "text", name: "kind" },
            { type: "text", name: "company", visibleWhen: { field: "kind", equals: "business" } },
        ]);

        expect(await saveAndReadPayload()).toEqual({ company: null });
    });

    it("clears the value to null when the field is hidden after it was filled", async () => {
        renderFields([
            { type: "text", name: "kind" },
            { type: "text", name: "company", visibleWhen: { field: "kind", equals: "b" } },
        ]);
        const user = userEvent.setup();
        await user.type(inputById("kind"), "b");
        await user.type(inputById("company"), "Acme");
        await user.type(inputById("kind"), "x");

        expect(await saveAndReadPayload(user)).toEqual({ kind: "bx", company: null });
    });

    it("uses resetValue in place of null", async () => {
        renderFields([
            { type: "text", name: "kind" },
            { type: "text", name: "auth", visibleWhen: { field: "kind", equals: "v3", resetValue: "SHA" } },
            { type: "text", name: "flag", visibleWhen: { field: "kind", equals: "v3", resetValue: false } },
            { type: "text", name: "text", visibleWhen: { field: "kind", equals: "v3", resetValue: "" } },
        ]);

        expect(await saveAndReadPayload()).toEqual({ auth: "SHA", flag: false, text: "" });
    });

    it("overwrites a saved value of a hidden field in edit data", async () => {
        renderFields(
            [
                { type: "text", name: "kind" },
                { type: "text", name: "company", visibleWhen: { field: "kind", equals: "business" } },
            ],
            { mode: "edit", data: { id: 5, kind: "home", company: "Old Co" } },
        );

        expect(await saveAndReadPayload()).toEqual({ id: 5, kind: "home", company: null });
    });
});

describe("FormBuilder dependent dropdown (dependsOn)", () => {
    const networks = [
        { id: 1, name: "Network A" },
        { id: 2, name: "Network B" },
    ];
    const packagesByNetwork: Record<string, Array<{ id: number; name: string }>> = {
        "/dropdown-packages/1": [{ id: 11, name: "A 10 Mbps" }],
        "/dropdown-packages/2": [{ id: 21, name: "B 20 Mbps" }],
    };

    const fields = (resetOnChange?: boolean): FormFieldConfig[] => [
        { type: "dropdown", name: "network_id", api: "/dropdown-networks" },
        {
            type: "dropdown",
            name: "package_id",
            api: "/never-used",
            dependsOn: {
                field: "network_id",
                buildApi: (networkId) => `/dropdown-packages/${networkId}`,
                ...(resetOnChange === undefined ? {} : { resetOnChange }),
            },
        },
    ];

    beforeEach(() => {
        stubBrowserApis();
        mockApi((request) => {
            if (request.url === "/dropdown-networks") return { success: true, data: networks };
            if (request.url in packagesByNetwork) return { success: true, data: packagesByNetwork[request.url] };
            return undefined;
        });
    });

    it("is disabled and loads nothing until the parent has a value", async () => {
        renderFields(fields());

        await waitFor(() => expect(selectRoot("package_id")).toHaveClass("select--is-disabled"));
        expect(apiRequests("GET").map((request) => request.url)).toEqual(["/dropdown-networks"]);
    });

    it("loads its options from buildApi(parent value) and never from its own api", async () => {
        renderFields(fields());
        const user = userEvent.setup();
        await pickOption(user, "network_id", "Network B");
        await pickOption(user, "package_id", "B 20 Mbps");

        expect(apiRequests("GET").map((request) => request.url)).toEqual([
            "/dropdown-networks",
            "/dropdown-packages/2",
        ]);
        expect(await saveAndReadPayload(user)).toEqual({ network_id: 2, package_id: 21 });
    });

    it("clears its value to null when the parent changes", async () => {
        renderFields(fields());
        const user = userEvent.setup();
        await pickOption(user, "network_id", "Network A");
        await pickOption(user, "package_id", "A 10 Mbps");
        await pickOption(user, "network_id", "Network B");

        expect(await saveAndReadPayload(user)).toEqual({ network_id: 2, package_id: null });
    });

    it("keeps its value when the parent changes and resetOnChange is false", async () => {
        renderFields(fields(false));
        const user = userEvent.setup();
        await pickOption(user, "network_id", "Network A");
        await pickOption(user, "package_id", "A 10 Mbps");
        await pickOption(user, "network_id", "Network B");

        expect(await saveAndReadPayload(user)).toEqual({ network_id: 2, package_id: 11 });
    });

    it("keeps a saved child value when the form opens with both values", async () => {
        renderFields(fields(), { mode: "edit", data: { id: 5, network_id: 1, package_id: 11 } });

        expect(await screen.findByText("A 10 Mbps")).toBeInTheDocument();
        expect(await saveAndReadPayload()).toEqual({ id: 5, network_id: 1, package_id: 11 });
    });
});

describe("FormBuilder dropdown populate", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi((request) =>
            request.url === "/dropdown-agents"
                ? {
                      success: true,
                      data: [
                          { id: 7, name: "Karim", commission: 12, phone: null },
                          { id: 8, name: "Rahim" },
                      ],
                  }
                : undefined,
        );
    });

    const fields: FormFieldConfig[] = [
        {
            type: "dropdown",
            name: "agent_id",
            api: "/dropdown-agents",
            populate: [
                { field: "commission", from: "commission" },
                { field: "agent_phone", from: "phone" },
            ],
        },
        { type: "number", name: "commission" },
    ];

    it("copies values from the chosen option's record into other fields, including fields with no input", async () => {
        renderFields(fields);
        const user = userEvent.setup();
        await pickOption(user, "agent_id", "Karim");

        expect(inputById("commission")).toHaveValue(12);
        expect(await saveAndReadPayload(user)).toEqual({ agent_id: 7, commission: 12, agent_phone: null });
    });

    it("leaves a target alone when the chosen record has no such key", async () => {
        renderFields(fields, { data: { commission: 5 } });
        const user = userEvent.setup();
        await pickOption(user, "agent_id", "Rahim");

        expect(await saveAndReadPayload(user)).toEqual({ agent_id: 8, commission: 5 });
    });
});
