"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { Row } from "@tanstack/react-table";
import { Edit, ShieldCheck, Trash2, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { DialogWrapper } from "@/components/dialog-wrapper";
import ActionButton from "@/components/action-button";
import useApiMutation from "@/hooks/use-api-mutation";
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { ResellerRow } from "@/components/resellers/reseller-type";

type Props = {
    row: Row<ResellerRow>;
};

const ResellerRowActions: FC<Props> = ({ row }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const reseller = row.original;
    const [deleteOpen, setDeleteOpen] = useState(false);

    const { mutateAsync: deleteReseller, isPending: isDeleting } = useApiMutation({
        url: `/resellers/${reseller.id}`,
        method: "DELETE",
        invalidateKeys: "resellers",
        successMessage: "common.item_deleted_successfully",
        defaultErrorMessage: "common.delete_failed",
    });

    const handleDelete = async (close: () => void) => {
        await deleteReseller();
        close();
    };

    return (
        <>
            <DataTableRowActions row={row}>
                {hasPermission("resellers.edit") && (
                    <DropdownMenuItem asChild>
                        <Link href={`/resellers/edit/${reseller.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t("reseller.actions.edit")}
                        </Link>
                    </DropdownMenuItem>
                )}

                {hasPermission("permissions.access") && hasPermission("resellers.edit") && (
                    <DropdownMenuItem asChild>
                        <Link href={`/permissions/${reseller.id}?type=reseller`}>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            {t("reseller.actions.permissions")}
                        </Link>
                    </DropdownMenuItem>
                )}

                {hasPermission("resellers.delete") && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={() => setDeleteOpen(true)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("common.delete")}
                        </DropdownMenuItem>
                    </>
                )}
            </DataTableRowActions>

            <DialogWrapper
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                size="sm"
                loading={isDeleting}
                footer={({ close, loading }) => (
                    <>
                        <ActionButton
                            action="cancel"
                            variant="outline"
                            size="default"
                            onClick={close}
                            disabled={loading}
                            title={t("common.cancel")}
                        />
                        <ActionButton
                            action="delete"
                            variant="default"
                            size="default"
                            onClick={() => handleDelete(close)}
                            disabled={loading}
                            loading={loading}
                            title={t("common.delete")}
                        />
                    </>
                )}
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <TriangleAlert className="h-8 w-8 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <DialogTitle className="text-center">
                            {t("common.confirm_delete")}
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            {t("reseller.delete_confirmation")}
                        </DialogDescription>
                    </div>
                </div>
            </DialogWrapper>
        </>
    );
};

export default ResellerRowActions;
