"use client";

// The module screens, built at full fidelity in the hero slot. Labels are the admin's own i18n keys;
// the rows are sample data (Bangladeshi places, round amounts), never figures to read as claims.
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const DOWN_BARS = new Set([17, 18, 39]);

export function OltSample() {
  const { t } = useTranslation();
  const ports = [
    { name: "PON 1", online: 30, total: 32 },
    { name: "PON 2", online: 28, total: 28 },
    { name: "PON 3", online: 25, total: 27 },
    { name: "PON 4", online: 19, total: 19 },
  ];
  const onus = [
    { client: "Sumi Akter", rx: "-28.4", distance: "2.1 km", tone: "mkt-bad" },
    { client: "Rubel Hasan", rx: "-25.6", distance: "1.7 km", tone: "mkt-warn" },
    { client: "Nasima Begum", rx: "-19.2", distance: "0.9 km", tone: "mkt-ok" },
  ];
  return (
    <div className="mkt-panel mkt-mod-s" role="img" aria-label={t("module_pages.olt.sample_alt")}>
      <div className="mkt-mod-s__bar">
        <span className="mkt-mod-s__title">OLT Mirpur-10</span>
        <span className="mkt-mod-s__label">BDCOM P3310D</span>
      </div>
      <div className="mkt-mod-s__body">
        <div>
          <div className="mkt-mod-s__row">
            <span>{t("olt.monitoring_card.title")}</span>
            <span className="mkt-mono mkt-ok">99.4%</span>
          </div>
          <div className="mkt-mod-s__bars" aria-hidden="true">
            {Array.from({ length: 48 }, (_, i) => (
              <span key={i} className={cn(DOWN_BARS.has(i) && "is-down")} />
            ))}
          </div>
          <div className="mkt-mod-s__row mkt-mod-s__label">
            <span>{t("olt.monitoring_card.ago_24h")}</span>
            <span>{t("olt.monitoring_card.now")}</span>
          </div>
        </div>
        <div className="mkt-mod-s__stats">
          <div><b className="mkt-ok">102</b><span className="mkt-mod-s__label">{t("olt.metrics.online")}</span></div>
          <div><b>4</b><span className="mkt-mod-s__label">{t("olt.metrics.offline")}</span></div>
          <div><b className="mkt-bad">1</b><span className="mkt-mod-s__label">{t("olt.metrics.los")}</span></div>
          <div><b className="mkt-warn">1</b><span className="mkt-mod-s__label">{t("olt.metrics.dying_gasp")}</span></div>
        </div>
        <div>
          <p className="mkt-mod-s__label">{t("olt.pon_ports.title")}</p>
          <div className="mkt-mod-s__ports">
            {ports.map((p) => (
              <div key={p.name}>
                <b className="mkt-mono">{p.name}</b>
                <span className={cn("mkt-mod-s__label", "mkt-mono", p.online < p.total ? "mkt-warn" : "mkt-ok")}>
                  {t("olt.pon_ports.online", { online: p.online, total: p.total })}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mkt-mod-s__scroll">
          <table className="mkt-mod-s__table">
            <thead>
              <tr>
                <th scope="col">{t("onu.columns.client")}</th>
                <th scope="col" className="num">{t("onu.columns.rx")}</th>
                <th scope="col" className="num">{t("onu.columns.distance")}</th>
              </tr>
            </thead>
            <tbody>
              {onus.map((o) => (
                <tr key={o.client}>
                  <td>{o.client}</td>
                  <td className={cn("num", o.tone)}>{o.rx} dBm</td>
                  <td className="num">{o.distance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SubscribersSample() {
  const { t } = useTranslation();
  const fields: [string, string][] = [
    ["client.pppoe_username.label", "rahim.mirpur10"],
    ["client.ip_address.label", "10.20.4.18"],
    ["client.zone.label", "Mirpur"],
    ["client.sub_zone.label", "Section 10"],
    ["client.package.label", "20 Mbps"],
    ["client.basic_view.billing_term", t("module_pages.subscribers.sample.term")],
    ["client.table.deadline", "10 Nov"],
    ["client.table.total_due", "৳ 0"],
  ];
  const actions = ["reset_session", "change_package", "pay", "sms", "tickets", "client_sync"];
  return (
    <div className="mkt-panel mkt-mod-s" role="img" aria-label={t("module_pages.subscribers.sample_alt")}>
      <div className="mkt-mod-s__bar">
        <span className="mkt-mod-s__title">Rahim Uddin</span>
        <span className="mkt-mono mkt-mod-s__label">SID 10482</span>
      </div>
      <div className="mkt-mod-s__body">
        <dl className="mkt-mod-s__kv">
          {fields.map(([key, value]) => (
            <div key={key}><dt>{t(key)}</dt><dd className="mkt-mono">{value}</dd></div>
          ))}
        </dl>
        <div className="mkt-mod-s__stats">
          <div><b>18.4</b><span className="mkt-mod-s__label">{t("client.speed.download")} Mbps</span></div>
          <div><b>3.1</b><span className="mkt-mod-s__label">{t("client.speed.upload")} Mbps</span></div>
          <div><b className="mkt-ok">4</b><span className="mkt-mod-s__label">{t("module_pages.subscribers.sample.ping")} ms</span></div>
          <div><b className="mkt-ok">-21.4</b><span className="mkt-mod-s__label">ONU dBm</span></div>
        </div>
        <div className="mkt-mod-s__chips">
          {actions.map((a) => (
            <span key={a} className={cn("mkt-mod-s__chip", a === "pay" && "mkt-mod-s__chip--ink")}>{t(`client.actions.${a}`)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BillingSample() {
  const { t } = useTranslation();
  const rows = [
    { id: "INV-24110021", client: "Rahim Uddin", zone: "Mirpur", amount: "800", status: "paid", tone: "mkt-ok" },
    { id: "INV-24110022", client: "Nasima Begum", zone: "Uttara", amount: "1,200", status: "partial_paid", tone: "mkt-warn" },
    { id: "INV-24110023", client: "Kamal Hossain", zone: "Dhanmondi", amount: "1,000", status: "due", tone: "mkt-bad" },
    { id: "INV-24110024", client: "Sumi Akter", zone: "Savar", amount: "600", status: "due", tone: "mkt-bad" },
  ];
  return (
    <div className="mkt-panel mkt-mod-s" role="img" aria-label={t("module_pages.billing.sample_alt")}>
      <div className="mkt-mod-s__bar">
        <span className="mkt-mod-s__title">{t("invoice.title_plural")}</span>
        <span className="mkt-mod-s__chips">
          <span className="mkt-mod-s__chip">{t("module_pages.billing.sample.receipt")}</span>
          <span className="mkt-mod-s__chip mkt-mod-s__chip--ink">{t("invoice.bulk_pay.title")}</span>
        </span>
      </div>
      <div className="mkt-mod-s__scroll">
        <table className="mkt-mod-s__table">
          <thead>
            <tr>
              <th scope="col">{t("invoice.invoice_id")}</th>
              <th scope="col">{t("invoice.client.label")}</th>
              <th scope="col">{t("invoice.zone")}</th>
              <th scope="col" className="num">{t("invoice.amount.label")}</th>
              <th scope="col">{t("invoice.status.label")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="mkt-mono">{r.id}</td>
                <td>{r.client}</td>
                <td>{r.zone}</td>
                <td className="num">৳ {r.amount}</td>
                <td className={r.tone}>{t(`invoice.status.${r.status}`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mkt-mod-s__body">
        <dl className="mkt-mod-s__kv">
          <div><dt>{t("invoice.bulk_pay.total_paid")}</dt><dd className="mkt-mono">৳ 1,400</dd></div>
          <div><dt>{t("invoice.bulk_pay.total_due")}</dt><dd className="mkt-mono mkt-bad">৳ 2,200</dd></div>
          <div><dt>{t("invoice.fund.label")}</dt><dd>bKash</dd></div>
          <div><dt>{t("invoice.confirmation_sms.label")}</dt><dd className="mkt-ok">{t("module_pages.billing.sample.on")}</dd></div>
        </dl>
      </div>
    </div>
  );
}

export function MikrotikSample() {
  const { t } = useTranslation();
  const active = t("re_sync.filters.client_status_mikrotik.options.active");
  const inactive = t("re_sync.filters.client_status_mikrotik.options.inactive");
  const rows = [
    { mt: "nasima.uttara", app: "nasima.uttara", mtProfile: "10M", appProfile: "20M", mtStatus: active, appStatus: active, diff: "profile" },
    { mt: "kamal.dhanmondi", app: "", mtProfile: "15M", appProfile: "", mtStatus: active, appStatus: "", diff: "app" },
    { mt: "", app: "rubel.savar", mtProfile: "", appProfile: "10M", mtStatus: "", appStatus: active, diff: "mt" },
    { mt: "sumi.mirpur", app: "sumi.mirpur", mtProfile: "20M", appProfile: "20M", mtStatus: active, appStatus: inactive, diff: "status" },
  ];
  const missing = t("module_pages.mikrotik.sample.missing");
  return (
    <div className="mkt-panel mkt-mod-s" role="img" aria-label={t("module_pages.mikrotik.sample_alt")}>
      <div className="mkt-mod-s__bar">
        <span className="mkt-mod-s__title">{t("re_sync.title_plural")}</span>
        <span className="mkt-mod-s__chips">
          <span className="mkt-mod-s__chip">{t("re_sync.sync.network.label")}: CCR Mirpur</span>
          <span className="mkt-mod-s__chip">{t("re_sync.sync.actions.load")}</span>
          <span className="mkt-mod-s__chip mkt-mod-s__chip--ink">{t("re_sync.sync.actions.all_sync")}</span>
        </span>
      </div>
      <div className="mkt-mod-s__scroll">
        <table className="mkt-mod-s__table">
          <thead>
            <tr>
              <th scope="col">{t("re_sync.table.client_in_mikrotik")}</th>
              <th scope="col">{t("re_sync.table.client_in_app")}</th>
              <th scope="col">{t("re_sync.table.mikrotik_profile")}</th>
              <th scope="col">{t("re_sync.table.app_profile")}</th>
              <th scope="col">{t("re_sync.table.client_status_mikrotik")}</th>
              <th scope="col">{t("re_sync.table.client_status_app")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.mt + r.app}>
                <td className={cn("mkt-mono", !r.mt && "mkt-bad")}>{r.mt || missing}</td>
                <td className={cn("mkt-mono", !r.app && "mkt-bad")}>{r.app || missing}</td>
                <td className="mkt-mono">{r.mtProfile}</td>
                <td className={cn("mkt-mono", r.diff === "profile" && "mkt-warn")}>{r.appProfile}</td>
                <td>{r.mtStatus}</td>
                <td className={cn(r.diff === "status" && "mkt-warn")}>{r.appStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mkt-mod-s__body">
        <div className="mkt-mod-s__row">
          <span>{t("module_pages.mikrotik.sample.mismatches")}</span>
          <b className="mkt-mono mkt-warn">4</b>
        </div>
      </div>
    </div>
  );
}

export function NocSample() {
  const { t } = useTranslation();
  const down = [
    { name: "Switch Uttara-7", minutes: "14 min", clients: 38 },
    { name: "TJ Box Mirpur-12", minutes: "4 min", clients: 6 },
  ];
  return (
    <div className="mkt-panel mkt-mod-s" role="img" aria-label={t("module_pages.noc.sample_alt")}>
      <div className="mkt-mod-s__bar">
        <span className="mkt-mod-s__title">{t("noc.title")}</span>
        <span className="mkt-mod-s__label">{t("noc.refreshes")}</span>
      </div>
      <div className="mkt-mod-s__body">
        <div className="mkt-mod-s__stats">
          <div><b className="mkt-bad">2</b><span className="mkt-mod-s__label">{t("noc.counts.down")}</span></div>
          <div><b className="mkt-warn">1</b><span className="mkt-mod-s__label">{t("noc.counts.unknown")}</span></div>
          <div><b className="mkt-ok">148</b><span className="mkt-mod-s__label">{t("noc.counts.up")}</span></div>
          <div><b>1</b><span className="mkt-mod-s__label">{t("noc.counts.open_outages")}</span></div>
        </div>
        <div>
          <p className="mkt-mod-s__label">{t("noc.down_devices")}</p>
          {down.map((d) => (
            <div key={d.name} className="mkt-mod-s__row">
              <span>
                <b>{d.name}</b>{" "}
                <span className="mkt-bad">{t("noc.down_for", { duration: d.minutes })}</span>
              </span>
              <span className="mkt-mod-s__chips">
                <span className="mkt-mod-s__chip">{t("noc.clients", { count: d.clients })}</span>
                <span className="mkt-mod-s__chip">Ping</span>
                <span className="mkt-mod-s__chip">{t("noc.directions")}</span>
              </span>
            </div>
          ))}
        </div>
        <div>
          <p className="mkt-mod-s__label">{t("noc.open_outages")}</p>
          <div className="mkt-mod-s__row">
            <span><b>Switch Uttara-7</b> {t("noc.clients", { count: 38 })}</span>
            <span className="mkt-mono">{t("noc.ticket", { number: 1042 })}</span>
          </div>
        </div>
        <div className="mkt-mod-s__row">
          <span>{t("noc.badges.maintenance")}</span>
          <span className="mkt-mod-s__label">OLT Gazipur-2, 02:00 to 04:00</span>
        </div>
      </div>
    </div>
  );
}

export function MessagingSample() {
  const { t } = useTranslation();
  return (
    <div className="mkt-panel mkt-mod-s" role="img" aria-label={t("module_pages.messaging.sample_alt")}>
      <div className="mkt-mod-s__bar">
        <span className="mkt-mod-s__title">{t("sms_sent.title")}</span>
        <span className="mkt-mod-s__chips">
          <span className="mkt-mod-s__chip mkt-mod-s__chip--ink">{t("sms_sent.mode.live.title")}</span>
          <span className="mkt-mod-s__chip">{t("sms_sent.mode.test.title")}</span>
        </span>
      </div>
      <div className="mkt-mod-s__body">
        <dl className="mkt-mod-s__kv">
          <div><dt>{t("client.network.label")}</dt><dd>CCR Mirpur</dd></div>
          <div><dt>{t("client.zone.label")}</dt><dd>Mirpur</dd></div>
          <div><dt>{t("client.status.label")}</dt><dd>{t("sms_sent.sort_option.active_clients")}</dd></div>
          <div><dt>{t("sms_sent.sms_template.label")}</dt><dd>{t("sms_template.template_type.options.invoice_due")}</dd></div>
        </dl>
        <div>
          <p className="mkt-mod-s__label">{t("sms_sent.sms_body.label")}</p>
          <p className="mkt-mod-s__msg">
            {t("module_pages.messaging.sample.greeting")} <code>{"{{client_name}}"}</code>, <code>{"{{total_due}}"}</code>{" "}
            {t("module_pages.messaging.sample.due_by")} <code>{"{{deadline}}"}</code>. bKash: <code>{"{{payment_link}}"}</code>
          </p>
        </div>
        <dl className="mkt-mod-s__kv">
          <div><dt>{t("sms_sent.confirm.recipients")}</dt><dd className="mkt-mono">214</dd></div>
          <div><dt>{t("sms_sent.per_sms_cost.label")}</dt><dd className="mkt-mono">৳ 0.35</dd></div>
          <div><dt>{t("sms_sent.total_cost.label")}</dt><dd className="mkt-mono">৳ 74.90</dd></div>
          <div><dt>{t("sms_sent.confirm.remaining_balance")}</dt><dd className="mkt-mono mkt-ok">৳ 1,175.10</dd></div>
        </dl>
      </div>
    </div>
  );
}
