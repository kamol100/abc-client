"use client";
import { useFetch } from "@/app/actions";
import { useParseError } from "@/lib/helper/helper";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";

type UseListDataProps = {
  api: string;
  isPagination?: boolean;
  filterValue?: string | null;
  queryKey?: string;
  retry?: number;
  currentPage?: number;
  refetchOnWindowFocus?: boolean;
};

export default function useListData({
  api,
  isPagination = true,
  filterValue = null,
  queryKey = "data",
  retry = 2,
  refetchOnWindowFocus = false,
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
  console.log(buildApiEndpoint());
  const fetchData = async () => {
    const get_data = await useFetch(buildApiEndpoint());
    if (!get_data?.success) {
      toast.error(useParseError(get_data));
      return [];
    }

    const data = get_data;
    return data;
  };

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [queryKey, isPagination ? { currentPage } : {}],
    queryFn: fetchData,
    enabled: true,
    placeholderData: isPagination ? keepPreviousData : undefined,
    refetchOnWindowFocus: refetchOnWindowFocus,
    retry,
  });
  return {
    data,
    isLoading,
    isFetching,
    refetch,
    currentPage,
    setCurrentPage,
  };
}
