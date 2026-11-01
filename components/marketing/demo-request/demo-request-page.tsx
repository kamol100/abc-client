"use client";

import { useTranslation } from "react-i18next";
import { useCompany } from "@/context/company-provider";
import DemoRequestForm from "@/components/marketing/demo-request/demo-request-form";
import "@/components/marketing/demo-request/demo-request.css";
import Hl from "@/components/marketing/hl";

// Modules the demo walks through; facts from the feature inventory.
const COVERS = ["subscribers", "mikrotik", "olt", "noc", "sms"] as const;
// What the code does with a request: saved, then an admin sets its status.
const STEPS = ["saved", "review"] as const;

export default function DemoRequestPage() {
  const { t } = useTranslation();
  const { company } = useCompany();
  const name = company.name || "ISPTik";

  return (
    <div className="mkt-page mkt-demo">
      <section className="mkt-section mkt-section--alt mkt-demo-head" aria-labelledby="demo-title">
        <div className="mkt-container">
          <span className="mkt-label">{t("demo_request.hero.label")}</span>
          <h1 id="demo-title"><Hl k="demo_request.hero.title" values={{ name }} /></h1>
          <p className="mkt-demo-copy">{t("demo_request.hero.subtitle")}</p>
        </div>
      </section>

      <section className="mkt-demo-body">
        <div className="mkt-container mkt-demo-layout">
          <DemoRequestForm />

          <aside className="mkt-demo-aside">
            <div className="mkt-demo-block">
              <h2 id="demo-covers"><Hl k="demo_request.covers.title" /></h2>
              <dl className="mkt-demo-spec" aria-labelledby="demo-covers">
                {COVERS.map((key) => (
                  <div key={key}>
                    <dt>{t(`demo_request.covers.items.${key}.name`)}</dt>
                    <dd>{t(`demo_request.covers.items.${key}.note`)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="mkt-demo-block">
              <h2 id="demo-after"><Hl k="demo_request.after.title" /></h2>
              <ol className="mkt-demo-steps" aria-labelledby="demo-after">
                {STEPS.map((key) => (
                  <li key={key}>{t(`demo_request.after.steps.${key}`)}</li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
