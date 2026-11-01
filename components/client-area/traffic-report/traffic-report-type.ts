import { z } from "zod";

const UsageFigureSchema = z.object({
  upload_bytes: z.number(),
  download_bytes: z.number(),
  total_bytes: z.number(),
  from: z.string(),
  to: z.string(),
  available: z.boolean(),
  complete: z.boolean(),
});

export const TrafficReportRowSchema = z.object({
  usage_date: z.string(),
  upload_bytes: z.number(),
  download_bytes: z.number(),
  total_bytes: z.number(),
});

export const TrafficReportSchema = z.object({
  timezone: z.string(),
  collected: z.boolean(),
  collected_from: z.string().nullable(),
  summaries: z.object({
    this_week: UsageFigureSchema,
    this_month: UsageFigureSchema,
    last_month: UsageFigureSchema,
  }),
  period: UsageFigureSchema,
  series: z.array(TrafficReportRowSchema),
  data: z.array(TrafficReportRowSchema),
  pagination: z.object({
    total: z.number(),
    count: z.number(),
    per_page: z.number(),
    current_page: z.number(),
    total_pages: z.number(),
  }),
});

export type UsageFigure = z.infer<typeof UsageFigureSchema>;
export type TrafficReportRow = z.infer<typeof TrafficReportRowSchema>;
export type TrafficReport = z.infer<typeof TrafficReportSchema>;
