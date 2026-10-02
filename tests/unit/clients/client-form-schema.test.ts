import { describe, expect, it } from "vitest";
import { ClientFormFieldSchema } from "@/components/clients/client-form-schema";

describe("ClientFormFieldSchema", () => {
  it("selects the first payment term option by default", () => {
    const sections = ClientFormFieldSchema({ mode: "create" });
    const paymentTerm = sections
      .flatMap((section) => section.form)
      .find((field) => field.name === "payment_term");

    expect(paymentTerm?.type).toBe("dropdown");
    if (paymentTerm?.type !== "dropdown") return;

    expect(paymentTerm.options?.[0]?.value).toBe("1");
    expect(paymentTerm.defaultValue).toBe(paymentTerm.options?.[0]?.value);
  });
});
