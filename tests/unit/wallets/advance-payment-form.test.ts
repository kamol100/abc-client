import { describe, expect, it } from "vitest";
import { SMS_TEMPLATE_TOKENS, SMS_TEMPLATE_TYPES } from "@/components/sms-templates/sms-template-type";
import { ClientWalletRechargeFormSchema } from "@/components/wallets/wallet-type";
import bn from "@/public/lang/bn.json";
import en from "@/public/lang/en.json";

const valid = { clientUuid: "client-uuid", balance: 500, fund_id: 3, confirmation_sms: 1, note: "Paid at office" };

describe("Advance payment form", () => {
    // অগ্রিম পেমেন্ট ফর্মে amount, fund, SMS ও note ঠিক থাকলে ফর্ম গ্রহণ হয় কি না যাচাই করি।
    it("Advance payment form: accepts an amount, a fund, the SMS choice and a note", () => {
        const parsed = ClientWalletRechargeFormSchema.safeParse(valid);

        expect(parsed.success).toBe(true);
        expect(parsed.data).toMatchObject({ balance: 500, fund_id: 3, confirmation_sms: 1 });
    });

    // Fund না বাছলে ফর্ম আটকে যায় এবং fund ফিল্ডে ত্রুটি দেখায় কি না যাচাই করি।
    it("Advance payment form - no fund chosen: shows the fund required error", () => {
        const parsed = ClientWalletRechargeFormSchema.safeParse({ ...valid, fund_id: 0 });

        expect(parsed.success).toBe(false);
        expect(parsed.error?.issues[0]).toMatchObject({
            path: ["fund_id"],
            message: "wallet.fund.errors.required",
        });
    });

    // Fund ফাঁকা (undefined/null/খালি) থাকলে 0 না দেখিয়ে fund required ত্রুটি দেখায় কি না যাচাই করি।
    it("Advance payment form - fund left empty: shows the fund required error", () => {
        for (const empty of [undefined, null, ""]) {
            const parsed = ClientWalletRechargeFormSchema.safeParse({ ...valid, fund_id: empty });

            expect(parsed.success).toBe(false);
            expect(parsed.error?.issues[0]).toMatchObject({
                path: ["fund_id"],
                message: "wallet.fund.errors.required",
            });
        }
    });

    // Amount শূন্য হলে ফর্ম আটকে যায় কি না যাচাই করি।
    it("Advance payment form - zero amount: shows the amount minimum error", () => {
        const parsed = ClientWalletRechargeFormSchema.safeParse({ ...valid, balance: 0 });

        expect(parsed.success).toBe(false);
        expect(parsed.error?.issues[0]?.message).toBe("wallet.amount.errors.min");
    });

    // SMS না বাছলে ডিফল্টভাবে SMS বন্ধ (0) থাকে কি না যাচাই করি।
    it("Advance payment form - SMS choice left out: defaults to no SMS", () => {
        const { confirmation_sms: _omitted, ...withoutSms } = valid;
        const parsed = ClientWalletRechargeFormSchema.safeParse(withoutSms);

        expect(parsed.data?.confirmation_sms).toBe(0);
    });

    // নতুন লেবেল ও ফিল্ডের অনুবাদ ইংরেজি ও বাংলা দুই ফাইলেই আছে কি না যাচাই করি।
    it("Advance payment labels: exist in both English and Bangla", () => {
        for (const lang of [en, bn]) {
            expect(lang.client.actions.advance_payment).toBeTruthy();
            expect(lang.wallet.advance_payment_title).toBeTruthy();
            expect(lang.wallet.fund.label).toBeTruthy();
            expect(lang.wallet.fund.errors.required).toBeTruthy();
            expect(lang.wallet.confirmation_sms.label).toBeTruthy();
            expect(lang.payment.paid_from_wallet).toBeTruthy();
            expect(lang.payment.wallet_source).toBeTruthy();
            expect(lang.sms_template.template_type.options.wallet_recharge).toBeTruthy();
        }
        expect(en.client.actions.advance_payment).toBe("Advance Payment");
    });

    // SMS template-এ wallet recharge টাইপ ও wallet balance টোকেন বাছা যায় কি না যাচাই করি।
    it("SMS templates: offer the wallet recharge type and the wallet balance token", () => {
        expect(SMS_TEMPLATE_TYPES).toContain("wallet_recharge");
        expect(SMS_TEMPLATE_TOKENS).toContain("{{wallet_balance}}");
    });
});
