import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders with expected attributes and default classes", () => {
    render(<Input placeholder="Username" type="text" />);

    const input = screen.getByPlaceholderText("Username");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveClass("h-9");
    expect(input).toHaveClass("border-input");
  });

  it("allows text entry", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Search serial" />);

    const input = screen.getByPlaceholderText("Search serial");
    await user.type(input, "SER-001");

    expect(input).toHaveValue("SER-001");
  });

  it("merges custom classes with defaults", () => {
    render(<Input className="bg-muted" placeholder="Filter" />);

    const input = screen.getByPlaceholderText("Filter");
    expect(input).toHaveClass("bg-muted");
    expect(input).toHaveClass("rounded-md");
  });
});
