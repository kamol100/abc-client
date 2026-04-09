import { z } from "zod";

const NumberLikeSchema = z.preprocess(
  (value) => (value === null || value === undefined || value === "" ? 0 : value),
  z.coerce.number(),
);

const NullableStringSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined || value === "") return null;
    return String(value);
  },
  z.string().nullable(),
);

export const DashboardDateFilterValues = [
  "all",
  "this_month",
  "last_month",
  "this_week",
  "last_week",
  "last_15_days",
  "today",
  "this_year",
  "last_year",
] as const;

export type DashboardDateFilter = (typeof DashboardDateFilterValues)[number];

export const DashboardClientCountSchema = z
  .object({
    total_clients: NumberLikeSchema,
    active_clients: NumberLikeSchema,
    inactive_clients: NumberLikeSchema,
    new_clients_this_month: NumberLikeSchema.optional().default(0),
    new_clients: NumberLikeSchema.optional().default(0),
  })
  .passthrough();

export const DashboardResellerCountSchema = z
  .object({
    total_clients: NumberLikeSchema,
    active_clients: NumberLikeSchema,
    inactive_clients: NumberLikeSchema,
  })
  .passthrough();

export const DashboardInvoiceReportSchema = z
  .object({
    month: z.string().nullable().optional(),
    total_invoice: NumberLikeSchema.optional().default(0),
    total_discount: NumberLikeSchema.optional().default(0),
    total_after_discount: NumberLikeSchema.optional().default(0),
    total_amount_paid: NumberLikeSchema.optional().default(0),
    total_amount_due: NumberLikeSchema.optional().default(0),
    total_partial_paid: NumberLikeSchema.optional().default(0),
  })
  .passthrough();

export const DashboardGraphSeriesSchema = z
  .object({
    name: z.string(),
    data: z.array(NumberLikeSchema).default([]),
    color: z.string().nullable().optional(),
  })
  .passthrough();

export const DashboardGraphSchema = z
  .object({
    months: z.array(z.string()).default([]),
    series: z.array(DashboardGraphSeriesSchema).default([]),
  })
  .passthrough();

export const DashboardTopDueInvoiceZoneSchema = z
  .object({
    id: NumberLikeSchema,
    name: NullableStringSchema.optional().default(null),
  })
  .passthrough();

export const DashboardTopDueInvoiceClientSchema = z
  .object({
    name: NullableStringSchema.optional().default(null),
    zone: DashboardTopDueInvoiceZoneSchema.nullable().optional(),
  })
  .passthrough();

export const DashboardTopDueInvoiceSchema = z
  .object({
    trackID: NullableStringSchema.optional().default(null),
    total_amount: NumberLikeSchema,
    due_date: NullableStringSchema.optional().default(null),
    status: NullableStringSchema.optional().default(null),
    client: DashboardTopDueInvoiceClientSchema.nullable().optional(),
  })
  .passthrough();

export const DashboardTopDueInvoiceListSchema = z
  .array(DashboardTopDueInvoiceSchema)
  .default([]);

export type DashboardClientCount = z.infer<typeof DashboardClientCountSchema>;
export type DashboardResellerCount = z.infer<typeof DashboardResellerCountSchema>;
export type DashboardInvoiceReport = z.infer<typeof DashboardInvoiceReportSchema>;
export type DashboardGraph = z.infer<typeof DashboardGraphSchema>;
export type DashboardGraphSeries = z.infer<typeof DashboardGraphSeriesSchema>;
export type DashboardTopDueInvoice = z.infer<typeof DashboardTopDueInvoiceSchema>;
export type DashboardTopDueInvoiceClient = z.infer<typeof DashboardTopDueInvoiceClientSchema>;
export type DashboardTopDueInvoiceZone = z.infer<typeof DashboardTopDueInvoiceZoneSchema>;
