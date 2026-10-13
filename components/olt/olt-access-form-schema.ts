import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import type { OltAccess } from "./olt-type";

const isV2c = (value: unknown) => value !== "v3";
const isV3 = (value: unknown) => value === "v3";
const hasCli = (value: unknown) => value === "ssh" || value === "telnet";

/** Secrets are write-only: once one is stored, an empty field keeps it. */
const secretPlaceholder = (stored: boolean | undefined, placeholder: string) =>
    stored ? "olt.access.fields.keep_placeholder" : placeholder;

/** Edit access fields (PUT /olts/{id}/access): SNMP v2c or v3, then optional CLI over SSH or Telnet. */
export default function OltAccessFormFieldSchema(access: OltAccess): FieldConfig[] {
    return [
        {
            type: "dropdown",
            name: "snmp_version",
            label: { labelText: "olt.access.fields.snmp_version", tooltip: "olt.access.fields.snmp_version_tooltip", mandatory: true },
            options: [
                { value: "v2c", label: "olt.access.snmp_v2c" },
                { value: "v3", label: "olt.access.snmp_v3" },
            ],
            isClearable: false,
        },
        {
            type: "password",
            name: "snmp_community",
            label: { labelText: "olt.access.fields.snmp_community", tooltip: "olt.access.fields.snmp_community_tooltip", mandatory: !access.has_snmp_community },
            placeholder: secretPlaceholder(access.has_snmp_community, "olt.access.fields.snmp_community"),
            visibleWhen: { field: "snmp_version", when: isV2c, resetValue: "" },
        },
        {
            type: "text",
            name: "snmp_v3_user",
            label: { labelText: "olt.access.fields.snmp_v3_user", tooltip: "olt.access.fields.snmp_v3_user_tooltip", mandatory: true },
            placeholder: "olt.access.fields.snmp_v3_user",
            visibleWhen: { field: "snmp_version", when: isV3, resetValue: "" },
        },
        {
            type: "dropdown",
            name: "snmp_v3_auth_protocol",
            label: { labelText: "olt.access.fields.snmp_v3_auth_protocol", tooltip: "olt.access.fields.snmp_v3_auth_protocol_tooltip" },
            options: [
                { value: "SHA", label: "SHA-1" },
                { value: "SHA256", label: "SHA-256" },
                { value: "SHA512", label: "SHA-512" },
                { value: "MD5", label: "MD5" },
            ],
            isClearable: false,
            visibleWhen: { field: "snmp_version", when: isV3, resetValue: "SHA" },
        },
        {
            type: "password",
            name: "snmp_v3_auth_pass",
            label: { labelText: "olt.access.fields.snmp_v3_auth_pass", tooltip: "olt.access.fields.snmp_v3_auth_pass_tooltip", mandatory: !access.has_snmp_v3_auth_pass },
            placeholder: secretPlaceholder(access.has_snmp_v3_auth_pass, "olt.access.fields.passphrase_placeholder"),
            visibleWhen: { field: "snmp_version", when: isV3, resetValue: "" },
        },
        {
            type: "dropdown",
            name: "snmp_v3_priv_protocol",
            label: { labelText: "olt.access.fields.snmp_v3_priv_protocol", tooltip: "olt.access.fields.snmp_v3_priv_protocol_tooltip" },
            options: [
                { value: "AES", label: "AES-128" },
                { value: "DES", label: "DES" },
            ],
            isClearable: false,
            visibleWhen: { field: "snmp_version", when: isV3, resetValue: "AES" },
        },
        {
            type: "password",
            name: "snmp_v3_priv_pass",
            label: { labelText: "olt.access.fields.snmp_v3_priv_pass", tooltip: "olt.access.fields.snmp_v3_priv_pass_tooltip" },
            placeholder: secretPlaceholder(access.has_snmp_v3_priv_pass, "olt.access.fields.priv_pass_placeholder"),
            visibleWhen: { field: "snmp_version", when: isV3, resetValue: "" },
        },
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
        },
        {
            type: "text",
            name: "cli_username",
            label: { labelText: "olt.access.fields.cli_username", tooltip: "olt.access.fields.cli_username_tooltip", mandatory: true },
            placeholder: "olt.access.fields.cli_username",
            visibleWhen: { field: "cli_protocol", when: hasCli, resetValue: "" },
        },
        {
            type: "password",
            name: "cli_password",
            label: { labelText: "olt.access.fields.cli_password", tooltip: "olt.access.fields.cli_password_tooltip", mandatory: !access.has_cli_password },
            placeholder: secretPlaceholder(access.has_cli_password, "olt.access.fields.cli_password"),
            visibleWhen: { field: "cli_protocol", when: hasCli, resetValue: "" },
        },
        {
            type: "password",
            name: "cli_enable_password",
            label: { labelText: "olt.access.fields.cli_enable_password", tooltip: "olt.access.fields.cli_enable_password_tooltip" },
            placeholder: secretPlaceholder(access.has_cli_enable_password, "olt.access.fields.cli_enable_password_placeholder"),
            visibleWhen: { field: "cli_protocol", when: hasCli, resetValue: "" },
        },
        {
            // Only when an SSH host key is pinned: forget it (e.g. the OLT was replaced).
            type: "switch",
            name: "reset_host_key",
            label: { labelText: "olt.access.fields.reset_host_key", tooltip: "olt.access.fields.reset_host_key_tooltip" },
            permission: !!access.cli_host_key,
            visibleWhen: { field: "cli_protocol", when: (value) => value === "ssh", resetValue: false },
        },
    ];
}
