"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ChevronRight, Home } from "lucide-react";
import DemoRequestForm from "@/components/marketing/demo-request/demo-request-form";
import { cn } from "@/lib/utils";

export default function DemoRequestPage() {
  const { t } = useTranslation();

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_70%)]" />
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-10 sm:px-6 sm:py-14">
          <nav
            className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
            aria-label={t("demo_request.breadcrumb.aria")}
          >
            <Link
              href="/home"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <Home className="size-3.5" aria-hidden />
              {t("demo_request.breadcrumb.home")}
            </Link>
            <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden />
            <span className="font-medium text-foreground">
              {t("demo_request.breadcrumb.current")}
            </span>
          </nav>
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("demo_request.hero.title")}
            </h1>
            <p className="text-muted-foreground sm:max-w-xl">
              {t("demo_request.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <section className={cn("mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12")}>
        <DemoRequestForm />
      </section>
    </>
  );
}
