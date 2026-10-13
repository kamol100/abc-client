"use client";

import { ReactNode } from "react";
import { useWatch } from "react-hook-form";
import { ScanSearch } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FieldConfig, FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { VisibleFormField } from "@/components/form-wrapper/form-builder";
import MyButton from "@/components/my-button";
import { communityPlaceholder, detectCommunityBlockedReason, hasCliProtocol } from "./olt-access-form-schema";
import type { OltAccess } from "./olt-type";

interface Props {
    field: FieldConfig;
    renderField: (field: FormFieldConfig) => ReactNode;
    access: OltAccess;
    vendor?: string | null;
    /** "Detect from OLT" (POST /olts/{id}/access/detect-community); absent without permission. */
    onDetect?: () => void;
    detecting?: boolean;
}

/**
 * The SNMP community input of Edit access: mandatory only without a CLI login (with one, the app can read
 * the community from a BDCOM/VSOL OLT), plus the "Detect from OLT" button.
 */
export default function OltAccessCommunityField({ field, renderField, access, vendor, onDetect, detecting }: Props) {
    const { t } = useTranslation();
    const cli = hasCliProtocol(useWatch({ name: "cli_protocol" }));
    const stored = !!access.has_snmp_community;
    const shown: FieldConfig = {
        ...field,
        label: { ...field.label, mandatory: !stored && !cli },
        placeholder: communityPlaceholder(stored, cli),
    };
    const blocked = detectCommunityBlockedReason(access, vendor);

    return (
        <VisibleFormField field={shown}>
            {renderField(shown)}
            {onDetect && (
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {/* A disabled button gets no pointer events: the wrapper carries the reason. */}
                    <span title={blocked ? t(blocked) : undefined} className={blocked ? "inline-flex cursor-not-allowed" : "inline-flex"}>
                        <MyButton type="button" variant="outline" size="sm" loading={detecting} disabled={!!blocked} onClick={onDetect}>
                            {!detecting && <ScanSearch className="h-4 w-4" />}
                            {t("olt.access.detect.button")}
                        </MyButton>
                    </span>
                    <span className="text-xs text-muted-foreground">{t(blocked ?? "olt.access.detect.hint")}</span>
                </div>
            )}
        </VisibleFormField>
    );
}
