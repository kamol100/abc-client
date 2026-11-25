import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import CheckboxField from "@/components/form/checkbox-field";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => `translated:${key}` }),
}));

function Host() {
    const form = useForm({ defaultValues: { agree: false } });
    return (
        <FormProvider {...form}>
            <CheckboxField name="agree" single label={{ labelText: "terms.agree" }} />
        </FormProvider>
    );
}

describe("CheckboxField single", () => {
    it("translates its label", () => {
        render(<Host />);

        expect(screen.getByText("translated:terms.agree")).toHaveAttribute("for", "agree");
    });
});
