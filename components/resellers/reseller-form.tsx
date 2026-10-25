"use client";

import { FC } from "react";
import { FieldValues } from "react-hook-form";
import { useRouter } from "next/navigation";
import AccordionFormBuilder from "@/components/form-wrapper/accordion-form-builder";
import ResellerFormFieldSchema from "@/components/resellers/reseller-form-schema";
import { getResellerFormSchema } from "@/components/resellers/reseller-type";
import ResellerImageFields from "./reseller-image-fields";

type Props = {
    mode?: "create" | "edit";
    api?: string;
    method?: "GET" | "POST" | "PUT";
    data?: Record<string, unknown>;
};

const RESELLER_IMAGE_KEYS = ["avatar", "nid_front", "nid_back"] as const;

function omitResellerImages(values: FieldValues): FieldValues {
    const payload = { ...values };
    for (const key of RESELLER_IMAGE_KEYS) {
        delete payload[key];
    }
    delete payload.nid;
    return payload;
}

const ResellerForm: FC<Props> = ({
    mode = "create",
    api = "/resellers",
    method = "POST",
    data,
}) => {
    const router = useRouter();
    const resellerId = mode === "edit" && typeof data?.id === "string" ? data.id : undefined;

    return (
        <div className="w-full">
            <div className="mr-3">
                <AccordionFormBuilder
                    formSchema={ResellerFormFieldSchema({ mode, resellerId })}
                    grids={2}
                    data={data}
                    api={api}
                    mode={mode}
                    schema={getResellerFormSchema(mode)}
                    method={method}
                    queryKey="resellers"
                    fullPage
                    actionButtonClass="justify-center"
                    transformPayload={omitResellerImages}
                    sectionSlots={{
                        reseller_images: <ResellerImageFields />,
                    }}
                    onClose={() => router.push("/resellers")}
                />
            </div>
        </div>
    );
};

export default ResellerForm;
