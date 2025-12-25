-- Create test booking clerk user
-- Created: 2024-12-25
-- Description: Adds a test booking clerk user for role-based testing

INSERT INTO public.profiles (email, password, full_name, role, status)
VALUES ('clerk@mango.com', 'clerk123', 'Test Booking Clerk', 'booking_clerk', 'active')
ON CONFLICT (email) 
DO UPDATE SET 
    password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status;
