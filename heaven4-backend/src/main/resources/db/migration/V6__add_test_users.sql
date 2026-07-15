-- =====================================================
-- Heaven4 Enterprise — V6: Test Users Setup
-- =====================================================
-- Inserts standard test users for all workspaces

-- 1. Insert Users (if they don't exist, though phone numbers are UNIQUE)
INSERT INTO users (phone_number, first_name, last_name, created_by)
VALUES 
('7020875435', 'Test', 'Customer', 'MIGRATION'),
('1234567890', 'Test', 'Manager', 'MIGRATION'),
('70208785435', 'Test', 'Admin', 'MIGRATION'),
('1111111111', 'Test', 'Owner', 'MIGRATION'),
('2222222222', 'Test', 'Kitchen', 'MIGRATION'),
('3333333333', 'Test', 'Employee', 'MIGRATION')
ON CONFLICT (phone_number) DO NOTHING;

-- 2. Insert User Roles
-- Customer
INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'CUSTOMER', 'CUSTOMER', 'MIGRATION' FROM users WHERE phone_number = '7020875435'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;

-- Manager
INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'MANAGER', 'MANAGER', 'MIGRATION' FROM users WHERE phone_number = '1234567890'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;

-- Admin
INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'ADMIN', 'ADMIN', 'MIGRATION' FROM users WHERE phone_number = '70208785435'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;

-- Owner
INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'OWNER', 'OWNER', 'MIGRATION' FROM users WHERE phone_number = '1111111111'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;

-- Kitchen
INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'KITCHEN', 'KITCHEN', 'MIGRATION' FROM users WHERE phone_number = '2222222222'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;

-- Employee
INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'EMPLOYEE', 'EMPLOYEE', 'MIGRATION' FROM users WHERE phone_number = '3333333333'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;
