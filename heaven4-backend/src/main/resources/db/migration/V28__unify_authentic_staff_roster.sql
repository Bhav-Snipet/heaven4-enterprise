-- =====================================================
-- Heaven4 Enterprise — V28: Unify Authentic Staff Roster
-- =====================================================
-- Seeds all canonical staff members into database users and user_roles,
-- and assigns them to departments in teams and user_teams tables.

-- 1. Insert or update all authentic staff members in users
INSERT INTO users (phone_number, first_name, last_name, created_by, password)
VALUES 
('+1234567891', 'Sarah', 'Jenkins', 'MIGRATION', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
('+1234567892', 'Marco', 'Polo', 'MIGRATION', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
('+1234567893', 'Alex', 'Rivera', 'MIGRATION', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
('+1234567894', 'David', 'Kim', 'MIGRATION', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
('+1234567895', 'Elena', 'Rostova', 'MIGRATION', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
('+1234567896', 'Marcus', 'Vance', 'MIGRATION', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
('+1234567897', 'Chloe', 'Bennett', 'MIGRATION', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
('+1555019400', 'Sanjay', 'Kumar', 'MIGRATION', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'),
('+1555019600', 'Maria', 'Garcia', 'MIGRATION', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG')
ON CONFLICT (phone_number) DO UPDATE 
SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

-- 2. Ensure their roles are accurately registered in user_roles
INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'MANAGER', 'MANAGER', 'MIGRATION' FROM users WHERE phone_number = '+1234567891'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;

INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'KITCHEN', 'KITCHEN', 'MIGRATION' FROM users WHERE phone_number = '+1234567892'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;

INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'EMPLOYEE', 'EMPLOYEE', 'MIGRATION' FROM users WHERE phone_number = '+1234567893'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;

INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'EMPLOYEE', 'EMPLOYEE', 'MIGRATION' FROM users WHERE phone_number = '+1234567894'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;

INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'KITCHEN', 'KITCHEN', 'MIGRATION' FROM users WHERE phone_number = '+1234567895'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;

INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'EMPLOYEE', 'EMPLOYEE', 'MIGRATION' FROM users WHERE phone_number = '+1234567896'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;

INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'EMPLOYEE', 'EMPLOYEE', 'MIGRATION' FROM users WHERE phone_number = '+1234567897'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;

INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'KITCHEN', 'KITCHEN', 'MIGRATION' FROM users WHERE phone_number = '+1555019400'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;

INSERT INTO user_roles (user_id, role, workspace, created_by)
SELECT id, 'EMPLOYEE', 'EMPLOYEE', 'MIGRATION' FROM users WHERE phone_number = '+1555019600'
ON CONFLICT (user_id, role, workspace, branch_id) DO NOTHING;

-- Also update existing generic test users with proper full names
UPDATE users SET first_name = 'Gordon', last_name = 'Ramsay' WHERE phone_number = 'chef001';
UPDATE users SET first_name = 'Sarah', last_name = 'Jenkins' WHERE phone_number = '1234567890';
UPDATE users SET first_name = 'Alex', last_name = 'Rivera' WHERE phone_number = '3333333333';
UPDATE users SET first_name = 'Marco', last_name = 'Polo' WHERE phone_number = '2222222222';

-- 3. Seed canonical teams if not present
INSERT INTO teams (name, description) VALUES
('🍳 Kitchen Crew', 'Head chefs, line cooks, and culinary prep specialists'),
('🍹 Bar & Beverage Staff', 'Sommeliers, mixologists, and beverage specialists'),
('🍽️ Floor Waitstaff', 'Floor captains, waiters, and table service runners'),
('🎷 Rooftop Event & Hospitality Hosts', 'Event hosts, VIP table concierges, and ticketing staff'),
('🍷 Sommelier & Wine Cellar Curators', 'VIP wine pairing specialists, cellar curators, and beverage stewards')
ON CONFLICT DO NOTHING;

-- 4. Map users to teams in user_teams table
INSERT INTO user_teams (user_id, team_id)
SELECT u.id, t.id FROM users u, teams t 
WHERE u.phone_number = '+1234567892' AND t.name LIKE '%Kitchen Crew%'
ON CONFLICT (user_id, team_id) DO NOTHING;

INSERT INTO user_teams (user_id, team_id)
SELECT u.id, t.id FROM users u, teams t 
WHERE u.phone_number = '+1555019400' AND t.name LIKE '%Kitchen Crew%'
ON CONFLICT (user_id, team_id) DO NOTHING;

INSERT INTO user_teams (user_id, team_id)
SELECT u.id, t.id FROM users u, teams t 
WHERE u.phone_number = '+1234567893' AND t.name LIKE '%Floor Waitstaff%'
ON CONFLICT (user_id, team_id) DO NOTHING;

INSERT INTO user_teams (user_id, team_id)
SELECT u.id, t.id FROM users u, teams t 
WHERE u.phone_number = '+1234567894' AND t.name LIKE '%Floor Waitstaff%'
ON CONFLICT (user_id, team_id) DO NOTHING;

INSERT INTO user_teams (user_id, team_id)
SELECT u.id, t.id FROM users u, teams t 
WHERE u.phone_number = '+1234567895' AND t.name LIKE '%Bar & Beverage%'
ON CONFLICT (user_id, team_id) DO NOTHING;

INSERT INTO user_teams (user_id, team_id)
SELECT u.id, t.id FROM users u, teams t 
WHERE u.phone_number = '+1234567896' AND t.name LIKE '%Bar & Beverage%'
ON CONFLICT (user_id, team_id) DO NOTHING;

INSERT INTO user_teams (user_id, team_id)
SELECT u.id, t.id FROM users u, teams t 
WHERE u.phone_number = '+1234567897' AND t.name LIKE '%Sommelier%'
ON CONFLICT (user_id, team_id) DO NOTHING;

INSERT INTO user_teams (user_id, team_id)
SELECT u.id, t.id FROM users u, teams t 
WHERE u.phone_number = '+1234567891' AND t.name LIKE '%Rooftop Event%'
ON CONFLICT (user_id, team_id) DO NOTHING;
