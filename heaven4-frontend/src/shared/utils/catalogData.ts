export interface Category {
    id: number;
    name: string;
    description: string;
    sortOrder: number;
    isActive: boolean;
    imageUrl?: string;
}

export interface MenuItem {
    id: number;
    categoryId: number;
    name: string;
    description: string;
    basePrice: number;
    isAvailable: boolean;
    isVeg: boolean;
    spicinessLevel: number;
    imageUrl?: string;
    sortOrder: number;
    prepTimeMinutes?: number;
}

export const INITIAL_CATEGORIES: Category[] = [
    { id: 1, name: '🍔 Burgers & Handhelds', description: 'Gourmet smashed & classic brioche burgers crafted with premium artisanal ingredients', sortOrder: 1, isActive: true },
    { id: 2, name: '🍕 Wood-Fired Pizzas', description: 'Artisanal sourdough pizzas stone-baked at 450°C with fresh organic toppings', sortOrder: 2, isActive: true },
    { id: 3, name: '🥗 Starters & Tapas', description: 'Crispy small sharing plates, authentic Spanish tapas & fresh Italian antipasti', sortOrder: 3, isActive: true },
    { id: 4, name: '🍝 Mains & Signatures', description: 'Chef-curated signature entrées, slow-cooked classics & hand-made pastas', sortOrder: 4, isActive: true },
    { id: 5, name: '🥤 Mocktails & Refreshers', description: 'House-crafted zero-proof botanical drinks, cold-pressed juices & sparkling infusions', sortOrder: 5, isActive: true },
    { id: 6, name: '🍸 Cocktails & Fine Spirits', description: 'Award-winning craft mixology, rare single-malt whiskeys & vintage tequila', sortOrder: 6, isActive: true },
    { id: 7, name: '🍷 Wines & Champagne', description: 'Curated French, Italian & Napa Valley wine list with rare vintage pours', sortOrder: 7, isActive: true },
    { id: 8, name: '🍰 Artisanal Desserts', description: 'Patisserie-grade molten cakes, fusion cheesecakes & handcrafted gelato', sortOrder: 8, isActive: true },
    { id: 9, name: '🎷 Event Special Menu', description: 'Exclusive luxury dining offerings for gala functions, private dining & live jazz nights', sortOrder: 9, isActive: true },
];

