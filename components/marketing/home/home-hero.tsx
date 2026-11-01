"use client";

import "@/components/marketing/home/home-hero.css";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity, Cable, Gauge, GitCompareArrows, Import, MapPin, MessageSquare, Network,
  Printer, Radio, Receipt, RefreshCw, Router, UserX, Wallet, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* One outline icon per spec line, in the order of marketing.hero.slides.<id>.specs.0..3. */
const SLIDES = [
  { id: "olt", href: "/features#olt", icons: [Network, Cable, Gauge, RefreshCw] },
  { id: "mikrotik", href: "/features#mikrotik", icons: [Router, GitCompareArrows, UserX, Import] },
  { id: "billing", href: "/features#billing", icons: [Receipt, Wallet, Printer, MessageSquare] },
  { id: "noc", href: "/features#noc", icons: [RefreshCw, Activity, Radio, MapPin] },
] as const satisfies readonly { id: string; href: string; icons: readonly LucideIcon[] }[];

type SlideId = (typeof SLIDES)[number]["id"];

/* Sample rows: UI samples, not customer data. */
type OnuState = "online" | "offline" | "los" | "power_off";
const ONUS: { onu: string; state: OnuState; rx: number | null; km: string; client: string }[] = [
  { onu: "EPON0/1:3", state: "online", rx: -21.4, km: "1.2 km", client: "Rahim, Mirpur 10" },
  { onu: "EPON0/1:7", state: "online", rx: -26.1, km: "2.8 km", client: "Nila, Uttara 7" },
  { onu: "EPON0/1:9", state: "online", rx: -28.3, km: "3.4 km", client: "Karim Store, Uttara" },
  { onu: "EPON0/2:1", state: "los", rx: null, km: "0.9 km", client: "Sumon, Dhanmondi 27" },
  { onu: "EPON0/2:4", state: "power_off", rx: null, km: "1.6 km", client: "Tania, Mirpur 2" },
];

const STATE_CLASS: Record<OnuState, string> = {
  online: "mkt-ok",
  offline: "mkt-hero-dim",
  los: "mkt-bad",
  power_off: "mkt-warn",
};

/** Same buckets as the app: low below -27 dBm, near limit within 2 dB of it. */
function rxClass(rx: number | null): string {
  if (rx === null) return "mkt-hero-dim";
  if (rx < -27) return "mkt-bad";
  if (rx < -25) return "mkt-warn";
  return "mkt-ok";
}

const RESYNC: { mikrotik: string | null; app: string | null; profile: string; match: boolean }[] = [
  { mikrotik: "rahim.mirpur", app: "rahim.mirpur", profile: "20 Mbps", match: true },
  { mikrotik: "nila.uttara", app: "nila.uttara", profile: "10 / 20 Mbps", match: false },
  { mikrotik: "sumon.dhanmondi", app: null, profile: "15 Mbps", match: false },
  { mikrotik: null, app: "tania.mirpur", profile: "20 Mbps", match: false },
];

