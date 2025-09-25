"use client";
import { useFetch } from "@/app/actions";
import { Form } from "@/components/ui/form";
import { useParseError } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ReactNode, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ActionButton from "../action-button";

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
  actionButton?: boolean;
  saveOnChange?: boolean;
  setSaveOnChange?: (x: boolean) => void;
  actionButtonClass?: string;
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
  actionButton = true,
  saveOnChange: save = false,
  setSaveOnChange = () => {},
  actionButtonClass = "justify-between",
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

  const submitRef = useRef<HTMLInputElement>(null);
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
    console.log(data, "submit");

    if (isFormData) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value as any);
      });
      submitForm(formData as any);
    } else {
      submitForm(data);
    }
  };

  const onError = async (data: any) => {
    console.log(data);
  };
  useEffect(() => {
    if (save) {
      submitRef.current?.click();
      setSaveOnChange(false);
    }
  }, [save]);
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        {isLoading && <Loader2 className="animate-spin" />}
        {children}

        <input type="submit" className="hidden" ref={submitRef} />
        {actionButton && (
          <div
            className={cn("flex justify-center gap-4 mt-5", actionButtonClass)}
          >
            <ActionButton
              type="cancel"
              title={t("cancel")}
              size="default"
              onClick={() => onClose()}
            />
            <ActionButton
              type="save"
              title={t("save")}
              size="default"
              buttonType="submit"
              variant={"default"}
              loading={isPending}
            />
          </div>
        )}
      </form>
    </Form>
  );
}
