"use client";

// Product samples for the modules-b pages (support, resellers, finance, inventory, reports, portal).
// Each is the app's own screen with its real labels: labels reuse the admin's i18n keys,
// sample text lives under module_pages.<id>.sample.*. Shared parts come from module-detail.css (mkt-mod-s).
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleId } from "@/components/marketing/modules/module-types";
import "@/components/marketing/modules/content-b.css";

const tk = "৳ ";

function Panel({ id, title, aside, children }: { id: ModuleId; title: string; aside?: ReactNode; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="mkt-panel mkt-mod-s" role="img" aria-label={t(`module_pages.${id}.sample_alt`)}>
      <div className="mkt-mod-s__bar">
        <span className="mkt-mod-s__title">{title}</span>
        {aside}
      </div>
      <div className="mkt-mod-s__body">{children}</div>
    </div>
  );
}

function Kv({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="mkt-mod-s__kv">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Field({ label, value, select, muted }: { label: string; value: ReactNode; select?: boolean; muted?: boolean }) {
  return (
    <div className="mkt-modb-field">
      <span className="mkt-mod-s__label">{label}</span>
      <span className={cn("mkt-modb-input", muted && "mkt-modb-input--muted")}>
        <span>{value}</span>
        {select ? <ChevronDown aria-hidden="true" /> : null}
      </span>
    </div>
  );
}

function Row({ label, value, total }: { label: string; value: ReactNode; total?: boolean }) {
  return (
    <div className={cn("mkt-mod-s__row", total && "mkt-modb-total")}>
      <span>{label}</span>
      <span className="mkt-modb-fig">{value}</span>
    </div>
  );
}

function Tick({ on, children }: { on?: boolean; children: ReactNode }) {
  return (
    <div className="mkt-modb-pick">
      <span className={cn("mkt-modb-check", on && "mkt-modb-check--on")}>{on ? <Check aria-hidden="true" /> : null}</span>
      {children}
    </div>
  );
}

function Actions({ items }: { items: [string, boolean?][] }) {
  return (
    <div className="mkt-mod-s__chips mkt-modb-end">
      {items.map(([label, ink]) => (
        <span key={label} className={cn("mkt-mod-s__chip", ink && "mkt-mod-s__chip--ink")}>{label}</span>
      ))}
    </div>
  );
}

const fig = (v: string) => <span className="mkt-modb-fig">{v}</span>;

export function SupportSample() {
  const { t } = useTranslation();
  const s = (k: string) => t(`module_pages.support.sample.${k}`);
  return (
    <Panel id="support" title={`${t("ticket.title_single")} #1042`} aside={<span className="mkt-mod-s__label">{s("subject")}</span>}>
      <Kv
        items={[
          [t("ticket.client.label"), s("client")],
          [t("ticket.priority.label"), <span key="p" className="mkt-warn">{t("ticket.priority.high")}</span>],
          [t("ticket.status.label"), t("ticket.status.in_progress")],
          [t("ticket.assigned_to.label"), s("staff")],
          [t("ticket.tags.label"), `${s("tag_fiber")}, ${s("tag_zone")}`],
          [t("ticket.client_address"), s("address")],
        ]}
      />
      <span className="mkt-mod-s__label">{t("ticket.replies")}</span>
      <div className="mkt-mod-s__msg">
        <span className="mkt-mod-s__label">{s("client")}, 09:12</span>
        <p>{s("msg_client")}</p>
      </div>
      <div className="mkt-mod-s__msg mkt-modb-staff">
        <span className="mkt-mod-s__label">
          {t("ticket.replied_by")} {s("staff")}, 09:40
        </span>
        <p>{s("msg_staff")}</p>
      </div>
      <Field label={t("ticket.reply.title")} value={t("ticket.reply.placeholder")} muted />
      <Actions items={[[t("ticket.reply.send"), true]]} />
    </Panel>
  );
}

export function ResellersSample() {
  const { t } = useTranslation();
  const s = (k: string) => t(`module_pages.resellers.sample.${k}`);
  return (
    <Panel id="resellers" title={t("wallet.client_recharge_title")}>
      <Kv
        items={[
          [t("wallet.client_summary.name"), s("client")],
          [t("wallet.client_summary.pppoe_username"), fig("nasrin.uttara")],
          [t("wallet.client_summary.address"), s("address")],
          [t("wallet.client_summary.package"), s("package")],
          [t("wallet.client_summary.buying_price"), fig(`${tk}600.00`)],
          [t("wallet.client_summary.termination_date"), fig("30/11/2026")],
        ]}
      />
      <div>
        <Row label={t("wallet.balance.label")} value={`${tk}4,250.00`} />
      </div>
      <Field label={t("wallet.days.label")} value={fig("15")} />
      <div>
        <Row label={s("formula")} value="600.00 ÷ 30 × 15" />
        <Row label={t("wallet.recharge_cost.label")} value={`${tk}300.00`} total />
      </div>
      <Actions items={[[t("common.cancel")], [t("common.save"), true]]} />
    </Panel>
  );
}

const EXPENSES = [
  { id: "EXP-0311", type: "type_cable", by: "staff_a", amount: "3,200.00", status: "pending" },
  { id: "EXP-0310", type: "type_rent", by: "staff_b", amount: "18,000.00", status: "pending" },
  { id: "EXP-0309", type: "type_fuel", by: "staff_a", amount: "650.00", status: "approved" },
  { id: "EXP-0308", type: "type_tea", by: "staff_b", amount: "420.00", status: "declined" },
] as const;

export function FinanceSample() {
  const { t } = useTranslation();
  const s = (k: string) => t(`module_pages.finance.sample.${k}`);
  return (
    <Panel
      id="finance"
      title={t("expense.title_plural")}
      aside={
        <span className="mkt-mod-s__label">
          {t("expense.reports.pending")} {fig(`${tk}21,200.00`)}
        </span>
      }
    >
      <div>
        {EXPENSES.map((e) => (
          <div key={e.id} className="mkt-mod-s__row mkt-modb-item">
            <span>
              <strong>{s(e.type)}</strong> <span className="mkt-mod-s__label mkt-modb-fig">{e.id}</span>
              <br />
              <span className="mkt-mod-s__label">
                {t("expense.staff.label")}: {s(e.by)}, {t("expense.fund.label")}: {s("fund_cash")}
              </span>
            </span>
            <span className="mkt-modb-cell">
              {fig(`${tk}${e.amount}`)}
              {e.status === "pending" ? (
                <Actions items={[[t("expense.decline")], [t("expense.approve"), true]]} />
              ) : e.status === "approved" ? (
                <span className="mkt-ok">{t("common.approved")}</span>
              ) : (
                <span className="mkt-bad">{t("expense.declined")}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const SERIALS = [
  { mac: "E0:67:B3:4A:1C:02", on: true },
  { mac: "E0:67:B3:4A:1C:07", on: false },
  { mac: "E0:67:B3:4A:1D:11", on: false },
];

export function InventorySample() {
  const { t } = useTranslation();
  const s = (k: string) => t(`module_pages.inventory.sample.${k}`);
  return (
    <Panel id="inventory" title={t("product_out.create_title")}>
      <div className="mkt-modb-fields">
        <Field label={t("product_out.client.label")} value={s("client")} select />
        <Field label={t("product_out.received_by.label")} value={s("staff")} select />
      </div>
      <span className="mkt-mod-s__label">{t("product_out.lines.item", { index: 1 })}</span>
      <div className="mkt-modb-fields">
        <Field label={t("product_out.line.product.label")} value={s("product")} select />
        <Field label={t("product_out.line.product_in.label")} value={fig("PV-2207")} select />
        <Field label={t("product_out.line.quantity.label")} value={fig("1")} />
        <Field label={t("product_out.line.unit_price.label")} value={fig("1,800.00")} />
      </div>
      <div className="mkt-modb-field">
        <span className="mkt-modb-input mkt-modb-input--muted">
          <span>{t("product_out.serial.search_placeholder")}</span>
          <Search aria-hidden="true" />
        </span>
        <div>
          {SERIALS.map((x) => (
            <Tick key={x.mac} on={x.on}>
              {fig(x.mac)}
            </Tick>
          ))}
        </div>
        <span className="mkt-mod-s__label">{t("product_out.serial.selected_count", { count: 1 })}</span>
      </div>
      <Tick on>{t("product_out.create_invoice.label")}</Tick>
      <div>
        <Row label={t("product_out.totals.total_quantity")} value="1" />
        <Row label={t("product_out.totals.total_amount")} value={`${tk}1,800.00`} total />
      </div>
    </Panel>
  );
}

export function ReportsSample() {
  const { t } = useTranslation();
  const download = (
    <span className="mkt-mod-s__chip mkt-modb-download">
      <Download aria-hidden="true" />
      {t("btrc.download")}
    </span>
  );
  return (
    <Panel id="reports" title={t("btrc.title")}>
      <div className="mkt-modb-split">
        <div>
          <span className="mkt-mod-s__title">{t("btrc.client.title")}</span>
          <Field label={t("btrc.client.type.label")} value={t("btrc.client.type.own")} select />
          <Field label={t("btrc.client.zone.label")} value={t("module_pages.reports.sample.zone")} select />
          <Field label={t("btrc.client.status.label")} value={t("btrc.client.status.active")} select />
          {download}
        </div>
        <div>
          <span className="mkt-mod-s__title">{t("btrc.reseller.title")}</span>
          <Field label={t("btrc.reseller.reseller.label")} value={t("btrc.reseller.reseller.all")} select />
          {download}
        </div>
      </div>
    </Panel>
  );
}

export function PortalSample() {
  const { t } = useTranslation();
  const s = (k: string) => t(`module_pages.portal.sample.${k}`);
  return (
    <Panel id="portal" title={t("client_dashboard.info.title")}>
      <Kv
        items={[
          [t("client_dashboard.info.account_status"), <span key="a" className="mkt-ok">{t("common.active")}</span>],
          [t("client_dashboard.info.connection_status"), <span key="c" className="mkt-ok">{t("client.basic_view.online")}</span>],
          [t("client_dashboard.info.onu_status"), <span key="o" className="mkt-ok">{t("onu.status.online")}</span>],
          [t("client_dashboard.info.customer_id"), fig("MRP-0457")],
          [t("client_dashboard.info.account_expiration"), fig("05/11/2026")],
          [t("client_dashboard.info.package"), s("package")],
          [t("client_dashboard.info.name"), s("client")],
          [t("client_dashboard.info.username"), fig("farhana.mirpur")],
        ]}
      />
      <span className="mkt-mod-s__title">{t("client_dashboard.payment.title")}</span>
      <div>
        <Row label={s("invoice")} value={`${tk}1,000.00`} total />
      </div>
      <Actions items={[[t("pay.result.pay_bkash"), true]]} />
    </Panel>
  );
}
