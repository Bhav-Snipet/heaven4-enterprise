-- Heaven4 Enterprise — V20: Block Users, Points Transactions, Restore Images

-- 1. Add blocked status to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- 2. Unblock Requests
CREATE TABLE IF NOT EXISTS unblock_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Points Transactions (if not exists)
CREATE TABLE IF NOT EXISTS points_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- EARNED, SPENT, ADJUSTED
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Restore menu item images logically instead of all being burgers
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&auto=format&fit=crop' WHERE category_id = 1; -- Burgers
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop' WHERE category_id = 2; -- Pizzas
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&auto=format&fit=crop' WHERE category_id = 3; -- Drinks
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&auto=format&fit=crop' WHERE category_id = 4; -- Desserts
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop' WHERE category_id > 4; -- Others
