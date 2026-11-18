"use client";

import { useTranslation } from "react-i18next";
import { SupportRetry } from "@/components/platform-support/support-thread";

export default function HelpError({ reset }: { reset: () => void }) {
  const { t } = useTranslation();
  return <main className="mx-auto min-h-40 max-w-6xl p-4" aria-label={t("help.title")}>
    <SupportRetry messageKey="help.error" onRetry={reset} />
  </main>;
}
