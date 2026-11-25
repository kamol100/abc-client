/**
 * The controls work on their own, with no form around them. That is what lets a
 * toolbar or a table cell use the same dropdown and date picker as a form.
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DateInput } from "@/components/controls/date-input";
import { DateRangeInput } from "@/components/controls/date-range-input";
import { SelectBox } from "@/components/controls/select-box";
import { stubBrowserApis } from "./harness";

// The shared harness imports the network module; these controls never call it.
vi.mock("@/app/actions", () => ({ useFetch: vi.fn() }));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

const options = [
    { value: 1, label: "status.active" },
    { value: 2, label: "status.inactive" },
];

describe("controls without a form", () => {
    beforeEach(() => {
        stubBrowserApis();
        vi.useFakeTimers({ toFake: ["Date"] });
        vi.setSystemTime(new Date(2026, 9, 15, 12, 0, 0));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("SelectBox", () => {
        it("shows the option that matches `value`", () => {
            render(<SelectBox id="status" value={2} onChange={vi.fn()} options={options} />);

            expect(screen.getByText("status.inactive")).toBeInTheDocument();
        });

        it("calls onChange with the option value and the chosen option", async () => {
            const onChange = vi.fn();
            render(<SelectBox id="status" value={null} onChange={onChange} options={options} />);
            const user = userEvent.setup();
            await user.click(screen.getByRole("combobox"));
            await user.click(screen.getByText("status.active"));

            expect(onChange).toHaveBeenCalledWith(1, options[0]);
        });

        it("calls onChange with a list of values when isMulti", async () => {
            const onChange = vi.fn();
            render(<SelectBox id="tags" value={[1]} onChange={onChange} options={options} isMulti />);
            const user = userEvent.setup();
            await user.click(screen.getByRole("combobox"));
            await user.click(screen.getByText("status.inactive"));

            expect(onChange).toHaveBeenCalledWith([1, 2]);
        });

        it("calls onChange with null when cleared", async () => {
            const onChange = vi.fn();
            const { container } = render(
                <SelectBox id="status" value={1} onChange={onChange} options={options} />,
            );
            const user = userEvent.setup();
            await user.click(container.querySelector(".select__clear-indicator") as HTMLElement);

            expect(onChange).toHaveBeenCalledWith(null, null);
        });
    });

    describe("DateInput", () => {
        it("shows the value and calls onChange with the picked day", async () => {
            const onChange = vi.fn();
            render(
                <DateInput id="paid_at" value="2026-10-10" onChange={onChange} onClear={vi.fn()} />,
            );
            const user = userEvent.setup();

            expect(screen.getByRole("button", { name: "10/10/2026" })).toBeInTheDocument();
            await user.click(screen.getByRole("button", { name: "10/10/2026" }));
            await user.click(screen.getByRole("button", { name: /October 21st, 2026/ }));

            expect(onChange).toHaveBeenCalledTimes(1);
            const picked = onChange.mock.calls[0][0] as Date;
            expect([picked.getFullYear(), picked.getMonth(), picked.getDate()]).toEqual([2026, 9, 21]);
        });

        it("calls onClear from the clear button, and has none when empty", async () => {
            const onClear = vi.fn();
            const { rerender } = render(
                <DateInput id="paid_at" value={new Date(2026, 9, 10)} onChange={vi.fn()} onClear={onClear} />,
            );
            const user = userEvent.setup();
            await user.click(screen.getByRole("button", { name: "common.clear" }));
            expect(onClear).toHaveBeenCalledTimes(1);

            rerender(<DateInput id="paid_at" value={null} onChange={vi.fn()} onClear={onClear} />);
            expect(screen.queryByRole("button", { name: "common.clear" })).not.toBeInTheDocument();
        });
    });

    describe("DateRangeInput", () => {
        it("calls onChange once, with the finished range, after the second day is picked", async () => {
            const onChange = vi.fn();
            render(
                <DateRangeInput id="period" value={undefined} onChange={onChange} onClear={vi.fn()} placeholder="period" />,
            );
            const user = userEvent.setup({ skipHover: true });
            await user.click(screen.getByRole("button", { name: "period" }));
            await user.click(screen.getByRole("button", { name: /October 21st, 2026/ }));
            expect(onChange).not.toHaveBeenCalled();
            await user.click(screen.getByRole("button", { name: /October 23rd, 2026/ }));

            expect(onChange).toHaveBeenCalledTimes(1);
            const range = onChange.mock.calls[0][0] as { from: Date; to: Date };
            expect([range.from.getDate(), range.to.getDate()]).toEqual([21, 23]);
        });
    });
});
