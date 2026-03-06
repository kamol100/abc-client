"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import AccordionFormBuilder from "@/components/form-wrapper/accordion-form-builder";
import ResellerFormFieldSchema from "@/components/resellers/reseller-form-schema";
import { getResellerFormSchema } from "@/components/resellers/reseller-type";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Record<string, unknown>;
};

const ResellerForm: FC<Props> = ({
    mode = "create",
    api = "/resellers",
    method = "POST",
    data,
}) => {
    const router = useRouter();

    return (
        <div className="w-full md:w-3/4 mx-auto flex flex-col flex-1 min-h-0">
            <AccordionFormBuilder
                formSchema={ResellerFormFieldSchema({ mode })}
                grids={2}
                data={data}
                api={api}
                mode={mode}
                schema={getResellerFormSchema(mode)}
                method={method}
                queryKey="resellers"
                fullPage
                actionButtonClass="justify-center"
                onClose={() => router.push("/resellers")}
            />
        </div>
    );
};

export default ResellerForm;
