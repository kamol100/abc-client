"use client";

import { useFetch } from "@/app/actions";
import { parseApiError } from "@/lib/helper/helper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface UseApiMutationOptions<TData = unknown, TVariables = void> {
  url: string;
  method?: "POST" | "PUT" | "DELETE";
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
  defaultErrorMessage = "request_failed",
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
      const result = await useFetch({
        url: apiUrl,
        method,
        ...(variables !== undefined && { data: variables }),
      });
      if (!result?.success) throw result;
      return result as TData;
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
      const errorMsg = parseApiError(error);
      toast.error(t(String(errorMsg || defaultErrorMessage)));
      onError?.(error);
    },
  });
}
