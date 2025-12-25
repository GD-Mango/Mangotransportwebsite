-- Create test depot manager users
-- Created: 2024-12-25
-- Description: Adds test depot manager users for Bhusari Colony, Sadashiv Peth, and Akurdi

-- First, get the depot IDs and create depot managers
DO $$
DECLARE
  bhusari_depot_id UUID;
  sadashiv_depot_id UUID;
  akurdi_depot_id UUID;
BEGIN
  -- Get depot IDs
  SELECT id INTO bhusari_depot_id FROM public.depots WHERE name = 'Bhusari Colony' LIMIT 1;
  SELECT id INTO sadashiv_depot_id FROM public.depots WHERE name = 'Sadashiv Peth' LIMIT 1;
  SELECT id INTO akurdi_depot_id FROM public.depots WHERE name = 'Akurdi' LIMIT 1;

  -- Insert depot managers
  INSERT INTO public.profiles (email, password, full_name, role, assigned_depot_id, status)
  VALUES 
    ('bhusari@mango.com', 'bhusari123', 'Bhusari Colony Manager', 'depot_manager', bhusari_depot_id, 'active'),
    ('sadashiv@mango.com', 'sadashiv123', 'Sadashiv Peth Manager', 'depot_manager', sadashiv_depot_id, 'active'),
    ('akurdi@mango.com', 'akurdi123', 'Akurdi Manager', 'depot_manager', akurdi_depot_id, 'active')
  ON CONFLICT (email) 
  DO UPDATE SET 
      password = EXCLUDED.password,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      assigned_depot_id = EXCLUDED.assigned_depot_id,
      status = EXCLUDED.status;
END $$;
