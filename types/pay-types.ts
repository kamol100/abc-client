export type ClientPackage = {
  name: string;
  bandwidth: string | null;
  mikrotik_profile: string | null;
  price: number | string | null;
};

export type InvoiceDueItem = {
  id: string;
  invoice_id: string;
  invoice_type: string | null;
  month: string;
  due_date: string | null;
  after_discount_amount: number | string;
  discount: number | string;
  line_total_discount: number | string;
};

export type ClientPaymentData = {
  id: string;
  name: string;
  phone: string;
  status: "Active" | "Inactive";
  billing_terms: string | null;
  payment_terms: string | null;
  package: ClientPackage | null;
  invoice: InvoiceDueItem[];
  total_due: number | string;
  total_discount: number | string;
};

export type ClientPaymentResponse = {
  data: ClientPaymentData;
};
