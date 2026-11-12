import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import InputField from "@/components/form/input-field";
import { PasswordField } from "@/components/form/password-field";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

function Harness({ children }: { children: ReactNode }) {
    const form = useForm({ defaultValues: { secret: "hidden-value", amount: "" } });

    return <FormProvider {...form}>{children}</FormProvider>;
}

describe("InputField adornments", () => {
    it("renders prefix and suffix without changing a plain field", () => {
        const { rerender } = render(
            <Harness>
                <InputField name="secret" placeholder="field.placeholder" />
            </Harness>
        );

        const plain = screen.getByPlaceholderText("field.placeholder");
        expect(plain).toHaveAttribute("type", "text");
        expect(plain.className).not.toContain("pl-9");
        expect(plain.className).not.toContain("pr-9");

        rerender(
            <Harness>
                <InputField
                    name="amount"
                    placeholder="field.amount"
                    prefix={<span>৳</span>}
                    suffix={<span>BDT</span>}
                />
            </Harness>
        );

        const adorned = screen.getByPlaceholderText("field.amount");
        expect(adorned.className).toContain("pl-9");
        expect(adorned.className).toContain("pr-9");
        expect(screen.getByText("৳")).toBeInTheDocument();
        expect(screen.getByText("BDT")).toBeInTheDocument();
    });

    it("keeps password type as given and does not add a visibility toggle", () => {
        render(
            <Harness>
                <InputField name="secret" type="password" placeholder="field.placeholder" />
            </Harness>
        );

        expect(screen.getByPlaceholderText("field.placeholder")).toHaveAttribute("type", "password");
        expect(screen.queryByRole("button", { name: "common.show_password" })).not.toBeInTheDocument();
    });
});

describe("PasswordField", () => {
    it("toggles visibility through the input suffix", async () => {
        const user = userEvent.setup();
        render(
            <Harness>
                <PasswordField name="secret" placeholder="field.placeholder" />
            </Harness>
        );

        const input = screen.getByPlaceholderText("field.placeholder");
        expect(input).toHaveAttribute("type", "password");

        await user.click(screen.getByRole("button", { name: "common.show_password" }));
        expect(input).toHaveAttribute("type", "text");
        expect(screen.getByRole("button", { name: "common.hide_password" })).toHaveAttribute(
            "aria-pressed",
            "true"
        );

        await user.click(screen.getByRole("button", { name: "common.hide_password" }));
        expect(input).toHaveAttribute("type", "password");
    });
});
