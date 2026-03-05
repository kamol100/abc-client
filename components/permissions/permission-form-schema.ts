"use client";

import { FieldConfig } from "@/components/form-wrapper/form-builder-type";

const PermissionFormFieldSchema = (): FieldConfig[] => {
  return [
    {
      type: "dropdown",
      name: "role_id",
      label: {
        labelText: "permission.role.label",
        mandatory: true,
      },
      placeholder: "permission.role.placeholder",
      isClearable: false,
      isSearchable: true,
    },
  ];
};

export default PermissionFormFieldSchema;

