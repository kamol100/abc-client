import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { ReferralEnrollmentForm } from "@/components/referrals/referral-seller-form";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => ({
  "referral.enrolled": "Enrolled", "referral.actions.enroll": "Enroll Seller",
  "referral.enrolled_as.tenant_manager": "Enrolled as tenant",
  "referral.enrolled_as.independent": "Enrolled as independent",
  "referral.enrolled_as.reseller": "Enrolled as reseller",
}[key] ?? key) }) }));
vi.mock("@/components/my-dialog", () => ({ MyDialog: ({ trigger }: { trigger: ReactNode }) => <>{trigger}</> }));
vi.mock("@/components/form-wrapper/form-builder", () => ({ default: () => null }));
vi.mock("@/hooks/use-api-mutation", () => ({ default: () => ({}) }));

afterEach(cleanup);
describe("user referral enrollment status", () => {
  it("shows a disabled Enrolled indicator instead of the enrollment action", () => {
    render(<ReferralEnrollmentForm userUuid="existing" enrolled />);
    expect(screen.getByRole("button", { name: "Enrolled" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Enroll Seller" })).not.toBeInTheDocument();
  });
  it.each([
    ["tenant_manager", "Enrolled as tenant"],
    ["independent", "Enrolled as independent"],
    ["reseller", "Enrolled as reseller"],
  ] as const)("shows the saved %s enrollment type with a check icon", (sellerType, label) => {
    render(<ReferralEnrollmentForm userUuid="existing" enrolled sellerType={sellerType} />);
    const button = screen.getByRole("button", { name: label });
    expect(button).toBeDisabled();
    expect(button.querySelector("svg")).toHaveClass("lucide-circle-check");
    expect(screen.queryByRole("button", { name: "Enroll Seller" })).not.toBeInTheDocument();
  });
  it("keeps the enrollment action available for a user without a seller profile", () => {
    render(<ReferralEnrollmentForm userUuid="new" enrolled={false} />);
    expect(screen.getByRole("button", { name: "Enroll Seller" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Enrolled" })).not.toBeInTheDocument();
  });
});
