-- Create bookings_complete view
-- This view joins bookings with related data for convenient querying

CREATE OR REPLACE VIEW bookings_complete AS
SELECT 
    b.booking_id AS id,
    b.booking_id,
    b.receipt_number,
    b.sender_name,
    b.sender_phone,
    b.pickup_depot AS origin_depot_id,
    b.status,
    b.payment_method,
    b.total_amount,
    b.to_pay_collected_at,
    b.to_pay_collected_method,
    b.created_at,
    b.updated_at,
    b.custom_instructions,
    -- Origin depot info
    od.name AS origin_depot_name,
    -- Get first receiver's destination
    (SELECT destination_depot FROM booking_receivers br WHERE br.booking_id = b.booking_id LIMIT 1) AS destination_depot_id,
    (SELECT d.name FROM booking_receivers br 
     JOIN depots d ON d.depot_id = br.destination_depot 
     WHERE br.booking_id = b.booking_id LIMIT 1) AS destination_depot_name,
    -- Receiver info
    (SELECT receiver_name FROM booking_receivers br WHERE br.booking_id = b.booking_id LIMIT 1) AS receiver_name,
    (SELECT receiver_phone FROM booking_receivers br WHERE br.booking_id = b.booking_id LIMIT 1) AS receiver_phone,
    (SELECT delivery_type FROM booking_receivers br WHERE br.booking_id = b.booking_id LIMIT 1) AS delivery_type,
    -- Package details as JSON
    b.package_details
FROM bookings b
LEFT JOIN depots od ON od.depot_id = b.pickup_depot;

-- Grant access to the view
GRANT SELECT ON bookings_complete TO authenticated;
GRANT SELECT ON bookings_complete TO anon;

-- Verify the view exists
SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings_complete';
