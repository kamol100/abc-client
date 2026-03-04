import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const DeviceFormFieldSchema = (): FieldConfig[] => {
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
      label: { labelText: "device.device_ip.label" },
      placeholder: "device.device_ip.placeholder",
    },
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
