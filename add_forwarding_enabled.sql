-- Add forwarding_enabled column to depots table
ALTER TABLE depots 
ADD COLUMN IF NOT EXISTS forwarding_enabled BOOLEAN DEFAULT false;

-- Find Sadashiv Peth depot and enable forwarding
-- First check what Sadashiv Peth's id is:
SELECT id, name FROM depots WHERE name ILIKE '%Sadashiv%';

-- Then enable forwarding for Sadashiv Peth
UPDATE depots 
SET forwarding_enabled = true 
WHERE name ILIKE '%Sadashiv%';

-- Verify the change
SELECT id, number, name, forwarding_enabled FROM depots ORDER BY number;
