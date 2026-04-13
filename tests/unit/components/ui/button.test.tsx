import { render, screen } from "@testing-library/react";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders as native button with default classes", () => {
    render(<Button type="button">Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("inline-flex");
    expect(button).toHaveClass("bg-primary");
  });

  it("applies requested variant and size classes", () => {
    render(
      <Button type="button" variant="outline" size="sm">
        Cancel
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Cancel" });
    expect(button).toHaveClass("border");
    expect(button).toHaveClass("h-8");
  });

  it("supports rendering as child element", () => {
    render(
      <Button asChild>
        <a href="/dashboard">Open Dashboard</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Open Dashboard" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveClass("inline-flex");
  });
});
