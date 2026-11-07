import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export function MikrotikSyncFilterSchema(): FieldConfig[] {
  return [
    {
      type: "text",
      name: "any",
      placeholder: "mikrotik_sync.any_search.placeholder",
      permission: true,
      watchForFilter: true,
    },
    {
      type: "dropdown",
      name: "disabled",
      placeholder: "mikrotik_sync.filters.disabled.placeholder",
      isClearable: true,
      options: [
        { value: "true", label: "mikrotik_sync.filters.disabled.options.true" },
        { value: "false", label: "mikrotik_sync.filters.disabled.options.false" },
      ],
    },
    {
      type: "dropdown",
      name: "syncd_status",
      placeholder: "mikrotik_sync.filters.syncd_status.placeholder",
      isClearable: true,
      options: [
        {
          value: "imported",
          label: "mikrotik_sync.filters.syncd_status.options.imported",
        },
        {
          value: "null",
          label: "mikrotik_sync.filters.syncd_status.options.not_imported",
        },
      ],
    },
    {
      type: "dropdown",
      name: "reseller_id",
      placeholder: "mikrotik_sync.filters.reseller.placeholder",
      isClearable: true,
      api: "/dropdown-resellers/company",
    },
    {
      type: "dropdown",
      name: "client_status_mikrotik",
      placeholder: "mikrotik_sync.filters.client_status_mikrotik.placeholder",
      isClearable: true,
      options: [
        {
          value: "Active",
          label: "mikrotik_sync.filters.client_status_mikrotik.options.active",
        },
        {
          value: "Inactive",
          label: "mikrotik_sync.filters.client_status_mikrotik.options.inactive",
        },
      ],
    },
    {
      type: "dropdown",
      name: "client",
      placeholder: "mikrotik_sync.filters.client.placeholder",
      isClearable: true,
      options: [
        { value: "mikrotik", label: "mikrotik_sync.filters.client.options.mikrotik" },
        { value: "app", label: "mikrotik_sync.filters.client.options.app" },
      ],
    },
    {
      type: "dropdown",
      name: "mikrotik_match",
      placeholder: "mikrotik_sync.filters.mikrotik_match.placeholder",
      isClearable: true,
      options: [
        { value: 1, label: "mikrotik_sync.filters.mikrotik_match.options.match" },
        { value: 0, label: "mikrotik_sync.filters.mikrotik_match.options.not_match" },
      ],
    },
  ];
}

export default MikrotikSyncFilterSchema;
