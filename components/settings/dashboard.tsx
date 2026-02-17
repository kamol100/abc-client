"use client";
import { useSettings } from "@/context/app-provider";
import { FC } from "react";
import FormBuilder from "../form-wrapper/form-builder";
import DashboardFormSchema from "./dashboard-form-schema";
import { settings } from "./setting-zod-schema";

const DashboardSetting: FC = () => {
  const { settings: setting } = useSettings();
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
