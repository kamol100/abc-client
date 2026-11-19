-- ISP Referral Partner Program. Proposed MySQL 8.0.16+ DDL for review.
-- Existing dependencies: users, companies, reseller, demo_requests.
-- All amounts are BDT and are stored in poisha (1 BDT = 100 poisha).
-- Populate datetime fields in UTC. Generate public UUIDs in Laravel.

CREATE TABLE referral_sellers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NULL,
    origin_company_id BIGINT UNSIGNED NULL,
    origin_reseller_id BIGINT UNSIGNED NULL,
    display_name VARCHAR(150) NOT NULL,
    seller_type ENUM('tenant_manager', 'reseller', 'independent') NOT NULL,
    code VARCHAR(32) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_referral_sellers_user (user_id),
    UNIQUE KEY uq_referral_sellers_code (code),
    CONSTRAINT fk_referral_sellers_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_referral_sellers_origin_company
        FOREIGN KEY (origin_company_id) REFERENCES companies (id) ON DELETE SET NULL,
    CONSTRAINT fk_referral_sellers_origin_reseller
        FOREIGN KEY (origin_reseller_id) REFERENCES reseller (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE referral_contracts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    seller_id BIGINT UNSIGNED NOT NULL,
    effective_at DATETIME(6) NOT NULL,
    commission_type ENUM('fixed', 'percentage') NOT NULL,
    fixed_amount_minor BIGINT UNSIGNED NULL,
    rate_bps SMALLINT UNSIGNED NULL,
    created_by_user_id BIGINT UNSIGNED NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_referral_contracts_seller_effective (seller_id, effective_at),
    CONSTRAINT fk_referral_contracts_seller
        FOREIGN KEY (seller_id) REFERENCES referral_sellers (id) ON DELETE RESTRICT,
    CONSTRAINT fk_referral_contracts_creator
        FOREIGN KEY (created_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_referral_contracts_commission_terms CHECK (
        (commission_type = 'fixed'
            AND fixed_amount_minor IS NOT NULL AND fixed_amount_minor > 0
            AND rate_bps IS NULL)
        OR
        (commission_type = 'percentage'
            AND fixed_amount_minor IS NULL
            AND rate_bps IS NOT NULL AND rate_bps BETWEEN 1 AND 10000)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE referrals (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    uuid CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
    contract_id BIGINT UNSIGNED NOT NULL,
    demo_request_id BIGINT UNSIGNED NULL,
    prospect_name VARCHAR(200) NOT NULL,
    estimated_sale_minor BIGINT UNSIGNED NULL,
    customer_company_id BIGINT UNSIGNED NULL,
    customer_company_uuid CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    submitted_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    decided_at DATETIME(6) NULL,
    decided_by_user_id BIGINT UNSIGNED NULL,
    decision_note TEXT NULL,
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_referrals_uuid (uuid),
    UNIQUE KEY uq_referrals_demo_request (demo_request_id),
    UNIQUE KEY uq_referrals_customer_company (customer_company_id),
    UNIQUE KEY uq_referrals_customer_uuid (customer_company_uuid),
    KEY ix_referrals_contract_submitted (contract_id, submitted_at),
    KEY ix_referrals_status_submitted (status, submitted_at),
    CONSTRAINT fk_referrals_contract
        FOREIGN KEY (contract_id) REFERENCES referral_contracts (id) ON DELETE RESTRICT,
    CONSTRAINT fk_referrals_demo_request
        FOREIGN KEY (demo_request_id) REFERENCES demo_requests (id) ON DELETE SET NULL,
    CONSTRAINT fk_referrals_customer_company
        FOREIGN KEY (customer_company_id) REFERENCES companies (id) ON DELETE SET NULL,
    CONSTRAINT fk_referrals_reviewer
        FOREIGN KEY (decided_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_referrals_decision_time CHECK (
        (status = 'pending' AND decided_at IS NULL)
        OR
        (status IN ('approved', 'rejected') AND decided_at IS NOT NULL)
    ),
    CONSTRAINT chk_referrals_approved_customer CHECK (
        status <> 'approved' OR customer_company_uuid IS NOT NULL
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE referral_commissions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    referral_id BIGINT UNSIGNED NOT NULL,
    approved_sale_minor BIGINT UNSIGNED NOT NULL,
    amount_minor BIGINT UNSIGNED NOT NULL,
    earned_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_referral_commissions_referral (referral_id),
    CONSTRAINT fk_referral_commissions_referral
        FOREIGN KEY (referral_id) REFERENCES referrals (id) ON DELETE RESTRICT,
    CONSTRAINT chk_referral_commissions_sale CHECK (approved_sale_minor > 0),
    CONSTRAINT chk_referral_commissions_amount CHECK (amount_minor > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE referral_payouts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    commission_id BIGINT UNSIGNED NOT NULL,
    amount_minor BIGINT UNSIGNED NOT NULL,
    method VARCHAR(32) NOT NULL,
    transfer_reference VARCHAR(100) NOT NULL,
    paid_at DATETIME(6) NOT NULL,
    recorded_by_user_id BIGINT UNSIGNED NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uq_referral_payouts_commission (commission_id),
    KEY ix_referral_payouts_transfer (method, transfer_reference),
    CONSTRAINT fk_referral_payouts_commission
        FOREIGN KEY (commission_id) REFERENCES referral_commissions (id) ON DELETE RESTRICT,
    CONSTRAINT fk_referral_payouts_recorder
        FOREIGN KEY (recorded_by_user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_referral_payouts_amount CHECK (amount_minor > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Laravel transaction rules:
-- 1. On referral submission, require an active seller and select their latest
--    contract with effective_at at or before submitted_at. Contract versions are insert-only.
-- 2. When attributing a company, write its id and UUID together. Validate
--    that the company matches the demo request when demo_request_id is present.
--    New demo attribution must be made before the demo provisions a company.
-- 3. Lock the pending referral before approval. Validate the new tenant,
--    reject self-referrals, and write status + commission in one transaction.
--    Round the percentage once to the nearest poisha, half up. Reject an
--    approval whose final commission rounds down to zero.
-- 4. On payout, lock the commission and copy its amount.
--    Record a completed transfer before inserting the payout row.
-- 5. Tenant purge must explicitly detach affected live FKs and deactivate
--    affected sellers because the existing purge disables FK handling.
--    Keep customer_company_uuid, contract versions, commissions, and payouts.
