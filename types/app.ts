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

export interface Company {
  uuid: string;
  name: string;
  logo?: string;
  favicon?: string;
  domain?: string;
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
  company?: Company | null
}

export type AppPermission = string;

export interface AppData {
  settings: Settings;
  profile: Profile;
  permissions: AppPermission[];
}

// ─── Impersonation ──────────────────────────────────────────────────
export interface ImpersonationState {
  is_impersonating: boolean;
  chain: number[];
  original_user_id: number | null;
}

export interface ImpersonationUser {
  id: string;
  name: string;
  username?: string;
  email?: string;
  reseller_id?: string | null;
  roles?: { id: number; name: string }[];
  staff?: Staff | null;
  company?: {
    id: string;
    name: string;
    logo?: string;
    favicon?: string;
    domain?: string;
  };
}

export interface ImpersonationResponse {
  user: ImpersonationUser;
  token: string | null;
  impersonation: ImpersonationState;
}

export interface TenantListItem {
  id: string;
  name: string;
  user?: {
    uuid: string;
    name: string;
    username?: string;
  };
}
