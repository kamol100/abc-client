"use client";
import { useFetch } from "@/app/actions";
import { Form } from "@/components/ui/form";
import { useParseError } from "@/lib/helper/helper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ReactNode, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Button } from "../ui/button";

type props = {
  children?: ReactNode;
  data?: any;
  schema?: any;
  mode?: string;
  method?: string;
  isOpen?: boolean;
  setOpen?: (boolean: boolean) => void;
  api?: string;
  isFormData?: boolean;
  queryKey?: string;
  onClose?: () => void;
};

export default function FormWrapper({
  children,
  data,
  schema,
  mode = "create",
  method = "POST",
  api = undefined,
  isFormData = false,
  queryKey = "data",
  onClose = () => {},
}: props) {
  const form = useForm<any>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: data,
  });
  const {
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = form;
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const inputRef = useRef<HTMLInputElement>(null);
  let api_route = `${api}`;

  if (mode === "edit") {
    api_route = `${api}/${data?.id}`;
  }

  const fetchData = async () => {
    const get_data = await useFetch({
      url: api_route,
    });
    if (!get_data?.success) {
      toast.error(useParseError(get_data));
      return [];
    }

    const data = get_data;
    return data;
  };

  const { data: getData, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchData,
    enabled: method === "GET",
    retry: 2,
  });

  const { mutate: submitForm, isPending } = useMutation({
    mutationFn: async (formData: any) => {
      const data = await useFetch({
        url: api_route,
        data: formData,
        method: mode === "edit" ? "PUT" : method,
      });
      if (!data.success) {
        throw data;
      }
      return data?.data;
    },
    onSuccess: (data: any) => {
      reset();
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      if (data?.message) {
        toast.success(t(`${data?.message}`));
      }
      if (onClose) onClose();
    },
    onError: (error: any) => {
      toast.error(t(`${useParseError(error)}`));
    },
  });

  const onSubmit = async (data: any) => {
    console.log(data, isFormData);
    if (isFormData) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as any);
      });
      submitForm(formData as any);
    } else {
      console.log("test");
      submitForm(data);
    }
  };

  const onError = async (data: any) => {
    console.log(data);
  };
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        {isLoading && <Loader2 className="animate-spin" />}
        {children}

        <input type="submit" className="hidden" ref={inputRef} />

        <div className="flex justify-between mt-5">
          <Button onClick={() => onClose()} type="button">
            {t("cancel")}
          </Button>
          <Button type="submit">
            {isPending && <Loader2 className="animate-spin" />}
            {t("save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
