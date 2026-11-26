import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ComponentProps } from "react";
import { toast } from "react-toastify";
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

const nameAndNote = (): FormFieldConfig[] => [
    { type: "text", name: "name" },
    { type: "text", name: "note" },
];

type Props = Partial<ComponentProps<typeof FormBuilder>>;

function renderEdit(props: Props = {}) {
    return renderWithClient(
        <FormBuilder
            formSchema={nameAndNote()}
            schema={anyValues}
            api="/zones"
            method="PUT"
            mode="edit"
            queryKey="zones"
            data={{ id: 5 }}
            {...props}
        />,
    );
}

const zoneRecord = { id: 5, name: "North", note: "main zone" };

const serveZone = (record: Record<string, unknown> = zoneRecord) =>
    mockApi((request) => (request.url === "/zones/5" && request.method === "GET" ? { success: true, data: record } : undefined));

const detailRequests = () => apiRequests("GET").filter((request) => request.url === "/zones/5");

async function settle() {
    await new Promise((resolve) => setTimeout(resolve, 50));
}

describe("FormBuilder edit loading", () => {
    beforeEach(() => {
        stubBrowserApis();
        serveZone();
        vi.mocked(toast.error).mockClear();
    });

    describe("when the record is fetched", () => {
        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «fetches GET api/{id} when data only has the id, and fills the form»।
        it("Load saved form values: fetches GET api/{id} when data only has the id, and fills the form", async () => {
            renderEdit();

            await waitFor(() => expect(inputById("name")).toHaveValue("North"));
            expect(inputById("note")).toHaveValue("main zone");
            expect(detailRequests()).toHaveLength(1);
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «accepts an api without a leading slash»।
        it("Load saved form values: accepts an api without a leading slash", async () => {
            renderEdit({ api: "zones" });

            await waitFor(() => expect(inputById("name")).toHaveValue("North"));
            expect(detailRequests()).toHaveLength(1);
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not fetch when data already has a key for every field»।
        it("Load saved form values: does not fetch when data already has a key for every field", async () => {
            renderEdit({ data: { id: 5, name: "From row", note: null } });
            await settle();

            expect(detailRequests()).toHaveLength(0);
            expect(inputById("name")).toHaveValue("From row");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «fetches when one field's key is missing from data»।
        it("Load saved form values: fetches when one field's key is missing from data", async () => {
            renderEdit({ data: { id: 5, name: "From row" } });

            await waitFor(() => expect(inputById("name")).toHaveValue("North"));
            expect(detailRequests()).toHaveLength(1);
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «looks for valueKey, not the field name, when deciding»।
        it("Load saved form values: looks for valueKey, not the field name, when deciding", async () => {
            renderEdit({
                formSchema: [
                    { type: "text", name: "name" },
                    { type: "dropdown", name: "zone_id", valueKey: "zone", options: [] },
                ],
                data: { id: 5, name: "From row", zone: { id: 3 } },
            });
            await settle();

            expect(detailRequests()).toHaveLength(0);
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «ignores fields with permission false and slot fields when deciding»।
        it("Load saved form values: ignores fields with permission false and slot fields when deciding", async () => {
            renderEdit({
                formSchema: [
                    { type: "text", name: "name" },
                    { type: "text", name: "secret", permission: false },
                    { type: "slot", name: "images", slot: "images" },
                ],
                data: { id: 5, name: "From row" },
            });
            await settle();

            expect(detailRequests()).toHaveLength(0);
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «for a geolocation field, looks for its latitude and longitude keys»।
        it("Load saved form values: for a geolocation field, looks for its latitude and longitude keys", async () => {
            const formSchema: FormFieldConfig[] = [
                { type: "text", name: "name" },
                { type: "geolocation", name: "location", latitudeName: "latitude", longitudeName: "longitude" },
            ];
            const complete = renderEdit({
                formSchema,
                data: { id: 5, name: "From row", latitude: "23.7", longitude: "90.4" },
            });
            await settle();
            expect(detailRequests()).toHaveLength(0);
            complete.unmount();

            renderEdit({ formSchema, data: { id: 5, name: "From row", latitude: "23.7" } });
            await waitFor(() => expect(detailRequests()).toHaveLength(1));
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «never fetches with hydrateOnEdit="never"»।
        it("Load saved form values: never fetches with hydrateOnEdit=\"never\"", async () => {
            renderEdit({ hydrateOnEdit: "never" });
            await settle();

            expect(detailRequests()).toHaveLength(0);
            expect(inputById("name")).toHaveValue("");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «always fetches with hydrateOnEdit="always", even when data is complete»।
        it("Load saved form values: always fetches with hydrateOnEdit=\"always\", even when data is complete", async () => {
            renderEdit({ hydrateOnEdit: "always", data: { id: 5, name: "From row", note: "row note" } });

            await waitFor(() => expect(inputById("name")).toHaveValue("North"));
            expect(detailRequests()).toHaveLength(1);
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not fetch in create mode, without an id, or without an api»।
        it("Load saved form values: does not fetch in create mode, without an id, or without an api", async () => {
            const create = renderEdit({ mode: "create" });
            await settle();
            create.unmount();

            const noId = renderEdit({ data: { name: "x" } });
            await settle();
            noId.unmount();

            renderEdit({ api: undefined });
            await settle();

            expect(apiRequests("GET")).toHaveLength(0);
        });
    });

    describe("while and after loading", () => {
        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a skeleton with no fields and no buttons while loading»।
        it("Load saved form values: shows a skeleton with no fields and no buttons while loading", async () => {
            let release: (value: unknown) => void = () => {};
            mockApi((request) =>
                request.url === "/zones/5"
                    ? new Promise((resolve) => {
                          release = resolve;
                      })
                    : undefined,
            );
            const { container } = renderEdit();

            await waitFor(() => expect(detailRequests()).toHaveLength(1));
            expect(fieldById("name")).toBeNull();
            expect(screen.queryByRole("button", { name: "common.save" })).not.toBeInTheDocument();
            expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);

            release({ success: true, data: zoneRecord });
            await waitFor(() => expect(inputById("name")).toHaveValue("North"));
            expect(screen.getByRole("button", { name: "common.save" })).toBeInTheDocument();
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «replaces the starting values with the fetched record»।
        it("Load saved form values: replaces the starting values with the fetched record", async () => {
            renderEdit({ data: { id: 5, only_in_row: "x" } });
            await waitFor(() => expect(inputById("name")).toHaveValue("North"));

            const user = userEvent.setup();
            await user.click(screen.getByRole("button", { name: "common.save" }));
            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            expect(writeRequests()[0]).toEqual({ url: "/zones/5", method: "PUT", data: zoneRecord });
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «converts the fetched record like edit data: dates, related ids, dropdown defaults»।
        it("Load saved form values: converts the fetched record like edit data: dates, related ids, dropdown defaults", async () => {
            serveZone({
                id: 5,
                opened_at: "2026-11-25",
                manager: { id: 9, name: "Karim" },
                status: null,
                kind: null,
            });
            renderEdit({
                formSchema: [
                    { type: "date", name: "opened_at" },
                    {
                        type: "dropdown",
                        name: "manager_id",
                        valueKey: "manager",
                        valueMapping: { idKey: "id", labelKey: "name" },
                        options: [{ value: 9, label: "Karim" }],
                    },
                    { type: "dropdown", name: "status", defaultValue: "active", options: [] },
                    { type: "radio", name: "kind", defaultValue: "home", options: [{ value: "home", label: "home" }] },
                ],
            });

            expect(await screen.findByText("Karim")).toBeInTheDocument();
            const user = userEvent.setup();
            await user.click(screen.getByRole("button", { name: "common.save" }));
            await waitFor(() => expect(writeRequests()).toHaveLength(1));

            const data = writeRequests()[0].data as Record<string, unknown>;
            const openedAt = data.opened_at as Date;
            expect([openedAt.getFullYear(), openedAt.getMonth() + 1, openedAt.getDate(), openedAt.getHours()]).toEqual([2026, 11, 25, 0]);
            expect(data.manager_id).toBe(9);
            expect(data.status).toBe("active");
            expect(data.kind).toBeNull();
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps typed values when the builder re-renders with the same formSchema array»।
        it("Load saved form values: keeps typed values when the builder re-renders with the same formSchema array", async () => {
            const stableFields = nameAndNote();
            function Host() {
                const [count, setCount] = useState(0);
                return (
                    <>
                        <button type="button" onClick={() => setCount(count + 1)}>
                            rerender {count}
                        </button>
                        <FormBuilder
                            formSchema={stableFields}
                            schema={anyValues}
                            api="/zones"
                            method="PUT"
                            mode="edit"
                            queryKey="zones"
                            data={{ id: 5 }}
                        />
                    </>
                );
            }
            renderWithClient(<Host />);
            await waitFor(() => expect(inputById("name")).toHaveValue("North"));

            const user = userEvent.setup();
            await user.type(inputById("name"), " edited");
            await user.click(screen.getByRole("button", { name: /rerender/ }));
            await settle();

            expect(inputById("name")).toHaveValue("North edited");
        });

        // Most callers build formSchema inline, so this is the common case.
        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps typed values when the parent re-renders with a new formSchema array»।
        it("Load saved form values: keeps typed values when the parent re-renders with a new formSchema array", async () => {
            function Host() {
                const [count, setCount] = useState(0);
                return (
                    <>
                        <button type="button" onClick={() => setCount(count + 1)}>
                            rerender {count}
                        </button>
                        <FormBuilder
                            formSchema={nameAndNote()}
                            schema={anyValues}
                            api="/zones"
                            method="PUT"
                            mode="edit"
                            queryKey="zones"
                            data={{ id: 5 }}
                        />
                    </>
                );
            }
            renderWithClient(<Host />);
            await waitFor(() => expect(inputById("name")).toHaveValue("North"));

            const user = userEvent.setup();
            await user.type(inputById("name"), " edited");
            expect(inputById("name")).toHaveValue("North edited");
            await user.click(screen.getByRole("button", { name: /rerender/ }));
            await settle();

            expect(inputById("name")).toHaveValue("North edited");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «fills the form again when a refetch returns a changed record»।
        it("Load saved form values: fills the form again when a refetch returns a changed record", async () => {
            const view = renderEdit();
            await waitFor(() => expect(inputById("name")).toHaveValue("North"));

            serveZone({ id: 5, name: "Renamed", note: "main zone" });
            await view.client.invalidateQueries({ queryKey: ["zones"] });

            await waitFor(() => expect(inputById("name")).toHaveValue("Renamed"));
        });
    });

    describe("when the fetch fails", () => {
        const failDetail = () =>
            mockApi((request) =>
                request.url === "/zones/5" ? { success: false, message: "zone.not_found", status: 404 } : undefined,
            );

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the failure text with Cancel and Refresh, and a toast, after two retries»।
        it("Load saved form values: shows the failure text with Cancel and Refresh, and a toast, after two retries", async () => {
            failDetail();
            renderEdit();

            expect(await screen.findByText("common.failed_to_load_data")).toBeInTheDocument();
            expect(detailRequests()).toHaveLength(3);
            expect(fieldById("name")).toBeNull();
            expect(screen.queryByRole("button", { name: "common.save" })).not.toBeInTheDocument();
            expect(toast.error).toHaveBeenCalledWith("zone.not_found");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «Refresh fetches again and shows the form when it works»।
        it("Load saved form values: fetch the saved record again and show the form after a successful refresh", async () => {
            failDetail();
            renderEdit();
            await screen.findByText("common.failed_to_load_data");

            serveZone();
            const user = userEvent.setup();
            await user.click(screen.getByRole("button", { name: "common.refresh" }));

            await waitFor(() => expect(inputById("name")).toHaveValue("North"));
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «Cancel calls onClose»।
        it("Load saved form values: Cancel calls onClose", async () => {
            failDetail();
            const onClose = vi.fn();
            renderEdit({ onClose });
            await screen.findByText("common.failed_to_load_data");

            const user = userEvent.setup();
            await user.click(screen.getByRole("button", { name: "common.cancel" }));

            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
