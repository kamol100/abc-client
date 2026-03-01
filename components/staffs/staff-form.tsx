"use client";

import { useRouter } from "next/navigation";
import { FC } from "react";
import AccordionFormBuilder from "../form-wrapper/accordion-form-builder";
import { StaffFormSchema as StaffSchema } from "./staff-type";
import StaffFormSchema from "./staff-form-schema";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Record<string, unknown>;
};

const StaffForm: FC<Props> = ({
  mode = "create",
  api = "/staffs",
  method = "POST",
  data,
}) => {
  const router = useRouter();

  return (
    <div className="w-full md:w-3/4 mx-auto flex flex-col flex-1 min-h-0">
      <AccordionFormBuilder
        formSchema={StaffFormSchema({ mode })}
        grids={2}
        data={data}
        api={api}
        mode={mode}
        schema={StaffSchema}
        method={method}
        queryKey="staffs"
        fullPage
        actionButtonClass="justify-center"
        onClose={() => router.push("/staffs")}
      />
    </div>
  );
};

export default StaffForm;
