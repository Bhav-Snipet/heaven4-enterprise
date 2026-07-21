-- Add Developer user
INSERT INTO users (phone_number, first_name, last_name, created_by)
VALUES ('9999999999', 'Test', 'Developer', 'MIGRATION')
ON CONFLICT (phone_number) DO NOTHING;

-- Add Developer role
INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'DEVELOPER', 'CUSTOMER', 'MIGRATION' FROM users WHERE phone_number = '9999999999'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;
