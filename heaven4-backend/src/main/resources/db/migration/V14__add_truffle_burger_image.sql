-- Add image to truffle mayo burger (if V13 was already applied before the previous patch)
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1594212202868-45e95454b6fc?q=80&w=2000&auto=format&fit=crop'
WHERE description ILIKE '%truffle mayo%';
