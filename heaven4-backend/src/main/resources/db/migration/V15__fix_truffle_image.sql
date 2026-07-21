-- Update the image for Double Truffle Burger to a highly reliable URL
UPDATE menu_items 
SET image_url = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=2000&auto=format&fit=crop' 
WHERE name ILIKE '%Truffle%';
