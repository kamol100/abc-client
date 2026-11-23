import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format } from "date-fns";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import DatePicker from "@/components/form/DatePicker";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

type Values = { when: Date | null };

function Harness({ showTime, initial, onValue }: { showTime?: boolean; initial: Date | null; onValue: (value: unknown) => void }) {
  const form = useForm<Values>({ defaultValues: { when: initial } });
  form.watch((values) => onValue(values.when));
  return (
    <FormProvider {...form}>
      <DatePicker name="when" placeholder="pick" showTime={showTime} onValueChange={onValue} />
    </FormProvider>
  );
}

/** The 15th of the current month: inside the default month, never "today"-prefixed by accident. */
const day15 = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 15);
};

describe("DatePicker showTime", () => {
  it("is unchanged without showTime: no time field, date-only display, closes on pick", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Harness initial={null} onValue={onValue} />);

    await user.click(screen.getByRole("button", { name: "pick" }));
    expect(screen.queryByLabelText("common.time")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: new RegExp(format(day15(), "MMMM do, yyyy")) }));

    const picked = onValue.mock.calls.at(-1)?.[0] as Date;
    expect(format(picked, "yyyy-MM-dd HH:mm")).toBe(format(day15(), "yyyy-MM-dd 00:00"));
    expect(screen.getByRole("button", { name: format(day15(), "MM/dd/yyyy") })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "common.done" })).not.toBeInTheDocument();
  });

  it("keeps the time when another day is picked, and sets the time from the time field", async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    const start = new Date(day15().getFullYear(), day15().getMonth(), 10, 9, 45);
    render(<Harness showTime initial={start} onValue={onValue} />);

    expect(screen.getByRole("button", { name: format(start, "MM/dd/yyyy hh:mm a") })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: format(start, "MM/dd/yyyy hh:mm a") }));
    await user.click(screen.getByRole("button", { name: new RegExp(format(day15(), "MMMM do, yyyy")) }));
    expect(format(onValue.mock.calls.at(-1)?.[0] as Date, "yyyy-MM-dd HH:mm")).toBe(format(day15(), "yyyy-MM-dd 09:45"));

    const time = screen.getByLabelText("common.time");
    expect(time).toHaveValue("09:45");
    fireEvent.change(time, { target: { value: "18:30" } });
    expect(format(onValue.mock.calls.at(-1)?.[0] as Date, "yyyy-MM-dd HH:mm")).toBe(format(day15(), "yyyy-MM-dd 18:30"));

    await user.click(screen.getByRole("button", { name: "common.done" }));
    expect(screen.queryByLabelText("common.time")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: format(new Date(day15().setHours(18, 30)), "MM/dd/yyyy hh:mm a") }),
    ).toBeInTheDocument();
  });
});
