"use client";
import { useSetting } from "@/lib/utils/user-setting";
import { FC } from "react";
import FormBuilder from "../form-wrapper/form-builder";
import DashboardFormSchema from "./dashboard-form-schema";
import { settings } from "./setting-zod-schema";
import { z } from "zod";

const DashboardSetting: FC = () => {
  const setting = useSetting("settings");
  return (
    <>
      <div>
        <div className="font-bold bg-primary p-3 mb-4 text-primary-foreground rounded-md">
          Dashboard settings
        </div>
      </div>
      <FormBuilder
        formSchema={DashboardFormSchema()}
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

export default DashboardSetting;
