-- Update the image for Double Truffle Burger to a highly reliable Wikimedia Commons URL
UPDATE menu_items 
SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Hamburger_%28black_bg%29.jpg/800px-Hamburger_%28black_bg%29.jpg' 
WHERE name ILIKE '%Truffle%' OR description ILIKE '%truffle%';
