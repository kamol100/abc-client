"use client";

import { FC, useState } from "react";
import ActionButton from "@/components/action-button";
import { DeleteModal } from "@/components/delete-modal";
import { usePermissions } from "@/context/app-provider";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ActivityLogChangesDialog } from "./activity-log-changes-dialog";
import type { ActivityLogRow } from "./activity-log-type";

type Props = {
    row: ActivityLogRow;
};

export const ActivityLogActionsCell: FC<Props> = ({ row }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [viewOpen, setViewOpen] = useState(false);
    const canDelete = hasPermission("activity-logs.delete");
    const changes = row.changes ?? {};

    return (
        <div className="flex items-center justify-end gap-2 mr-3">
            <ActionButton
                size="sm"
                variant="outline"
                icon={true}
                title={t("activity_log.view")}
                onClick={() => setViewOpen(true)}
                className="[&_svg]:size-4"
            >
                <Eye className="size-4" />
            </ActionButton>
            {viewOpen && (
                <ActivityLogChangesDialog
                    changes={changes}
                    open={viewOpen}
                    onOpenChange={setViewOpen}
                    updated_at={row.updated_at}
                />
            )}
            {canDelete && (
                <DeleteModal
                    api_url={`/activity-logs/${row.id}`}
                    keys="activities"
                    confirmMessage="activity_log.delete_confirmation"
                    buttonText="common.confirm_delete"
                />
            )}
        </div>
    );
};
