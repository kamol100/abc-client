"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import { togglePin } from "@/components/permissions/permission-groups";

const STAFF_ACCOUNT_KEY = ["staff-account"];

type PinPayload = { pinned_permission_groups: string[] };

/**
 * The signed-in user's pinned permission groups, kept in their user meta through
 * the staff account settings. A pin shows at once and rolls back if the save fails.
 * Without a staff profile there is nowhere to save, so `canPin` is false.
 */
export function usePinnedPermissionGroups() {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<string[] | null>(null);

  const { data, isSuccess } = useApiQuery<ApiResponse<unknown>>({
    queryKey: STAFF_ACCOUNT_KEY,
    url: "staff-account",
    pagination: false,
    retry: false,
  });

  const saved = useMemo(() => readPins(data?.data), [data]);
  const pins = pending ?? saved;

  const save = useApiMutation<unknown, PinPayload>({
    url: "/staff-account/settings",
    method: "PUT",
    defaultErrorMessage: "permission.pin.failed",
    onSuccess: (account) => {
      queryClient.setQueryData<ApiResponse<unknown>>(STAFF_ACCOUNT_KEY, (previous) =>
        previous ? { ...previous, data: account } : { success: true, data: account },
      );
      setPending(null);
    },
    onError: () => setPending(null),
  });

  const toggle = useCallback(
    (group: string) => {
      const next = togglePin(pins, group);
      setPending(next);
      save.mutate({ pinned_permission_groups: next });
    },
    [pins, save],
  );

  return { pins, toggle, canPin: isSuccess, isSaving: save.isPending };
}

function readPins(account: unknown): string[] {
  if (!account || typeof account !== "object") return [];
  const settings = (account as { settings?: unknown }).settings;
  if (!settings || typeof settings !== "object") return [];
  const pins = (settings as { pinned_permission_groups?: unknown }).pinned_permission_groups;
  return Array.isArray(pins) ? pins.filter((pin): pin is string => typeof pin === "string") : [];
}
