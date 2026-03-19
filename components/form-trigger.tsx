import { forwardRef } from "react";
import MyButton, { type MyButtonProps } from "@/components/my-button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

type FormTriggerProps = Omit<MyButtonProps, "action"> & {
    mode: "create" | "edit";
};

const FormTrigger = forwardRef<HTMLButtonElement, FormTriggerProps>(({ mode, ...props }, ref) => {
    const isMobile = useIsMobile();
    const { t } = useTranslation();
    return mode === "create" ? (
        <MyButton ref={ref} action="create" size="default" variant="default" title={isMobile ? "" : t("common.add")} {...props} />
    ) : (
        <MyButton ref={ref} action="edit" icon {...props} />
    )
});

FormTrigger.displayName = "FormTrigger";

export default FormTrigger;
