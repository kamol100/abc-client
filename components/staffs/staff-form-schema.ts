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
  return [
    {
      name: "common.basic_information",
      form: [
        {
          type: "text",
          name: "name",
          label: { labelText: "staff.name.label", mandatory: true },
          placeholder: "staff.name.placeholder",
        },
        {
          type: "text",
          name: "username",
          label: { labelText: "staff.username.label" },
          placeholder: "staff.username.placeholder",
          permission: mode === "create",
        },
        {
          type: "password",
          name: "password",
          label: { labelText: "staff.password.label" },
          placeholder: "staff.password.placeholder",
          permission: mode === "create",
        },
        {
          type: "dropdown",
          name: "roles_id",
          label: { labelText: "staff.roles.label" },
          placeholder: "staff.roles.placeholder",
          api: "/dropdown-roles",
          isMulti: true,
        },
        {
          type: "text",
          name: "designation",
          label: { labelText: "staff.designation.label" },
          placeholder: "staff.designation.placeholder",
        },
        {
          type: "text",
          name: "phone",
          label: { labelText: "staff.phone.label", mandatory: true },
          placeholder: "staff.phone.placeholder",
        },
        {
          type: "email",
          name: "email",
          label: { labelText: "staff.email.label" },
          placeholder: "staff.email.placeholder",
        },
        {
          type: "date",
          name: "date_of_birth",
          label: { labelText: "staff.date_of_birth.label" },
          placeholder: "staff.date_of_birth.placeholder",
        },
        {
          type: "date",
          name: "join_date",
          label: { labelText: "staff.join_date.label" },
          placeholder: "staff.join_date.placeholder",
        },
        {
          type: "dropdown",
          name: "salary_day",
          label: { labelText: "staff.salary_day.label" },
          placeholder: "staff.salary_day.placeholder",
          options: salaryDayOptions,
        },
        {
          type: "radio",
          name: "salary_generation_type",
          label: { labelText: "staff.salary_generation_type.label" },
          direction: "row",
          defaultValue: "auto",
          options: [
            { label: "common.auto", value: "auto" },
            { label: "common.manual", value: "manual" },
            { label: "common.no_salary", value: "no_bill" },
          ],
        },
        {
          type: "text",
          name: "father_name",
          label: { labelText: "staff.father_name.label" },
          placeholder: "staff.father_name.placeholder",
        },
        {
          type: "text",
          name: "mother_name",
          label: { labelText: "staff.mother_name.label" },
          placeholder: "staff.mother_name.placeholder",
        },
        {
          type: "text",
          name: "nid",
          label: { labelText: "staff.nid.label" },
          placeholder: "staff.nid.placeholder",
        },
        {
          type: "radio",
          name: "marital_status",
          label: { labelText: "staff.marital_status.label" },
          direction: "row",
          defaultValue: "unmarred",
          options: [
            { label: "common.married", value: "marred" },
            { label: "common.unmarried", value: "unmarred" },
          ],
        },
        {
          type: "radio",
          name: "gender",
          label: { labelText: "staff.gender.label", mandatory: true },
          direction: "row",
          defaultValue: "male",
          options: [
            { label: "common.male", value: "male" },
            { label: "common.female", value: "female" },
          ],
        },
        {
          type: "dropdown",
          name: "status",
          label: { labelText: "common.status" },
          placeholder: "staff.status.placeholder",
          options: [
            { value: "active", label: "common.active" },
            { value: "inactive", label: "common.inactive" },
          ],
        },
        {
          type: "textarea",
          name: "present_address",
          label: { labelText: "staff.present_address.label" },
          placeholder: "staff.present_address.placeholder",
          rows: 2,
        },
        {
          type: "textarea",
          name: "permanent_address",
          label: { labelText: "staff.permanent_address.label" },
          placeholder: "staff.permanent_address.placeholder",
          rows: 2,
        },
        {
          type: "textarea",
          name: "job_experience",
          label: { labelText: "staff.job_experience.label" },
          placeholder: "staff.job_experience.placeholder",
          rows: 2,
        },
        {
          type: "textarea",
          name: "social_media_address",
          label: { labelText: "staff.social_media_address.label" },
          placeholder: "staff.social_media_address.placeholder",
          rows: 2,
        },
      ],
    },
    {
      name: "common.salary_information",
      form: [
        {
          type: "fieldArray",
          name: "salary_items",
          label: { labelText: "common.salary_and_allowance" },
          minItems: 1,
          grids: 2,
          addButtonLabel: "common.add_item",
          defaultItem: { items_label: "", items_value: 0 },
          itemFields: [
            {
              type: "text",
              name: "items_label",
              label: { labelText: "common.label" },
              placeholder: "common.label",
            },
            {
              type: "number",
              name: "items_value",
              label: { labelText: "common.value" },
              placeholder: "0",
            },
          ],
        },
        {
          type: "fieldArray",
          name: "salary_deductions",
          label: { labelText: "common.salary_deductions" },
          minItems: 0,
          grids: 2,
          addButtonLabel: "common.add_deduction",
          defaultItem: { deductions_label: "", deductions_value: 0 },
          itemFields: [
            {
              type: "text",
              name: "deductions_label",
              label: { labelText: "common.label" },
              placeholder: "common.label",
            },
            {
              type: "number",
              name: "deductions_value",
              label: { labelText: "common.value" },
              placeholder: "0",
            },
          ],
        },
      ],
    },
  ];
};

export default StaffFormSchema;
