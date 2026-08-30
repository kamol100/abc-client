import { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ChangePasswordFormFieldSchema = (): FieldConfig[] => {
  return [
    {
      type: "password",
      name: "current_password",
      label: {
        labelText: "user_profile.change_password.current_password.label",
        mandatory: true,
      },
      placeholder: "user_profile.change_password.current_password.placeholder",
    },
    {
      type: "password",
      name: "password",
      label: {
        labelText: "user_profile.change_password.password.label",
        mandatory: true,
      },
      placeholder: "user_profile.change_password.password.placeholder",
    },
    {
      type: "password",
      name: "password_confirmation",
      label: {
        labelText: "user_profile.change_password.password_confirmation.label",
        mandatory: true,
      },
      placeholder: "user_profile.change_password.password_confirmation.placeholder",
    },
  ];
};

export default ChangePasswordFormFieldSchema;
