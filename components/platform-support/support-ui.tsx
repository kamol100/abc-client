"use client";

import { type ReactNode } from "react";
import { ArrowLeft, Eye, FileText, Flag, Headset, Inbox, MessageCircle, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import MyButton from "@/components/my-button";
import { cn } from "@/lib/utils";

export const supportPageClass = "mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-5 pb-16 sm:gap-6 [&>*]:shrink-0";

export function SupportViewLink({ href }: { href: string }) {
    const { t } = useTranslation();
    return (
        <MyButton asChild variant="outline" size="icon" className="size-8" tooltip="common.view">
            <Link href={href} aria-label={t("common.view")}>
                <Eye aria-hidden className="size-4" />
            </Link>
        </MyButton>
    );
}

export function SupportHeading({ title, subtitle, reference, action, back, icon: Icon }: {
    title: string; subtitle?: string; reference?: string | null; action?: ReactNode;
    back?: { href: string; label: string }; icon?: LucideIcon;
}) {
    return (
        <header className="space-y-3">
            {back && <MyButton url={back.href} variant="ghost" className="-ms-2 text-muted-foreground">
                <ArrowLeft aria-hidden className="size-4" />{back.label}
            </MyButton>}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    {Icon && <SupportIcon icon={Icon} />}
                    <div className="min-w-0">
                        {reference && <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground">{reference}</p>}
                        <h1 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
                        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
                    </div>
                </div>
                {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
            </div>
        </header>
    );
}

export function SupportIcon({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
    return <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary", className)}><Icon className="size-[18px]" aria-hidden /></span>;
}

export function SupportTabs<T extends string>({ label, value, items, onChange }: {
    label: string; value: T; items: readonly { value: T; label: string; icon?: LucideIcon }[]; onChange: (value: T) => void;
}) {
    return (
        <div role="tablist" aria-label={label} className="flex min-w-0 gap-2 overflow-x-auto border-b border-border"
            onKeyDown={(event) => {
                const index = items.findIndex((item) => item.value === value);
                const next = event.key === "ArrowRight" ? (index + 1) % items.length
                    : event.key === "ArrowLeft" ? (index + items.length - 1) % items.length
                    : event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : -1;
                if (next < 0) return;
                event.preventDefault();
                const tab = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next];
                tab?.focus();
                tab?.click();
            }}>
            {items.map(({ value: key, label: title, icon: Icon }) => (
                <MyButton key={key} type="button" unstyled role="tab" aria-selected={value === key}
                    tabIndex={value === key ? 0 : -1} onClick={() => onChange(key)}
                    className={cn("h-10 shrink-0 rounded-none border-b-2 border-transparent px-2.5 text-muted-foreground hover:text-foreground sm:px-3",
                        value === key && "border-primary font-semibold text-foreground")}>
                    {Icon && <Icon aria-hidden className="size-4" />}{title}
                </MyButton>
            ))}
        </div>
    );
}

export function SupportKindTabs({ kind, onChange }: { kind: "issue" | "chat"; onChange: (kind: "issue" | "chat") => void }) {
    const { t } = useTranslation();
    return <SupportTabs label={t("platform_support.kinds.label")} value={kind} onChange={onChange} items={[
        { value: "issue", label: t("platform_support.issues"), icon: FileText },
        { value: "chat", label: t("platform_support.chats"), icon: MessageCircle },
    ]} />;
}

export function SupportBadge({ type, value }: { type: "status" | "priority"; value: string | null }) {
    const { t } = useTranslation();
    if (!value) return null;
    const highlighted = type === "status" && ["open", "in_progress"].includes(value);
    const warning = value === "high" || value === "urgent" || value === "waiting_for_requester";
    return <span className={cn("inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        warning ? "border-warning bg-warning text-warning-foreground" : highlighted
            ? "border-primary/20 bg-primary/10 text-primary" : "border-border bg-muted text-foreground")}>
        {type === "priority" ? <Flag className="size-3 shrink-0" aria-hidden /> : <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />}
        {t(`platform_support.${type === "status" ? "statuses" : "priorities"}.${value}`, { defaultValue: value })}
    </span>;
}

interface SupportCounts {
    open_issues?: number; open_chats?: number; unread_threads?: number; unread_messages?: number; unassigned_threads?: number;
}

export function SupportSummary({ counts, loading, platform }: { counts: SupportCounts | null | undefined; loading?: boolean; platform?: boolean }) {
    const { t, i18n } = useTranslation();
    const metrics = [
        { key: "open_issues", value: counts?.open_issues, icon: FileText },
        { key: "open_chats", value: counts?.open_chats, icon: MessageCircle },
        { key: "unread_threads", value: counts?.unread_threads, icon: Inbox },
        platform ? { key: "unassigned_threads", value: counts?.unassigned_threads, icon: Headset }
            : { key: "unread_messages", value: counts?.unread_messages, icon: Headset },
    ].filter((metric) => loading || typeof metric.value === "number" && Number.isFinite(metric.value) && metric.value >= 0);
    if (!metrics.length) return null;
    const format = new Intl.NumberFormat(i18n.resolvedLanguage === "bn" ? "bn-BD" : "en");
    return <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 sm:gap-3" aria-busy={loading}>
        {metrics.map(({ key, value, icon: Icon }) => <Card key={key} className="flex min-w-0 flex-col gap-2 p-3 shadow-none sm:p-4">
            <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">{t(`platform_support.redesign.metrics.${key}`)}</span>
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </div>
            {value === undefined ? <div className="my-1 h-6 w-12 animate-pulse rounded bg-muted" aria-hidden />
                : <span className="text-2xl font-semibold tabular-nums tracking-tight">{format.format(value)}</span>}
        </Card>)}
    </div>;
}

export function SupportDetailPanel({ children, className, testId }: { children: ReactNode; className?: string; testId?: string }) {
    const { t } = useTranslation();
    return <Card className={cn("min-w-0 space-y-4 p-4 shadow-none sm:p-5", className)} data-testid={testId}>
        <h2 className="border-b border-border pb-3 text-sm font-semibold">{t("platform_support.redesign.details")}</h2>
        {children}
    </Card>;
}

export function SupportDetail({ label, children }: { label: string; children: ReactNode }) {
    return <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="break-words text-sm">{children}</div>
    </div>;
}
