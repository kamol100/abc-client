const maxMinor = 999_999_999_999;
const bengaliDigits = "০১২৩৪৫৬৭৮৯";

export function parseReferralDecimal(value: unknown, limit = maxMinor): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).trim().replace(/[০-৯]/g, (digit) => String(bengaliDigits.indexOf(digit)));
  const match = /^(\d{1,10})(?:\.(\d{1,2}))?$/.exec(text);
  if (!match) return null;

  const [, whole, fraction = ""] = match;
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return minor > 0 && minor <= limit ? minor : null;
}

export function previewCommission(sale: number, terms: { fixed_amount_minor: number | null; rate_bps: number | null }): number | null {
  if (terms.fixed_amount_minor !== null) return terms.fixed_amount_minor;
  if (terms.rate_bps === null) return null;
  return Number((BigInt(sale) * BigInt(terms.rate_bps) + BigInt(5000)) / BigInt(10_000));
}

export function referralMoney(minor: number, language: string): string {
  return "৳" + new Intl.NumberFormat(language.startsWith("bn") ? "bn-BD" : "en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(minor / 100);
}
