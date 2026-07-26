-- Fix burger image by updating all menu items that have broken images to a robust Unsplash placeholder
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop'
WHERE image_url IS NOT NULL;

-- Create Coupon table for Owner Coupons Management
CREATE TABLE IF NOT EXISTS billing_coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed a default WELCOME10 coupon
INSERT INTO billing_coupons (code, discount_percentage, is_active)
VALUES ('WELCOME10', 0.10, TRUE)
ON CONFLICT (code) DO NOTHING;
