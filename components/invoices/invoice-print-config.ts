import { z } from "zod";

export const INVOICE_PRINT_FONT_WEIGHTS = [400, 500, 600, 700, 800, 900] as const;

export type InvoicePrintFontWeight = (typeof INVOICE_PRINT_FONT_WEIGHTS)[number];

export const INVOICE_PRINT_FONT_SIZE = { min: 12, max: 64, default: 28 } as const;

/** Horizontal padding only. Standard is the receipt's existing 16px inset. */
export const INVOICE_PRINT_CONTENT_SPACING = ["comfortable", "standard", "compact", "narrow", "full"] as const;

export type InvoicePrintContentSpacing = (typeof INVOICE_PRINT_CONTENT_SPACING)[number];

export const INVOICE_PRINT_CONTENT_PADDING_X: Record<InvoicePrintContentSpacing, number> = {
    comfortable: 24,
    standard: 16,
    compact: 8,
    narrow: 4,
    full: 0,
};

export const receiptContentPaddingX = (spacing: InvoicePrintContentSpacing): number =>
    INVOICE_PRINT_CONTENT_PADDING_X[spacing];

export const INVOICE_PRINT_FLAG_KEYS = [
    "show_company_name",
    "show_company_address",
    "show_company_phone",
    "show_client_id",
    "show_client_name",
    "show_client_pppoe_id",
    "show_client_phone",
    "show_date_time",
    "show_item_amount_header",
    "show_total_amount_in_words",
    "show_thank_you",
    "show_company_support_number",
] as const;

export type InvoicePrintFlagKey = (typeof INVOICE_PRINT_FLAG_KEYS)[number];

export type InvoicePrintSettings = Record<InvoicePrintFlagKey, boolean> & {
    font_size: number;
    font_weight: InvoicePrintFontWeight;
    content_spacing: InvoicePrintContentSpacing;
};

const flagSchema = z.boolean();

export const InvoicePrintSettingsSchema: z.ZodType<InvoicePrintSettings> = z.object({
    show_company_name: flagSchema,
    show_company_address: flagSchema,
    show_company_phone: flagSchema,
    show_client_id: flagSchema,
    show_client_name: flagSchema,
    show_client_pppoe_id: flagSchema,
    show_client_phone: flagSchema,
    show_date_time: flagSchema,
    show_item_amount_header: flagSchema,
    show_total_amount_in_words: flagSchema,
    show_thank_you: flagSchema,
    show_company_support_number: flagSchema,
    font_size: z.number().int().min(INVOICE_PRINT_FONT_SIZE.min).max(INVOICE_PRINT_FONT_SIZE.max),
    font_weight: z.union([
        z.literal(400),
        z.literal(500),
        z.literal(600),
        z.literal(700),
        z.literal(800),
        z.literal(900),
    ]),
    content_spacing: z.enum(INVOICE_PRINT_CONTENT_SPACING),
});

export const DEFAULT_INVOICE_PRINT_SETTINGS: InvoicePrintSettings = {
    show_company_name: true,
    show_company_address: true,
    show_company_phone: true,
    show_client_id: true,
    show_client_name: true,
    show_client_pppoe_id: true,
    show_client_phone: true,
    show_date_time: true,
    show_item_amount_header: true,
    show_total_amount_in_words: true,
    show_thank_you: true,
    show_company_support_number: true,
    font_size: INVOICE_PRINT_FONT_SIZE.default,
    font_weight: 700,
    content_spacing: "standard",
};

export const receiptLineHeight = (fontSize: number): number =>
    Math.round(fontSize * (36 / 28));
