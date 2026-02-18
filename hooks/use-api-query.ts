"use client";

import { useFetch } from "@/app/actions";
import { objectToQueryString, parseApiError } from "@/lib/helper/helper";
import {
  keepPreviousData,
  QueryKey,
  useQuery,
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
        throw new Error(parseApiError(response) || "Request failed");
      }
      return response as TData;
    },
    placeholderData: pagination ? keepPreviousData : undefined,
    refetchOnWindowFocus: false,
    retry: 2,
    ...queryOptions,
  });

  return {
    ...query,
    currentPage,
    setCurrentPage,
  };
}
