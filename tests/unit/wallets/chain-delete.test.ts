import { describe, expect, it } from "vitest";
import {
    chainDeleteDueAgainInvoice,
    chainDeleteEntries,
    isChainDeleteConfirmed,
} from "@/components/wallets/chain-delete";
import { FundTransactionRowSchema } from "@/components/fund-transactions/fund-transaction-type";
import { LinkedPaymentChainSchema, WalletTransactionRowSchema } from "@/components/wallets/wallet-type";
import bn from "@/public/lang/bn.json";
import en from "@/public/lang/en.json";

const recharge = LinkedPaymentChainSchema.parse({
    source: "wallet_recharge",
    amount: 600,
    payment: "PAY-1",
    invoice: "INV-1",
    invoice_deleted: true,
    fund: "cash",
});

const paidFromWallet = LinkedPaymentChainSchema.parse({
    source: "wallet",
    amount: 500,
    payment: "PAY-2",
    invoice: "INV-2",
    invoice_deleted: false,
    fund: null,
});

describe("Linked delete confirmation", () => {
    // অগ্রিম পেমেন্টের লেনদেন মুছলে invoice, payment, fund লেনদেন ও wallet লেনদেন চারটিই তালিকায় আসে কি না যাচাই করি।
    it("Advance payment transaction: lists the invoice, payment, fund transaction and wallet transaction", () => {
        const entries = chainDeleteEntries(recharge);

        expect(entries.map((entry) => entry.key)).toEqual([
            "invoice",
            "payment",
            "fund_transaction",
            "wallet_transaction",
        ]);
        expect(entries[0]?.values.id).toBe("INV-1");
        expect(entries[1]?.values.id).toBe("PAY-1");
        expect(entries[2]?.values.fund).toBe("cash");
        expect(entries[3]?.effect).toBe("wallet.chain_delete.effects.wallet_decrease");
        expect(chainDeleteDueAgainInvoice(recharge)).toBeNull();
    });

    // Wallet থেকে পরিশোধ হওয়া বিলের লেনদেন মুছলে শুধু payment ও wallet লেনদেন মুছে, invoice আবার due হয় কি না যাচাই করি।
    it("Bill paid from wallet: lists the payment and wallet transaction and keeps the invoice as due again", () => {
        const entries = chainDeleteEntries(paidFromWallet);

        expect(entries.map((entry) => entry.key)).toEqual(["payment", "wallet_transaction"]);
        expect(entries[1]?.effect).toBe("wallet.chain_delete.effects.wallet_increase");
        expect(chainDeleteDueAgainInvoice(paidFromWallet)).toBe("INV-2");
    });

    // বিলের অগ্রিম সমন্বয়ের wallet লেনদেন মুছলে কোনো payment থাকে না, শুধু wallet লেনদেন মুছে আর বিল আবার বকেয়া হয় কি না যাচাই করি।
    it("Advance taken for a bill: lists only the wallet transaction and keeps the invoice as due again", () => {
        const advance = LinkedPaymentChainSchema.parse({
            source: "wallet",
            amount: 1400,
            payment: null,
            invoice: "INV-3",
            invoice_deleted: false,
            fund: null,
        });
        const entries = chainDeleteEntries(advance);

        expect(entries.map((entry) => entry.key)).toEqual(["wallet_transaction"]);
        expect(entries[0]?.effect).toBe("wallet.chain_delete.effects.wallet_increase");
        expect(chainDeleteDueAgainInvoice(advance)).toBe("INV-3");
    });

    // সাধারণ বিল payment-এর fund লেনদেন মুছলে payment ও fund লেনদেন তালিকায় আসে, wallet লেনদেন আসে না, আর বিল আবার বকেয়া হয় কি না যাচাই করি।
    it("Fund transaction of an ordinary bill payment: lists the payment and fund transaction, no wallet transaction", () => {
        const billPayment = LinkedPaymentChainSchema.parse({
            source: null,
            amount: 500,
            payment: "PAY-9",
            invoice: "INV-9",
            invoice_deleted: false,
            fund: "cash",
            wallet: false,
        });
        const entries = chainDeleteEntries(billPayment);

        expect(entries.map((entry) => entry.key)).toEqual(["payment", "fund_transaction"]);
        expect(entries[0]?.values.id).toBe("PAY-9");
        expect(entries[1]?.effect).toBe("wallet.chain_delete.effects.fund_decrease");
        expect(chainDeleteDueAgainInvoice(billPayment)).toBe("INV-9");
    });

    // OK লিখলেই কেবল delete অনুমতি পায় কি না যাচাই করি।
    it("Confirm word: allows the delete only after OK is typed", () => {
        expect(isChainDeleteConfirmed("OK")).toBe(true);
        expect(isChainDeleteConfirmed(" ok ")).toBe(true);
        expect(isChainDeleteConfirmed("")).toBe(false);
        expect(isChainDeleteConfirmed("O")).toBe(false);
        expect(isChainDeleteConfirmed("OKAY")).toBe(false);
    });

    // API থেকে আসা linked তথ্য wallet ও fund লেনদেনের row-তে ঠিকভাবে পড়া হয় কি না যাচাই করি।
    it("Transaction rows: keep the linked entries sent by the API", () => {
        const walletRow = WalletTransactionRowSchema.parse({
            id: "wt-1",
            transaction_id: 1,
            amount: 600,
            transaction_type: "deposit",
            linked: recharge,
        });
        const fundRow = FundTransactionRowSchema.parse({
            id: 1,
            amount: 600,
            transaction_type: "deposit",
            linked: null,
        });

        expect(walletRow.linked?.payment).toBe("PAY-1");
        expect(fundRow.linked).toBeNull();
    });

    // Delete confirmation-এর সব লেখা ইংরেজি ও বাংলা দুই ফাইলেই আছে কি না যাচাই করি।
    it("Linked delete labels: exist in both English and Bangla", () => {
        for (const lang of [en, bn]) {
            const text = lang.wallet.chain_delete;
            expect(text.description).toBeTruthy();
            expect(text.entries.invoice).toContain("{{id}}");
            expect(text.entries.payment).toContain("{{id}}");
            expect(text.entries.fund_transaction).toContain("{{fund}}");
            expect(text.entries.wallet_transaction).toBeTruthy();
            expect(text.effects.fund_decrease).toContain("{{amount}}");
            expect(text.effects.wallet_decrease).toContain("{{amount}}");
            expect(text.effects.wallet_increase).toContain("{{amount}}");
            expect(text.invoice_due_again).toContain("{{id}}");
            expect(text.confirm_label).toContain("{{word}}");
            expect(lang.wallet.transaction_delete_confirmation).toBeTruthy();
        }
    });
});
