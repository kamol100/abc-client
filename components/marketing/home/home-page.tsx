"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  Users,
  CreditCard,
  Wifi,
  MessageSquare,
  LifeBuoy,
  BarChart3,
  MapPin,
  Router,
  UserCog,
  Wallet,
  LayoutDashboard,
  ClipboardList,
  Check,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompany } from "@/context/company-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  { icon: Users, key: "clients" },
  { icon: CreditCard, key: "billing" },
  { icon: Wifi, key: "network" },
  { icon: MapPin, key: "client_map" },
  { icon: Router, key: "device_map" },
  { icon: UserCog, key: "staff" },
  { icon: Wallet, key: "finance" },
  { icon: MessageSquare, key: "communication" },
  { icon: LifeBuoy, key: "support" },
  { icon: BarChart3, key: "reporting" },
  { icon: LayoutDashboard, key: "dashboard" },
  { icon: ClipboardList, key: "activity_log" },
] as const;

const PLANS = ["starter", "business", "enterprise"] as const;
const PLAN_HIGHLIGHTS: Record<string, number> = { business: 1 };

function HeroSection() {
  const { t } = useTranslation();
  const { company, logoUrl } = useCompany();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_70%)]" />
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-36">
        <img
          src={logoUrl}
          alt={company.name ?? ""}
          className="h-12 w-auto object-contain"
        />

        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("marketing.hero.headline")}
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            {t("marketing.hero.subheadline")}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/demo-request">
              {t("marketing.hero.cta_primary")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#features">{t("marketing.hero.cta_secondary")}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section id="features" className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("marketing.features.title")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("marketing.features.subtitle")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, key }) => (
            <Card key={key} className="border bg-background">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="text-base">
                  {t(`marketing.features.${key}.title`)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t(`marketing.features.${key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/features">
              {t("features_page.view_all")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const { t } = useTranslation();

  return (
    <section id="pricing" className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("marketing.pricing.title")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("marketing.pricing.subtitle")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const highlighted = PLAN_HIGHLIGHTS[plan] !== undefined;
            const bulletCount = Number(t(`marketing.pricing.${plan}.bullet_count`)) || 0;
            const bullets = Array.from({ length: bulletCount }, (_, i) =>
              t(`marketing.pricing.${plan}.bullets.${i}`)
            );

            return (
              <Card
                key={plan}
                className={cn(
                  "flex flex-col",
                  highlighted && "border-primary shadow-md"
                )}
              >
                <CardHeader>
                  {highlighted && (
                    <span className="mb-1 w-fit rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                      {t("marketing.pricing.popular")}
                    </span>
                  )}
                  <CardTitle className="text-lg">
                    {t(`marketing.pricing.${plan}.name`)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t(`marketing.pricing.${plan}.description`)}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <div className="text-3xl font-bold">
                    {t(`marketing.pricing.${plan}.price`)}
                  </div>
                  <ul className="flex-1 space-y-2">
                    {bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    variant={highlighted ? "default" : "outline"}
                    className="mt-auto w-full"
                  >
                    <Link href="/demo-request">{t("marketing.pricing.cta")}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/pricing">
              {t("marketing.pricing.view_full")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const { t } = useTranslation();

  return (
    <section id="about" className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("marketing.about.title")}
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {t("marketing.about.body")}
          </p>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  const { t } = useTranslation();

  return (
    <section id="cta" className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 rounded-2xl bg-primary/5 px-6 py-12 text-center sm:px-12">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("marketing.cta.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("marketing.cta.subtitle")}
          </p>
          <Button asChild size="lg">
            <Link href="/demo-request">
              {t("marketing.cta.button")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <AboutSection />
      <CtaSection />
    </>
  );
}
