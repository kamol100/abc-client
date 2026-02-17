export interface Settings {
  auto_inactive_client_invoice_due?: number;
  gmap_api?: string;
  invoice_prefix?: string;
  lat?: number;
  lon?: number;
  sms_after_payment_received?: number;
  roles?: string[];
  show_dashboard_header?: boolean;
  show_table_header?: boolean;
  [key: string]: unknown;
}

export interface Staff {
  name?: string;
  id?: string;
  item_per_page?: number;
  address?: string;
}

export interface Profile {
  id: string;
  phone?: number | string;
  name: string;
  email?: string;
  status: number;
  current_address?: string | null;
  avatar?: string | null;
  staff?: Staff | null;
}

export type AppPermission = string;

export interface AppData {
  settings: Settings;
  profile: Profile;
  permissions: AppPermission[];
}
