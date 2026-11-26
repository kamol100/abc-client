/**
 * In its own file on purpose: the dropdown's code is loaded lazily, and only the first
 * dropdown drawn after a fresh start ever waits for it.
 */
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import FormBuilder from "@/components/form-wrapper/form-builder";
import { fieldById, mockApi, renderWithClient, stubBrowserApis } from "./harness";

vi.mock("@/app/actions", () => ({ useFetch: vi.fn() }));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("dropdown placeholder", () => {
    beforeEach(() => {
        stubBrowserApis();
        mockApi();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «holds the field's place with the label and a box while the dropdown code loads»।
    it("Dropdown placeholder: holds the field's place with the label and a box while the dropdown code loads", async () => {
        const { container } = renderWithClient(
            <FormBuilder
                formSchema={[
                    {
                        type: "dropdown",
                        name: "status",
                        label: { labelText: "thing.status" },
                        options: [{ value: 1, label: "status.active" }],
                    },
                ]}
                schema={z.object({}).passthrough()}
                api="/things"
                method="POST"
                mode="create"
            />,
        );

        // Before the code arrives: the label and a placeholder box, no control yet.
        expect(fieldById("status")).toBeNull();
        expect(screen.getByText("thing.status")).toBeInTheDocument();
        expect(container.querySelector(".animate-pulse")).toHaveClass("h-9", "w-full");

        await waitFor(() => expect(fieldById("status")).toHaveAttribute("role", "combobox"));
        expect(container.querySelector(".animate-pulse")).toBeNull();
        expect(screen.getAllByText("thing.status")).toHaveLength(1);
    });
});
