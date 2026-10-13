import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { ONU_STATUSES } from "./onu-type";

/** GET /onus filters: search (serial, MAC, name, client), OLT, status, low optical power, not bound to a client. */
export const OnuFilterSchema = (): FieldConfig[] => [
    { type: "text", name: "search", placeholder: "onu.filters.search", permission: true, watchForFilter: true },
    { type: "dropdown", name: "olt", placeholder: "onu.filters.olt", permission: true, api: "/dropdown-devices?category=olt" },
    {
        type: "dropdown",
        name: "status",
        placeholder: "onu.filters.status",
        permission: true,
        options: ONU_STATUSES.map((status) => ({ value: status, label: `onu.status.${status}` })),
    },
    {
        type: "dropdown",
        name: "low_power",
        placeholder: "onu.filters.low_power",
        permission: true,
        options: [{ value: 1, label: "onu.filters.yes" }],
    },
    {
        type: "dropdown",
        name: "unbound",
        placeholder: "onu.filters.unbound",
        permission: true,
        options: [{ value: 1, label: "onu.filters.yes" }],
    },
];

export default OnuFilterSchema;
