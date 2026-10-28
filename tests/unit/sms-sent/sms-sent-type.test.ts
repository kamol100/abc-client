import { describe, expect, it } from "vitest";
import {
  SmsSendModeSchema,
  SmsSentClientFilterSchema,
  SmsSentFormSchema,
  SmsSentPayloadSchema,
  buildSmsSentPayload,
  canConfirmSmsSend,
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
