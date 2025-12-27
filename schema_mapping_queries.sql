-- =====================================================
-- COMPREHENSIVE DATABASE SCHEMA MAPPING QUERIES
-- Run each section separately and share results
-- =====================================================

-- 1. ALL TABLES IN PUBLIC SCHEMA
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. BOOKINGS TABLE COLUMNS (CRITICAL)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'bookings'
ORDER BY ordinal_position;

-- 3. BOOKING_RECEIVERS TABLE COLUMNS
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'booking_receivers'
ORDER BY ordinal_position;

-- 4. DEPOTS TABLE COLUMNS
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'depots'
ORDER BY ordinal_position;

-- 5. PROFILES TABLE COLUMNS (User roles/depot assignment)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 6. ALL VIEWS
SELECT table_name AS view_name
FROM information_schema.views 
WHERE table_schema = 'public';

-- 7. ALL ENUMS
SELECT t.typname AS enum_name, 
       e.enumlabel AS enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
ORDER BY t.typname, e.enumsortorder;

-- 8. SAMPLE BOOKING DATA (to understand structure)
SELECT * FROM bookings LIMIT 3;

-- 9. SAMPLE BOOKING_RECEIVERS DATA
SELECT * FROM booking_receivers LIMIT 3;

-- 10. FOREIGN KEY RELATIONSHIPS
SELECT
    tc.table_name AS source_table,
    kcu.column_name AS source_column,
    ccu.table_name AS target_table,
    ccu.column_name AS target_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public';
