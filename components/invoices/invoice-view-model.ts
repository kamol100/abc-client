import { toNumber } from "@/lib/helper/helper";
import type { Language } from "@/lib/i18n/languages";

export type InvoiceViewLine = {
    key: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    amount: number;
};

export type InvoiceViewModel = {
    invoiceNumber: string;
    invoiceDate: string | null;
    dueDate: string | null;
    invoiceType: string | null;
    status: string | null;
    note: string | null;
    merchantName: string | null;
    merchantAddress: string | null;
    merchantPhone: string | null;
    merchantLogoUrl: string | null;
    customerName: string | null;
    customerCode: string | null;
    customerAddress: string | null;
    customerPhone: string | null;
    customerZone: string | null;
    lines: InvoiceViewLine[];
    totalQuantity: number;
    subTotal: number;
    lineDiscount: number;
    discount: number;
    amountPaid: number;
    amountDue: number;
    total: number;
    /** What the client still holds in the wallet, when the API sent it; 0 otherwise. */
    advanceInHand: number;
    paymentMethod: string | null;
    paymentDate: string | null;
    transactionId: string | null;
    reference: string | null;
    partialAmount: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const readString = (record: Record<string, unknown> | null, key: string): string | null => {
    if (!record) return null;
    const value = record[key];
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return null;
};

const readNote = (record: Record<string, unknown>): string | null => {
    const value = record.note;
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const formatInvoiceDate = (value: string | null): string | null => {
    if (!value) return null;
    const isoDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!isoDate) return value;
    return `${isoDate[3]}-${isoDate[2]}-${isoDate[1]}`;
};

const readLines = (record: Record<string, unknown>): unknown[] => {
    if (Array.isArray(record.lines)) return record.lines;
    if (Array.isArray(record.invoice_lines)) return record.invoice_lines;
    if (Array.isArray(record.invoiceLines)) return record.invoiceLines;
    return [];
};

const asNumberInput = (value: unknown): number | string | null | undefined => {
    if (typeof value === "number" || typeof value === "string" || value == null) return value;
    return null;
};

const readLine = (value: unknown, index: number): InvoiceViewLine | null => {
    if (!isRecord(value)) return null;
    const description = readString(value, "description") ?? "—";
    const quantityValue = value.quantity;
    const quantity = quantityValue == null || quantityValue === ""
        ? 1
        : Math.max(0, Math.trunc(toNumber(asNumberInput(quantityValue))));
    const unitPrice = toNumber(asNumberInput(value.amount));
    const discount = toNumber(asNumberInput(value.discount));
    const hasTotal = value.total_amount != null && value.total_amount !== "";
    const amount = hasTotal
        ? toNumber(asNumberInput(value.total_amount))
        : Math.max(unitPrice * quantity - discount, 0);
    const key = readString(value, "uuid") ?? `${description}-${index}`;

    return { key, description, quantity, unitPrice, discount, amount };
};

const firstString = (...values: Array<string | null>): string | null => {
    for (const value of values) {
        if (value) return value;
    }
    return null;
};

const invoiceNumberFormat = (language: Language): Intl.NumberFormat =>
    new Intl.NumberFormat(language === "bn" ? "bn-BD" : "en", {
        numberingSystem: language === "bn" ? "beng" : "latn",
        minimumFractionDigits: 0,
    });

export const formatInvoiceAmount = (value: number, language: Language = "en"): string =>
    `${invoiceNumberFormat(language).format(value)}৳`;

export const formatInvoiceCount = (value: number, language: Language = "en"): string =>
    invoiceNumberFormat(language).format(value);

const BENGALI_DIGITS = "০১২৩৪৫৬৭৮৯";

/** Translate digits in an identifier. Grouping would change the code. */
export const formatInvoiceDigits = (value: string, language: Language = "en"): string => {
    if (language !== "bn") return value;
    return value.replace(/\d/g, (digit) => BENGALI_DIGITS[Number(digit)] ?? digit);
};

export const buildInvoiceViewModel = (
    source: unknown,
    settings: Record<string, unknown> = {},
    logoUrl: string | null = null,
): InvoiceViewModel | null => {
    if (!isRecord(source)) return null;

    const client = isRecord(source.client) ? source.client : null;
    const reseller = isRecord(source.reseller) ? source.reseller : null;
    // A reseller invoice has no client: the reseller it is billed to is the customer.
    const billedReseller = isRecord(source.bill_to) && source.bill_to.type === "reseller" ? source.bill_to : null;
    // Sent with a reseller's own bills: the company or parent reseller that issued the invoice.
    const issuer = isRecord(source.issuer) ? source.issuer : null;
    const zone = isRecord(source.zone) ? source.zone : null;
    const invoiceType = isRecord(source.invoice_type) ? source.invoice_type : null;
    const fund = isRecord(source.fund) ? source.fund : null;
    // A bill that used the client's advance is saved with the advance taken off its
    // amounts, as a minus line. It is shown the usual way: the full bill, with the
    // advance counted as paid. The minus line is not an item.
    const advance = Math.max(toNumber(asNumberInput(source.advance_amount)), 0);
    const lines = readLines(source).flatMap((line, index) => {
        const parsed = readLine(line, index);
        if (!parsed || (advance > 0 && parsed.amount < 0)) return [];
        return [parsed];
    });

    const invoiceNumber = readString(source, "trackID");
    const hasIdentity = Boolean(
        invoiceNumber
        || readString(source, "id")
        || readString(source, "uuid")
        || client
        || lines.length > 0,
    );
    if (!hasIdentity) return null;

    const subTotal = toNumber(asNumberInput(source.total_amount)) + advance;
    const discount = toNumber(asNumberInput(source.discount));
    const lineDiscount = toNumber(asNumberInput(source.line_total_discount));
    const explicitTotal = asNumberInput(source.after_discount_amount);
    const total = explicitTotal == null || explicitTotal === ""
        ? Math.max(subTotal - discount - lineDiscount, 0)
        : toNumber(explicitTotal) + advance;
    const amountPaid = toNumber(asNumberInput(source.amount_paid)) + advance;
    const amountDue = source.amount_due == null
        ? Math.max(total - amountPaid, 0)
        : toNumber(asNumberInput(source.amount_due));

    const settingsAddress = firstString(
        readString(settings, "company_address"),
        readString(settings, "address"),
    );
    const settingsPhone = firstString(
        readString(settings, "company_phone"),
        readString(settings, "phone"),
    );

    return {
        invoiceNumber: invoiceNumber ?? "—",
        invoiceDate: formatInvoiceDate(readString(source, "create_date")),
        dueDate: formatInvoiceDate(readString(source, "due_date")),
        invoiceType: readString(invoiceType, "name"),
        status: readString(source, "status"),
        note: readNote(source),
        merchantName: firstString(
            readString(issuer, "name"),
            readString(reseller, "company"),
            readString(settings, "company"),
            readString(reseller, "name"),
        ),
        merchantAddress: issuer
            ? readString(issuer, "address")
            : firstString(readString(reseller, "company_address"), settingsAddress),
        merchantPhone: issuer ? readString(issuer, "phone") : firstString(
            readString(reseller, "company_phone"),
            settingsPhone,
            readString(reseller, "phone"),
        ),
        merchantLogoUrl: logoUrl,
        customerName: firstString(readString(client, "name"), readString(billedReseller, "name")),
        customerCode: readString(client, "sid"),
        customerAddress: firstString(readString(client, "current_address"), readString(billedReseller, "address")),
        customerPhone: firstString(readString(client, "phone"), readString(billedReseller, "phone")),
        customerZone: readString(zone, "name"),
        lines,
        totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
        subTotal,
        lineDiscount,
        discount,
        amountPaid,
        amountDue,
        total,
        advanceInHand: Math.max(toNumber(asNumberInput(source.wallet_balance)), 0),
        paymentMethod: readString(fund, "name"),
        paymentDate: formatInvoiceDate(readString(source, "payment_date")),
        transactionId: readString(source, "transaction_id"),
        reference: readString(source, "reference"),
        partialAmount: toNumber(asNumberInput(source.partial_amount)),
    };
};
