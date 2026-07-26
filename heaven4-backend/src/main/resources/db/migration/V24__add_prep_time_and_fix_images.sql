-- V24: Prep time, Waiter calls table, Double Truffle burger image fix

-- 1. Add prep_time_minutes column to menu_items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS prep_time_minutes INT NOT NULL DEFAULT 15;

-- 2. Fix Double Truffle Burger image (id = 2)
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800&auto=format&fit=crop'
WHERE id = 2;

-- 3. Create waiter_calls table
CREATE TABLE IF NOT EXISTS waiter_calls (
    id BIGSERIAL PRIMARY KEY,
    table_number VARCHAR(20) NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    attended_at TIMESTAMP WITH TIME ZONE,
    attended_by VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_waiter_calls_status ON waiter_calls(status);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_table ON waiter_calls(table_number);
