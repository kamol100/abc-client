"use client";

import { FC } from "react";
import PermissionForm from "./permission-form";

const PermissionTable: FC = () => {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PermissionForm />
    </div>
  );
};

export default PermissionTable;

