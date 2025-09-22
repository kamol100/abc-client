import { useFetch } from "@/app/actions";
import { useSetting } from "@/lib/utils/user-setting";
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
  const profile = useSetting("profile") as any;
  const [pageSize, setPageSize] = useState(
    profile?.staff?.item_per_page ?? "10"
  );

  const { mutate: updatePagination } = useMutation<any>({
    mutationFn: async (formData) => {
      const { data } = await useFetch({
        url: `/staffs/item-per-page/${profile?.staff?.id}`,
        data: formData,
        method: "PUT",
      });
      return data;
    },
    onSuccess: async (data: any) => {
      console.log(queryKey);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: () => {},
  });

  const updateItemPerPage = (page: number | string) => {
    setPageSize(page);
    const data = {
      item_per_page: page,
    };
    updatePagination(data as any);
  };

  return (
    <Select
      value={pageSize as string}
      onValueChange={(value) => {
        updateItemPerPage(value);
      }}
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
