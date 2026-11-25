/**
 * Company list pages that have a table filter.
 *
 * Each id gives its table toolbar two things:
 *   - a ⚙ settings dialog (settings section `list_<id>`), and
 *   - a company setting `filter_position_<id>`: where the desktop filter opens.
 *
 * To add a list page: add one line here (id → title translation key), then pass
 * `page: "<id>"` in the table's toolbar config. Its setting, dialog and
 * translations follow from this entry (see settings/registry).
 */
export const LIST_PAGES = {
  activity_logs: "activity_log.title_plural",
  agent_transactions: "agent_transaction.title_plural",
  agents: "agent.title_plural",
  archived_clients: "archived_client.title_plural",
  client_invoices: "invoice.client_history.title",
  clients: "client.title_plural",
  communication_logs: "communication_log.title_plural",
  communication_queue: "communication_queue.title_plural",
  communication_queue_archive: "communication_queue.archive.title",
  devices: "device.title_plural",
  expenses: "expense.title_plural",
  fund_transactions: "fund_transaction.title_plural",
  funds: "fund.title_plural",
  histories: "history.title_plural",
  invoices: "invoice.title_plural",
  mikrotik_packages: "mikrotik_package.title_plural",
  mikrotik_sync: "mikrotik_sync.title_plural",
  networks: "network.title_plural",
  notifications: "notifications.title",
  olts: "olt.title_plural",
  onus: "onu.title_plural",
  payments: "payment.title_plural",
  product_movements: "product_movement.title",
  product_reports: "product_reports.title",
  products: "product.title_plural",
  resellers: "reseller.title_plural",
  telegram: "telegram.title_plural",
  tickets: "ticket.title_plural",
  tj_boxes: "tj_box.title_plural",
  users: "user.title_plural",
  vendors: "vendor.title_plural",
} as const;

export type ListPageId = keyof typeof LIST_PAGES;

export const LIST_PAGE_IDS = Object.keys(LIST_PAGES) as ListPageId[];

/** Desktop filter: "inline" replaces the toolbar while open; "below" opens a panel under it. */
export type FilterPosition = "inline" | "below";

export const FILTER_POSITIONS: readonly FilterPosition[] = ["inline", "below"];

export const DEFAULT_FILTER_POSITION: FilterPosition = "inline";

export type FilterPositionSettingKey = `filter_position_${ListPageId}`;

export function filterPositionKey(page: ListPageId): FilterPositionSettingKey {
  return `filter_position_${page}`;
}

export type ListSettingsSectionName = `list_${ListPageId}`;

export function listSettingsSection(page: ListPageId): ListSettingsSectionName {
  return `list_${page}`;
}

/** A stored value → a position. Anything unknown is the default. */
export function toFilterPosition(raw: unknown): FilterPosition {
  return raw === "below" ? "below" : DEFAULT_FILTER_POSITION;
}
