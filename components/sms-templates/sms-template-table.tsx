"use client";

import { Import } from "lucide-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import MyButton from "@/components/my-button";
import SmsTemplateForm from "@/components/sms-templates/sms-template-form";
import { useSmsTemplateColumns } from "@/components/sms-templates/sms-template-column";
import { SmsTemplateRow } from "@/components/sms-templates/sms-template-type";
import { usePermissions } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";

const SmsTemplateTable: FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const columns = useSmsTemplateColumns();
  const canCreate = hasPermission("sms-templates.create");

  const { mutate: importTemplates, isPending: isImporting } = useApiMutation<
    { message: string },
    { message: "import" }
  >({
    url: "sms-templates",
    invalidateKeys: "sms-templates",
    successMessage: "sms_template.import_success",
  });

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<SmsTemplateRow>>({
      queryKey: ["sms-templates"],
      url: "sms-templates",
    });

  const smsTemplates = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  const toolbarTitle = pagination?.total
    ? `${t("sms_template.title_plural")} (${pagination.total})`
    : t("sms_template.title_plural");

  return (
    <DataTable
      data={smsTemplates}
      columns={columns}
      toggleColumns={true}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      queryKey="sms-templates"
      form={canCreate ? SmsTemplateForm : undefined}
      toolbarTitle={toolbarTitle}
      toolbarBeforeViewOptions={
        canCreate ? (
          <MyButton
            type="button"
            size="default"
            variant="outline"
            icon={false}
            loading={isImporting}
            disabled={isImporting}
            onClick={() => importTemplates({ message: "import" })}
          >
            <Import aria-hidden />
            {t("sms_template.import")}
          </MyButton>
        ) : undefined
      }
    />
  );
};

export default SmsTemplateTable;
