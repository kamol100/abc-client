"use client";
import { useSetting } from "@/lib/utils/user-setting";
import { FC } from "react";
import FormBuilder from "../form-wrapper/form-builder";
import { settings } from "./setting-zod-schema";
import TableFormSchema from "./table-form-schema";

const TableSetting: FC = () => {
  const setting = useSetting("settings");
  return (
    <>
      <div>
        <div className="font-bold bg-primary p-3 mb-4 text-white rounded-md">
          Table settings
        </div>
      </div>
      <FormBuilder
        formSchema={TableFormSchema()}
        grids={2}
        data={setting}
        api={"/company/settings"}
        mode={"create"}
        schema={settings}
        method={"POST"}
        queryKey="settings"
        actionButton={false}
      />
    </>
  );
};

export default TableSetting;
