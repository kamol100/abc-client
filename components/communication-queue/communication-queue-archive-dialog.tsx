"use client";

import { useState } from "react";
import { Archive } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import CommunicationQueueArchiveTable from "./communication-queue-archive-table";

/** Toolbar button that opens the deleted-SMS archive in a large modal. */
export function CommunicationQueueArchiveDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <MyButton
        size="icon"
        variant="outline"
        className="shrink-0"
        tooltip={t("communication_queue.archive.open")}
        aria-label={t("communication_queue.archive.open")}
        onClick={() => setOpen(true)}
      >
        <Archive className="h-4 w-4" />
      </MyButton>
      <MyDialog open={open} onOpenChange={setOpen} size="fullscreen" title="communication_queue.archive.title">
        {/* Only mounted while open, so the archive list loads on demand. */}
        {open && <CommunicationQueueArchiveTable />}
      </MyDialog>
    </>
  );
}
