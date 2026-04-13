import { render, screen } from "@testing-library/react";
import { type ReactNode } from "react";

import ZoneForm from "@/components/zones/zone-form";

type MockDialogProps = {
  title?: string;
  trigger?: ReactNode;
  children?: ReactNode;
};

type MockFormBuilderProps = {
  mode: "create" | "edit";
  api: string;
  method: "GET" | "POST" | "PUT";
  queryKey: string;
  formSchema: unknown[];
  data?: Record<string, unknown>;
};

const formBuilderSpy = vi.fn<(props: MockFormBuilderProps) => void>();

vi.mock("@/components/my-dialog", () => ({
  MyDialog: ({ title, trigger, children }: MockDialogProps) => (
    <div data-testid="mock-zone-dialog" data-title={title}>
      {trigger}
      {children}
    </div>
  ),
}));

vi.mock("@/components/form-wrapper/form-builder", () => ({
  default: (props: MockFormBuilderProps) => {
    formBuilderSpy(props);
    return <div data-testid="mock-zone-form-builder" />;
  },
}));

vi.mock("@/components/form-trigger", () => ({
  default: ({ mode }: { mode: "create" | "edit" }) => (
    <button type="button" data-testid={`zone-trigger-${mode}`} />
  ),
}));

describe("ZoneForm", () => {
  beforeEach(() => {
    formBuilderSpy.mockReset();
  });

  it("uses create defaults for zone form", () => {
    render(<ZoneForm />);

    expect(screen.getByTestId("zone-trigger-create")).toBeInTheDocument();
    expect(screen.getByTestId("mock-zone-dialog")).toHaveAttribute(
      "data-title",
      "zone.create_title",
    );

    const builderProps = formBuilderSpy.mock.calls[0]?.[0];
    expect(builderProps.mode).toBe("create");
    expect(builderProps.api).toBe("/zones");
    expect(builderProps.method).toBe("POST");
    expect(builderProps.queryKey).toBe("zones");
    expect(builderProps.formSchema).toHaveLength(3);
  });

  it("uses provided edit props", () => {
    render(
      <ZoneForm
        mode="edit"
        data={{ id: 44 }}
        api="/zones"
        method="PUT"
      />,
    );

    expect(screen.getByTestId("zone-trigger-edit")).toBeInTheDocument();
    expect(screen.getByTestId("mock-zone-dialog")).toHaveAttribute(
      "data-title",
      "zone.edit_title",
    );

    const builderProps = formBuilderSpy.mock.calls[0]?.[0];
    expect(builderProps.mode).toBe("edit");
    expect(builderProps.method).toBe("PUT");
    expect(builderProps.data).toEqual({ id: 44 });
  });
});