function OltPanel() {
  const { t } = useTranslation();
  const p = "marketing.hero.panel.olt";
  return (
    <div className="mkt-panel mkt-hero-panel">
      <div className="mkt-hero-panel-head">
        <span className="mkt-hero-panel-title">{t(`${p}.title`)}</span>
        <span className="mkt-hero-dim">Mirpur OLT 01</span>
      </div>
      <table className="mkt-hero-table">
        <thead>
          <tr>
            <th>{t(`${p}.onu`)}</th>
            <th>{t(`${p}.status`)}</th>
            <th className="mkt-hero-num">{t(`${p}.rx`)}</th>
            <th className="mkt-hero-num mkt-hero-wide">{t(`${p}.distance`)}</th>
            <th className="mkt-hero-wide">{t(`${p}.client`)}</th>
          </tr>
        </thead>
        <tbody>
          {ONUS.map((row) => (
            <tr key={row.onu}>
              <td className="mkt-mono">{row.onu}</td>
              <td className={STATE_CLASS[row.state]}>{t(`${p}.${row.state}`)}</td>
              <td className={cn("mkt-mono mkt-hero-num", rxClass(row.rx))}>
                {row.rx === null ? t(`${p}.not_reported`) : `${row.rx.toFixed(1)} dBm`}
              </td>
              <td className="mkt-mono mkt-hero-num mkt-hero-wide">{row.km}</td>
              <td className="mkt-hero-clip mkt-hero-wide">{row.client}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResyncPanel() {
  const { t } = useTranslation();
  const p = "marketing.hero.panel.resync";
  const missing = <span className="mkt-bad">{t(`${p}.missing`)}</span>;
  const matched = RESYNC.filter((row) => row.match).length;
  return (
    <div className="mkt-panel mkt-hero-panel">
      <div className="mkt-hero-panel-head">
        <span className="mkt-hero-panel-title">{t(`${p}.title`)}</span>
        <span className="mkt-hero-dim">
          {t(`${p}.network`)}: Uttara NAS
        </span>
      </div>
      <dl className="mkt-hero-summary">
        <div>
          <dt>{t(`${p}.total`)}</dt>
          <dd className="mkt-mono">{RESYNC.length}</dd>
        </div>
        <div>
          <dt>{t(`${p}.match`)}</dt>
          <dd className="mkt-mono mkt-ok">{matched}</dd>
        </div>
        <div>
          <dt>{t(`${p}.not_match`)}</dt>
          <dd className="mkt-mono mkt-bad">{RESYNC.length - matched}</dd>
        </div>
      </dl>
      <table className="mkt-hero-table">
        <thead>
          <tr>
            <th>{t(`${p}.in_mikrotik`)}</th>
            <th>{t(`${p}.in_app`)}</th>
            <th className="mkt-hero-wide">{t(`${p}.profile`)}</th>
            <th>{t(`${p}.match`)}</th>
          </tr>
        </thead>
        <tbody>
          {RESYNC.map((row) => (
            <tr key={`${row.mikrotik}-${row.app}`}>
              <td className="mkt-mono mkt-hero-clip">{row.mikrotik ?? missing}</td>
              <td className="mkt-mono mkt-hero-clip">{row.app ?? missing}</td>
              <td className="mkt-mono mkt-hero-wide">{row.profile}</td>
              <td className={row.match ? "mkt-ok" : "mkt-bad"}>
                {t(row.match ? `${p}.match` : `${p}.not_match`)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mkt-hero-panel-foot">
        <span className="mkt-hero-ctl">{t(`${p}.all_sync`)}</span>
      </div>
    </div>
  );
}

function BillingPanel() {
  const { t } = useTranslation();
  const p = "marketing.hero.panel.billing";
  return (
    <div className="mkt-hero-billing">
      <div className="mkt-panel mkt-hero-panel">
        <div className="mkt-hero-panel-head">
          <span className="mkt-hero-panel-title">
            {t(`${p}.invoice`)} <span className="mkt-mono">INV-1042</span>
          </span>
          <span className="mkt-hero-dim">Rahim Uddin, Mirpur 10</span>
        </div>
        <table className="mkt-hero-table">
          <thead>
            <tr>
              <th>{t(`${p}.item`)}</th>
              <th className="mkt-hero-num">{t(`${p}.amount`)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t(`${p}.monthly`)}</td>
              <td className="mkt-mono mkt-hero-num">৳1,000</td>
            </tr>
            <tr>
              <td>{t(`${p}.setup`)}</td>
              <td className="mkt-mono mkt-hero-num">৳500</td>
            </tr>
            <tr className="mkt-hero-total">
              <td>{t(`${p}.total`)}</td>
              <td className="mkt-mono mkt-hero-num">৳1,500</td>
            </tr>
            <tr>
              <td>{t(`${p}.status`)}</td>
              <td className="mkt-hero-num mkt-bad">{t(`${p}.due`)}</td>
            </tr>
          </tbody>
        </table>
        <div className="mkt-hero-panel-foot">
          <span className="mkt-hero-ctl">{t(`${p}.pay`)}</span>
        </div>
      </div>
      <div className="mkt-panel mkt-hero-receipt mkt-mono">
        <span className="mkt-hero-panel-title">{t(`${p}.receipt`)}</span>
        <span>INV-1031</span>
        <span className="mkt-hero-rule" />
        <span className="mkt-hero-pair">
          <span>{t(`${p}.paid`)}</span>
          <span>৳1,000</span>
        </span>
        <span className="mkt-hero-pair">
          <span>{t(`${p}.method`)}</span>
          <span>bKash</span>
        </span>
        <span className="mkt-hero-pair">
          <span>{t(`${p}.date`)}</span>
          <span>28/10/26</span>
        </span>
        <span className="mkt-hero-rule" />
        <span>{t(`${p}.thanks`)}</span>
      </div>
    </div>
  );
}

function NocPanel() {
  const { t } = useTranslation();
  const p = "marketing.hero.panel.noc";
  const counts = [
    { key: "down", value: 1, tone: "mkt-bad" },
    { key: "unknown", value: 2, tone: "mkt-warn" },
    { key: "up", value: 38, tone: "mkt-ok" },
  ] as const;
  return (
    <div className="mkt-panel mkt-hero-panel">
      <div className="mkt-hero-panel-head">
        <span className="mkt-hero-panel-title">{t(`${p}.title`)}</span>
        <span className="mkt-hero-dim">{t(`${p}.refreshes`)}</span>
      </div>
      <dl className="mkt-hero-summary mkt-hero-counts">
        {counts.map((c) => (
          <div key={c.key}>
            <dt>{t(`${p}.${c.key}`)}</dt>
            <dd className={cn("mkt-mono", c.tone)}>{c.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mkt-hero-device">
        <span className="mkt-hero-dim">{t(`${p}.down_devices`)}</span>
        <span className="mkt-hero-panel-title">Uttara Sector 7 switch</span>
        <span className="mkt-hero-pair">
          <span className="mkt-bad">{t(`${p}.down_for`, { duration: "12 min" })}</span>
          <span>{t(`${p}.clients`, { count: 27 })}</span>
        </span>
        <span className="mkt-hero-pair">
          <span>
            {t(`${p}.ping`)} <span className="mkt-mono">10.20.7.1</span>
          </span>
          <span className="mkt-mono">{t(`${p}.ping_result`, { sent: 4, received: 0 })}</span>
        </span>
        <span className="mkt-hero-ctl mkt-hero-ctl--line">{t(`${p}.directions`)}</span>
      </div>
    </div>
  );
}

const PANELS: Record<SlideId, () => ReactNode> = {
  olt: OltPanel,
  mikrotik: ResyncPanel,
  billing: BillingPanel,
  noc: NocPanel,
};

export default function HomeHero() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const total = SLIDES.length;

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: total - 1 };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const index = (next + total) % total;
    setActive(index);
    tabs.current[index]?.focus();
  };

  return (
    <section className="mkt-night mkt-hero" aria-roledescription="carousel" aria-label={t("marketing.hero.carousel_label")}>
      <h1 className="visually-hidden">{t("marketing.hero.title")}</h1>
      <div className="mkt-hero-viewport">
        <div className="mkt-hero-track" data-index={active}>
          {SLIDES.map((slide, i) => {
            const k = `marketing.hero.slides.${slide.id}`;
            const Panel = PANELS[slide.id];
            const current = i === active;
            return (
              <div
                key={slide.id}
                id={`mkt-hero-slide-${slide.id}`}
                role="tabpanel"
                aria-labelledby={`mkt-hero-tab-${slide.id}`}
                aria-roledescription="slide"
                aria-hidden={!current}
                inert={!current}
                data-active={current || undefined}
                data-tone={slide.id}
                className="mkt-hero-slide"
              >
                <div className="mkt-container mkt-hero-grid">
                  <figure className="mkt-hero-figure" data-slot={`hero-${slide.id}`} data-alt={t(`${k}.alt`)} role="img" aria-label={t(`${k}.alt`)}>
                    <Panel />
                  </figure>
                  <div className="mkt-hero-copy">
                    <h2 className="mkt-hero-name mkt-hero-in mkt-hero-d1">{t(`${k}.name`)}</h2>
                    <p className="mkt-hero-body mkt-hero-in mkt-hero-d2">{t(`${k}.body`)}</p>
                    <ul className="mkt-hero-specs">
                      {slide.icons.map((Icon, s) => (
                        <li key={s} className="mkt-hero-in mkt-hero-d3">
                          <Icon className="mkt-hero-icon" aria-hidden="true" strokeWidth={1} />
                          <span>{t(`${k}.specs.${s}`)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mkt-hero-actions mkt-hero-in mkt-hero-d4">
                      <Link href={slide.href} className="mkt-btn">
                        {t("marketing.hero.details")}
                      </Link>
                      <Link href="/demo-request" className="mkt-btn">
                        {t("marketing.hero.demo")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mkt-container mkt-hero-controls">
        <div className="mkt-hero-tabs" role="tablist" aria-label={t("marketing.hero.tablist_label")}>
          {SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`mkt-hero-tab-${slide.id}`}
              aria-controls={`mkt-hero-slide-${slide.id}`}
              aria-selected={i === active}
              tabIndex={i === active ? 0 : -1}
              className="mkt-hero-tab"
              onClick={() => setActive(i)}
              onKeyDown={onTabKey}
            >
              <span className="mkt-hero-tab-mark" aria-hidden="true" />
              <span className="mkt-hero-tab-label">{t(`marketing.hero.slides.${slide.id}.tab`)}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
