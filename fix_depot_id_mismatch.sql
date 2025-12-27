-- STEP 1: Check what's stored in users table for Sadashiv Peth manager
SELECT id, email, role, assigned_depot_id 
FROM users 
WHERE role = 'depot_manager';

-- STEP 2: Check what format depot IDs are in bookings
SELECT DISTINCT origin_depot_id, destination_depot_id 
FROM bookings 
LIMIT 10;

-- STEP 3: If assigned_depot_id should be integer, fix it:
-- (Run this ONLY if Step 1 shows UUID values that don't match depots)
-- UPDATE users 
-- SET assigned_depot_id = '4'  -- The depot_id of Sadashiv Peth
-- WHERE email = 'sadashiv@example.com';  -- Replace with actual email

-- Or if the column should reference depot_id integers as strings:
-- Find depot managers and set their assigned_depot_id properly
