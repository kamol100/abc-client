/**
 * The stock-out and stock-in forms, with their line items.
 *
 * Recorded before the hand-written line editors are replaced by the form builder's
 * field array, so the move can be compared against the same markup, the same
 * behaviour and the same payload.
 */
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProductInForm from "@/components/products/product-in-form";
import ProductOutForm from "@/components/products/product-out-form";
import { apiRequests, fieldById, inputById, mockApi, renderWithClient, stubBrowserApis, writeRequests } from "./harness";

vi.hoisted(() => {
    process.env.TZ = "Asia/Dhaka";
});

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
vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({ hasPermission: () => true }),
    useProfile: () => ({ profile: { staff: null } }),
    // DisplayCount reads the number format from the app settings.
    useSettings: () => ({ settings: {} }),
    useApp: () => ({ settings: {} }),
}));

const products = [
    { id: 1, name: "Router" },
    { id: 2, name: "Fiber cable" },
    { id: 3, name: "Patch cord" },
];

const productDetails: Record<string, Record<string, unknown>> = {
    "/get-product/1": { has_serial: 1, vat: 5, category: { id: 1, name: "Device" } },
    "/get-product/2": { has_serial: 0, vat: 0, category: { id: 2, name: "Fiber" } },
    "/get-product/3": { has_serial: 0, vat: 0, category: { id: 1, name: "Device" } },
};

const serveStock = () =>
    mockApi((request) => {
        if (request.method !== "GET") return undefined;
        if (request.url.startsWith("/dropdown-products")) return { success: true, data: products };
        if (request.url === "/dropdown-staffs") return { success: true, data: [{ id: 4, name: "Rahim" }] };
        if (request.url === "/dropdown-expense-types") return { success: true, data: [{ id: 6, name: "Purchase" }] };
        if (request.url === "/dropdown-funds") return { success: true, data: [{ id: 7, name: "Cash" }] };
        if (request.url in productDetails) return { success: true, data: productDetails[request.url] };
        if (request.url === "/dropdown-product-ins/1") {
            return { success: true, data: [{ id: 11, name: "Lot 11", unit_sell_price: 450 }] };
        }
        if (request.url === "/dropdown-product-ins/3") {
            return { success: true, data: [{ id: 31, name: "Lot 31", unit_sell_price: 20 }] };
        }
        if (request.url === "/product-in-serials/11") {
            return {
                success: true,
                data: [
                    { id: 101, serial_number: "SN-101" },
                    { id: 102, serial_number: "SN-102" },
                    { id: 103, serial_number: "SN-103" },
                ],
            };
        }
        return undefined;
    });

/** Generated ids differ between runs of a changed tree; they are not markup. */
function stableDom(root: HTMLElement): HTMLElement {
    const copy = root.cloneNode(true) as HTMLElement;
    copy.querySelectorAll("*").forEach((element) => {
        for (const attribute of Array.from(element.attributes)) {
            if (/^(radix-|_r_|:r)|(_r_\w+_)/.test(attribute.value)) element.setAttribute(attribute.name, "generated-id");
        }
    });
    return copy;
}

const linesBlock = (titleKey: string) =>
    screen.getByText(titleKey).parentElement?.parentElement as HTMLElement;

type User = ReturnType<typeof userEvent.setup>;

async function pick(user: User, fieldName: string, optionLabel: string) {
    await waitFor(() => expect(fieldById(fieldName)).toBeInTheDocument());
    const control = fieldById(fieldName)?.closest(".basic-single") as HTMLElement;
    await waitFor(() => expect(control).not.toHaveClass("select--is-disabled"));
    await user.click(fieldById(fieldName) as HTMLElement);
    const menu = await waitFor(() => {
        const found = document.querySelector(".select__menu");
        if (!found) throw new Error("menu not open");
        return found as HTMLElement;
    });
    await user.click(await within(menu).findByText(optionLabel));
}

/**
 * Sets an input to a new value in one step. Clearing and typing would pass through an
 * empty quantity, and a quantity of zero (correctly) drops the line's serials.
 */
function retype(_user: User, fieldName: string, text: string) {
    fireEvent.change(inputById(fieldName), { target: { value: text } });
}

const urls = () => apiRequests("GET").map((request) => request.url);

