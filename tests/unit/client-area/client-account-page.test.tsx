import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClientAccountView } from "@/components/client-area/client-account-page";
import {
  parseClientAccount,
  type ClientAccount,
} from "@/components/client-area/client-account-type";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("@/app/actions", () => ({
  useFetch: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const account: ClientAccount = {
  id: "uuid-1",
  customer_id: "12673",
  name: "Kamol Hasan",
  father_name: "Karim",
  occupation: null,
  nid: "1990123456789",
  phone: "01677217129",
  alternate_phone: null,
  email: "kamol@example.test",
  photo: "clients/3/client-1/photo/file.png",
  current_address: "Road 4",
  permanent_address: "Village 9",
  latitude: null,
  longitude: null,
  upazila: null,
  status: 1,
  type: "1",
  connection_type: "2",
  connection_date: "2024-01-15",
  termination_date: "2026-11-01",
  billing_term: "prepaid",
  billing_type: "auto",
  payment_term: "1",
  username: "bns250532",
  mac_address: null,
  ip_address: "100.64.1.10",
  cable_type: "FIBER",
  cable_length: null,
  package: { name: "Regular-840", bandwidth: "20 Mbps" },
  zone: "North Zone",
  sub_zone: null,
};

describe("ClientAccountView", () => {
  it("shows the subscriber record as read-only and keeps photo as the only edit", () => {
    const onSelectFile = vi.fn();
    const onRemove = vi.fn();
    const { container } = render(
      <ClientAccountView
        account={account}
        photo={account.photo}
        busy={false}
        onSelectFile={onSelectFile}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByRole("heading", { name: "Kamol Hasan" })).toBeInTheDocument();
    expect(screen.getByText("12673 · bns250532")).toBeInTheDocument();
    expect(screen.getByText("common.active")).toBeInTheDocument();
    expect(screen.getByText("Karim")).toBeInTheDocument();
    expect(screen.getByText("1990123456789")).toBeInTheDocument();
    expect(screen.getByText("01677217129")).toBeInTheDocument();
    expect(screen.getByText("kamol@example.test")).toBeInTheDocument();
    expect(screen.getByText("Road 4")).toBeInTheDocument();
    expect(screen.getByText("Village 9")).toBeInTheDocument();
    expect(screen.getByText("Regular-840")).toBeInTheDocument();
    expect(screen.getByText("20 Mbps")).toBeInTheDocument();
    expect(screen.getByText("North Zone")).toBeInTheDocument();
    expect(screen.getByText("client.type.home")).toBeInTheDocument();
    expect(screen.getByText("client.connection_type.dedicated")).toBeInTheDocument();
    expect(screen.getByText("client.cable_type.options.fiber")).toBeInTheDocument();
    expect(screen.getByText("15-Jan-24")).toBeInTheDocument();
    expect(screen.getByText("01-Nov-26")).toBeInTheDocument();
    expect(screen.getByText("common.prepaid")).toBeInTheDocument();
    expect(screen.getByText("common.auto")).toBeInTheDocument();
    expect(screen.queryByText("hidden-pppoe")).not.toBeInTheDocument();
    expect(container.querySelectorAll("input:not([type=file])")).toHaveLength(0);
    expect(container.querySelectorAll("textarea")).toHaveLength(0);
    expect(screen.getByLabelText("client_account.photo_input")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "client_account.remove_photo" }));
    expect(onRemove).toHaveBeenCalledOnce();

    const file = new File(["photo"], "photo.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("client_account.photo_input"), {
      target: { files: [file] },
    });
    expect(onSelectFile).toHaveBeenCalledWith(file);
  });

  it("hides photo removal when the client has no photo", () => {
    render(
      <ClientAccountView
        account={{ ...account, photo: null }}
        photo={null}
        busy={false}
        onSelectFile={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "client_account.remove_photo" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "client_account.change_photo" }).length).toBeGreaterThan(0);
  });
});

describe("parseClientAccount", () => {
  it("keeps profile fields and drops secrets", () => {
    const parsed = parseClientAccount({
      id: "uuid-1",
      name: "Kamol",
      pppoe_password: "hidden-pppoe",
      password: "secret",
      note: "staff note",
      discount: 25,
      company_id: 4,
    });

    expect(parsed?.name).toBe("Kamol");
    expect(parsed && "pppoe_password" in parsed).toBe(false);
    expect(parsed && "password" in parsed).toBe(false);
    expect(parsed && "note" in parsed).toBe(false);
  });
});
