import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { MikrotikCommandOptions } from "./mikrotik-command-type";

const MikrotikCommandFormSchema = (): FieldConfig[] => {
  return [
    {
      type: "dropdown",
      name: "network_id",
      label: { labelText: "mikrotik_command.network.label", mandatory: true },
      placeholder: "mikrotik_command.network.placeholder",
      api: "/dropdown-networks",
      isClearable: false,
    },
    {
      type: "dropdown",
      name: "command",
      label: { labelText: "mikrotik_command.command.label", mandatory: true },
      placeholder: "mikrotik_command.command.placeholder",
      options: MikrotikCommandOptions,
      isClearable: false,
    },
  ];
};

export default MikrotikCommandFormSchema;
