import { useFetch } from "@/app/actions";
import { useProfile } from "@/context/app-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Props = {
  queryKey?: string;
};

const ChangePagination: FC<Props> = ({ queryKey = "users" }) => {
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const [pageSize, setPageSize] = useState<string>(
    String(profile?.staff?.item_per_page ?? 10)
  );

  const { mutate: updatePagination } = useMutation<unknown>({
    mutationFn: async (formData) => {
      const { data } = await useFetch({
        url: `/staffs/item-per-page/${profile?.staff?.id}`,
        data: formData,
        method: "PUT",
      });
      return data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: () => { },
  });

  const updateItemPerPage = (page: string) => {
    setPageSize(page);
    updatePagination({ item_per_page: page } as never);
  };

  return (
    <Select
      value={pageSize}
      onValueChange={updateItemPerPage}
      aria-label="Results per page"
    >
      <SelectTrigger id="results-per-page" className="w-fit whitespace-nowrap">
        <SelectValue placeholder="Select number of results" />
      </SelectTrigger>
      <SelectContent>
        {[5, 10, 25, 50].map((pageSize) => (
          <SelectItem key={pageSize} value={pageSize.toString()}>
            {pageSize} / page
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ChangePagination;
