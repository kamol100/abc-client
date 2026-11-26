import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { SmsSendModeSelector } from "@/components/sms-sent/sms-sent-form";
import type { SmsSendMode } from "@/components/sms-sent/sms-sent-type";

vi.mock("@/app/actions", () => ({
  useFetch: vi.fn(),
  getData: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

function Harness({
  initial = "live",
  onChange,
}: {
  initial?: SmsSendMode;
  onChange: (mode: SmsSendMode) => void;
}) {
  const [mode, setMode] = useState<SmsSendMode>(initial);

  return (
    <SmsSendModeSelector
      value={mode}
      onChange={(next) => {
        setMode(next);
        onChange(next);
      }}
    />
  );
}

describe("SmsSendModeSelector", () => {
  // SMS-এর কোট ও পাঠানোর নিয়ম যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «selects live mode by default»।
  it("SMS send mode selector: selects live mode by default", () => {
    render(<SmsSendModeSelector value="live" onChange={vi.fn()} />);

    expect(screen.getByRole("radio", { name: "sms_sent.mode.live.title" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "sms_sent.mode.test.title" })).not.toBeChecked();
    expect(screen.getByText("sms_sent.mode.live.short")).toBeVisible();
    expect(screen.getByText("sms_sent.mode.test.short")).toBeVisible();
  });

  // SMS-এর কোট ও পাঠানোর নিয়ম যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «selects test mode from a click or the keyboard»।
  it("SMS send mode selector: selects test mode from a click or the keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: /sms_sent.mode.test.title/ }));
    expect(onChange).toHaveBeenLastCalledWith("test");
    expect(screen.getByRole("radio", { name: /sms_sent.mode.test.title/ })).toBeChecked();

    const live = screen.getByRole("radio", { name: /sms_sent.mode.live.title/ });
    await user.click(live);
    fireEvent.keyDown(live, { key: "ArrowDown" });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(onChange).toHaveBeenLastCalledWith("test");
    expect(screen.getByRole("radio", { name: /sms_sent.mode.test.title/ })).toBeChecked();
  });
});
