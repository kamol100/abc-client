import { describe, expect, it } from "vitest";
import { parseReferralDecimal, previewCommission, referralMoney } from "@/components/referrals/referral-amount";
import {
  approvalFormSchema, assistedReferralSchema, contractFormSchema, payoutFormSchema, referralCaptureSchema,
} from "@/components/referrals/referral-form-schema";
import { buildDemoRequestSchema } from "@/lib/validations/demo-request-schema";

describe("RF-007-T01 · BDT amounts and contracts", () => {
  // রেফারেল ও সেলার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «parses BDT precisely, including Bangla digits and the API limit»।
  it("Referral form: parses BDT precisely, including Bangla digits and the API limit", () => {
    expect(parseReferralDecimal("1250.30")).toBe(125030);
    expect(parseReferralDecimal("০.০১")).toBe(1);
    expect(parseReferralDecimal("9999999999.99")).toBe(999999999999);
    for (const invalid of ["", "0", "-1", "1.001", "1e3", "10000000000", "2,000"]) {
      expect(parseReferralDecimal(invalid)).toBeNull();
    }
    expect(referralMoney(200000, "en")).toBe("৳2,000");
    expect(referralMoney(200000, "bn")).toContain("২,০০০");
  });

  // রেফারেল ও সেলার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «validates each contract branch and sends exactly one set of terms»।
  it("Referral form: validates each contract branch and sends exactly one set of terms", () => {
    const effective_at = new Date("2026-11-18T00:00:00Z");
    expect(contractFormSchema.parse({
      effective_at, commission_type: "fixed", fixed_amount_minor: "500.10", rate_bps: "10",
    })).toEqual({ effective_at: effective_at.toISOString(), commission_type: "fixed", fixed_amount_minor: 50010 });
    expect(contractFormSchema.parse({
      effective_at, commission_type: "percentage", rate_bps: "10.25", fixed_amount_minor: "500",
    })).toEqual({ effective_at: effective_at.toISOString(), commission_type: "percentage", rate_bps: 1025 });
    expect(contractFormSchema.safeParse({ effective_at, commission_type: "percentage", rate_bps: "100.01" }).success).toBe(false);
    expect(contractFormSchema.safeParse({ effective_at, commission_type: "fixed", fixed_amount_minor: "" }).success).toBe(false);
  });

  // রেফারেল ও সেলার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «previews the agreed sale with exact half-up rounding and fixed terms»।
  it("Referral form: previews the agreed sale with exact half-up rounding and fixed terms", () => {
    expect(previewCommission(2000000, { fixed_amount_minor: null, rate_bps: 1000 })).toBe(200000);
    expect(previewCommission(1, { fixed_amount_minor: null, rate_bps: 5000 })).toBe(1);
    expect(previewCommission(999999999999, { fixed_amount_minor: null, rate_bps: 10000 })).toBe(999999999999);
    expect(previewCommission(2000000, { fixed_amount_minor: 100000, rate_bps: null })).toBe(100000);
    expect(approvalFormSchema.parse({ approved_sale_minor: "20000", decision_note: "" })).toEqual({ approved_sale_minor: 2000000, decision_note: undefined });
  });

  // রেফারেল ও সেলার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «validates transfer fields and omits a caller-supplied amount»।
  it("Referral form: validates transfer fields and omits a caller-supplied amount", () => {
    const paid_at = new Date("2020-01-01");
    expect(payoutFormSchema.parse({ method: "bank", transfer_reference: " R-1 ", paid_at, amount_minor: 1 }))
      .toEqual({ method: "bank", transfer_reference: "R-1", paid_at: paid_at.toISOString() });
    expect(payoutFormSchema.safeParse({ method: "bank", transfer_reference: "R", paid_at: new Date("2099-01-01") }).success).toBe(false);
  });
});

describe("RF-007-T02/T03 · attribution and authority fields", () => {
  // রেফারেল ও সেলার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «allows a direct referral without an estimate and removes authority fields»।
  it("Referral form: allows a direct referral without an estimate and removes authority fields", () => {
    expect(referralCaptureSchema.parse({ prospect_name: " River ISP ", estimated_sale_minor: "", seller_id: 12, customer_company_id: 2, status: "paid" }))
      .toEqual({ prospect_name: "River ISP", estimated_sale_minor: undefined });
    expect(assistedReferralSchema.parse({ demo_request_id: "21", referral_code: "RF-DEMO" }).demo_request_id).toBe(21);
    expect(assistedReferralSchema.safeParse({ prospect_name: "", referral_code: "RF-DEMO" }).success).toBe(false);
  });

  // রেফারেল ও সেলার যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «accepts an omitted, empty, or valid public referral code and rejects a malformed one»।
  it("Referral form: accepts an omitted, empty, or valid public referral code and rejects a malformed one", () => {
    const demo = {
      full_name: "Contact", isp_name: "ISP", website: "", phone: "01711111111",
      whatsapp: "01811111111", user_count: "", office_address: "", terms_accepted: true,
    };
    const schema = buildDemoRequestSchema((key) => key);
    expect(schema.safeParse(demo).success).toBe(true);
    expect(schema.safeParse({ ...demo, referral_code: "" }).success).toBe(true);
    expect(schema.safeParse({ ...demo, referral_code: "RF-OK" }).success).toBe(true);
    expect(schema.safeParse({ ...demo, referral_code: "bad code" }).success).toBe(false);
  });
});
