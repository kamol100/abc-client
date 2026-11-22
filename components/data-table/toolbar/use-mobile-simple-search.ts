"use client";

import { useMemo, useState } from "react";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import {
  MobileSearchSettingSchema,
  type MobileSearchSetting,
} from "@/components/profiles/staff-account-type";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";

/**
 * Mobile "simple search": the staff member can replace the filter sheet with a
 * single `any` text field, optionally pinned open. Only tables that opt in
 * (`simpleSearch`) fetch the staff account setting.
 */
export function useMobileSimpleSearch({
  enabled,
  filter,
}: {
  enabled: boolean;
  filter: FieldConfig[] | undefined;
}) {
  const [open, setOpen] = useState(false);
  const fields = useMemo(() => anySearchFields(filter), [filter]);

  const { data: staffAccount, isSuccess } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["staff-account"],
    url: "staff-account",
    pagination: false,
    enabled,
  });

  const setting = enabled && isSuccess ? readMobileSearch(staffAccount?.data) : null;
  const active = setting?.mode === "simple" && fields.length > 0;
  const pinned = active && setting?.always_open === true;

  return {
    fields,
    active,
    pinned,
    visible: pinned || (active && open),
    toggle: () => {
      if (!pinned) setOpen((value) => !value);
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readMobileSearch(account: unknown): MobileSearchSetting | null {
  if (!isRecord(account) || !isRecord(account.settings)) return null;
  const parsed = MobileSearchSettingSchema.safeParse(account.settings.mobile_search);
  return parsed.success ? parsed.data : null;
}

function anySearchFields(fields: FieldConfig[] | undefined): FieldConfig[] {
  return (fields ?? []).filter(
    (field) => field.type === "text" && field.name === "any" && field.watchForFilter === true,
  );
}
