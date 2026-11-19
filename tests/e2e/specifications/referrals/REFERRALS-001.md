# REFERRALS-001 — ISP referral acceptance

Use the [implementation workflow and API contract](../../../../.ai/features/referrals/README.md) for detailed behavior. Run the [disposable referral suite](../../referrals/README.md) for browser evidence.

## Browser scenarios

- RF-008-E01 [P0] Enroll tenant-manager, reseller and independent sellers, validate unique codes and contract values, and verify their separate authenticated referral panels.
- RF-008-E02 [P0] Submit a referred public demo, provision the tenant, confirm Pending persists, approve the sale, verify the payable commission, and record and verify the completed payout.
- RF-008-E03 [P0] Submit a fixed-rate direct referral, change the seller's current agreement, and verify the original commission plus the rejection path.
- RF-008-E04 [P0] Retry approval and payout and verify duplicate or conflicting attempts leave a single ledger result.
- RF-008-E05 [P0] Check anonymous, cross-seller, reseller-peer, unrelated company and restricted platform visibility and authorization. Verify an identity change in the same browser leaves only the new account's data.
- RF-008-E06 [P1] Check desktop and mobile, English and Bangla, light and dark, keyboard use, transient list errors and retries, and public demo submission after clearing a rejected code.
