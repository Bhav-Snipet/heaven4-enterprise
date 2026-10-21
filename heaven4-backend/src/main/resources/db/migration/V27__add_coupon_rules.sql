-- Migration V27: Add rule fields to billing_coupons table
ALTER TABLE billing_coupons ADD COLUMN IF NOT EXISTS min_order_amount DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE billing_coupons ADD COLUMN IF NOT EXISTS max_discount_amount DECIMAL(10,2);
ALTER TABLE billing_coupons ADD COLUMN IF NOT EXISTS usage_limit_per_customer INT DEFAULT 1;
ALTER TABLE billing_coupons ADD COLUMN IF NOT EXISTS total_usage_limit INT;
ALTER TABLE billing_coupons ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP;
ALTER TABLE billing_coupons ADD COLUMN IF NOT EXISTS description VARCHAR(255);

-- Update existing default coupons with sensible standard rules
UPDATE billing_coupons
SET min_order_amount = 25.00,
    max_discount_amount = 20.00,
    usage_limit_per_customer = 1,
    valid_until = '2026-12-31 23:59:59',
    description = '20% off on orders above $25.00 (Max discount $20.00)'
WHERE code = 'WELCOME20';

UPDATE billing_coupons
SET min_order_amount = 40.00,
    max_discount_amount = 35.00,
    usage_limit_per_customer = 2,
    valid_until = '2026-12-31 23:59:59',
    description = 'VIP Gold 15% off on orders above $40.00 (Max discount $35.00)'
WHERE code = 'VIPGOLD15';

UPDATE billing_coupons
SET min_order_amount = 15.00,
    max_discount_amount = 10.00,
    usage_limit_per_customer = 1,
    valid_until = '2026-12-31 23:59:59',
    description = 'Heaven signature 10% off on all orders above $15.00'
WHERE code = 'HEAVEN10';
