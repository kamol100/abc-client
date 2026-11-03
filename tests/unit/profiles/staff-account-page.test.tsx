import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StaffAccountView } from "@/components/profiles/staff-account-page";
import { parseStaffAccount, type StaffAccount } from "@/components/profiles/staff-account-type";

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

const account: StaffAccount = {
  id: "staff-1",
  staff_id: "STF-10",
  name: "Kamol Hasan",
  designation: "Manager",
  phone: "01677217129",
  email: "kamol@example.test",
  gender: "male",
  marital_status: "unmarred",
  blood_group: "O+",
  date_of_birth: "1990-01-15",
  join_date: "2020-06-01",
  father_name: "Karim",
  mother_name: "Amina",
  present_address: "Road 4",
  permanent_address: "Village 9",
  job_experience: "5 years",
  social_media_address: "@kamol",
  status: "active",
  photo: null,
  username: "kamol",
  roles: ["Admin"],
  settings: {
    mobile_search: {
      mode: "simple",
      always_open: false,
    },
  },
};

function renderAccount(overrides: Partial<Parameters<typeof StaffAccountView>[0]> = {}) {
  const onSaveName = vi.fn(async () => true);
  const onCancelName = vi.fn();
  const onNameChange = vi.fn();
  const onSaveSettings = vi.fn(async () => true);
  render(
    <StaffAccountView
      account={account}
      photo={null}
      nameDraft="Kamol Hasan"
      busy={false}
      savingName={false}
      onNameChange={onNameChange}
      onSaveName={onSaveName}
      onCancelName={onCancelName}
      onSelectFile={vi.fn()}
      onRemove={vi.fn()}
      savingSettings={false}
      onSaveSettings={onSaveSettings}
      {...overrides}
    />,
  );
  return { onSaveName, onCancelName, onNameChange, onSaveSettings };
}

describe("StaffAccountView", () => {
  it("shows the name with an edit button and keeps the other fields read only", () => {
    renderAccount();

    expect(screen.getByRole("heading", { name: "Kamol Hasan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "staff_account.edit_name" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "staff_account.save_name" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "common.cancel" })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByLabelText("staff_account.dummy_photo")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "staff_account.account_information" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "staff_account.account_settings" })).toBeInTheDocument();
    expect(screen.getByText("01677217129")).toBeInTheDocument();
    expect(screen.getByText("kamol@example.test")).toBeInTheDocument();
    expect(screen.getByText("common.male")).toBeInTheDocument();
    expect(screen.getByText("Road 4")).toBeInTheDocument();
    expect(screen.queryByText("Village 9")).not.toBeInTheDocument();
    expect(screen.queryByText("common.unmarried")).not.toBeInTheDocument();
    expect(screen.queryByText("Karim")).not.toBeInTheDocument();
    expect(screen.queryByText("Amina")).not.toBeInTheDocument();
    expect(screen.queryByText("@kamol")).not.toBeInTheDocument();
    expect(screen.queryByText("5 years")).not.toBeInTheDocument();
    expect(screen.getByText("Manager")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "staff_account.remove_photo" })).not.toBeInTheDocument();
  });

  it("shows the permanent address when the present address is empty", () => {
    renderAccount({
      account: { ...account, present_address: null },
    });

    expect(screen.getByText("staff.permanent_address.label")).toBeInTheDocument();
    expect(screen.getByText("Village 9")).toBeInTheDocument();
    expect(screen.queryByText("staff.present_address.label")).not.toBeInTheDocument();
  });

  it("hides the address category when neither address exists", () => {
    renderAccount({
      account: { ...account, present_address: null, permanent_address: null },
    });

    expect(screen.queryByRole("heading", { name: "staff_account.sections.address" })).not.toBeInTheDocument();
  });

  it("opens the name field on edit and closes it on save or cancel", async () => {
    const { onSaveName, onCancelName } = renderAccount({ nameDraft: "New Name" });

    fireEvent.click(screen.getByRole("button", { name: "staff_account.edit_name" }));
    expect(screen.getByLabelText("staff.name.label")).toHaveValue("New Name");
    expect(screen.queryByRole("button", { name: "staff_account.edit_name" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "common.cancel" }));
    expect(onCancelName).toHaveBeenCalledOnce();
    expect(onSaveName).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "staff_account.edit_name" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "staff_account.save_name" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "staff_account.edit_name" }));
    fireEvent.click(screen.getByRole("button", { name: "staff_account.save_name" }));
    expect(onSaveName).toHaveBeenCalledOnce();
    expect(await screen.findByRole("button", { name: "staff_account.edit_name" })).toBeInTheDocument();
  });

  it("starts on simple search and saves a new style or an open switch", async () => {
    const { onSaveSettings } = renderAccount();
    const simple = screen.getByRole("radio", { name: "staff_account.mobile_search.simple" });
    const standard = screen.getByRole("radio", { name: "staff_account.mobile_search.default" });
    const alwaysOpen = screen.getByRole("switch", { name: "staff_account.mobile_search.always_open" });

    expect(simple).toBeChecked();
    expect(standard).not.toBeChecked();
    expect(alwaysOpen).not.toBeChecked();
    expect(screen.queryByText("staff_account.mobile_search.description")).not.toBeInTheDocument();
    expect(screen.queryByText("staff_account.mobile_search.simple_hint")).not.toBeInTheDocument();
    expect(screen.queryByText("staff_account.mobile_search.default_hint")).not.toBeInTheDocument();
    expect(screen.queryByText("staff_account.mobile_search.always_open_hint")).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(standard);
    });
    expect(onSaveSettings).toHaveBeenCalledWith({ mode: "default", always_open: false });
    expect(standard).toBeChecked();

    await act(async () => {
      fireEvent.click(alwaysOpen);
    });
    expect(onSaveSettings).toHaveBeenLastCalledWith({ mode: "default", always_open: true });
    expect(alwaysOpen).toBeChecked();
  });

  it("restores the previous mobile search when saving fails", async () => {
    const onSaveSettings = vi.fn(async () => false);
    renderAccount({ onSaveSettings });
    const simple = screen.getByRole("radio", { name: "staff_account.mobile_search.simple" });

    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: "staff_account.mobile_search.default" }));
    });

    expect(onSaveSettings).toHaveBeenCalledOnce();
    expect(simple).toBeChecked();
  });
});

describe("parseStaffAccount", () => {
  it("drops salary and keeps the profile fields", () => {
    const parsed = parseStaffAccount({
      id: "staff-1",
      name: "Kamol",
      phone: "017",
      roles: ["Admin", " "],
      salary_items: [{ items_label: "Basic", items_value: 1000 }],
    });

    expect(parsed?.name).toBe("Kamol");
    expect(parsed?.roles).toEqual(["Admin"]);
    expect(parsed?.settings.mobile_search).toEqual({ mode: "simple", always_open: false });
    expect(parsed).not.toHaveProperty("salary_items");
  });

  it("keeps a stored mobile search setting", () => {
    const parsed = parseStaffAccount({
      id: "staff-1",
      settings: { mobile_search: { mode: "default", always_open: true } },
    });

    expect(parsed?.settings.mobile_search).toEqual({ mode: "default", always_open: true });
  });
});
