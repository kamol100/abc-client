import { FC, useMemo } from "react";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import FormTrigger from "@/components/form-trigger";
import PackageFormFieldSchema, {
  PackageFormType,
} from "@/components/packages/package-form-schema";
import {
  PackageFormSchema,
  PackageRow,
} from "@/components/packages/package-type";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Partial<PackageRow> & { id?: number };
  packageType?: PackageFormType;
};

const PackageForm: FC<Props> = ({
  mode = "create",
  api = "/packages",
  method = "POST",
  data = undefined,
  packageType = "client",
}) => {
  const mergedData = useMemo(() => {
    if (mode === "create") {
      return {
        is_reseller_package: packageType === "reseller" ? 1 : 0,
        price: 0,
        buying_price: 0,
        ...data,
      };
    }
    return data;
  }, [data, mode, packageType]);

  const titleKey =
    mode === "create"
      ? packageType === "reseller"
        ? "package.create_title_reseller"
        : "package.create_title_client"
      : "package.edit_title";

  return (
    <MyDialog
      size="xl"
      title={titleKey}
      trigger={<FormTrigger mode={mode} />}
    >
      <FormBuilder
        formSchema={PackageFormFieldSchema({ packageType })}
        grids={2}
        data={mergedData}
        api={api}
        mode={mode}
        schema={PackageFormSchema}
        method={method}
        queryKey="packages"
      />
    </MyDialog>
  );
};

export default PackageForm;
