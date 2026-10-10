import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import { MyDialog } from "@/components/my-dialog";
import SubscriptionPlanFormFieldSchema from "@/components/subscription/subscription-plan-form-schema";
import { SubscriptionPlanFormSchema, SubscriptionPlanRow } from "@/components/subscription/subscription-plan-type";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "POST" | "PUT";
  data?: Partial<SubscriptionPlanRow> & { id: string };
};

export default function SubscriptionPlanForm({
  mode = "create",
  api = "/subscription-plans",
  method = "POST",
  data,
}: Props) {
  return (
    <MyDialog
      size="xl"
      title={mode === "create" ? "subscription.plan.create" : "subscription.plan.edit"}
      trigger={<FormTrigger mode={mode} />}
    >
      <FormBuilder
        formSchema={SubscriptionPlanFormFieldSchema()}
        grids={1}
        data={data}
        api={api}
        mode={mode}
        schema={SubscriptionPlanFormSchema}
        method={method}
        queryKey="subscription-plans"
      />
    </MyDialog>
  );
}
