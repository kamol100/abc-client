import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  CommunicationQueueRestoreOptions,
  defaultRestoreOptions,
  isRestoreOptionsValid,
  restorePayload,
  type RestoreOptionsValue,
} from "@/components/communication-queue/communication-queue-restore-options";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

describe("restore option helpers", () => {
  // বার্তা পাঠানোর অপেক্ষমাণ তালিকা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «defaults to pending at the current minute»।
  it("Restore options: defaults to pending at the current minute", () => {
    const value = defaultRestoreOptions();
    expect(value.mode).toBe("pending");
    expect(value.sendAt?.getSeconds()).toBe(0);
    expect(Math.abs((value.sendAt?.getTime() ?? 0) - Date.now())).toBeLessThan(61_000);
  });

  // বার্তা পাঠানোর অপেক্ষমাণ তালিকা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «sends the send time only for pending, as local time»।
  it("Restore options: sends the send time only for pending, as local time", () => {
    const sendAt = new Date(2026, 11, 1, 10, 30);
    expect(restorePayload({ mode: "pending", sendAt })).toEqual({ status_mode: "pending", send_at: "2026-12-01 10:30:00" });
    expect(restorePayload({ mode: "keep", sendAt })).toEqual({ status_mode: "keep" });
  });

  // বার্তা পাঠানোর অপেক্ষমাণ তালিকা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «needs a send time only for pending»।
  it("Restore options: needs a send time only for pending", () => {
    expect(isRestoreOptionsValid({ mode: "pending", sendAt: null })).toBe(false);
    expect(isRestoreOptionsValid({ mode: "keep", sendAt: null })).toBe(true);
  });
});

function Harness() {
  const [value, setValue] = useState<RestoreOptionsValue>({ mode: "pending", sendAt: new Date(2026, 11, 1, 10, 30) });
  return <CommunicationQueueRestoreOptions value={value} onChange={setValue} />;
}

describe("CommunicationQueueRestoreOptions", () => {
  // বার্তা পাঠানোর অপেক্ষমাণ তালিকা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the send time in the DatePicker and disables it when keeping the old status»।
  it("Restore options: shows the send time in the DatePicker and disables it when keeping the old status", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const sendAt = screen.getByRole("button", { name: "communication_queue.restore.send_at" });
    expect(sendAt).toHaveTextContent("12/01/2026 10:30 AM");

    expect(sendAt).toBeEnabled();
    await user.click(screen.getByLabelText("communication_queue.restore.mode_keep"));
    expect(sendAt).toBeDisabled();
    await user.click(screen.getByLabelText("communication_queue.restore.mode_pending"));
    expect(sendAt).toBeEnabled();
  });
});
