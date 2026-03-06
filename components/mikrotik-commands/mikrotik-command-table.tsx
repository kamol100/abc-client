"use client";

import { DataTable } from "@/components/data-table/data-table";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Card from "../card";
import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import MikrotikCommandForm from "./mikrotik-command-form";
import { MikrotikCommandColumns } from "./mikrotik-command-column";
import type { MikrotikCommandRow } from "./mikrotik-command-type";

const NO_VALUE = "—";

function safeJsonStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function stringifyResultValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return NO_VALUE;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return safeJsonStringify(value);
}

function normalizeResultRows(
  result: unknown,
  rowLabel: (index: number) => string,
  singleValueLabel: string
): MikrotikCommandRow[] {
  if (result === null || result === undefined || result === "") return [];

  if (Array.isArray(result)) {
    return result.map((item, index) => ({
      id: index + 1,
      key: rowLabel(index + 1),
      value: stringifyResultValue(item),
    }));
  }

  if (typeof result === "object") {
    return Object.entries(result as Record<string, unknown>).map(([key, value], index) => ({
      id: index + 1,
      key,
      value: stringifyResultValue(value),
    }));
  }

  return [
    {
      id: 1,
      key: singleValueLabel,
      value: stringifyResultValue(result),
    },
  ];
}

const MikrotikCommandTable: FC = () => {
  const { t } = useTranslation();
  const [rawResult, setRawResult] = useState<unknown>(null);
  const [hasRun, setHasRun] = useState(false);

  const rows = useMemo(
    () =>
      normalizeResultRows(
        rawResult,
        (index) => t("mikrotik_command.result.row_key", { index }),
        t("mikrotik_command.result.single_value")
      ),
    [rawResult, t]
  );

  const rawResultText = useMemo(() => {
    if (rawResult === null || rawResult === undefined || rawResult === "") return "";
    return safeJsonStringify(rawResult);
  }, [rawResult]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("mikrotik_command.form_title")}</CardTitle>
          <CardDescription>{t("mikrotik_command.form_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <MikrotikCommandForm
            onSuccess={(result) => {
              setRawResult(result);
              setHasRun(true);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("mikrotik_command.result.title")}</CardTitle>
          <CardDescription>{t("mikrotik_command.result.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasRun ? (
            <p className="text-sm text-muted-foreground">
              {t("mikrotik_command.result.initial_hint")}
            </p>
          ) : rows.length > 0 ? (
            <>
              <DataTable data={rows} columns={MikrotikCommandColumns} toolbar={false} />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {t("mikrotik_command.result.raw_title")}
                </p>
                <pre className="rounded-md border bg-muted/30 p-3 text-xs whitespace-pre-wrap break-words font-mono">
                  {rawResultText}
                </pre>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("mikrotik_command.result.empty")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MikrotikCommandTable;
