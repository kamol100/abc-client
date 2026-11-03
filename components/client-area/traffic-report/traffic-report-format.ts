import { format } from "date-fns";
import { bn, enUS } from "date-fns/locale";
import { formatDataUsage } from "@/lib/helper/helper";

function usageDateToLocal(usageDate: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(usageDate);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatUsageDate(usageDate: string, language: string): string {
  const date = usageDateToLocal(usageDate);
  if (!date) return usageDate;
  const locale = language.startsWith("bn") ? bn : enUS;
  return format(date, "d MMM, yyyy", { locale });
}

export function formatUsageRecordedAt(usageDate: string, language: string): string {
  const date = usageDateToLocal(usageDate);
  if (!date) return usageDate;
  const locale = language.startsWith("bn") ? bn : enUS;
  return format(date, "d MMM, yyyy h:mm aaa", { locale });
}

export function formatTrafficAmount(bytes: number, available: boolean): string | null {
  if (!available) return null;
  return formatDataUsage(bytes);
}

export function usageRangeLength(from: string, to: string): number {
  const start = usageDateToLocal(from);
  const end = usageDateToLocal(to);
  if (!start || !end) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}
