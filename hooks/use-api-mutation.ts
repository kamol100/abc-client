"use client";

import { useFetch } from "@/app/actions";
import { apiErrorText } from "@/lib/helper/helper";
import { sanitizeServerActionPayload } from "@/lib/helper/server-action-payload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface UseApiMutationOptions<TData = unknown, TVariables = void> {
  url: string;
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  invalidateKeys?: string;
  successMessage?: string;
  defaultErrorMessage?: string;
  redirectTo?: string;
  onSuccess?: (data: TData) => void;
  onError?: (error: unknown) => void;
}

export default function useApiMutation<
  TData = unknown,
  TVariables = void,
>({
  url,
  method = "POST",
  invalidateKeys,
  successMessage,
  defaultErrorMessage = "common.request_failed",
  redirectTo,
  onSuccess,
  onError,
}: UseApiMutationOptions<TData, TVariables>) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<TData, unknown, TVariables>({
    mutationFn: async (variables?: TVariables) => {
      const apiUrl = url.startsWith("/") ? url : `/${url}`;
      const payload = variables instanceof FormData
        ? variables
        : sanitizeServerActionPayload(variables);
      const result = await useFetch({
        url: apiUrl,
        method,
        ...(payload !== undefined && { data: payload }),
      });
      if (!result?.success) throw result;
      return result?.data as TData;
    },
    onSuccess: (data) => {
      if (invalidateKeys) {
        invalidateKeys.split(",").forEach((key) =>
          queryClient.invalidateQueries({ queryKey: [key.trim()] })
        );
      }
      if (redirectTo) router.push(redirectTo);
      if (successMessage) toast.success(t(successMessage));
      onSuccess?.(data);
    },
    onError: (error) => {
      // A translated message_key when the API sends one, a friendly text for 429, else the API message.
      toast.error(apiErrorText(error, t, defaultErrorMessage));
      onError?.(error);
    },
  });
}
