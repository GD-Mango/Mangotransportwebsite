-- =============================================================================
-- VERIFICATION SCRIPT: Database State Post-Cleanup
-- =============================================================================

WITH 
    -- 1. Check Transactional Data (Should be 0)
    tx_check AS (
        SELECT 
            'Transactional Tables (Should be 0)' as category,
            (SELECT count(*) FROM public.bookings) as bookings_count,
            (SELECT count(*) FROM public.trips) as trips_count,
            (SELECT count(*) FROM public.booking_receivers) as receivers_count,
            (SELECT count(*) FROM public.receiver_packages) as packages_items_count,
            (SELECT count(*) FROM public.ledger_transactions) as ledger_count
    ),
    -- 2. Check Master/Config Data (Should be > 0)
    master_check AS (
        SELECT 
            'Master/Config Data (Should be > 0)' as category,
            (SELECT count(*) FROM public.depots) as depots_count,
            (SELECT count(*) FROM public.contacts) as contacts_count,
            (SELECT count(*) FROM public.packages) as package_sizes_count,
            (SELECT count(*) FROM public.profiles) as users_count
    ),
    -- 3. Check Counter State
    counter_check AS (
        SELECT 
            'Counter Reset' as status,
            counter,
            last_date
        FROM public.receipt_counter
        WHERE id = 1
    )

-- Output Results
SELECT category, 'Bookings' as table_name, bookings_count as count FROM tx_check
UNION ALL SELECT category, 'Trips', trips_count FROM tx_check
UNION ALL SELECT category, 'Receivers', receivers_count FROM tx_check
UNION ALL SELECT category, 'Ledger', ledger_count FROM tx_check
UNION ALL SELECT category, 'Depots', depots_count FROM master_check
UNION ALL SELECT category, 'Contacts', contacts_count FROM master_check
UNION ALL SELECT category, 'Users', users_count FROM master_check
UNION ALL SELECT 'COUNTER', 'Current Value', counter FROM counter_check;

-- Final Verification message
SELECT 
    CASE 
        WHEN (SELECT count(*) FROM public.bookings) = 0 
         AND (SELECT count(*) FROM public.depots) > 0 
        THEN 'SUCCESS: Transactional data cleared, Master data preserved.'
        ELSE 'FAIL: Verify manual steps or table existence.'
    END as status;
