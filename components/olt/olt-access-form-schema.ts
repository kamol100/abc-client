import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import type { OltAccess } from "./olt-type";

const isV2c = (value: unknown) => value !== "v3";
const isV3 = (value: unknown) => value === "v3";

/** Vendors whose community tooltip has brand-specific instructions. */
export const COMMUNITY_HELP_VENDORS = ["bdcom", "vsol", "huawei"] as const;

/** Where to find the SNMP community, for the OLT's brand; all three brands when it is not known. */
export function communityTooltipKey(vendor?: string | null): string {
    return (COMMUNITY_HELP_VENDORS as readonly string[]).includes(vendor ?? "")
        ? `olt.access.fields.snmp_community_tooltip_${vendor}`
        : "olt.access.fields.snmp_community_tooltip";
}

/** Saved → "empty keeps it"; with a CLI login → "leave empty to read it from the OLT"; else the plain label. */
export function communityPlaceholder(stored: boolean | undefined, hasCliLogin: boolean): string {
    if (stored) return "olt.access.fields.keep_placeholder";
    return hasCliLogin ? "olt.access.fields.snmp_community_auto_placeholder" : "olt.access.fields.snmp_community";
}

export const hasCliProtocol = (value: unknown) => value === "ssh" || value === "telnet";

/** Why "Detect from OLT" cannot run, or null: it logs in with the SAVED CLI access (BDCOM, VSOL). */
export function detectCommunityBlockedReason(
    access: Pick<OltAccess, "configured" | "cli_protocol" | "snmp_version">,
    vendor?: string | null
): string | null {
    if (!access.configured || !hasCliProtocol(access.cli_protocol)) return "olt.access.detect.needs_cli";
    if (access.snmp_version === "v3") return "olt.access.detect.v3";
    if (vendor === "huawei") return "olt.access.detect.huawei";
    return null;
}

/** Help rows of "Where do I find these settings?" (olt.access.where.<key> + <key>_title). */
const WHERE_TO_FIND = ["general", "auto", "bdcom", "vsol", "huawei", "missing"] as const;

/** The help rows with the OLT's own brand first (all of them, in the usual order, when the brand is not known). */
export function whereToFindRows(vendor?: string | null): string[] {
    const brand = (COMMUNITY_HELP_VENDORS as readonly string[]).includes(vendor ?? "") ? (vendor as string) : null;
    if (!brand) return [...WHERE_TO_FIND];
    return [brand, ...WHERE_TO_FIND.filter((key) => key !== brand)];
}

/** Secrets are write-only: once one is stored, an empty field keeps it. */
const secretPlaceholder = (stored: boolean | undefined, placeholder: string) =>
    stored ? "olt.access.fields.keep_placeholder" : placeholder;

/**
 * Edit access fields (PUT /olts/{id}/access): the CLI login (SSH or Telnet) first, then SNMP v2c or v3, so the
 * community can be left empty and read from the OLT over the CLI (BDCOM, VSOL).
 */
export default function OltAccessFormFieldSchema(access: OltAccess, vendor?: string | null): FieldConfig[] {
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
        },
        {
            type: "text",
            name: "cli_username",
            label: { labelText: "olt.access.fields.cli_username", tooltip: "olt.access.fields.cli_username_tooltip", mandatory: true },
            placeholder: "olt.access.fields.cli_username",
            visibleWhen: { field: "cli_protocol", when: hasCliProtocol, resetValue: "" },
        },
        {
            type: "password",
            name: "cli_password",
            label: { labelText: "olt.access.fields.cli_password", tooltip: "olt.access.fields.cli_password_tooltip", mandatory: !access.has_cli_password },
            placeholder: secretPlaceholder(access.has_cli_password, "olt.access.fields.cli_password"),
            visibleWhen: { field: "cli_protocol", when: hasCliProtocol, resetValue: "" },
        },
        {
            type: "password",
            name: "cli_enable_password",
            label: { labelText: "olt.access.fields.cli_enable_password", tooltip: "olt.access.fields.cli_enable_password_tooltip" },
            placeholder: secretPlaceholder(access.has_cli_enable_password, "olt.access.fields.cli_enable_password_placeholder"),
            visibleWhen: { field: "cli_protocol", when: hasCliProtocol, resetValue: "" },
        },
        {
            // Only when an SSH host key is pinned: forget it (e.g. the OLT was replaced).
            type: "switch",
            name: "reset_host_key",
            label: { labelText: "olt.access.fields.reset_host_key", tooltip: "olt.access.fields.reset_host_key_tooltip" },
            permission: !!access.cli_host_key,
            visibleWhen: { field: "cli_protocol", when: (value) => value === "ssh", resetValue: false },
        },
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
            // Label `mandatory` and placeholder follow the CLI choice (OltAccessCommunityField): with a CLI login
            // the app can read the community from a BDCOM/VSOL OLT, so it may stay empty.
            type: "password",
            name: "snmp_community",
            label: {
                labelText: "olt.access.fields.snmp_community",
                tooltip: communityTooltipKey(vendor),
                mandatory: !access.has_snmp_community,
            },
            placeholder: communityPlaceholder(access.has_snmp_community, false),
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
    ];
}
