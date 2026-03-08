"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { usePermissions } from "@/context/app-provider";
import SmsTemplateForm from "@/components/sms-templates/sms-template-form";
import { useSmsTemplateColumns } from "@/components/sms-templates/sms-template-column";
import { SmsTemplateRow } from "@/components/sms-templates/sms-template-type";

const SmsTemplateTable: FC = () => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const columns = useSmsTemplateColumns();

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
      form={hasPermission("sms-templates.create") ? SmsTemplateForm : undefined}
      toolbarTitle={toolbarTitle}
    />
  );
};

export default SmsTemplateTable;
