"use client";

import { FC, useMemo, useState } from "react";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import FormBuilder from "@/components/form-wrapper/form-builder";
import CompanyProfileFormFieldSchema from "@/components/company-profile/company-profile-form-schema";
import {
  CompanyProfileFormInput,
  CompanyProfileFormSchema,
  CompanyProfileRow,
} from "@/components/company-profile/company-profile-type";

type CompanyProfileFormProps = {
  companyId: string;
  isReseller: boolean;
  company: CompanyProfileRow;
};

const CompanyProfileForm: FC<CompanyProfileFormProps> = ({
  companyId,
  isReseller,
  company,
}) => {
  const [open, setOpen] = useState(false);
  const formSchema = useMemo(() => CompanyProfileFormFieldSchema(), []);

  const endpoint = isReseller
    ? `reseller-company-profile/${companyId}`
    : `company-profile/${company.id ?? companyId}`;
  const dialogTitle = isReseller
    ? "reseller_profile.edit_title"
    : "company_profile.edit_title";
  const successMessage = isReseller
    ? "reseller_profile.messages.update_success"
    : "company_profile.messages.update_success";

  const defaultValues = useMemo<CompanyProfileFormInput>(
    () => ({
      name: company.name ?? "",
      phone: company.phone ?? "",
      email: company.email ?? "",
      address: company.address ?? "",
    }),
    [company]
  );

  return (
    <MyDialog
      open={open}
      onOpenChange={setOpen}
      size="lg"
      title={dialogTitle}
      trigger={
        <MyButton action="edit" title="company_profile.actions.edit" />
      }
    >
      <FormBuilder
        formSchema={formSchema}
        grids={2}
        data={defaultValues as Record<string, unknown>}
        api={endpoint}
        mode="create"
        schema={CompanyProfileFormSchema}
        method="PUT"
        queryKey="company-profile"
        successMessage={successMessage}
      />
    </MyDialog>
  );
};

export default CompanyProfileForm;
