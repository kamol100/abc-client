import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

/**
 * OLT credentials (saved to olt_accesses), shown only while an OLT device type is selected: the CLI login first,
 * then the SNMP community, which the app can read from the OLT when it is left empty.
 * When editing, the saved secrets are never sent back: a blank community / password keeps them.
 */
const oltAccessFields = (oltTypeIds: (string | number)[], keepSecrets: boolean): FieldConfig[] => {
  const isOlt = (value: unknown) => oltTypeIds.some((id) => String(id) === String(value));
  return [
    {
      type: "dropdown",
      name: "cli_protocol",
      label: { labelText: "olt.access.fields.cli_protocol", tooltip: "olt.access.fields.cli_protocol_tooltip" },
      placeholder: "olt.access.fields.cli_protocol_placeholder",
      options: [
        { value: "telnet", label: "olt.access.protocol.telnet" },
        { value: "ssh", label: "olt.access.protocol.ssh" },
      ],
      isClearable: true,
      visibleWhen: { field: "device_type_id", when: isOlt },
    },
    // Hidden with cli_protocol, which is itself cleared when the type is not an OLT.
    {
      type: "text",
      name: "cli_username",
      label: { labelText: "olt.access.fields.cli_username", tooltip: "olt.access.fields.cli_username_tooltip" },
      placeholder: "olt.access.fields.cli_username",
      visibleWhen: { field: "cli_protocol" },
    },
    {
      type: "password",
      name: "cli_password",
      label: { labelText: "olt.access.fields.cli_password", tooltip: "olt.access.fields.cli_password_tooltip" },
      placeholder: keepSecrets ? "olt.access.fields.keep_placeholder" : "olt.access.fields.cli_password",
      visibleWhen: { field: "cli_protocol" },
    },
    // Last, after the CLI login: with one, it may stay empty and the app reads it from the OLT (BDCOM, VSOL).
    // The brand is not known here, so the tooltip covers BDCOM, VSOL and Huawei.
    {
      type: "password",
      name: "snmp_community",
      label: { labelText: "olt.access.fields.snmp_community", tooltip: "olt.access.fields.snmp_community_tooltip" },
      placeholder: keepSecrets ? "olt.access.fields.keep_placeholder" : "olt.access.fields.snmp_community_auto_placeholder",
      visibleWhen: { field: "device_type_id", when: isOlt },
    },
  ];
};

/** Pass `oltTypeIds` to add the OLT credential inputs (users with olts.access-settings only). */
export const DeviceFormFieldSchema = (oltTypeIds: (string | number)[] = [], keepSecrets = false): FieldConfig[] => {
  return [
    {
      type: "dropdown",
      name: "network_id",
      label: { labelText: "device.network.label", mandatory: true },
      placeholder: "device.network.placeholder",
      api: "/dropdown-networks",
      valueKey: "network",
      valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
      type: "dropdown",
      name: "device_type_id",
      label: { labelText: "device.device_type.label", mandatory: true },
      placeholder: "device.device_type.placeholder",
      api: "/dropdown-device-types",
      valueKey: "device_type",
      valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
      type: "text",
      name: "name",
      label: { labelText: "device.name.label", mandatory: true },
      placeholder: "device.name.placeholder",
    },
    {
      type: "dropdown",
      name: "device_id",
      label: { labelText: "device.parent_device.label" },
      placeholder: "device.parent_device.placeholder",
      api: "/dropdown-devices",
      valueKey: "device",
      valueMapping: { idKey: "id", labelKey: "name" },
      isClearable: true,
    },
    {
      type: "text",
      name: "device_ip",
      label: { labelText: "device.device_ip.label", tooltip: "device.device_ip.tooltip" },
      placeholder: "device.device_ip.placeholder",
    },
    ...(oltTypeIds.length ? oltAccessFields(oltTypeIds, keepSecrets) : []),
    {
      type: "dropdown",
      name: "zone_id",
      label: { labelText: "device.zone.label" },
      placeholder: "device.zone.placeholder",
      api: "/dropdown-zones",
      valueKey: "zone",
      valueMapping: { idKey: "id", labelKey: "name" },
      isClearable: true,
    },
    {
      type: "text",
      name: "input_port",
      label: { labelText: "device.input_port.label" },
      placeholder: "device.input_port.placeholder",
    },
    {
      type: "text",
      name: "total_port",
      label: { labelText: "device.total_port.label" },
      placeholder: "device.total_port.placeholder",
    },
    {
      type: "number",
      name: "latitude",
      label: { labelText: "device.latitude.label" },
      placeholder: "device.latitude.placeholder",
    },
    {
      type: "number",
      name: "longitude",
      label: { labelText: "device.longitude.label" },
      placeholder: "device.longitude.placeholder",
    },
    {
      type: "text",
      name: "fiber_code",
      label: { labelText: "device.fiber_code.label" },
      placeholder: "device.fiber_code.placeholder",
    },
    {
      type: "number",
      name: "device_order",
      label: { labelText: "device.device_order.label" },
      placeholder: "device.device_order.placeholder",
    },
    {
      type: "dropdown",
      name: "status",
      label: { labelText: "device.status.label" },
      placeholder: "device.status.placeholder",
      options: [
        { value: "active", label: "device.status.active" },
        { value: "inactive", label: "device.status.inactive" },
      ],
    },
    {
      type: "switch",
      name: "monitor_enabled",
      label: { labelText: "device.monitor_enabled.label", tooltip: "device.monitor_enabled.tooltip" },
    },
    {
      type: "textarea",
      name: "note",
      label: { labelText: "device.note.label" },
      placeholder: "device.note.placeholder",
      rows: 3,
      className: "sm:col-span-2",
    },
  ];
};

export default DeviceFormFieldSchema;
