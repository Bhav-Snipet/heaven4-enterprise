-- Veggie Delight Burger
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop'
WHERE id = 3;

-- Spicy Chicken Burger
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1615719413546-198b25453f85?q=80&w=800&auto=format&fit=crop'
WHERE id = 9;

-- Classic Cheeseburger (id 8 duplicate)
UPDATE menu_items
SET image_url = 'https://images.unsplash.com/photo-1586816001966-79b736744398?q=80&w=800&auto=format&fit=crop'
WHERE id = 8;