describe("stock forms", () => {
    beforeEach(() => {
        stubBrowserApis();
        serveStock();
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date("2026-11-25T06:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("stock out", () => {
        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «starts with one line, the lot disabled, and no request for a lot list»।
        it("Stock movement forms: starts with one line, the lot disabled, and no request for a lot list", async () => {
            renderWithClient(<ProductOutForm />);

            await waitFor(() => expect(fieldById("product.0.productin_id")).toBeInTheDocument());
            expect(fieldById("product.0.productin_id")?.closest(".basic-single")).toHaveClass("select--is-disabled");
            expect(fieldById("product.1.product_id")).toBeNull();
            expect(urls().filter((url) => url.startsWith("/dropdown-product-ins"))).toEqual([]);
            expect(urls().filter((url) => url.startsWith("/get-product"))).toEqual([]);
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «a serial product: loads its details, fills the price from the lot, and picks serials up to the quantity»।
        it("Stock movement forms: a serial product: loads its details, fills the price from the lot, and picks serials up to the quantity", async () => {
            renderWithClient(<ProductOutForm />);
            const user = userEvent.setup();

            await pick(user, "product.0.product_id", "Router");
            await waitFor(() => expect(inputById("product.0.vat")).toHaveValue(5));

            await pick(user, "product.0.productin_id", "Lot 11");
            expect(inputById("product.0.unit_price")).toHaveValue(450);

            retype(user, "product.0.quantity", "2");
            expect(await screen.findByText("SN-101")).toBeInTheDocument();
            const boxes = () => screen.getAllByRole("checkbox");
            await user.click(boxes()[0]);
            await user.click(boxes()[1]);
            await user.click(boxes()[2]);

            // The third serial is refused: the quantity is 2.
            expect(boxes().filter((box) => box.getAttribute("data-state") === "checked")).toHaveLength(2);
            expect(stableDom(linesBlock("product_out.lines.title"))).toMatchSnapshot();

            await pick(user, "received_by", "Rahim");
            await user.click(screen.getByRole("button", { name: "common.save" }));
            await waitFor(() => expect(writeRequests()).toHaveLength(1));
            expect(writeRequests()[0]).toMatchSnapshot();
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «changing the product clears the lot and the serials»।
        it("Stock movement forms: changing the product clears the lot and the serials", async () => {
            renderWithClient(<ProductOutForm />);
            const user = userEvent.setup();
            await pick(user, "product.0.product_id", "Router");
            await pick(user, "product.0.productin_id", "Lot 11");
            await user.click((await screen.findAllByRole("checkbox"))[0]);

            await pick(user, "product.0.product_id", "Patch cord");

            await waitFor(() => expect(screen.queryByText("SN-101")).not.toBeInTheDocument());
            expect(screen.queryByText("Lot 11")).not.toBeInTheDocument();
            await pick(user, "product.0.productin_id", "Lot 31");
            expect(inputById("product.0.unit_price")).toHaveValue(20);
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «lowering the quantity drops the extra serials»।
        it("Stock movement forms: lowering the quantity drops the extra serials", async () => {
            renderWithClient(<ProductOutForm />);
            const user = userEvent.setup();
            await pick(user, "product.0.product_id", "Router");
            await pick(user, "product.0.productin_id", "Lot 11");
            retype(user, "product.0.quantity", "2");
            const boxes = await screen.findAllByRole("checkbox");
            await user.click(boxes[0]);
            await user.click(boxes[1]);

            retype(user, "product.0.quantity", "1");

            await waitFor(() =>
                expect(
                    screen.getAllByRole("checkbox").filter((box) => box.getAttribute("data-state") === "checked"),
                ).toHaveLength(1),
            );
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «adds and removes lines, and cannot remove the last one»।
        it("Stock movement forms: adds and removes lines, and cannot remove the last one", async () => {
            renderWithClient(<ProductOutForm />);
            const user = userEvent.setup();
            await waitFor(() => expect(fieldById("product.0.product_id")).toBeInTheDocument());
            screen
                .getAllByRole("button", { name: "product_out.lines.remove" })
                .forEach((button) => expect(button).toBeDisabled());

            await user.click(screen.getByRole("button", { name: "product_out.lines.add" }));
            await waitFor(() => expect(fieldById("product.1.product_id")).toBeInTheDocument());
            expect(inputById("product.1.quantity")).toHaveValue(1);

            await user.click(screen.getAllByRole("button", { name: "product_out.lines.remove" })[0]);
            await waitFor(() => expect(fieldById("product.1.product_id")).toBeNull());
        });
    });

    describe("stock in", () => {
        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «a serial product: one serial input per unit, and the expense amount follows the total»।
        it("Stock movement forms: a serial product: one serial input per unit, and the expense amount follows the total", async () => {
            renderWithClient(<ProductInForm />);
            const user = userEvent.setup();

            await pick(user, "product.0.product_id", "Router");
            await waitFor(() => expect(inputById("product.0.vat")).toHaveValue(5));
            retype(user, "product.0.quantity", "2");
            retype(user, "product.0.unit_price", "100");

            await waitFor(() => expect(fieldById("product.0.serial.1")).toBeInTheDocument());
            expect(fieldById("product.0.serial.2")).toBeNull();
            await user.type(inputById("product.0.serial.0"), "A-1");
            await user.type(inputById("product.0.serial.1"), "A-2");

            await waitFor(() => expect(inputById("expense.amount")).toHaveValue(210));
            expect(stableDom(linesBlock("product_in.lines.title"))).toMatchSnapshot();

            await pick(user, "purchase_by", "Rahim");
            await pick(user, "expense.expense_type_id", "Purchase");
            await pick(user, "expense.fund_id", "Cash");
            await user.click(fieldById("purchase_date") as HTMLElement);
            await user.click(await screen.findByRole("button", { name: /November 25th, 2026/ }));
            await user.click(screen.getByRole("button", { name: "common.save" }));

            try {
                await waitFor(() => expect(writeRequests()).toHaveLength(1));
            } catch {
                const messages = Array.from(document.querySelectorAll("p.text-destructive")).map((n) => n.textContent);
                throw new Error("not saved: " + JSON.stringify(messages));
            }
            expect(writeRequests()[0]).toMatchSnapshot();
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «lowering the quantity removes the extra serial inputs and keeps the first ones»।
        it("Stock movement forms: lowering the quantity removes the extra serial inputs and keeps the first ones", async () => {
            renderWithClient(<ProductInForm />);
            const user = userEvent.setup();
            await pick(user, "product.0.product_id", "Router");
            retype(user, "product.0.quantity", "3");
            await waitFor(() => expect(fieldById("product.0.serial.2")).toBeInTheDocument());
            await user.type(inputById("product.0.serial.0"), "A-1");

            retype(user, "product.0.quantity", "1");

            await waitFor(() => expect(fieldById("product.0.serial.1")).toBeNull());
            expect(inputById("product.0.serial.0")).toHaveValue("A-1");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «a fibre product: shows the cable fields and works the total from the metres»।
        it("Stock movement forms: Fibre product: show cable fields and calculate the total from the length in metres", async () => {
            renderWithClient(<ProductInForm />);
            const user = userEvent.setup();
            await pick(user, "product.0.product_id", "Fiber cable");

            await waitFor(() => expect(fieldById("product.0.fiber_meter_end")).toBeInTheDocument());
            retype(user, "product.0.unit_price", "2");
            retype(user, "product.0.fiber_meter_start", "10");
            retype(user, "product.0.fiber_meter_end", "60");

            await waitFor(() => expect(inputById("expense.amount")).toHaveValue(100));
            expect(fieldById("product.0.serial.0")).toBeNull();
            expect(stableDom(linesBlock("product_in.lines.title"))).toMatchSnapshot();
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «changing the product clears what belonged to the old one»।
        it("Stock movement forms: changing the product clears what belonged to the old one", async () => {
            renderWithClient(<ProductInForm />);
            const user = userEvent.setup();
            await pick(user, "product.0.product_id", "Fiber cable");
            await waitFor(() => expect(fieldById("product.0.fiberID")).toBeInTheDocument());
            await user.type(inputById("product.0.fiberID"), "F-9");

            await pick(user, "product.0.product_id", "Patch cord");
            await waitFor(() => expect(fieldById("product.0.fiberID")).toBeNull());

            await pick(user, "product.0.product_id", "Fiber cable");
            await waitFor(() => expect(fieldById("product.0.fiberID")).toBeInTheDocument());
            expect(inputById("product.0.fiberID")).toHaveValue("");
        });

        // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «adds and removes lines, and cannot remove the last one»।
        it("Stock movement forms: adds and removes lines, and cannot remove the last one", async () => {
            renderWithClient(<ProductInForm />);
            const user = userEvent.setup();
            await waitFor(() => expect(fieldById("product.0.product_id")).toBeInTheDocument());
            screen
                .getAllByRole("button", { name: "product_in.lines.remove" })
                .forEach((button) => expect(button).toBeDisabled());

            await user.click(screen.getByRole("button", { name: "product_in.lines.add" }));
            await waitFor(() => expect(fieldById("product.1.product_id")).toBeInTheDocument());

            await user.click(screen.getAllByRole("button", { name: "product_in.lines.remove" })[0]);
            await waitFor(() => expect(fieldById("product.1.product_id")).toBeNull());
        });
    });
});
