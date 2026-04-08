-- =============================================================================
-- SEASONAL DATABASE CLEANUP SCRIPT (New Mango Season)
-- =============================================================================
-- This script REMOVES all transactional data (bookings, trips, payments)
-- It PERSISTS master data (depots, pricing, routes, contacts, and profiles).
-- 
-- WARNING: This will permanently DELETE all booking and trip history.
-- RECOMMENDATION: Take a full database backup before running this script.
-- =============================================================================

BEGIN;

-- 1. DELETE TRANSACTIONAL DATA (CHILD TABLES FIRST)
-- ================================================

-- Delete receiver packages (child of booking_receivers)
DELETE FROM public.receiver_packages;

-- Delete booking receivers (child of bookings)
DELETE FROM public.booking_receivers;

-- Delete trip_bookings junction table
DELETE FROM public.trip_bookings;

-- Delete ledger transactions
DELETE FROM public.ledger_transactions;

-- Delete credit payments (if exists)
DO $$ BEGIN
  DELETE FROM public.credit_payments;
EXCEPTION WHEN undefined_table THEN 
  RAISE NOTICE 'Skipping credit_payments: table not found';
END $$;

-- 2. DELETE MAIN TRANSACTIONAL ENTITIES
-- =====================================

-- Delete bookings
DELETE FROM public.bookings;

-- Delete trips
DELETE FROM public.trips;

-- 3. RESET SEQUENCES / COUNTERS
-- ============================

-- Reset receipt counter to start fresh for the next booking
-- Setting last_date to yesterday/past ensures the next booking starts at 1
UPDATE public.receipt_counter 
SET 
  counter = 0,
  payment_counter = 0,
  trip_counter = 0,
  last_date = (CURRENT_DATE - INTERVAL '1 day')::DATE,
  payment_last_date = (CURRENT_DATE - INTERVAL '1 day')::DATE,
  trip_last_date = (CURRENT_DATE - INTERVAL '1 day')::DATE
WHERE id = 1;

-- Handle serial/identity sequences if any (PostgreSQL standard)
-- Note: Most IDs in this project seem to be UUIDs or custom strings,
-- but this is good practice if any serial columns exist.
-- ALTER SEQUENCE IF EXISTS public.bookings_id_seq RESTART WITH 1;

COMMIT;

SELECT 'Seasonal cleanup completed successfully! Transactional data cleared, Configuration preserved.' as result;
