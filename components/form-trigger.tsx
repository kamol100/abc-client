import { forwardRef } from "react";
import ActionButton, { type ActionButtonProps } from "@/components/action-button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

type FormTriggerProps = Omit<ActionButtonProps, "action"> & {
    mode: "create" | "edit";
};

const FormTrigger = forwardRef<HTMLButtonElement, FormTriggerProps>(({ mode, ...props }, ref) => {
    const isMobile = useIsMobile();
    const { t } = useTranslation();
    return mode === "create" ? (
        <ActionButton ref={ref} action="create" size="default" variant="default" title={isMobile ? "" : t("add")} {...props} />
    ) : (
        <ActionButton ref={ref} action="edit" icon {...props} />
    )
});

FormTrigger.displayName = "FormTrigger";

export default FormTrigger;
