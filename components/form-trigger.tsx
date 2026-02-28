import { forwardRef } from "react";
import ActionButton, { type ActionButtonProps } from "@/components/action-button";

type FormTriggerProps = Omit<ActionButtonProps, "action"> & {
    mode: "create" | "edit";
};

const FormTrigger = forwardRef<HTMLButtonElement, FormTriggerProps>(
    ({ mode, ...props }, ref) =>
        mode === "create" ? (
            <ActionButton ref={ref} action="create" size="default" variant="default" title="add" {...props} />
        ) : (
            <ActionButton ref={ref} action="edit" icon {...props} />
        )
);

FormTrigger.displayName = "FormTrigger";

export default FormTrigger;
