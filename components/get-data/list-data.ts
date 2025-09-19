"use client";
import { useFetch } from "@/app/actions";
import { useParseError } from "@/lib/helper/helper";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type UseListDataProps = {
  api: string;
  isPagination?: boolean;
  filterValue?: string | null;
  queryKey?: string;
  retry?: number;
  currentPage?: number;
  refetchOnWindowFocus?: boolean;
  isEnabled?: boolean
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
};

export default function useListData({
  api,
  isPagination = true,
  filterValue = null,
  queryKey = "data",
  retry = 2,
  refetchOnWindowFocus = false,
  isEnabled = true,
  onSuccess,
  onError,
}: UseListDataProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const buildApiEndpoint = () => {
    let endpoint = `/${api}`;
    if (isPagination) {
      endpoint += `?page=${currentPage}`;
    }
    if (filterValue) {
      endpoint += `&${filterValue}`;
    }
    return {
      url: endpoint,
    };
  };
  //console.log(buildApiEndpoint());
  const fetchData = async () => {
    try {
      const get_data = await useFetch(buildApiEndpoint());
      if (!get_data?.success) {
        const errorMessage = useParseError(get_data);
        toast.error(errorMessage);
        onError?.(get_data);
        return [];
      }

      onSuccess?.(get_data);
      const data = get_data;
      return data;
    } catch (error) {
      toast.error(useParseError(error));
      onError?.(error);
      return [];
    }
  };

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [queryKey, isPagination ? { currentPage } : {}],
    queryFn: fetchData,
    enabled: isEnabled,
    placeholderData: isPagination ? keepPreviousData : undefined,
    refetchOnWindowFocus: refetchOnWindowFocus,
    retry,
  });

  useEffect(() => {
    if (!filterValue?.includes("#")) {
      setCurrentPage(1);
      refetch();
    }
  }, [filterValue]);

  return {
    data,
    isLoading,
    isFetching,
    refetch,
    currentPage,
    setCurrentPage,
  };
}
