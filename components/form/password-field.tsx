import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import InputField, { type InputFieldProps } from "@/components/form/input-field";

type PasswordFieldProps = Omit<InputFieldProps, "type" | "prefix" | "suffix">;

export function PasswordField(props: PasswordFieldProps) {
    const { t } = useTranslation();
    const [passwordVisible, setPasswordVisible] = useState(false);

    return (
        <InputField
            {...props}
            type={passwordVisible ? "text" : "password"}
            suffix={
                <button
                    type="button"
                    className="inline-flex items-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    onClick={() => setPasswordVisible((visible) => !visible)}
                    aria-label={t(passwordVisible ? "common.hide_password" : "common.show_password")}
                    aria-pressed={passwordVisible}
                >
                    {passwordVisible ? (
                        <EyeOff className="h-4 w-4" aria-hidden />
                    ) : (
                        <Eye className="h-4 w-4" aria-hidden />
                    )}
                </button>
            }
        />
    );
}

export default PasswordField;
