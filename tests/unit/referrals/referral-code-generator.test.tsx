import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { ReferralCodeGenerator } from "@/components/referrals/referral-seller-form";
import { sellerEnrollmentSchema } from "@/components/referrals/referral-form-schema";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("@/hooks/use-api-mutation", () => ({ default: () => ({}) }));
vi.mock("@/components/form-wrapper/form-builder", () => ({ default: () => null }));
vi.mock("@/components/my-dialog", () => ({ MyDialog: () => null }));

const defaults = { code: "MANUAL-CODE", user_uuid: "12345678-1234-4234-8234-123456789012", seller_type: "independent" };
function Harness({ submit }: { submit: () => void }) {
  const form = useForm({ defaultValues: defaults });
  return (
    <FormProvider {...form}>
      <form onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <label htmlFor="code">Referral code</label>
        <input id="code" {...form.register("code")} />
        <label htmlFor="user_uuid">User</label>
        <input id="user_uuid" {...form.register("user_uuid")} />
        <ReferralCodeGenerator />
      </form>
    </FormProvider>
  );
}
afterEach(cleanup);
describe("referral code generation", () => {
  // রেফারেল ও সেলার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «fills a valid editable code without submitting or changing the selected user»।
  it("Referral code generator: fills a valid editable code without submitting or changing the selected user", async () => {
    const submit = vi.fn();
    render(<Harness submit={submit} />);
    const input = screen.getByRole("textbox", { name: "Referral code" });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "referral.actions.generate_code" }));
    await waitFor(() => expect(input).not.toHaveValue(defaults.code));
    const generated = (input as HTMLInputElement).value;
    expect(sellerEnrollmentSchema.safeParse({ ...defaults, code: generated }).success).toBe(true);
    expect(screen.getByRole("textbox", { name: "User" })).toHaveValue(defaults.user_uuid);
    expect(submit).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, "MY-OWN-CODE");
    expect(input).toHaveValue("MY-OWN-CODE");
    await user.click(screen.getByRole("button", { name: "referral.actions.generate_code" }));
    expect(input).not.toHaveValue("MY-OWN-CODE");
    expect(input).not.toHaveValue(generated);
    expect(submit).not.toHaveBeenCalled();
  });
});
