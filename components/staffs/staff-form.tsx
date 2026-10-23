"use client";

import { FieldValues } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FC } from "react";
import AccordionFormBuilder from "@/components/form-wrapper/accordion-form-builder";
import StaffImageFields from "@/components/staffs/staff-image-fields";
import StaffFormSchema from "@/components/staffs/staff-form-schema";
import { StaffFormSchema as StaffSchema } from "@/components/staffs/staff-type";

type Props = {
  mode?: "create" | "edit";
  api?: string;
  method?: "GET" | "POST" | "PUT";
  data?: Record<string, unknown>;
};

const STAFF_IMAGE_KEYS = ["photo", "nid_front", "nid_back"] as const;

function omitStaffImages(values: FieldValues): FieldValues {
  const payload = { ...values };
  for (const key of STAFF_IMAGE_KEYS) {
    delete payload[key];
  }
  return payload;
}

const StaffForm: FC<Props> = ({
  mode = "create",
  api = "/staffs",
  method = "POST",
  data,
}) => {
  const router = useRouter();

  return (
    <div className="w-full md:w-3/4 mx-auto flex flex-col flex-1 min-h-0">
      <div className="mr-3">
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
          transformPayload={omitStaffImages}
          sectionSlots={{
            staff_images: <StaffImageFields />,
          }}
          onClose={() => router.push("/staffs")}
        />
      </div>
    </div>
  );
};

export default StaffForm;
