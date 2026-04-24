"use client";

import { FC, useState } from "react";
import { usePermissions } from "@/context/app-provider";
import { DeleteModal } from "@/components/delete-modal";
import DemoRequestStatusForm from "@/components/demo-requests/demo-request-status-form";
import { DemoRequestViewDialog } from "@/components/demo-requests/demo-request-view-dialog";
import type { DemoRequestRow } from "@/components/demo-requests/demo-request-type";
import MyButton from "@/components/my-button";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
    row: DemoRequestRow;
};

const DemoRequestActionsCell: FC<Props> = ({ row }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [viewOpen, setViewOpen] = useState(false);
    const canEdit = hasPermission("demo-requests.edit");
    const canView = hasPermission("demo-requests.show");
    const canDelete = hasPermission("demo-requests.delete");

    return (
        <div className="flex items-end justify-end gap-2 mr-3">
            {canEdit && <DemoRequestStatusForm row={row} />}
            {canView && (
                <>
                    <MyButton
                        size="sm"
                        variant="outline"
                        icon={true}
                        title={t("admin_demo_request.view")}
                        onClick={() => setViewOpen(true)}
                        className="[&_svg]:size-4"
                    >
                        <Eye className="size-4" />
                    </MyButton>
                    <DemoRequestViewDialog
                        demoRequestId={row.id}
                        open={viewOpen}
                        onOpenChange={setViewOpen}
                    />
                </>
            )}
            {canDelete && (
                <DeleteModal
                    api_url={`/demo-requests/${row.id}`}
                    keys="demo-requests"
                    confirmMessage="admin_demo_request.delete_confirmation"
                    buttonText="common.confirm_delete"
                />
            )}
        </div>
    );
};

export default DemoRequestActionsCell;
