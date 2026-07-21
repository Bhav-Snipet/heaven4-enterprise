-- Clean up any CUSTOMER roles accidentally assigned to the Developer user
DELETE FROM user_roles 
WHERE user_id = (SELECT id FROM users WHERE phone_number = '9999999999')
AND role != 'DEVELOPER';

-- Ensure the Developer role is correctly set to DEVELOPER workspace
UPDATE user_roles 
SET workspace = 'DEVELOPER' 
WHERE user_id = (SELECT id FROM users WHERE phone_number = '9999999999')
AND role = 'DEVELOPER';
