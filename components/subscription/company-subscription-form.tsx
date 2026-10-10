import { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import { MyDialog } from "@/components/my-dialog";
import {
  CompanySubscriptionFormSchema,
  CompanySubscriptionRow,
  SUBSCRIPTION_STATUSES,
} from "@/components/subscription/company-subscription-type";

const fields = (mode: "create" | "edit"): FieldConfig[] => [
  {
    type: "dropdown",
    name: "company_id",
    valueKey: "company",
    label: { labelText: "subscription.company.company", mandatory: true },
    placeholder: "subscription.company.company",
    api: "/dropdown-companies",
    valueMapping: { idKey: "id", labelKey: "name" },
    disabled: mode === "edit",
  },
  {
    type: "dropdown",
    name: "plan_id",
    valueKey: "plan",
    label: { labelText: "subscription.plan.name", mandatory: true },
    placeholder: "subscription.plan.name",
    api: "/dropdown-subscription-plans",
    valueMapping: { idKey: "id", labelKey: "name" },
  },
  {
    type: "dropdown",
    name: "status",
    label: { labelText: "subscription.status", mandatory: true },
    placeholder: "subscription.status",
    defaultValue: "active",
    options: SUBSCRIPTION_STATUSES.map((status) => ({
      label: `subscription.status_value.${status}`,
      value: status,
    })),
  },
  {
    type: "number",
    name: "trial_days",
    label: { labelText: "subscription.company.trial_days" },
    placeholder: "subscription.company.trial_days",
  },
  {
    type: "number",
    name: "grace_days",
    label: { labelText: "subscription.company.grace_days" },
    placeholder: "subscription.company.grace_days",
  },
  {
    type: "date",
    name: "starts_at",
    label: { labelText: "subscription.starts_at" },
    placeholder: "subscription.starts_at",
  },
  {
    type: "date",
    name: "ends_at",
    label: { labelText: "subscription.ends_at" },
    placeholder: "subscription.ends_at",
  },
];

type CompanySubscriptionFormProps = {
  mode?: "create" | "edit";
  api?: string;
  method?: "POST" | "PUT";
  data?: CompanySubscriptionRow;
};

export default function CompanySubscriptionForm({
  mode = "create",
  api = "/company-subscriptions",
  method = "POST",
  data,
}: CompanySubscriptionFormProps) {
  return (
    <MyDialog
      size="xl"
      title={mode === "create" ? "subscription.company.assign" : "subscription.company.edit"}
      trigger={<FormTrigger mode={mode} />}
    >
      <FormBuilder
        formSchema={fields(mode)}
        grids={2}
        data={data}
        api={api}
        mode={mode}
        schema={CompanySubscriptionFormSchema}
        method={method}
        queryKey="company-subscriptions"
        hydrateOnEdit="never"
      />
    </MyDialog>
  );
}
