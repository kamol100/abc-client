import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ClientDashboardInfo from "@/components/client-area/dashboard/ClientDashboardInfo";
import {
  ClientDashboardInfoSchema,
  type ClientDashboardInfo as ClientDashboardInfoData,
} from "@/components/client-area/dashboard/client-dashboard-type";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

const info: ClientDashboardInfoData = {
  customer_id: "12673",
  name: "Kamol",
  username: "bns250532",
  phone: "01677217129",
  alternate_phone: null,
  email: null,
  status: 1,
  termination_date: "2026-11-01",
  package: "Regular-840",
  connection: {
    is_online: true,
    ip_address: "100.64.150.42",
  },
  onu_status: null,
};

describe("ClientDashboardInfo", () => {
  it("shows the subscriber fields from the reference layout", () => {
    render(<ClientDashboardInfo data={info} isLoading={false} isError={false} />);

    expect(screen.getByRole("heading", { name: "client_dashboard.info.title" })).toBeInTheDocument();
    expect(screen.getByText("common.active")).toBeInTheDocument();
    expect(screen.getByText("client.basic_view.online")).toBeInTheDocument();
    expect(screen.getByText("client_dashboard.info.not_available")).toBeInTheDocument();
    expect(screen.getByText("12673")).toBeInTheDocument();
    expect(screen.getByText("01-Nov-26")).toBeInTheDocument();
    expect(screen.getByText("bns250532")).toBeInTheDocument();
    expect(screen.getByText("Kamol")).toBeInTheDocument();
    expect(screen.getByText("01677217129")).toBeInTheDocument();
    expect(screen.getByText("100.64.150.42")).toBeInTheDocument();
    expect(screen.getByText("Regular-840")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(2);
  });

  it("shows inactive and offline states", () => {
    render(
      <ClientDashboardInfo
        data={{
          ...info,
          status: 0,
          connection: { is_online: false, ip_address: null },
          onu_status: "offline",
        }}
        isLoading={false}
        isError={false}
      />,
    );

    expect(screen.getByText("common.inactive")).toBeInTheDocument();
    expect(screen.getByText("client.basic_view.offline")).toBeInTheDocument();
    expect(screen.getByText("onu.status.offline")).toBeInTheDocument();
    expect(screen.queryByText("100.64.150.42")).not.toBeInTheDocument();
  });

  it("shows a loading skeleton without subscriber values", () => {
    render(<ClientDashboardInfo data={null} isLoading isError={false} />);

    expect(screen.getByRole("heading", { name: "client_dashboard.info.title" })).toBeInTheDocument();
    expect(screen.queryByText("12673")).not.toBeInTheDocument();
  });

  it("shows an error when the request fails", () => {
    render(<ClientDashboardInfo data={null} isLoading={false} isError />);

    expect(screen.getByRole("alert")).toHaveTextContent("common.failed_to_load_data");
  });
});

describe("ClientDashboardInfoSchema", () => {
  it("keeps a numeric customer id and defaults a missing session", () => {
    const parsed = ClientDashboardInfoSchema.parse({
      customer_id: 12673,
      name: "Kamol",
      status: "1",
    });

    expect(parsed.customer_id).toBe("12673");
    expect(parsed.status).toBe(1);
    expect(parsed.connection).toEqual({ is_online: false, ip_address: null });
    expect(parsed.onu_status).toBeNull();
  });
});
