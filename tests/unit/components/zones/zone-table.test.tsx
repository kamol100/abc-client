import { render, screen } from "@testing-library/react";

import ZoneTable from "@/components/zones/zone-table";

type MockedDataTableProps = {
  data: Array<{ id: number; name: string }>;
  columns: unknown;
  form?: unknown;
  toolbarTitle?: string | null;
};

const { mockedZoneForm, mockedZonesColumns } = vi.hoisted(() => ({
  mockedZoneForm: vi.fn(),
  mockedZonesColumns: [{ accessorKey: "name" }],
}));

const useApiQueryMock = vi.fn();
const dataTableRenderSpy = vi.fn<(props: MockedDataTableProps) => void>();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/hooks/use-api-query", () => ({
  default: (...args: unknown[]) => useApiQueryMock(...args),
}));

vi.mock("@/components/data-table/data-table", () => ({
  DataTable: (props: MockedDataTableProps) => {
    dataTableRenderSpy(props);

    return (
      <div
        data-testid="zones-data-table"
        data-row-count={String(props.data.length)}
        data-toolbar-title={props.toolbarTitle ?? ""}
      />
    );
  },
}));

vi.mock("@/components/zones/zone-form", () => ({
  default: mockedZoneForm,
}));

vi.mock("@/components/zones/zones-column", () => ({
  ZonesColumns: mockedZonesColumns,
}));

describe("ZoneTable", () => {
  beforeEach(() => {
    useApiQueryMock.mockReset();
    dataTableRenderSpy.mockReset();
  });

  it("loads zones query and builds toolbar title with count", () => {
    useApiQueryMock.mockReturnValue({
      data: {
        data: {
          data: [
            { id: 1, name: "North" },
            { id: 2, name: "South" },
          ],
          pagination: {
            total: 2,
            per_page: 20,
            current_page: 1,
            last_page: 1,
          },
        },
      },
      isLoading: false,
      isFetching: false,
      setCurrentPage: vi.fn(),
    });

    render(<ZoneTable />);

    const queryArgs = useApiQueryMock.mock.calls[0]?.[0] as {
      queryKey: string[];
      url: string;
      params?: Record<string, unknown>;
    };
    expect(queryArgs.queryKey).toEqual(["zones"]);
    expect(queryArgs.url).toBe("zones");
    expect(queryArgs.params).toBeUndefined();

    const tableProps = dataTableRenderSpy.mock.calls[0]?.[0] as MockedDataTableProps;
    expect(tableProps.columns).toBe(mockedZonesColumns);
    expect(tableProps.form).toBe(mockedZoneForm);
    expect(tableProps.toolbarTitle).toBe("zone.title (2)");

    expect(screen.getByTestId("zones-data-table")).toHaveAttribute(
      "data-row-count",
      "2",
    );
  });

  it("falls back to plain translated title when total is missing", () => {
    useApiQueryMock.mockReturnValue({
      data: {
        data: {
          data: [],
          pagination: undefined,
        },
      },
      isLoading: false,
      isFetching: false,
      setCurrentPage: vi.fn(),
    });

    render(<ZoneTable />);

    const table = screen.getByTestId("zones-data-table");
    expect(table).toHaveAttribute("data-toolbar-title", "zone.title");
    expect(table).toHaveAttribute("data-row-count", "0");
  });
});
