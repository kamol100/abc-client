import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { toast } from "react-toastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import FormBuilder from "@/components/form-wrapper/form-builder";
import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { MyDialog } from "@/components/my-dialog";
import {
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

const fields: FormFieldConfig[] = [
    { type: "text", name: "name", label: { labelText: "zone.name" }, placeholder: "zone.name.placeholder" },
    { type: "text", name: "note" },
];

const schema = z
    .object({
        name: z.string({ required_error: "zone.name.required" }).min(1, "zone.name.required"),
        note: z.string().nullable().optional(),
    })
    .passthrough();

type Props = Partial<ComponentProps<typeof FormBuilder>>;

function renderForm(props: Props = {}) {
    return renderWithClient(
        <FormBuilder
            formSchema={fields}
            schema={schema}
            api="/zones"
            method="POST"
            mode="create"
            queryKey="zones"
            hydrateOnEdit="never"
            {...props}
        />,
    );
}

async function typeNameAndSave(name = "North") {
    const user = userEvent.setup();
    await user.type(inputById("name"), name);
    await user.click(screen.getByRole("button", { name: "common.save" }));
    return user;
}

describe("FormBuilder submit", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
        vi.mocked(toast.success).mockClear();
        vi.mocked(toast.error).mockClear();
    });

    describe("request", () => {
        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «create sends POST to the api with the form values»।
        it("Form submission: create sends POST to the api with the form values", async () => {
            renderForm();
            await typeNameAndSave();

            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            expect(writeRequests()[0]).toEqual({ url: "/zones", method: "POST", data: { name: "North" } });
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «edit sends PUT to api/{id}, whatever `method` says»।
        it("Form submission: edit sends PUT to api/{id}, whatever `method` says", async () => {
            renderForm({ mode: "edit", method: "POST", data: { id: 5, name: "Old", note: "n" } });
            const user = userEvent.setup();
            await user.clear(inputById("name"));
            await typeNameAndSave("New");

            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            expect(writeRequests()[0]).toEqual({
                url: "/zones/5",
                method: "PUT",
                data: { id: 5, name: "New", note: "n" },
            });
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «create with method PUT sends PUT to the exact api, with no id suffix»।
        it("Form submission: create with method PUT sends PUT to the exact api, with no id suffix", async () => {
            renderForm({ method: "PUT", api: "/company-profile" });
            await typeNameAndSave();

            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            expect(writeRequests()[0]).toMatchObject({ url: "/company-profile", method: "PUT" });
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «create with method GET sends POST»।
        it("Form submission: create with method GET sends POST", async () => {
            renderForm({ method: "GET" });
            await typeNameAndSave();

            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            expect(writeRequests()[0].method).toBe("POST");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «adds a leading slash to an api given without one»।
        it("Form submission: adds a leading slash to an api given without one", async () => {
            renderForm({ api: "zones" });
            await typeNameAndSave();

            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            expect(writeRequests()[0].url).toBe("/zones");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does nothing on submit when there is no api»।
        it("Form submission: does nothing on submit when there is no api", async () => {
            const onSuccess = vi.fn();
            renderForm({ api: undefined, onSuccess });
            await typeNameAndSave();

            await new Promise((resolve) => setTimeout(resolve, 50));
            expect(writeRequests()).toHaveLength(0);
            expect(onSuccess).not.toHaveBeenCalled();
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not send when Zod validation fails, and shows the message under the field»।
        it("Form submission: does not send when Zod validation fails, and shows the message under the field", async () => {
            renderForm();
            const user = userEvent.setup();
            await user.click(screen.getByRole("button", { name: "common.save" }));

            expect(await screen.findByText("zone.name.required")).toBeInTheDocument();
            expect(writeRequests()).toHaveLength(0);
        });
    });

    describe("payload steps", () => {
        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «runs preparePayload, then transformPayload, then merges extraPayload last»।
        it("Form submission: runs preparePayload, then transformPayload, then merges extraPayload last", async () => {
            const order: string[] = [];
            renderForm({
                preparePayload: (values) => {
                    order.push("prepare");
                    return { ...values, step: "prepared", fromPrepare: true };
                },
                transformPayload: (values) => {
                    order.push("transform");
                    return { ...values, step: "transformed", seenByTransform: values.step };
                },
                extraPayload: { step: "extra", referral_uuid: "abc" },
            });
            await typeNameAndSave();

            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            expect(order).toEqual(["prepare", "transform"]);
            expect(writeRequests()[0].data).toEqual({
                name: "North",
                fromPrepare: true,
                seenByTransform: "prepared",
                step: "extra",
                referral_uuid: "abc",
            });
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «awaits an async preparePayload»।
        it("Form submission: awaits an async preparePayload", async () => {
            renderForm({
                preparePayload: async (values) => {
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    return { ...values, uploaded: true };
                },
            });
            await typeNameAndSave();

            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            expect(writeRequests()[0].data).toEqual({ name: "North", uploaded: true });
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «skips the request and keeps the typed values when preparePayload returns false»।
        it("Form submission: skips the request and keeps the typed values when preparePayload returns false", async () => {
            renderForm({ preparePayload: () => false });
            await typeNameAndSave();

            await new Promise((resolve) => setTimeout(resolve, 50));
            expect(writeRequests()).toHaveLength(0);
            expect(inputById("name")).toHaveValue("North");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «drops undefined keys and turns the "$undefined" marker into null»।
        it("Form submission: drops undefined keys and turns the \"$undefined\" marker into null", async () => {
            renderForm({
                transformPayload: (values) => ({
                    ...values,
                    gone: undefined,
                    marker: "$undefined",
                    nested: { keep: 1, gone: undefined, list: ["$undefined", 2] },
                }),
            });
            await typeNameAndSave();

            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            expect(writeRequests()[0].data).toEqual({
                name: "North",
                marker: null,
                nested: { keep: 1, list: [null, 2] },
            });
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «sends a Date value as a Date object (no date conversion in the builder)»।
        it("Form submission: sends a Date value as a Date object (no date conversion in the builder)", async () => {
            const when = new Date(2026, 10, 25);
            renderForm({ transformPayload: (values) => ({ ...values, when }) });
            await typeNameAndSave();

            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            const data = writeRequests()[0].data as { when: unknown };
            expect(data.when).toBeInstanceOf(Date);
            expect((data.when as Date).getTime()).toBe(when.getTime());
        });
    });

    describe("after a successful save", () => {
        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «calls onSuccess with the response data and the sent payload, then onClose»।
        it("Form submission: calls onSuccess with the response data and the sent payload, then onClose", async () => {
            mockApi((request) =>
                request.method === "POST" ? { success: true, data: { id: 9, message: "zone.saved" } } : undefined,
            );
            const calls: string[] = [];
            const onSuccess = vi.fn(() => {
                calls.push("success");
            });
            const onClose = vi.fn(() => {
                calls.push("close");
            });
            renderForm({ onSuccess, onClose, extraPayload: { extra: 1 } });
            await typeNameAndSave();

            await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
            expect(onSuccess).toHaveBeenCalledWith(
                { id: 9, message: "zone.saved" },
                { name: "North", extra: 1 },
            );
            expect(calls).toEqual(["success", "close"]);
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «resets the form to its starting values»।
        it("Form submission: resets the form to its starting values", async () => {
            renderForm();
            await typeNameAndSave();

            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            await waitFor(() => expect(inputById("name")).toHaveValue(""));
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the typed values when resetOnSuccess is false»।
        it("Form submission: keeps the typed values when resetOnSuccess is false", async () => {
            const onSuccess = vi.fn();
            renderForm({ resetOnSuccess: false, onSuccess });
            await typeNameAndSave();

            await waitFor(() => expect(onSuccess).toHaveBeenCalled());
            expect(inputById("name")).toHaveValue("North");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the response message as the success toast when there is no successMessage»।
        it("Form submission: shows the response message as the success toast when there is no successMessage", async () => {
            mockApi((request) =>
                request.method === "POST" ? { success: true, data: { message: "zone.saved" } } : undefined,
            );
            renderForm();
            await typeNameAndSave();

            await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
            expect(toast.success).toHaveBeenCalledWith("zone.saved");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows successMessage once, and not the response message»।
        it("Form submission: shows successMessage once, and not the response message", async () => {
            mockApi((request) =>
                request.method === "POST" ? { success: true, data: { message: "zone.saved" } } : undefined,
            );
            renderForm({ successMessage: "zone.create_success" });
            await typeNameAndSave();

            await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
            expect(toast.success).toHaveBeenCalledWith("zone.create_success");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «invalidates each key of a comma-separated queryKey»।
        it("Form submission: invalidates each key of a comma-separated queryKey", async () => {
            const view = renderForm({ queryKey: "zones, sub-zones" });
            const invalidate = vi.spyOn(view.client, "invalidateQueries");
            await typeNameAndSave();

            await waitFor(() => expect(invalidate).toHaveBeenCalledTimes(2));
            expect(invalidate).toHaveBeenCalledWith({ queryKey: ["zones"] });
            expect(invalidate).toHaveBeenCalledWith({ queryKey: ["sub-zones"] });
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «invalidates the default key "data" when no queryKey is given»।
        it("Form submission: invalidates the default key \"data\" when no queryKey is given", async () => {
            const view = renderForm({ queryKey: undefined });
            const invalidate = vi.spyOn(view.client, "invalidateQueries");
            await typeNameAndSave();

            await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ["data"] }));
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «invalidates nothing when skipInvalidate is set»।
        it("Form submission: invalidates nothing when skipInvalidate is set", async () => {
            const onSuccess = vi.fn();
            const view = renderForm({ skipInvalidate: true, onSuccess });
            const invalidate = vi.spyOn(view.client, "invalidateQueries");
            await typeNameAndSave();

            await waitFor(() => expect(onSuccess).toHaveBeenCalled());
            expect(invalidate).not.toHaveBeenCalled();
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «closes the surrounding MyDialog when no onClose is passed»।
        it("Form submission: closes the surrounding MyDialog when no onClose is passed", async () => {
            const user = userEvent.setup();
            renderWithClient(
                <MyDialog trigger={<button type="button">open</button>} title="zone.create">
                    <FormBuilder
                        formSchema={fields}
                        schema={schema}
                        api="/zones"
                        method="POST"
                        mode="create"
                        queryKey="zones"
                    />
                </MyDialog>,
            );
            await user.click(screen.getByRole("button", { name: "open" }));
            expect(await screen.findByRole("dialog")).toBeInTheDocument();

            await user.type(inputById("name"), "North");
            await user.click(screen.getByRole("button", { name: "common.save" }));

            await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
            expect(writeRequests()).toHaveLength(1);
        });
    });

    describe("after a failed save", () => {
        const failWith = (body: Record<string, unknown>) =>
            mockApi((request) => (request.method === "GET" ? undefined : { success: false, ...body }));

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the values, does not close, and calls onSubmitError with the error and payload»।
        it("Form submission: keeps the values, does not close, and calls onSubmitError with the error and payload", async () => {
            failWith({ message: "zone.save_failed", status: 500 });
            const onClose = vi.fn();
            const onSuccess = vi.fn();
            const onSubmitError = vi.fn();
            renderForm({ onClose, onSuccess, onSubmitError });
            await typeNameAndSave();

            await waitFor(() => expect(onSubmitError).toHaveBeenCalledTimes(1));
            expect(onSubmitError).toHaveBeenCalledWith(
                expect.objectContaining({ success: false, message: "zone.save_failed" }),
                { name: "North" },
            );
            expect(toast.error).toHaveBeenCalledWith("zone.save_failed");
            expect(onClose).not.toHaveBeenCalled();
            expect(onSuccess).not.toHaveBeenCalled();
            expect(inputById("name")).toHaveValue("North");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a 422 message under a top-level field that is in formSchema»।
        it("Form submission: shows a 422 message under a top-level field that is in formSchema", async () => {
            failWith({ message: "invalid", status: 422, errors: { name: ["zone.name.taken"] } });
            renderForm();
            await typeNameAndSave();

            expect(await screen.findByText("zone.name.taken")).toBeInTheDocument();
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a 422 message under a field inside a row»।
        it("Form submission: shows a 422 message under a field inside a row", async () => {
            failWith({ message: "invalid", status: 422, errors: { "items.0.qty": ["qty.invalid"] } });
            renderForm({
                formSchema: [
                    ...fields,
                    {
                        type: "fieldArray",
                        name: "items",
                        defaultItem: {},
                        itemFields: [{ type: "number", name: "qty" }],
                    },
                ],
                data: { items: [{ qty: 1 }] },
            });
            await typeNameAndSave();

            expect(await screen.findByText("qty.invalid")).toBeInTheDocument();
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a 422 message under a geolocation input»।
        it("Form submission: shows a 422 message under a geolocation input", async () => {
            failWith({ message: "invalid", status: 422, errors: { latitude: ["latitude.range"] } });
            renderForm({
                formSchema: [
                    ...fields,
                    { type: "geolocation", name: "location", latitudeName: "latitude", longitudeName: "longitude" },
                ],
            });
            await typeNameAndSave();

            expect(await screen.findByText("latitude.range")).toBeInTheDocument();
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «ignores a 422 message for a name with no field, and lets the next save go through»।
        it("Form submission: ignores a 422 message for a name with no field, and lets the next save go through", async () => {
            failWith({ message: "invalid", status: 422, errors: { unknown_field: ["unknown.invalid"] } });
            const onSubmitError = vi.fn();
            renderForm({ onSubmitError });
            const user = await typeNameAndSave();
            await waitFor(() => expect(onSubmitError).toHaveBeenCalled());
            expect(screen.queryByText("unknown.invalid")).not.toBeInTheDocument();

            mockApi();
            await user.click(screen.getByRole("button", { name: "common.save" }));
            await waitFor(() => expect(writeRequests()).toHaveLength(1));
        });
    });

    describe("validate", () => {
        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «stops the save and shows the returned messages under their fields»।
        it("Form submission: stops the save and shows the returned messages under their fields", async () => {
            const validate = vi.fn(async () => ({ name: "zone.name.taken" }));
            renderForm({ validate });
            await typeNameAndSave();

            expect(await screen.findByText("zone.name.taken")).toBeInTheDocument();
            expect(validate).toHaveBeenCalledWith({ name: "North" });
            expect(writeRequests()).toHaveLength(0);
            expect(inputById("name")).toHaveValue("North");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «lets the save go on when it returns nothing, and can be tried again after a message»।
        it("Form submission: lets the save go on when it returns nothing, and can be tried again after a message", async () => {
            let taken = true;
            renderForm({ validate: () => (taken ? { name: "zone.name.taken" } : undefined) });
            const user = await typeNameAndSave();
            expect(await screen.findByText("zone.name.taken")).toBeInTheDocument();

            taken = false;
            await user.click(screen.getByRole("button", { name: "common.save" }));

            await waitFor(() => expect(writeRequests()).toHaveLength(1));
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not run when Zod validation fails»।
        it("Form submission: does not run when Zod validation fails", async () => {
            const validate = vi.fn();
            renderForm({ validate });
            const user = userEvent.setup();
            await user.click(screen.getByRole("button", { name: "common.save" }));

            await screen.findByText("zone.name.required");
            expect(validate).not.toHaveBeenCalled();
        });
    });

    describe("onSubmit (the caller saves)", () => {
        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «calls onSubmit with the payload and the form values, and sends no request»।
        it("Form submission: calls onSubmit with the payload and the form values, and sends no request", async () => {
            const onSubmit = vi.fn(async () => ({ id: 77 }));
            renderForm({ api: undefined, onSubmit, extraPayload: { extra: 1 } });
            await typeNameAndSave();

            await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
            expect(onSubmit).toHaveBeenCalledWith({ name: "North", extra: 1 }, { name: "North" });
            expect(writeRequests()).toHaveLength(0);
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «then runs the same success steps: reset, onSuccess with what it returned, close»।
        it("Form submission: then runs the same success steps: reset, onSuccess with what it returned, close", async () => {
            const onSuccess = vi.fn();
            const onClose = vi.fn();
            renderForm({
                api: undefined,
                onSubmit: async () => ({ id: 77 }),
                onSuccess,
                onClose,
                successMessage: "zone.create_success",
            });
            await typeNameAndSave();

            await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
            expect(onSuccess).toHaveBeenCalledWith({ id: 77 }, { name: "North" });
            expect(toast.success).toHaveBeenCalledWith("zone.create_success");
            expect(inputById("name")).toHaveValue("");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the form open when it throws, toasts the error and shows field messages»।
        it("Form submission: keeps the form open when it throws, toasts the error and shows field messages", async () => {
            const onClose = vi.fn();
            const onSubmitError = vi.fn();
            const failure = { message: "zone.save_failed", errors: { name: ["zone.name.taken"] } };
            renderForm({
                api: undefined,
                onSubmit: async () => {
                    throw failure;
                },
                onClose,
                onSubmitError,
            });
            await typeNameAndSave();

            expect(await screen.findByText("zone.name.taken")).toBeInTheDocument();
            expect(toast.error).toHaveBeenCalledWith("zone.save_failed");
            expect(onSubmitError).toHaveBeenCalledWith(failure, { name: "North" });
            expect(onClose).not.toHaveBeenCalled();
            expect(inputById("name")).toHaveValue("North");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the Save button as busy while it runs»।
        it("Form submission: shows the Save button as busy while it runs", async () => {
            let finish: (value: unknown) => void = () => {};
            renderForm({
                api: undefined,
                onSubmit: () =>
                    new Promise((resolve) => {
                        finish = resolve;
                    }),
            });
            await typeNameAndSave();

            await waitFor(() => expect(screen.getByRole("button", { name: "common.save" })).toBeDisabled());
            finish({});
            await waitFor(() => expect(screen.getByRole("button", { name: "common.save" })).toBeEnabled());
        });
    });

    describe("footer", () => {
        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «renders Cancel first and a real submit button»।
        it("Form submission: renders Cancel first and a real submit button", () => {
            const { container } = renderForm();
            const buttons = Array.from(container.querySelectorAll("form button"));

            expect(buttons.map((button) => button.textContent)).toEqual(["common.cancel", "common.save"]);
            expect(buttons[0]).toHaveAttribute("type", "button");
            expect(buttons[1]).toHaveAttribute("type", "submit");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «Cancel calls onClose and sends nothing»।
        it("Form submission: Cancel calls onClose and sends nothing", async () => {
            const onClose = vi.fn();
            renderForm({ onClose });
            const user = userEvent.setup();
            await user.click(screen.getByRole("button", { name: "common.cancel" }));

            expect(onClose).toHaveBeenCalledTimes(1);
            expect(writeRequests()).toHaveLength(0);
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «hides both buttons when actionButton is false, but keeps the form»।
        it("Form submission: hides both buttons when actionButton is false, but keeps the form", () => {
            const { container } = renderForm({ actionButton: false });

            expect(container.querySelector("form")).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "common.save" })).not.toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "common.cancel" })).not.toBeInTheDocument();
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «uses submitTitle as the submit label»।
        it("Form submission: uses submitTitle as the submit label", () => {
            renderForm({ submitTitle: "onu.bind" });

            expect(screen.getByRole("button", { name: "onu.bind" })).toHaveAttribute("type", "submit");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «sticks the footer to the bottom in a dialog and not in fullPage»।
        it("Form submission: sticks the footer to the bottom in a dialog and not in fullPage", () => {
            const dialog = renderForm();
            const dialogFooter = screen.getByRole("button", { name: "common.save" }).parentElement;
            expect(dialogFooter).toHaveClass("sticky", "bottom-0", "justify-between");
            dialog.unmount();

            renderForm({ fullPage: true, actionButtonClass: "justify-end" });
            const pageFooter = screen.getByRole("button", { name: "common.save" }).parentElement;
            expect(pageFooter).toHaveClass("shrink-0", "justify-end");
            expect(pageFooter).not.toHaveClass("sticky");
        });
    });

    describe("repeat submits", () => {
        const slowApi = () => {
            let release: (value: unknown) => void = () => {};
            mockApi((request) =>
                request.method === "GET"
                    ? undefined
                    : new Promise((resolve) => {
                          release = resolve;
                      }),
            );
            return () => release({ success: true, data: {} });
        };

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «disables the submit button while the request is in flight»।
        it("Form submission: disables the submit button while the request is in flight", async () => {
            const finish = slowApi();
            renderForm();
            await typeNameAndSave();
            await waitFor(() => expect(writeRequests()).toHaveLength(1));

            expect(screen.getByRole("button", { name: "common.save" })).toBeDisabled();
            finish();
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «ignores Enter while saving, because the only submit button is disabled»।
        it("Form submission: ignores Enter while saving, because the only submit button is disabled", async () => {
            const finish = slowApi();
            renderForm();
            const user = await typeNameAndSave();
            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            await user.type(inputById("name"), "{Enter}");
            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(writeRequests()).toHaveLength(1);
            finish();
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «Enter in a field saves the form»।
        it("Form submission: Enter in a field saves the form", async () => {
            renderForm();
            const user = userEvent.setup();
            await user.type(inputById("name"), "North{Enter}");

            await waitFor(() => expect(writeRequests()).toHaveLength(1));
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «Enter does not save a form whose buttons are hidden with actionButton={false}»।
        it("Form submission: Enter does not save a form whose buttons are hidden with actionButton={false}", async () => {
            renderForm({ actionButton: false });
            const user = userEvent.setup();
            await user.type(inputById("name"), "North{Enter}");
            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(writeRequests()).toHaveLength(0);
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «ignores Enter while saving when preventDuplicateSubmit is set»।
        it("Form submission: ignores Enter while saving when preventDuplicateSubmit is set", async () => {
            const finish = slowApi();
            renderForm({ preventDuplicateSubmit: true });
            const user = await typeNameAndSave();
            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            await user.type(inputById("name"), "{Enter}");
            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(writeRequests()).toHaveLength(1);
            finish();
        });
    });

    describe("submitHoldMs", () => {
        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «waits at least that long after the click before closing»।
        it("Form submission: wait for the configured minimum loading duration before closing after submit", async () => {
            const onClose = vi.fn();
            const onSuccess = vi.fn();
            renderForm({ submitHoldMs: 300, onClose, onSuccess });
            const started = Date.now();
            await typeNameAndSave();

            await waitFor(() => expect(onSuccess).toHaveBeenCalled());
            expect(onClose).not.toHaveBeenCalled();

            await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1), { timeout: 2000 });
            expect(Date.now() - started).toBeGreaterThanOrEqual(250);
        });
    });
});
