import { describe, expect, it } from "vitest";
import { ClientFormFieldSchema } from "@/components/clients/client-form-schema";
import { applyFormFieldDefaults } from "@/components/form-wrapper/form-field-defaults";

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

  it("fills create defaults without replacing a chosen value or numeric zero", () => {
    const schema = ClientFormFieldSchema({ mode: "create" });
    const defaults = applyFormFieldDefaults(undefined, schema, { radios: true });

    expect(defaults).toMatchObject({
      billing_term: "prepaid",
      billing_type: "auto",
      welcome_notification: "1",
      payment_term: "1",
      invoice_day: "01",
      status: 1,
    });

    const chosen = applyFormFieldDefaults(
      {
        billing_term: "postpaid",
        billing_type: "no_bill",
        welcome_notification: "0",
        status: 0,
        payment_term: "3",
        invoice_day: "15",
      },
      schema,
      { radios: true },
    );

    expect(chosen).toMatchObject({
      billing_term: "postpaid",
      billing_type: "no_bill",
      welcome_notification: "0",
      status: 0,
      payment_term: "3",
      invoice_day: "15",
    });
  });

  it("leaves stored billing values alone when editing", () => {
    const schema = ClientFormFieldSchema({ mode: "edit" });
    const unchanged = applyFormFieldDefaults(
      {
        billing_term: "postpaid",
        billing_type: "manual",
        welcome_notification: 0,
      },
      schema,
    );
    const missing = applyFormFieldDefaults({ name: "kept" }, schema);

    expect(unchanged.billing_term).toBe("postpaid");
    expect(unchanged.billing_type).toBe("manual");
    expect(unchanged.welcome_notification).toBe(0);
    expect(missing).not.toHaveProperty("billing_term");
    expect(missing).not.toHaveProperty("billing_type");
    expect(missing).not.toHaveProperty("welcome_notification");
  });
});
