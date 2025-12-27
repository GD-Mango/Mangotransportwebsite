-- Check actual column names in depots table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'depots';

-- Also check what an actual depot row looks like
SELECT * FROM depots WHERE name = 'Sadashiv Peth';
