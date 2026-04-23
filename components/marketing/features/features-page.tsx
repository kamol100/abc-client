"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type FeatureSection = {
  key: string;
  image: string;
  bulletCount: number;
};

const SECTIONS: FeatureSection[] = [
  { key: "client_mgmt", image: "/static/features/feature-client-mgmt.png", bulletCount: 8 },
  { key: "billing", image: "/static/features/feature-billing.png", bulletCount: 8 },
  { key: "mikrotik", image: "/static/features/feature-mikrotik.png", bulletCount: 8 },
  { key: "network", image: "/static/features/feature-network.png", bulletCount: 6 },
  { key: "maps", image: "/static/features/feature-maps.png", bulletCount: 6 },
  { key: "hr", image: "/static/features/feature-hr.png", bulletCount: 7 },
  { key: "ticketing", image: "/static/features/feature-ticketing.png", bulletCount: 6 },
  { key: "communication", image: "/static/features/feature-communication.png", bulletCount: 7 },
  { key: "finance", image: "/static/features/feature-finance.png", bulletCount: 7 },
  { key: "inventory", image: "/static/features/feature-inventory.png", bulletCount: 6 },
  { key: "reseller", image: "/static/features/feature-reseller.png", bulletCount: 6 },
  { key: "dashboard_feature", image: "/static/features/feature-dashboard.png", bulletCount: 7 },
  { key: "client_portal", image: "/static/features/feature-client-portal.png", bulletCount: 7 },
  { key: "config", image: "/static/features/feature-config.png", bulletCount: 7 },
  { key: "activity", image: "/static/features/feature-activity.png", bulletCount: 5 },
  { key: "reporting", image: "/static/features/feature-reporting.png", bulletCount: 6 },
];

function FeatureHero() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_70%)]" />
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {t("features_page.hero.title")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {t("features_page.hero.subtitle")}
        </p>
      </div>
    </section>
  );
}

function FeatureSectionBlock({
  section,
  reversed,
}: {
  section: FeatureSection;
  reversed: boolean;
}) {
  const { t } = useTranslation();
  const prefix = `features_page.sections.${section.key}`;

  const bullets = Array.from({ length: section.bulletCount }, (_, i) =>
    t(`${prefix}.bullets.${i}`)
  );

  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-16",
        reversed && "lg:[direction:rtl]"
      )}
    >
      <div className="flex items-center justify-center lg:py-4">
        <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
          <Image
            src={section.image}
            alt={t(`${prefix}.title`)}
            width={560}
            height={350}
            className="h-auto w-full object-cover"
          />
        </div>
      </div>

      <div className={cn(reversed && "lg:[direction:ltr]")}>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t(`${prefix}.title`)}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t(`${prefix}.description`)}
        </p>
        <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <FeatureHero />
      {SECTIONS.map((section, index) => (
        <section
          key={section.key}
          className={cn(index % 2 === 0 ? "bg-muted/30" : "bg-background", "border-t")}
        >
          <FeatureSectionBlock section={section} reversed={index % 2 !== 0} />
        </section>
      ))}
    </>
  );
}
