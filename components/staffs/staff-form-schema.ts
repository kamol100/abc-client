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
      name: t("common.basic_information"),
      form: [
        {
          type: "text",
          name: "name",
          label: { labelText: t("staff.name.label"), mandatory: true },
          placeholder: t("staff.name.placeholder"),
        },
        {
          type: "text",
          name: "username",
          label: { labelText: t("staff.username.label") },
          placeholder: t("staff.username.placeholder"),
          permission: mode === "create",
        },
        {
          type: "password",
          name: "password",
          label: { labelText: t("staff.password.label") },
          placeholder: t("staff.password.placeholder"),
          permission: mode === "create",
        },
        {
          type: "dropdown",
          name: "roles_id",
          label: { labelText: t("staff.roles.label") },
          placeholder: t("staff.roles.placeholder"),
          api: "/dropdown-roles",
          isMulti: true,
        },
        {
          type: "text",
          name: "designation",
          label: { labelText: t("staff.designation.label") },
          placeholder: t("staff.designation.placeholder"),
        },
        {
          type: "text",
          name: "phone",
          label: { labelText: t("staff.phone.label"), mandatory: true },
          placeholder: t("staff.phone.placeholder"),
        },
        {
          type: "email",
          name: "email",
          label: { labelText: t("staff.email.label") },
          placeholder: t("staff.email.placeholder"),
        },
        {
          type: "date",
          name: "date_of_birth",
          label: { labelText: t("staff.date_of_birth.label") },
          placeholder: t("staff.date_of_birth.placeholder"),
        },
        {
          type: "date",
          name: "join_date",
          label: { labelText: t("staff.join_date.label") },
          placeholder: t("staff.join_date.placeholder"),
        },
        {
          type: "dropdown",
          name: "salary_day",
          label: { labelText: t("staff.salary_day.label") },
          placeholder: t("staff.salary_day.placeholder"),
          options: salaryDayOptions,
        },
        {
          type: "radio",
          name: "salary_generation_type",
          label: { labelText: t("staff.salary_generation_type.label") },
          direction: "row",
          defaultValue: "auto",
          options: [
            { label: t("common.auto"), value: "auto" },
            { label: t("common.manual"), value: "manual" },
            { label: t("common.no_salary"), value: "no_bill" },
          ],
        },
        {
          type: "text",
          name: "father_name",
          label: { labelText: t("staff.father_name.label") },
          placeholder: t("staff.father_name.placeholder"),
        },
        {
          type: "text",
          name: "mother_name",
          label: { labelText: t("staff.mother_name.label") },
          placeholder: t("staff.mother_name.placeholder"),
        },
        {
          type: "text",
          name: "nid",
          label: { labelText: t("staff.nid.label") },
          placeholder: t("staff.nid.placeholder"),
        },
        {
          type: "radio",
          name: "marital_status",
          label: { labelText: t("staff.marital_status.label") },
          direction: "row",
          defaultValue: "unmarred",
          options: [
            { label: t("common.married"), value: "marred" },
            { label: t("common.unmarried"), value: "unmarred" },
          ],
        },
        {
          type: "radio",
          name: "gender",
          label: { labelText: t("staff.gender.label"), mandatory: true },
          direction: "row",
          defaultValue: "male",
          options: [
            { label: t("common.male"), value: "male" },
            { label: t("common.female"), value: "female" },
          ],
        },
        {
          type: "dropdown",
          name: "status",
          label: { labelText: t("common.status") },
          placeholder: t("staff.status.placeholder"),
          options: [
            { value: "active", label: t("common.active") },
            { value: "inactive", label: t("common.inactive") },
          ],
        },
        {
          type: "textarea",
          name: "present_address",
          label: { labelText: t("staff.present_address.label") },
          placeholder: t("staff.present_address.placeholder"),
          rows: 2,
        },
        {
          type: "textarea",
          name: "permanent_address",
          label: { labelText: t("staff.permanent_address.label") },
          placeholder: t("staff.permanent_address.placeholder"),
          rows: 2,
        },
        {
          type: "textarea",
          name: "job_experience",
          label: { labelText: t("staff.job_experience.label") },
          placeholder: t("staff.job_experience.placeholder"),
          rows: 2,
        },
        {
          type: "textarea",
          name: "social_media_address",
          label: { labelText: t("staff.social_media_address.label") },
          placeholder: t("staff.social_media_address.placeholder"),
          rows: 2,
        },
      ],
    },
    {
      name: t("common.salary_information"),
      form: [
        {
          type: "fieldArray",
          name: "salary_items",
          label: { labelText: t("common.salary_and_allowance") },
          minItems: 1,
          grids: 2,
          addButtonLabel: t("common.add_item"),
          defaultItem: { items_label: "", items_value: 0 },
          itemFields: [
            {
              type: "text",
              name: "items_label",
              label: { labelText: t("common.label") },
              placeholder: t("common.label"),
            },
            {
              type: "number",
              name: "items_value",
              label: { labelText: t("common.value") },
              placeholder: "0",
            },
          ],
        },
        {
          type: "fieldArray",
          name: "salary_deductions",
          label: { labelText: t("common.salary_deductions") },
          minItems: 0,
          grids: 2,
          addButtonLabel: t("common.add_deduction"),
          defaultItem: { deductions_label: "", deductions_value: 0 },
          itemFields: [
            {
              type: "text",
              name: "deductions_label",
              label: { labelText: t("common.label") },
              placeholder: t("common.label"),
            },
            {
              type: "number",
              name: "deductions_value",
              label: { labelText: t("common.value") },
              placeholder: "0",
            },
          ],
        },
      ],
    },
  ];
};

export default StaffFormSchema;
