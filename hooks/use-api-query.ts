"use client";

import { useFetch } from "@/app/actions";
import { objectToQueryString, parseApiError, subscriptionDenialCode } from "@/lib/helper/helper";
import {
  keepPreviousData,
  QueryKey,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useState } from "react";

export interface ApiResponse<TData = unknown> {
  success: boolean;
  data: TData;
  message?: string;
}

export interface PaginatedData<TItem> {
  data: TItem[];
  pagination: Pagination;
}

export type PaginatedApiResponse<TItem> = ApiResponse<PaginatedData<TItem>>;

interface UseApiQueryOptions<TData>
  extends Omit<UseQueryOptions<TData, Error>, "queryKey" | "queryFn"> {
  queryKey: QueryKey;
  url: string;
  params?: Record<string, unknown>;
  pagination?: boolean;
  version?: string;
}

export default function useApiQuery<TData = unknown>({
  queryKey,
  url,
  params,
  pagination = true,
  version,
  retry: callerRetry,
  ...queryOptions
}: UseApiQueryOptions<TData>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [prevParamsKey, setPrevParamsKey] = useState(() =>
    JSON.stringify(params)
  );

  const paramsKey = JSON.stringify(params);
  if (prevParamsKey !== paramsKey) {
    setPrevParamsKey(paramsKey);
    setCurrentPage(1);
  }

  const buildUrl = (): string => {
    const allParams: Record<string, unknown> = {
      ...(pagination && { page: currentPage }),
      ...params,
    };
    const qs = objectToQueryString(allParams);
    return qs ? `/${url}?${qs}` : `/${url}`;
  };

  const queryClient = useQueryClient();
  const fullQueryKey: QueryKey = [
    ...queryKey,
    ...(pagination ? [{ page: currentPage }] : []),
    ...(params ? [params] : []),
  ];
  const query = useQuery<TData, Error>({
    queryKey: fullQueryKey,
    queryFn: async (): Promise<TData> => {
      const response = await useFetch({
        url: buildUrl(),
        ...(version && { version }),
      });
      if (!response?.success) {
        if (subscriptionDenialCode(response)) {
          void queryClient.invalidateQueries({ queryKey: ["settings"] });
        }
        throw new Error(parseApiError(response) || "Request failed");
      }
      return response as TData;
    },
    placeholderData: pagination ? keepPreviousData : undefined,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        (error.message === "subscription.feature_not_in_plan" || error.message === "subscription.expired_action")
      ) {
        return false;
      }
      if (typeof callerRetry === "function") return callerRetry(failureCount, error) === true;
      if (typeof callerRetry === "number") return failureCount < callerRetry;
      if (callerRetry === false) return false;
      return failureCount < 2;
    },
    ...queryOptions,
  });

  return {
    ...query,
    currentPage,
    setCurrentPage,
  };
}
