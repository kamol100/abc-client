import { describe, expect, it } from "vitest";
import {
  SmsSendModeSchema,
  SmsSentClientFilterSchema,
  SmsSentFormSchema,
  SmsSentPayloadSchema,
  buildSmsSentClientParams,
  buildSmsSentPayload,
  canConfirmSmsSend,
  isCustomOtherSmsTemplate,
  isInvoiceDueSmsTemplate,
  usesClientListSmsTemplate,
  type SmsSendQuote,
} from "@/components/sms-sent/sms-sent-type";

const formValues = SmsSentFormSchema.parse({
  phone: "01700000000",
  sms_body: "Hello",
  sms_template_id: null,
});

const filterValues = SmsSentClientFilterSchema.parse({});

describe("sms send mode payload", () => {
  it("defaults the payload mode to live", () => {
    const payload = buildSmsSentPayload({
      formValues,
      filterValues,
      smsCount: 1,
    });

    expect(payload.mode).toBe("live");
    expect(SmsSentPayloadSchema.parse({
      sms_body: "Hello",
      message: "Hello",
      custom_message: "Hello",
    }).mode).toBe("live");
  });

  it("passes test mode through and rejects any other mode", () => {
    const payload = buildSmsSentPayload({
      formValues,
      filterValues,
      smsCount: 1,
      mode: "test",
    });

    expect(payload.mode).toBe("test");
    expect(SmsSendModeSchema.safeParse("sandbox").success).toBe(false);
    expect(SmsSentPayloadSchema.safeParse({
      sms_body: "Hello",
      message: "Hello",
      custom_message: "Hello",
      mode: "sandbox",
    }).success).toBe(false);
  });
});

describe("invoice due client list", () => {
  it("asks for due invoices only for invoice due and reminder templates", () => {
    expect(isInvoiceDueSmsTemplate("invoice_due")).toBe(true);
    expect(isInvoiceDueSmsTemplate("invoice_due_reminder")).toBe(true);
    expect(isInvoiceDueSmsTemplate("custom_client")).toBe(false);
    expect(isInvoiceDueSmsTemplate("custom_other")).toBe(false);
    expect(isInvoiceDueSmsTemplate(null)).toBe(false);
    expect(isCustomOtherSmsTemplate("custom_other")).toBe(true);
    expect(usesClientListSmsTemplate("custom_client")).toBe(true);
    expect(usesClientListSmsTemplate("custom_other")).toBe(false);
    expect(usesClientListSmsTemplate(null)).toBe(false);

    expect(buildSmsSentClientParams(filterValues, { invoiceDueOnly: true })).toEqual({
      invoice: "due",
    });
    expect(buildSmsSentClientParams(filterValues)).toEqual({});
  });
});

describe("canConfirmSmsSend", () => {
  const quote: SmsSendQuote = {
    recipients: 1,
    total_units: 2,
    total_cost: 2,
    balance: 1,
    remaining_balance: -1,
    sufficient: false,
    scheduled_at: null,
    timezone: "Asia/Dhaka",
  };

  it("requires enough wallet balance for live sends only", () => {
    expect(canConfirmSmsSend(quote, "live")).toBe(false);
    expect(canConfirmSmsSend({ ...quote, sufficient: true }, "live")).toBe(true);
    expect(canConfirmSmsSend(quote, "test")).toBe(true);
  });

  it("refuses when nothing would be sent", () => {
    expect(canConfirmSmsSend({ ...quote, recipients: 0, sufficient: true }, "live")).toBe(false);
    expect(canConfirmSmsSend({ ...quote, recipients: 0 }, "test")).toBe(false);
  });
});

describe("custom sms recipients", () => {
  it("sends custom client templates to selected clients and custom other templates to a phone", () => {
    const withTemplate = SmsSentFormSchema.parse({
      phone: "01700000000",
      sms_body: "Notice",
      sms_template_id: 4,
    });

    const clientPayload = buildSmsSentPayload({
      formValues: withTemplate,
      filterValues,
      smsCount: 2,
      selectedClientIds: [8, 9],
      templateType: "custom_client",
    });
    expect(clientPayload.phone).toBeNull();
    expect(clientPayload.clientIds).toEqual([8, 9]);
    expect(clientPayload.all_client).toBe(0);

    const phonePayload = buildSmsSentPayload({
      formValues: withTemplate,
      filterValues,
      smsCount: 1,
      selectedClientIds: [8],
      templateType: "custom_other",
    });
    expect(phonePayload.phone).toBe("01700000000");
    expect(phonePayload.clientIds).toBeNull();
    expect(phonePayload.all_client).toBe(0);
  });
});
