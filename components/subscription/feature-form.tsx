import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import { MyDialog } from "@/components/my-dialog";
import FeatureFormFieldSchema from "@/components/subscription/feature-form-schema";
import { FeatureCreateSchema, FeatureFormSchema, FeatureRow } from "@/components/subscription/feature-type";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "POST" | "PUT";
  data?: Partial<FeatureRow> & { id: string };
};

export default function FeatureForm({
  mode = "create",
  api = "/features",
  method = "POST",
  data,
}: Props) {
  return (
    <MyDialog
      size="xl"
      title={mode === "create" ? "subscription.feature.create" : "subscription.feature.edit"}
      trigger={<FormTrigger mode={mode} />}
    >
      <FormBuilder
        formSchema={FeatureFormFieldSchema(mode)}
        grids={1}
        data={data}
        api={api}
        mode={mode}
        schema={mode === "create" ? FeatureCreateSchema : FeatureFormSchema}
        method={method}
        queryKey="features"
      />
    </MyDialog>
  );
}
