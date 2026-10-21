-- Flyway V26: Fix specific menu item images to ensure every dish has a distinct image URL

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800'
WHERE name ILIKE '%Truffle%Fries%' OR name ILIKE '%Parmesan Fries%' OR (name ILIKE '%Fries%' AND name NOT ILIKE '%Burger%');

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a81?w=800'
WHERE name ILIKE '%Burrata%' OR name ILIKE '%Heirloom Tomato%';

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800'
WHERE name ILIKE '%Watermelon%' OR name ILIKE '%Jalapeño Cooler%';

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800'
WHERE name ILIKE '%Daiquiri%' OR name ILIKE '%Dark Rum%';

UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1553240799-36bbf332a5c3?w=800'
WHERE name ILIKE '%Lobster%' OR name ILIKE '%Nova Scotia%';
