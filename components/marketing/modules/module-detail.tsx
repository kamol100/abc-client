"use client";

import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { MODULES } from "@/components/marketing/modules/registry";
import type { ModuleContent, ModuleId } from "@/components/marketing/modules/module-types";
import "@/components/marketing/modules/module-detail.css";

// A spec value with a figure in it (Latin or Bangla digits) is a measurement: set it in mono.
const MEASURE = /[0-9০-৯]/;
// Capability sections rotate through three compositions so neighbours never share a skeleton.
const LAYOUTS = ["rows", "cells", "list"] as const;
// A summary sentence set as the head's light second line drops its full stop.
const phrase = (s: string) => s.replace(/[.।]\s*$/, "");

type Section = ModuleContent["sections"][number];

/** A module as MikroTik shows a product in a grid: centred uppercase name over the picture (its screen, scaled). */
export function ModuleCard({ id }: { id: ModuleId }) {
  const { t } = useTranslation();
  const mod = MODULES[id];
  if (!mod) return null;
  const { Sample } = mod;
  return (
    <Link href={`/features/${id}`} className="mkt-mod-card">
      <span className="mkt-mod-card__name">{t(`marketing.nav.modules.${id}`)}</span>
      {Sample && (
        <div className="mkt-mod-card__pic" aria-hidden="true" inert>
          <div className="mkt-mod-card__frame">
            <div className="mkt-mod-card__scale">
              <Sample />
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}

function CapabilitySection({ section, layout, alt, label }: { section: Section; layout: (typeof LAYOUTS)[number]; alt: boolean; label: string }) {
  const { t } = useTranslation();
  return (
    <section className={cn("mkt-section", alt && "mkt-section--alt", `mkt-mod-cap mkt-mod-cap--${layout}`)}>
      <div className="mkt-container">
        <span className="mkt-label">{label}</span>
        <h2 className="mkt-mod-h2">
          {t(section.titleKey)}
          {section.summaryKey && <span className="mkt-title-sub">{phrase(t(section.summaryKey))}</span>}
        </h2>
        <ul className="mkt-mod-cap__items">
          {section.itemKeys.map((key) => (
            <li key={key}>
              {layout === "list" && <CircleCheck className="mkt-mod-icon" strokeWidth={1.25} aria-hidden="true" />}
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function ModuleDetail({ id }: { id: ModuleId }) {
  const { t } = useTranslation();
  const mod = MODULES[id];
  if (!mod) return null;

  const { Sample } = mod;
  const title = t(`module_pages.${id}.title`);
  const label = t(`marketing.nav.modules.${id}`);
  const related = mod.related.filter((rid) => MODULES[rid]);
  const specsAlt = mod.sections.length % 2 === 0;

  return (
    <div className="mkt-page">
      <section className="mkt-mod-hero">
        <div className={cn("mkt-container mkt-mod-hero__grid", !Sample && "mkt-mod-hero--text")}>
          {Sample && (
            <figure className="mkt-mod-hero__slot" data-slot={`module-${id}`} data-alt={t(`module_pages.${id}.sample_alt`)}>
              <Sample />
            </figure>
          )}
          <div className="mkt-mod-hero__text">
            <h1>{title}</h1>
            <p className="mkt-mod-hero__lead">{t(`module_pages.${id}.lead`)}</p>
            <ul className="mkt-mod-checks">
              {mod.highlightKeys.map((key) => (
                <li key={key}>
                  <CircleCheck className="mkt-mod-icon" strokeWidth={1.25} aria-hidden="true" />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
            <div className="mkt-mod-actions">
              <Link className="mkt-btn" href="/demo-request">{t("module_pages.common.demo")}</Link>
              <Link className="mkt-btn" href="/features">{t("module_pages.common.all_features")}</Link>
            </div>
          </div>
        </div>
      </section>

      {mod.sections.map((section, i) => (
        <CapabilitySection key={section.titleKey} section={section} layout={LAYOUTS[i % LAYOUTS.length]} alt={i % 2 === 0} label={label} />
      ))}

      <section className={cn("mkt-section", specsAlt && "mkt-section--alt")} aria-labelledby="mkt-mod-specs">
        <div className="mkt-container">
          <span className="mkt-label">{label}</span>
          <h2 id="mkt-mod-specs" className="mkt-mod-h2">
            {t("module_pages.common.specs")}
            <span className="mkt-title-sub">{t("module_pages.common.specs_sub")}</span>
          </h2>
          <table className="mkt-mod-specs">
            <tbody>
              {mod.specs.map(({ labelKey, valueKey }) => {
                const value = t(valueKey);
                return (
                  <tr key={labelKey}>
                    <th scope="row">{t(labelKey)}</th>
                    <td className={cn(MEASURE.test(value) && "mkt-mono")}>{value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {related.length > 0 && (
        <section className={cn("mkt-section", !specsAlt && "mkt-section--alt")} aria-labelledby="mkt-mod-related">
          <div className="mkt-container">
            <span className="mkt-label">{label}</span>
            <h2 id="mkt-mod-related" className="mkt-mod-h2">
              {t("module_pages.common.related")}
              <span className="mkt-title-sub">{t("module_pages.common.related_sub")}</span>
            </h2>
            <ul className="mkt-mod-cards">
              {related.map((rid) => (
                <li key={rid}>
                  <ModuleCard id={rid} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mkt-night mkt-mod-close" aria-labelledby="mkt-mod-close">
        <div className="mkt-container">
          <span className="mkt-label">{t("module_pages.common.cta_label")}</span>
          <h2 id="mkt-mod-close" className="mkt-mod-h2">{t("module_pages.common.cta_title", { module: title })}</h2>
          <p className="mkt-mod-copy">{t("module_pages.common.cta_text")}</p>
          <Link className="mkt-btn" href="/demo-request">{t("module_pages.common.demo")}</Link>
        </div>
      </section>
    </div>
  );
}
