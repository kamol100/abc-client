import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export function ReSyncFilterSchema(): FieldConfig[] {
  return [
    {
      type: "text",
      name: "client_in_app",
      placeholder: "re_sync.filters.client_in_app.placeholder",
      watchForFilter: true,
    },
    {
      type: "text",
      name: "mikrotik_profile",
      placeholder: "re_sync.filters.mikrotik_profile.placeholder",
      watchForFilter: true,
    },
    {
      type: "text",
      name: "app_profile",
      placeholder: "re_sync.filters.app_profile.placeholder",
      watchForFilter: true,
    },
    {
      type: "dropdown",
      name: "client_status_mikrotik",
      placeholder: "re_sync.filters.client_status_mikrotik.placeholder",
      options: [
        {
          value: "Active",
          label: "re_sync.filters.client_status_mikrotik.options.active",
        },
        {
          value: "Inactive",
          label: "re_sync.filters.client_status_mikrotik.options.inactive",
        },
      ],
    },
    {
      type: "dropdown",
      name: "client",
      placeholder: "re_sync.filters.client.placeholder",
      options: [
        {
          value: "mikrotik",
          label: "re_sync.filters.client.options.mikrotik",
        },
        {
          value: "app",
          label: "re_sync.filters.client.options.app",
        },
      ],
    },
    {
      type: "dropdown",
      name: "mikrotik_match",
      placeholder: "re_sync.filters.mikrotik_match.placeholder",
      options: [
        {
          value: 1,
          label: "re_sync.filters.mikrotik_match.options.match",
        },
        {
          value: 0,
          label: "re_sync.filters.mikrotik_match.options.not_match",
        },
      ],
    },
  ];
}

export default ReSyncFilterSchema;
