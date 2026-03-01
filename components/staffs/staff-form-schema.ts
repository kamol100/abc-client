import { useTranslation } from "react-i18next";
import { AccordionSection } from "../form-wrapper/form-builder-type";

type Props = {
  mode?: "create" | "edit";
};

const salaryDayOptions = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  const label = day < 10 ? `0${day}` : String(day);
  return { value: label, label };
});

export const StaffFormSchema = ({ mode = "create" }: Props): AccordionSection[] => {
  const { t } = useTranslation();

  return [
    {
      name: t("basic_information"),
      form: [
        {
          type: "text",
          name: "name",
          label: { labelText: t("name"), mandatory: true },
          placeholder: t("name"),
        },
        {
          type: "text",
          name: "username",
          label: { labelText: t("username") },
          placeholder: t("username"),
          permission: mode === "create",
        },
        {
          type: "password",
          name: "password",
          label: { labelText: t("password") },
          placeholder: t("password"),
          permission: mode === "create",
        },
        {
          type: "dropdown",
          name: "roles_id",
          label: { labelText: t("role_permission") },
          placeholder: t("role_permission"),
          api: "/dropdown-roles",
          isMulti: true,
        },
        {
          type: "text",
          name: "designation",
          label: { labelText: t("designation") },
          placeholder: t("designation"),
        },
        {
          type: "text",
          name: "phone",
          label: { labelText: t("phone_number"), mandatory: true },
          placeholder: t("phone_number"),
        },
        {
          type: "email",
          name: "email",
          label: { labelText: t("email") },
          placeholder: t("email"),
        },
        {
          type: "date",
          name: "date_of_birth",
          label: { labelText: t("date_of_birth") },
          placeholder: t("date_of_birth"),
        },
        {
          type: "date",
          name: "join_date",
          label: { labelText: t("join_date") },
          placeholder: t("join_date"),
        },
        {
          type: "dropdown",
          name: "salary_day",
          label: { labelText: t("salary_day") },
          placeholder: t("salary_day"),
          options: salaryDayOptions,
        },
        {
          type: "radio",
          name: "salary_generation_type",
          label: { labelText: t("salary_generation_type") },
          direction: "row",
          defaultValue: "auto",
          options: [
            { label: t("auto"), value: "auto" },
            { label: t("manual"), value: "manual" },
            { label: t("no_salary"), value: "no_bill" },
          ],
        },
        {
          type: "text",
          name: "father_name",
          label: { labelText: t("father_name") },
          placeholder: t("father_name"),
        },
        {
          type: "text",
          name: "mother_name",
          label: { labelText: t("mother_name") },
          placeholder: t("mother_name"),
        },
        {
          type: "text",
          name: "nid",
          label: { labelText: t("nid") },
          placeholder: t("nid"),
        },
        {
          type: "radio",
          name: "marital_status",
          label: { labelText: t("marital_status") },
          direction: "row",
          defaultValue: "unmarred",
          options: [
            { label: t("married"), value: "marred" },
            { label: t("unmarried"), value: "unmarred" },
          ],
        },
        {
          type: "radio",
          name: "gender",
          label: { labelText: t("gender"), mandatory: true },
          direction: "row",
          defaultValue: "male",
          options: [
            { label: t("male"), value: "male" },
            { label: t("female"), value: "female" },
          ],
        },
        {
          type: "dropdown",
          name: "status",
          label: { labelText: t("status") },
          placeholder: t("status"),
          options: [
            { value: "active", label: t("active") },
            { value: "inactive", label: t("inactive") },
          ],
        },
        {
          type: "textarea",
          name: "present_address",
          label: { labelText: t("present_address") },
          placeholder: t("present_address"),
          rows: 2,
        },
        {
          type: "textarea",
          name: "permanent_address",
          label: { labelText: t("permanent_address") },
          placeholder: t("permanent_address"),
          rows: 2,
        },
        {
          type: "textarea",
          name: "job_experience",
          label: { labelText: t("job_experience") },
          placeholder: t("job_experience"),
          rows: 2,
        },
        {
          type: "textarea",
          name: "social_media_address",
          label: { labelText: t("social_media_address") },
          placeholder: t("social_media_address"),
          rows: 2,
        },
      ],
    },
    {
      name: t("salary_information"),
      form: [
        {
          type: "fieldArray",
          name: "salary_items",
          label: { labelText: t("salary_and_allowance") },
          minItems: 1,
          grids: 2,
          addButtonLabel: t("add_item"),
          defaultItem: { items_label: "", items_value: 0 },
          itemFields: [
            {
              type: "text",
              name: "items_label",
              label: { labelText: t("label") },
              placeholder: t("label"),
            },
            {
              type: "number",
              name: "items_value",
              label: { labelText: t("value") },
              placeholder: "0",
            },
          ],
        },
        {
          type: "fieldArray",
          name: "salary_deductions",
          label: { labelText: t("salary_deductions") },
          minItems: 0,
          grids: 2,
          addButtonLabel: t("add_deduction"),
          defaultItem: { deductions_label: "", deductions_value: 0 },
          itemFields: [
            {
              type: "text",
              name: "deductions_label",
              label: { labelText: t("label") },
              placeholder: t("label"),
            },
            {
              type: "number",
              name: "deductions_value",
              label: { labelText: t("value") },
              placeholder: "0",
            },
          ],
        },
      ],
    },
  ];
};

export default StaffFormSchema;