export const INITIAL_ITEMS_MAP: Record<number, MenuItem[]> = {
    // ── BURGERS & HANDHELDS (Cat 1) ──
    1: [
        { id: 101, categoryId: 1, name: 'Black Angus Double Smash Burger', description: 'Two 100g Black Angus smashed patties, aged cheddar, house pickles, caramelized onion jam & secret smash sauce on a toasted brioche bun.', basePrice: 17.99, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600', prepTimeMinutes: 15 },
        { id: 102, categoryId: 1, name: 'Nashville Hot Chicken Burger', description: 'Crispy buttermilk-brined chicken thigh tossed in Nashville spice blend, creamy slaw, dill pickles & jalapeño mayo on a toasted brioche bun.', basePrice: 15.50, isAvailable: true, isVeg: false, spicinessLevel: 2, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600', prepTimeMinutes: 15 },
        { id: 103, categoryId: 1, name: 'Black Truffle Portobello Melt', description: 'Crispy panko portobello mushroom patty, black truffle aioli, gruyère cheese, wild rocket & caramelized shallots on toasted sourdough.', basePrice: 14.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600', prepTimeMinutes: 12 },
        { id: 104, categoryId: 1, name: 'Wagyu Beef Cheese Royale', description: 'Premium A5 Wagyu beef patty, triple-smoked cheddar, bone marrow butter, crispy shallots & Dijon aioli on a buttered pretzel bun.', basePrice: 29.99, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600', prepTimeMinutes: 18 },
        { id: 105, categoryId: 1, name: 'Beyond Avocado Smash Burger', description: 'Juicy plant-based patty, smashed fresh avocado, roasted tomato salsa, pickled red onion & oat-milk cheddar on a vegan brioche bun.', basePrice: 14.99, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600', prepTimeMinutes: 12 },
        { id: 106, categoryId: 1, name: 'Crispy Halloumi & Harissa Burger', description: 'Golden-fried halloumi steak, smoky harissa aioli, pickled cucumber ribbons, baby rocket & mint-yoghurt on a sesame brioche bun.', basePrice: 13.99, isAvailable: true, isVeg: true, spicinessLevel: 1, sortOrder: 6, imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600', prepTimeMinutes: 12 },
        { id: 107, categoryId: 1, name: 'Spicy Paneer Tikka Wrap Burger', description: 'Marinated paneer tikka, mint-coriander chutney, pickled onions, crispy lettuce & house yoghurt sauce in a toasted flatbread brioche.', basePrice: 12.99, isAvailable: true, isVeg: true, spicinessLevel: 2, sortOrder: 7, imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600', prepTimeMinutes: 12 },
        { id: 108, categoryId: 1, name: 'Smoked Black Bean & Chipotle Burger', description: 'House-made black bean & quinoa patty, smoked chipotle sauce, vegan pepperjack cheese, roasted corn salsa & fresh guacamole.', basePrice: 13.50, isAvailable: true, isVeg: true, spicinessLevel: 1, sortOrder: 8, imageUrl: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600', prepTimeMinutes: 12 },
    ],

    // ── WOOD-FIRED PIZZAS (Cat 2) ──
    2: [
        { id: 201, categoryId: 2, name: 'Classic Margherita Napoletana', description: 'Traditional Napoletana pizza with San Marzano tomato sauce, fresh buffalo mozzarella, hand-torn basil leaves & extra virgin olive oil.', basePrice: 16.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600', prepTimeMinutes: 15 },
        { id: 202, categoryId: 2, name: 'Black Truffle & Wild Mushroom Pizza', description: 'Sourdough base, portobello, shiitake & oyster mushrooms, fresh mozzarella, wild rocket, black truffle oil & aged pecorino shavings.', basePrice: 22.99, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600', prepTimeMinutes: 18 },
        { id: 203, categoryId: 2, name: 'Four Cheese Bianca & Truffle Honey', description: 'Mozzarella, creamy gorgonzola, taleggio & 24-month parmesan on a garlic cream base, drizzled with black truffle honey & walnuts.', basePrice: 21.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600', prepTimeMinutes: 15 },
        { id: 204, categoryId: 2, name: 'Pepperoni & Hot Honey Royale', description: 'Double-layer Calabrese pepperoni, San Marzano tomato base, fresh mozzarella, drizzled chili hot honey & fresh torn oregano.', basePrice: 20.50, isAvailable: true, isVeg: false, spicinessLevel: 1, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600', prepTimeMinutes: 15 },
        { id: 205, categoryId: 2, name: 'Burrata di Bufala & Pistachio Pesto', description: 'Whole creamy buffalo burrata crown, house-made Sicilian pistachio pesto, sun-dried tomatoes, toasted pine nuts & basil oil.', basePrice: 23.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600', prepTimeMinutes: 15 },
        { id: 206, categoryId: 2, name: 'Paneer Tikka & Tri-Color Pepper Pizza', description: 'Tandoori-spiced char-grilled paneer tikka, tri-color bell peppers, red onion rings, mint-coriander drizzle & mozzarella on garlic crust.', basePrice: 19.50, isAvailable: true, isVeg: true, spicinessLevel: 1, sortOrder: 6, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600', prepTimeMinutes: 15 },
        { id: 207, categoryId: 2, name: 'Garden Harvest Sun-Dried Tomato Pizza', description: 'Roasted zucchini, sweet cherry tomatoes, artichoke hearts, Kalamata olives, fresh basil & vegan cashew mozzarella on sun-dried tomato base.', basePrice: 17.99, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 7, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600', prepTimeMinutes: 15 },
        { id: 208, categoryId: 2, name: 'Spicy Arrabbiata Chicken Pizza', description: 'Grilled chicken breast, fiery arrabbiata tomato sauce, roasted chili flakes, kalamata olives & shaved pecorino on sourdough crust.', basePrice: 19.99, isAvailable: true, isVeg: false, spicinessLevel: 2, sortOrder: 8, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600', prepTimeMinutes: 15 },
        { id: 209, categoryId: 2, name: 'Roasted Garlic & Artichoke Bianca', description: 'Confit garlic cream, marinated baby artichokes, caramelized red onion, baby spinach, fontina cheese & Sicilian lemon zest.', basePrice: 18.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 9, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600', prepTimeMinutes: 15 },
        { id: 210, categoryId: 2, name: 'Golden Smoked Salmon & Caviar Pizza', description: 'White cream base, cold-smoked Atlantic salmon, fresh dill mascarpone, Oscietra caviar pearls & edible 24k gold leaf accent.', basePrice: 38.00, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 10, imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600', prepTimeMinutes: 20 },
    ],

    // ── STARTERS & TAPAS (Cat 3) ──
    3: [
        { id: 301, categoryId: 3, name: 'Black Truffle Parmesan Belgian Fries', description: 'Twice-cooked hand-cut Belgian fries tossed in black truffle butter, shaved 36-month aged Parmigiano-Reggiano & flat-leaf parsley.', basePrice: 9.99, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', prepTimeMinutes: 10 },
        { id: 302, categoryId: 3, name: 'Spinach & Artichoke Gruyère Dip', description: 'Warm creamy spinach & baby artichoke dip baked with Swiss gruyère, served with toasted sourdough crostini & crispy pita crisps.', basePrice: 11.99, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600', prepTimeMinutes: 12 },
        { id: 303, categoryId: 3, name: 'Crispy Paneer Tikka Skewers', description: 'Char-grilled cottage cheese cubes in saffron-yoghurt marinade, served with mint chutney, pickled onion & lemon wedge.', basePrice: 13.50, isAvailable: true, isVeg: true, spicinessLevel: 1, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600', prepTimeMinutes: 12 },
        { id: 304, categoryId: 3, name: 'Bruschetta Trio Platter', description: 'Three sourdough slices: heirloom tomato & basil, wild mushroom & truffle cream, and smashed avocado & feta with balsamic drizzle.', basePrice: 11.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600', prepTimeMinutes: 10 },
        { id: 305, categoryId: 3, name: 'Truffle & Fontina Arancini Balls', description: 'Golden crispy Sicilian saffron risotto balls stuffed with molten Fontina cheese & black truffle paste, served on marinara sauce.', basePrice: 12.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', prepTimeMinutes: 12 },
        { id: 306, categoryId: 3, name: 'Charred Edamame with Smoked Chili Salt', description: 'Wok-charred organic young soybean pods tossed in toasted sesame oil, garlic flakes & Himalayan pink smoked chili salt.', basePrice: 7.99, isAvailable: true, isVeg: true, spicinessLevel: 1, sortOrder: 6, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600', prepTimeMinutes: 8 },
        { id: 307, categoryId: 3, name: 'Tempura Tiger Prawns & Yuzu Dip', description: 'Crispy feather-light tempura-battered tiger prawns, shiso leaf, micro herbs, yuzu ponzu dipping sauce & spicy sriracha mayo.', basePrice: 18.00, isAvailable: true, isVeg: false, spicinessLevel: 1, sortOrder: 7, imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600', prepTimeMinutes: 12 },
        { id: 308, categoryId: 3, name: 'Wagyu Beef Carpaccio & Shaved Truffle', description: 'Paper-thin sliced A5 Wagyu beef, wild rocket, 36-month Parmigiano Reggiano, caperberries & white truffle vinaigrette.', basePrice: 26.00, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 8, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', prepTimeMinutes: 10 },
    ],

    // ── MAINS & SIGNATURES (Cat 4) ──
    4: [
        { id: 401, categoryId: 4, name: 'Saffron & 24k Gold Risotto Milanese', description: 'Carnaroli rice simmered in saffron broth, bone marrow butter, Parmigiano-Reggiano & edible 24k gold leaf crown.', basePrice: 32.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600', prepTimeMinutes: 20 },
        { id: 402, categoryId: 4, name: 'Wild Mushroom & White Truffle Tagliatelle', description: 'Fresh egg tagliatelle, sautéed chanterelle & portobello mushrooms, black truffle butter, whipped parmesan & crispy sage.', basePrice: 21.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600', prepTimeMinutes: 16 },
        { id: 403, categoryId: 4, name: 'Palak Paneer with Garlic Herb Naan', description: 'Velvety smooth spinach curry with soft fresh paneer cubes, aromatic ground spices & churned cream, served with butter garlic naan.', basePrice: 16.99, isAvailable: true, isVeg: true, spicinessLevel: 1, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600', prepTimeMinutes: 15 },
        { id: 404, categoryId: 4, name: 'Roasted Beetroot & Goat Cheese Fettuccine', description: 'Al dente fettuccine tossed with roasted beetroot purée, whipped French goat cheese, candied walnuts, wilted baby spinach & dill.', basePrice: 18.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600', prepTimeMinutes: 15 },
        { id: 405, categoryId: 4, name: 'Thai Green Curry with Fragrant Jasmine Rice', description: 'Fragrant green coconut curry with baby eggplant, bamboo shoots, kaffir lime leaf, Thai basil, and crisp tofu over jasmine rice.', basePrice: 19.00, isAvailable: true, isVeg: true, spicinessLevel: 2, sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600', prepTimeMinutes: 16 },
        { id: 406, categoryId: 4, name: 'Miso-Glazed Chilean Sea Bass', description: 'Pan-roasted wild Chilean sea bass, sweet Saikyo miso glaze, baby bok choy, lotus root crisp & ginger dashi broth.', basePrice: 42.00, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 6, imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600', prepTimeMinutes: 20 },
        { id: 407, categoryId: 4, name: '28-Day Dry Aged Ribeye Steak (300g)', description: 'Prime bone-in ribeye steak aged 28 days, compound herb butter, roasted garlic head, hand-cut chips & peppercorn jus.', basePrice: 52.00, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 7, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600', prepTimeMinutes: 22 },
        { id: 408, categoryId: 4, name: 'Slow-Braised Beef Short Rib Pappardelle', description: 'Wide pappardelle ribbons, 6-hour red wine braised short rib ragu, San Marzano tomatoes, aged parmesan & torn basil.', basePrice: 24.99, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 8, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600', prepTimeMinutes: 18 },
    ],

    // ── MOCKTAILS & REFRESHERS (Cat 5) ──
    5: [
        { id: 501, categoryId: 5, name: 'Dragon Fruit & Hibiscus Sparkling Elixir', description: 'Fresh red dragon fruit purée, organic brewed hibiscus tea, chia seed pearls, raw agave nectar & chilled coconut water soda.', basePrice: 8.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600', prepTimeMinutes: 5 },
        { id: 502, categoryId: 5, name: 'Smoked Yuzu & Rosemary Botanical Tonic', description: 'Japanese yuzu juice, charred rosemary sprig, elderflower cordial, sparkling botanical tonic water & Himalayan salt rim.', basePrice: 8.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1498603993951-8a027a8a8f84?w=600', prepTimeMinutes: 5 },
        { id: 503, categoryId: 5, name: 'Watermelon Jalapeño Cooler', description: 'Fresh-pressed watermelon juice, lightly muddled jalapeño, lime, young coconut water & a Himalayan pink salt rim.', basePrice: 7.00, isAvailable: true, isVeg: true, spicinessLevel: 1, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1559181567-c3190bbb0f93?w=600', prepTimeMinutes: 5 },
        { id: 504, categoryId: 5, name: 'House Artisanal Peach Iced Tea', description: 'Cold-brewed Darjeeling black tea infused with white peach purée, fresh mint, raw Acacia honey & sparkling soda.', basePrice: 5.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', prepTimeMinutes: 4 },
        { id: 505, categoryId: 5, name: 'Alphonso Mango Lassi Royale', description: 'Chilled Alphonso mango pulp blended with rich yoghurt, green cardamom, saffron strands & roasted pistachio dust.', basePrice: 6.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600', prepTimeMinutes: 5 },
        { id: 506, categoryId: 5, name: 'Blue Butterfly Pea Sparkling Lemonade', description: 'Color-changing blue butterfly pea flower tea with freshly squeezed lemon, acacia honey, basil seeds & club soda.', basePrice: 7.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 6, imageUrl: 'https://images.unsplash.com/photo-1498603993951-8a027a8a8f84?w=600', prepTimeMinutes: 5 },
    ],

    // ── COCKTAILS & FINE SPIRITS (Cat 6) ──
    6: [
        { id: 601, categoryId: 6, name: 'Smoked Bourbon Old Fashioned with Gold', description: 'Woodford Reserve bourbon, Angostura bitters, Luxardo cherry, charred cedar smoke cloche & 24k gold leaf rim.', basePrice: 22.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600', prepTimeMinutes: 6 },
        { id: 602, categoryId: 6, name: 'Midnight Espresso Martini & Cocoa Nibs', description: 'Belvedere Vodka, fresh espresso shot, Kahlúa, dark chocolate essence, topped with toasted cocoa nibs & 3 coffee beans.', basePrice: 19.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1572490122747-3a3d536e4b47?w=600', prepTimeMinutes: 5 },
        { id: 603, categoryId: 6, name: 'Heaven4 Smoked Cherry Negroni', description: 'Campari, Tanqueray No. Ten gin, Carpano Antica vermouth, cherry bitters & torched orange smoke over crystal ice sphere.', basePrice: 18.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600', prepTimeMinutes: 5 },
        { id: 604, categoryId: 6, name: 'Hendricks Botanical Gin & Tonic', description: "Hendrick's gin, Fever-Tree elderflower tonic water, thinly sliced cucumber ribbon, pink grapefruit peel & juniper berries.", basePrice: 15.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600', prepTimeMinutes: 4 },
        { id: 605, categoryId: 6, name: 'Passion Fruit Margarita Royale', description: 'Patrón Silver tequila, fresh passion fruit purée, Cointreau, fresh lime & a pink Himalayan salt-sugar rim.', basePrice: 17.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600', prepTimeMinutes: 5 },
    ],

    // ── WINES & CHAMPAGNE (Cat 7) ──
    7: [
        { id: 701, categoryId: 7, name: 'Dom Pérignon Vintage Champagne (Glass)', description: '2012 Épernay, France. Aromas of white peach, toasted brioche, almond & silky mineral bubbles. 125ml flute.', basePrice: 45.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=600', prepTimeMinutes: 3 },
        { id: 702, categoryId: 7, name: 'Reserve Cabernet Sauvignon Napa Valley (Glass)', description: '2019 Napa Valley. Deep ruby, rich blackcurrant, dark chocolate & French oak vanilla. Velvety tannins. 150ml.', basePrice: 16.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600', prepTimeMinutes: 3 },
        { id: 703, categoryId: 7, name: 'Whispering Angel Provence Rosé (Glass)', description: '2022 Côtes de Provence, France. Pale salmon-pink, notes of red berries, honeydew melon & clean crisp finish. 150ml.', basePrice: 17.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1559526323-cb2f2fe2591b?w=600', prepTimeMinutes: 3 },
        { id: 704, categoryId: 7, name: 'Sauvignon Blanc Marlborough (Glass)', description: '2021 Marlborough, New Zealand. Vibrant tropical passionfruit, citrus blossom & crisp stony acidity. 150ml.', basePrice: 14.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600', prepTimeMinutes: 3 },
    ],

    // ── ARTISANAL DESSERTS (Cat 8) ──
    8: [
        { id: 801, categoryId: 8, name: 'Valrhona Chocolate Gold Sphere Surprise', description: 'Handcrafted golden dark chocolate sphere filled with raspberry mousse, warm salted caramel poured tableside revealing the core.', basePrice: 16.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600', prepTimeMinutes: 10 },
        { id: 802, categoryId: 8, name: 'Matcha Lava Cake & Yuzu Sorbet', description: 'Warm Uji matcha green tea fondant with flowing white chocolate center, paired with refreshing yuzu citrus sorbet.', basePrice: 13.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600', prepTimeMinutes: 12 },
        { id: 803, categoryId: 8, name: 'Molten Dark Chocolate Fondant', description: 'Warm 70% Valrhona dark chocolate fondant with flowing molten core, Tahitian vanilla bean gelato & cacao dust.', basePrice: 11.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600', prepTimeMinutes: 12 },
        { id: 804, categoryId: 8, name: 'Crème Brûlée Classique', description: 'Classic Parisian vanilla bean custard with caramelized brittle sugar crust, fresh raspberries & mint leaf.', basePrice: 9.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600', prepTimeMinutes: 8 },
        { id: 805, categoryId: 8, name: 'Gulab Jamun New York Cheesecake', description: 'Rose-water infused New York style baked cheesecake layered with warm cardamom gulab jamun, saffron glaze & edible gold dust.', basePrice: 12.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600', prepTimeMinutes: 8 },
        { id: 806, categoryId: 8, name: 'Mango Sticky Rice Tower', description: 'Coconut-pandan infused sticky rice tower, sliced sweet Alphonso mango, warm coconut reduction cream & toasted sesame seeds.', basePrice: 10.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 6, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600', prepTimeMinutes: 8 },
    ],

    // ── EVENT SPECIALS (Cat 9) ──
    9: [
        { id: 901, categoryId: 9, name: 'Truffle Mushroom Bruschetta (Event)', description: 'Thick-cut sourdough crostini, wild forest mushroom duxelles, truffle glaze & shaved Parmigiano-Reggiano.', basePrice: 16.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600', prepTimeMinutes: 10 },
        { id: 902, categoryId: 9, name: 'Wagyu Beef Slider Trio (Event)', description: 'Three mini sesame brioche sliders with A5 Wagyu smash patties, bone marrow truffle butter & caramelized onion.', basePrice: 32.00, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600', prepTimeMinutes: 15 },
        { id: 903, categoryId: 9, name: 'Butter Poached Nova Scotia Lobster', description: 'Butter-poached whole lobster tail, Champagne beurre blanc, hand-made saffron risotto cake & Oscietra caviar.', basePrice: 68.00, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1559742811-822863646df1?w=600', prepTimeMinutes: 22 },
        { id: 904, categoryId: 9, name: 'Herb-Crusted Rack of Lamb (Event)', description: 'Josper-roasted French rack of lamb, Provençal herb crust, rosemary Pinot jus & whipped truffle potato.', basePrice: 52.00, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1610397095767-84a5b4736cbd?w=600', prepTimeMinutes: 25 },
        { id: 905, categoryId: 9, name: 'Moët & Chandon Brut (Event Bottle)', description: 'Crisp, celebratory Moët & Chandon Impérial Champagne served tableside on ice. Serves up to 6 flutes.', basePrice: 85.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=600', prepTimeMinutes: 3 },
        { id: 906, categoryId: 9, name: '24k Gold Leaf Champagne Cocktail', description: 'Moët Champagne, Grand Marnier liqueur, edible 24-karat gold leaf flakes & a hand-dipped rose petal sugar rim.', basePrice: 38.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 6, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600', prepTimeMinutes: 5 },
        { id: 907, categoryId: 9, name: 'Rose & Passion Fruit Jazz Mojito', description: 'White rum, fresh passion fruit, organic rose syrup, hand-muddled mint, fresh lime juice & sparkling soda.', basePrice: 18.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 7, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600', prepTimeMinutes: 5 },
        { id: 908, categoryId: 9, name: 'Valrhona Gold Fondant & Baileys Dome', description: 'Valrhona dark chocolate fondant, molten Baileys core, hand-painted 24k gold chocolate dome & vanilla ice cream.', basePrice: 16.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 8, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600', prepTimeMinutes: 10 },
        { id: 909, categoryId: 9, name: 'Alphonso Mango Rose Panna Cotta Tower', description: 'Rose-scented Italian panna cotta tower, Alphonso mango gel layers, passionfruit coulis & spun sugar cage.', basePrice: 14.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 9, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600', prepTimeMinutes: 8 },
    ]
};

// Unified storage keys across all workspaces
const MASTER_CATS_KEY = 'heaven4_catalog_categories_master';
const MASTER_ITEMS_KEY = 'heaven4_catalog_items_master';

/**
 * Load complete catalog from storage with guaranteed presence of all 9 categories
 * and full merge of default dishes + any custom dishes added by admin.
 */
export function loadCatalogFromStorage(): { categories: Category[]; itemsMap: Record<number, MenuItem[]> } {
    try {
        let storedCatsRaw = localStorage.getItem(MASTER_CATS_KEY);
        let storedItemsRaw = localStorage.getItem(MASTER_ITEMS_KEY);

        // Check fallback legacy keys if master not yet set
        if (!storedCatsRaw) {
            for (const key of ['heaven4_catalog_categories_v4', 'heaven4_catalog_categories_v3', 'heaven4_catalog_categories_v2']) {
                const val = localStorage.getItem(key);
                if (val) { storedCatsRaw = val; break; }
            }
        }
        if (!storedItemsRaw) {
            for (const key of ['heaven4_catalog_items_v4', 'heaven4_catalog_items_v3', 'heaven4_catalog_items_v2']) {
                const val = localStorage.getItem(key);
                if (val) { storedItemsRaw = val; break; }
            }
        }

        let parsedCats: Category[] = storedCatsRaw ? JSON.parse(storedCatsRaw) : [];
        let parsedItems: Record<number, MenuItem[]> = storedItemsRaw ? JSON.parse(storedItemsRaw) : {};

        // Merge categories: ensure all 9 INITIAL_CATEGORIES exist
        const catMap = new Map<number, Category>();
        INITIAL_CATEGORIES.forEach(c => catMap.set(c.id, { ...c }));
        parsedCats.forEach(c => catMap.set(c.id, { ...c }));
        const categories = Array.from(catMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);

        // Merge items: for each category, ensure all default dishes exist PLUS any custom dishes created
        const itemsMap: Record<number, MenuItem[]> = {};
        
        // Populate with INITIAL_ITEMS_MAP first
        Object.keys(INITIAL_ITEMS_MAP).forEach(catIdStr => {
            const catId = Number(catIdStr);
            itemsMap[catId] = [...INITIAL_ITEMS_MAP[catId]!];
        });

        // Merge user-modified or newly added items from storage
        Object.keys(parsedItems).forEach(catIdStr => {
            const catId = Number(catIdStr);
            const userList = parsedItems[catId] || [];
            const defaultList = itemsMap[catId] || [];

            const mergedList: MenuItem[] = [];
            const processedIds = new Set<number>();

            // If user has custom edits or toggles for default items, apply them
            defaultList.forEach(defItem => {
                const userItem = userList.find(u => u.id === defItem.id);
                if (userItem) {
                    mergedList.push({ ...defItem, ...userItem });
                } else {
                    mergedList.push(defItem);
                }
                processedIds.add(defItem.id);
            });

            // Add any custom newly-added items (id not in defaultList)
            userList.forEach(userItem => {
                if (!processedIds.has(userItem.id)) {
                    mergedList.push(userItem);
                    processedIds.add(userItem.id);
                }
            });

            itemsMap[catId] = mergedList;
        });

        // Ensure every category in categories array has an items array (never undefined)
        categories.forEach(c => {
            if (!itemsMap[c.id]) itemsMap[c.id] = [];
        });

        // Cache back into master key
        localStorage.setItem(MASTER_CATS_KEY, JSON.stringify(categories));
        localStorage.setItem(MASTER_ITEMS_KEY, JSON.stringify(itemsMap));

        return { categories, itemsMap };
    } catch {
        return { categories: INITIAL_CATEGORIES, itemsMap: INITIAL_ITEMS_MAP };
    }
}

/**
 * Save catalog to all relevant keys and notify all listening pages.
 */
export function saveCatalogToStorage(categories: Category[], itemsMap: Record<number, MenuItem[]>): void {
    try {
        const catsJson = JSON.stringify(categories);
        const itemsJson = JSON.stringify(itemsMap);

        localStorage.setItem(MASTER_CATS_KEY, catsJson);
        localStorage.setItem(MASTER_ITEMS_KEY, itemsJson);

        // Backwards compatibility with any legacy readers
        localStorage.setItem('heaven4_catalog_categories_v2', catsJson);
        localStorage.setItem('heaven4_catalog_items_v2', itemsJson);
        localStorage.setItem('heaven4_catalog_categories_v4', catsJson);
        localStorage.setItem('heaven4_catalog_items_v4', itemsJson);

        window.dispatchEvent(new Event('heaven4-catalog-updated'));
    } catch { /* proceed */ }
}

/**
 * Reset entire catalog to factory defaults.
 */
export function resetCatalogToDefaults(): { categories: Category[]; itemsMap: Record<number, MenuItem[]> } {
    try {
        const catsJson = JSON.stringify(INITIAL_CATEGORIES);
        const itemsJson = JSON.stringify(INITIAL_ITEMS_MAP);

        localStorage.setItem(MASTER_CATS_KEY, catsJson);
        localStorage.setItem(MASTER_ITEMS_KEY, itemsJson);
        localStorage.setItem('heaven4_catalog_categories_v2', catsJson);
        localStorage.setItem('heaven4_catalog_items_v2', itemsJson);
        localStorage.setItem('heaven4_catalog_categories_v4', catsJson);
        localStorage.setItem('heaven4_catalog_items_v4', itemsJson);

        window.dispatchEvent(new Event('heaven4-catalog-updated'));
    } catch { /* proceed */ }
    return { categories: INITIAL_CATEGORIES, itemsMap: INITIAL_ITEMS_MAP };
}
