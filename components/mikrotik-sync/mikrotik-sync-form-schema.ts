import ClientFormFieldSchema from "@/components/clients/client-form-schema";
import type {
  AccordionSection,
  FormFieldConfig,
} from "@/components/form-wrapper/form-builder-type";

type Props = {
  mode?: "create" | "edit";
  paymentDeadline?: unknown;
};

export function MikrotikSyncNetworkFieldSchema(): FormFieldConfig[] {
  return [
    {
      type: "dropdown",
      name: "network_id",
      label: {
        labelText: "mikrotik_sync.sync.network.label",
        mandatory: true,
      },
      placeholder: "mikrotik_sync.sync.network.placeholder",
      api: "/dropdown-networks",
    },
  ];
}

export function MikrotikSyncImportFieldSchema({
  mode = "create",
  paymentDeadline,
}: Props): AccordionSection[] {
  const sections = ClientFormFieldSchema({ mode, paymentDeadline });
  const profileField: FormFieldConfig = {
    type: "text",
    name: "mikrotik_profile",
    label: { labelText: "mikrotik_sync.mikrotik_profile.label" },
    placeholder: "mikrotik_sync.mikrotik_profile.placeholder",
  };
  const basicSection = sections[0];
  if (!basicSection) return sections;

  return [
    {
      ...basicSection,
      form: [...basicSection.form, profileField],
    },
    ...sections.slice(1),
  ];
}
