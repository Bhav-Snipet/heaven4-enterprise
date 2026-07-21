-- =====================================================
-- Heaven4 Enterprise — V13: System Upgrade Schema & Seed
-- =====================================================

-- 1. Add image to truffle mayo burger
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1594212202868-45e95454b6fc?q=80&w=2000&auto=format&fit=crop'
WHERE description ILIKE '%truffle mayo%';

-- 2. Add password support for staff
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- 3. Add discount support to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0.00;

-- 4. Seed sample staff users with passwords
-- Password for all sample users will be "password123" (BCrypt hash)
-- Hash generated for "password123": $2a$10$wO/.g1p80xH/8y5e2pW3M.O5n0Zf3w41y2F045T6Uu62c7R6U5bCq

-- Employee
INSERT INTO users (phone_number, first_name, last_name, password_hash)
VALUES ('emp001', 'John', 'Employee', '$2a$10$wO/.g1p80xH/8y5e2pW3M.O5n0Zf3w41y2F045T6Uu62c7R6U5bCq')
ON CONFLICT (phone_number) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO user_roles (user_id, role, workspace)
SELECT id, 'EMPLOYEE', 'EMPLOYEE' FROM users WHERE phone_number = 'emp001'
ON CONFLICT DO NOTHING;

-- Chef
INSERT INTO users (phone_number, first_name, last_name, password_hash)
VALUES ('chef001', 'Gordon', 'Ramsay', '$2a$10$wO/.g1p80xH/8y5e2pW3M.O5n0Zf3w41y2F045T6Uu62c7R6U5bCq')
ON CONFLICT (phone_number) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO user_roles (user_id, role, workspace)
SELECT id, 'KITCHEN', 'KITCHEN' FROM users WHERE phone_number = 'chef001'
ON CONFLICT DO NOTHING;

-- Manager
INSERT INTO users (phone_number, first_name, last_name, password_hash)
VALUES ('mgr001', 'Sarah', 'Manager', '$2a$10$wO/.g1p80xH/8y5e2pW3M.O5n0Zf3w41y2F045T6Uu62c7R6U5bCq')
ON CONFLICT (phone_number) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO user_roles (user_id, role, workspace)
SELECT id, 'MANAGER', 'MANAGER' FROM users WHERE phone_number = 'mgr001'
ON CONFLICT DO NOTHING;

-- Admin 1
INSERT INTO users (phone_number, first_name, last_name, password_hash)
VALUES ('admin001', 'Alice', 'Admin', '$2a$10$wO/.g1p80xH/8y5e2pW3M.O5n0Zf3w41y2F045T6Uu62c7R6U5bCq')
ON CONFLICT (phone_number) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO user_roles (user_id, role, workspace)
SELECT id, 'ADMIN', 'ADMIN' FROM users WHERE phone_number = 'admin001'
ON CONFLICT DO NOTHING;

-- Admin 2
INSERT INTO users (phone_number, first_name, last_name, password_hash)
VALUES ('admin002', 'Bob', 'Admin', '$2a$10$wO/.g1p80xH/8y5e2pW3M.O5n0Zf3w41y2F045T6Uu62c7R6U5bCq')
ON CONFLICT (phone_number) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO user_roles (user_id, role, workspace)
SELECT id, 'ADMIN', 'ADMIN' FROM users WHERE phone_number = 'admin002'
ON CONFLICT DO NOTHING;
