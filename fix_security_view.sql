-- =============================================================================
-- SECURITY FIX: Redefine bookings_complete as SECURITY INVOKER
-- =============================================================================
-- This fix addresses the Supabase Security Advisor warning (LINT 0010)
-- by explicitly setting the view to use the querying user's permissions (RLS).
-- =============================================================================

BEGIN;

-- 1. Drop the existing view
DROP VIEW IF EXISTS public.bookings_complete;

-- 2. Recreate with security_invoker = true (Postgres 15+)
-- This ensures that RLS policies on the underlying tables (bookings, etc.)
-- are enforced for the user querying the view.
CREATE VIEW public.bookings_complete 
WITH (security_invoker = true) AS
SELECT 
  b.*,
  od.name as origin_depot_name,
  dd.name as destination_depot_name,
  COALESCE(
    (SELECT jsonb_agg(
      jsonb_build_object(
        'id', br.id,
        'name', br.receiver_name,
        'phone', br.receiver_phone,
        'address', br.delivery_address,
        'packages', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', rp.id,
              'package_id', rp.package_id,
              'size', rp.package_size,
              'quantity', rp.quantity,
              'price_per_unit', rp.price_per_unit,
              'total_price', rp.quantity * rp.price_per_unit,
              'description', rp.description
            )
          ), '[]'::jsonb)
          FROM public.receiver_packages rp
          WHERE rp.receiver_id = br.id
        )
      ) ORDER BY br.receiver_order
    )
    FROM public.booking_receivers br
    WHERE br.booking_id = b.id
  ), '[]'::jsonb) as receivers
FROM public.bookings b
LEFT JOIN public.depots od ON b.origin_depot_id = od.id
LEFT JOIN public.depots dd ON b.destination_depot_id = dd.id;

-- 3. Restore permissions
GRANT SELECT ON public.bookings_complete TO authenticated;
GRANT SELECT ON public.bookings_complete TO anon;
GRANT SELECT ON public.bookings_complete TO service_role;

COMMIT;

SELECT 'View public.bookings_complete redefined with security_invoker = true successfully!' as result;
