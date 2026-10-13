"use client";

import { useState } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Link2, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/context/app-provider";
import OnuBindDialog from "./onu-bind-dialog";
import OnuRebootDialog from "./onu-reboot-dialog";
import { onuLabel, type OnuRow } from "./onu-type";

type MenuOnu = Pick<
    OnuRow,
    "id" | "name" | "label" | "serial" | "mac" | "description" | "status" | "client" | "client_bound" | "client_binding"
> &
    Partial<Pick<OnuRow, "status_known">>;

/**
 * "…" menu of an ONU: bind client (onus.edit) and reboot (onus.reboot, online ONUs only). The dialogs are
 * controlled siblings of the menu (client-row-actions pattern); "—" without either permission.
 */
export function OnuActionsMenu({ onu, rebootBlocked = false }: { onu: MenuOnu; rebootBlocked?: boolean }) {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const [bindOpen, setBindOpen] = useState(false);
    const [rebootOpen, setRebootOpen] = useState(false);
    const canBind = hasPermission("onus.edit");
    const canReboot = hasPermission("onus.reboot");
    // An "online" from an old poll (OLT down / not polled) is not good enough to send a reboot.
    const statusUnknown = onu.status_known === false;
    const online = onu.status === "online" && !statusUnknown;
    // The OLT's Device IP changed: the API refuses reboots until a Test connection passes.
    const rebootNote = rebootBlocked
        ? t("onu.reboot.retest_short")
        : statusUnknown
            ? t("onu.reboot.unknown_short")
            : !online
                ? t("onu.reboot.offline_short")
                : null;

    if (!canBind && !canReboot) {
        return <span className="text-muted-foreground">—</span>;
    }

    return (
        <>
            {/* Same trigger as DataTableRowActions. */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <MyButton
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                        aria-label={t("onu.actions.menu", { name: onuLabel(onu) })}
                    >
                        <DotsHorizontalIcon className="h-4 w-4" />
                    </MyButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {canBind && (
                        <DropdownMenuItem className="cursor-pointer" onSelect={() => setBindOpen(true)}>
                            <Link2 className="mr-2 h-4 w-4" />
                            {t("onu.bind.button")}
                        </DropdownMenuItem>
                    )}
                    {canBind && canReboot && <DropdownMenuSeparator />}
                    {canReboot && (
                        <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            disabled={!online || rebootBlocked}
                            onSelect={() => setRebootOpen(true)}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            {t("onu.reboot.button")}
                            {rebootNote && <span className="ml-2 text-xs text-muted-foreground">{rebootNote}</span>}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {canBind && <OnuBindDialog onu={onu} open={bindOpen} onOpenChange={setBindOpen} />}
            {canReboot && <OnuRebootDialog onu={onu} open={rebootOpen} onOpenChange={setRebootOpen} />}
        </>
    );
}

export default function OnuActionsCell({ row, rebootBlocked }: { row: Row<OnuRow>; rebootBlocked?: boolean }) {
    return <OnuActionsMenu onu={row.original} rebootBlocked={rebootBlocked} />;
}
