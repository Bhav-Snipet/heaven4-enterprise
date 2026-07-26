-- Fix menu item images to be diverse instead of all having the same burger image

-- Truffle burgers
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1594212202868-45e95454b6fc?q=80&w=800&auto=format&fit=crop'
WHERE name ILIKE '%Truffle%';

-- Double Truffle
UPDATE menu_items 
SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Hamburger_%28black_bg%29.jpg/800px-Hamburger_%28black_bg%29.jpg' 
WHERE name ILIKE '%Double Truffle%';

-- Regular burgers
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop'
WHERE name ILIKE '%Burger%' AND name NOT ILIKE '%Truffle%';

-- Fries
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1576107232684-1279f3908594?q=80&w=800&auto=format&fit=crop'
WHERE name ILIKE '%Fries%';

-- Drinks/Cola
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop'
WHERE name ILIKE '%Cola%' OR name ILIKE '%Drink%' OR name ILIKE '%Soda%';

-- Salad
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop'
WHERE name ILIKE '%Salad%';

-- Any remaining item with the same unsplash image, set to null so the frontend shows the default star placeholder
UPDATE menu_items 
SET image_url = NULL
WHERE image_url = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop' 
AND name NOT ILIKE '%Burger%';
