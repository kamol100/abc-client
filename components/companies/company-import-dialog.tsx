"use client";

import { MyDialog } from "@/components/my-dialog";
import MyButton from "@/components/my-button";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import type { CompanyExportFileRow } from "@/components/companies/company-type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { useState, useMemo, type FC } from "react";

const CompanyImportDialog: FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string>("");

  const { data: res, isLoading, isFetching, refetch } = useApiQuery<
    ApiResponse<CompanyExportFileRow[]>
  >({
    queryKey: ["companies", "export-files"],
    url: "companies/export-files",
    pagination: false,
    enabled: open,
  });

  const files = useMemo(() => {
    const payload = res?.data;
    return Array.isArray(payload) ? payload : [];
  }, [res]);

  const { mutateAsync: runImport, isPending: isImporting } = useApiMutation<
    unknown,
    { path: string }
  >({
    url: "companies/import",
    method: "POST",
    invalidateKeys: "companies",
    successMessage: "company.import_success",
  });

  const handleConfirm = async () => {
    if (!selectedPath) {
      return;
    }
    await runImport({ path: selectedPath });
    setSelectedPath("");
  };

  return (
    <MyDialog
      size="md"
      title="company.import_title"
      description="company.import_description"
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void refetch();
        if (!next) setSelectedPath("");
      }}
      trigger={
        <MyButton
          variant="outline"
          size="default"
          icon={false}
          className="gap-1.5"
          title={t("company.import")}
        >
          <Upload className="h-4 w-4 shrink-0" aria-hidden />
          {t("company.import")}
        </MyButton>
      }
      showFooter
      onConfirm={handleConfirm}
      confirmText="company.import_confirm"
      cancelText="common.cancel"
      loading={isImporting}
    >
      <div className="space-y-3">
        {isLoading || isFetching ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("company.import_empty")}</p>
        ) : (
          <Select value={selectedPath} onValueChange={setSelectedPath}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("company.import_select_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {files.map((f) => (
                <SelectItem key={f.path} value={f.path}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </MyDialog>
  );
};

export default CompanyImportDialog;
