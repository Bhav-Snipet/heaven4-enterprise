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
}

export const INITIAL_CATEGORIES: Category[] = [
    { id: 1, name: '🍔 Burgers & Handhelds', description: 'Gourmet smashed & classic brioche burgers crafted with premium ingredients', sortOrder: 1, isActive: true },
    { id: 2, name: '🍕 Wood-Fired Pizzas', description: 'Artisanal sourdough pizzas stone-baked to perfection with organic toppings', sortOrder: 2, isActive: true },
    { id: 3, name: '🥗 Starters & Tapas', description: 'Crispy small plates, sharing boards & premium antipasti', sortOrder: 3, isActive: true },
    { id: 4, name: '🍝 Mains & Signatures', description: 'Chef curated signature entrées and slow-cooked classics', sortOrder: 4, isActive: true },
    { id: 5, name: '🥤 Mocktails & Refreshers', description: 'House-crafted zero-proof drinks, fresh pressed juices & sparkling infusions', sortOrder: 5, isActive: true },
    { id: 6, name: '🍸 Cocktails & Fine Spirits', description: 'Award-winning craft cocktails, rare whiskeys & aged tequila', sortOrder: 6, isActive: true },
    { id: 7, name: '🍷 Wines & Champagne', description: 'Curated old-world & new-world wine list with rare vintages', sortOrder: 7, isActive: true },
    { id: 8, name: '🍰 Artisanal Desserts', description: 'Decadent patisserie-grade sweet treats, molten cakes & handcrafted gelato', sortOrder: 8, isActive: true },
    { id: 9, name: '🎷 Event Special Menu', description: 'Exclusive luxury event offerings for gala functions, private dining & live jazz nights', sortOrder: 9, isActive: true },
];

export const INITIAL_ITEMS_MAP: Record<number, MenuItem[]> = {
    // ── BURGERS (Cat 1) ──
    1: [
        { id: 101, categoryId: 1, name: 'Black Angus Double Smash Burger', description: 'Two 100g Black Angus smashed patties, aged cheddar, house pickles, caramelized onion jam & secret smash sauce on a toasted brioche bun.', basePrice: 17.99, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600' },
        { id: 102, categoryId: 1, name: 'Nashville Hot Chicken Burger', description: 'Crispy buttermilk-brined chicken thigh tossed in Nashville spice blend, creamy slaw, dill pickles & jalapeño mayo on a toasted brioche bun.', basePrice: 15.50, isAvailable: true, isVeg: false, spicinessLevel: 2, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600' },
        { id: 103, categoryId: 1, name: 'Black Truffle Mushroom Melt', description: 'Crispy portobello mushroom patty, black truffle aioli, gruyère cheese, wild rocket & caramelized shallots on toasted sourdough.', basePrice: 14.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600' },
        { id: 104, categoryId: 1, name: 'Wagyu Beef Cheese Royale', description: 'Premium A5 Wagyu beef patty, triple-smoked cheddar, bone marrow butter, crispy shallots & Dijon aioli on a buttered pretzel bun.', basePrice: 29.99, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600' },
        { id: 105, categoryId: 1, name: 'Beyond Avocado Smash Burger', description: 'Juicy plant-based patty, smashed fresh avocado, roasted tomato salsa, pickled red onion & oat-milk cheddar on a vegan brioche bun.', basePrice: 14.99, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600' },
    ],

    // ── PIZZAS (Cat 2) ──
    2: [
        { id: 201, categoryId: 2, name: 'Black Truffle & Wild Mushroom Pizza', description: 'Sourdough base, portobello, shiitake & oyster mushrooms, fresh mozzarella, wild rocket, black truffle oil & aged pecorino shavings.', basePrice: 22.99, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600' },
        { id: 202, categoryId: 2, name: 'Pepperoni & Hot Honey Royale', description: 'Double-layer Calabrese pepperoni, san marzano tomato base, fresh mozzarella, drizzled hot chili honey & fresh torn basil.', basePrice: 20.50, isAvailable: true, isVeg: false, spicinessLevel: 1, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600' },
        { id: 203, categoryId: 2, name: 'Burrata di Bufala Margherita', description: 'Imported buffalo burrata, vine-ripened san marzano tomatoes, cold-pressed extra-virgin olive oil, organic basil & Sicilian sea salt.', basePrice: 19.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600' },
        { id: 204, categoryId: 2, name: 'Prosciutto & Arugula White Pizza', description: 'White roasted garlic cream base, 24-month aged prosciutto di Parma, wild rocket, shaved parmesan & fresh lemon zest.', basePrice: 23.99, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600' },
        { id: 205, categoryId: 2, name: 'BBQ Pulled Jackfruit Vegan Pizza', description: 'House BBQ tomato base, slow-braised spiced jackfruit, caramelized onions, roasted red peppers, vegan mozzarella & fresh coriander.', basePrice: 18.99, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600' },
    ],

    // ── STARTERS (Cat 3) ──
    3: [
        { id: 301, categoryId: 3, name: 'Black Truffle Parmesan Fries', description: 'Twice-fried hand-cut Belgian fries, black truffle butter, shaved aged parmesan, confit roasted garlic & flat-leaf parsley.', basePrice: 9.99, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600' },
        { id: 302, categoryId: 3, name: 'Tempura Tiger Prawns', description: 'Crispy light tempura-battered tiger prawns, shiso leaf, micro greens, yuzu ponzu dipping sauce & spicy sriracha mayo.', basePrice: 18.00, isAvailable: true, isVeg: false, spicinessLevel: 1, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600' },
        { id: 303, categoryId: 3, name: 'Heaven4 Signature Charcuterie Board', description: 'Curated aged mortadella, copa, soppressata, aged comté & manchego cheese, cornichons, fig chutney, sourdough crostini & candied walnuts.', basePrice: 28.00, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600' },
        { id: 304, categoryId: 3, name: 'Burrata & Heirloom Tomato Salad', description: 'Creamy fresh Italian burrata, rainbow heirloom tomatoes, aged balsamic reduction, basil oil, fleur de sel & toasted pine nuts.', basePrice: 16.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600' },
        { id: 305, categoryId: 3, name: 'Crispy Calamari Fritti', description: 'Panko-dusted squid rings fried golden, lemon zest, sea salt flakes, house garlic aioli, fresh marinara & charred lemon wedges.', basePrice: 15.00, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=600' },
    ],

    // ── MAINS (Cat 4) ──
    4: [
        { id: 401, categoryId: 4, name: 'Pan-Seared Atlantic Salmon Fillet', description: 'Pan-seared Atlantic salmon, lemon caper beurre blanc, wilted baby spinach, baby roasted potatoes & fresh micro herbs.', basePrice: 28.50, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600' },
        { id: 402, categoryId: 4, name: '28-Day Dry Aged Ribeye Steak (300g)', description: 'Premium bone-in ribeye aged 28 days, compound herb butter, roasted garlic head, hand-cut chips & rich black peppercorn jus.', basePrice: 52.00, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600' },
        { id: 403, categoryId: 4, name: 'Slow-Braised Beef Short Rib Pasta', description: 'Wide pappardelle pasta, 6-hour red wine braised beef short rib ragu, San Marzano tomatoes, fresh parmesan & torn basil.', basePrice: 24.99, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600' },
        { id: 404, categoryId: 4, name: 'Wild Mushroom & Truffle Risotto', description: 'Carnaroli rice, mixed wild mushroom duxelles, black truffle paste, whipped parmesan foam, crispy sage & white truffle oil drizzle.', basePrice: 21.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600' },
        { id: 405, categoryId: 4, name: 'French Magret Duck Breast', description: 'French Magret duck breast, sour cherry & Pinot Noir reduction, creamy celeriac purée, haricots verts & crispy potato rosti.', basePrice: 34.00, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600' },
    ],

    // ── MOCKTAILS (Cat 5) ──
    5: [
        { id: 501, categoryId: 5, name: 'Cucumber & Elderflower Spritz', description: 'Fresh muddled cucumber, St-Germain elderflower cordial, fresh lime juice, ginger beer & a fresh rosemary sprig.', basePrice: 6.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1498603993951-8a027a8a8f84?w=600' },
        { id: 502, categoryId: 5, name: 'Watermelon Jalapeño Cooler', description: 'Fresh-pressed watermelon juice, lightly muddled jalapeño, lime, young coconut water & a Himalayan pink salt rim.', basePrice: 7.00, isAvailable: true, isVeg: true, spicinessLevel: 1, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1559181567-c3190bbb0f93?w=600' },
        { id: 503, categoryId: 5, name: 'House Artisanal Peach Iced Tea', description: 'Cold-brewed Darjeeling black tea infused with white peach purée, fresh mint, raw Acacia honey & sparkling water.', basePrice: 5.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600' },
        { id: 504, categoryId: 5, name: 'Virgin Passion Fruit Mojito', description: 'Crushed fresh mint, ripe passion fruit pulp, freshly squeezed lime, organic cane sugar syrup & premium sparkling soda.', basePrice: 6.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600' },
        { id: 505, categoryId: 5, name: 'Blue Butterfly Pea Lemonade', description: 'Color-changing butterfly pea flower brew, freshly squeezed lemon, lavender honey syrup & sparkling water.', basePrice: 7.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600' },
    ],

    // ── COCKTAILS (Cat 6) ──
    6: [
        { id: 601, categoryId: 6, name: 'Heaven4 Smoked Cherry Negroni', description: 'Campari, Tanqueray gin, sweet vermouth, cherry bitters, hand-torched orange smoke & Angostura. Served over ice sphere.', basePrice: 18.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600' },
        { id: 602, categoryId: 6, name: "Hendricks Botanical Gin & Tonic", description: "Hendrick's gin, Fever-Tree elderflower tonic water, thinly sliced fresh cucumber, pink grapefruit twist & juniper berries.", basePrice: 15.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600' },
        { id: 603, categoryId: 6, name: 'Dark Rum Passion Fruit Daiquiri', description: 'Havana Club 7yr dark rum, fresh passion fruit coulis, freshly squeezed lime, brown cane sugar & Angostura.', basePrice: 16.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1572490122747-3a3d536e4b47?w=600' },
        { id: 604, categoryId: 6, name: 'Aged Reserve Whisky Flight (60ml)', description: 'Rotating reserve cask selection — Glenfarclas 15yr, Macallan Amber or Oban 14yr. Served neat with tasting notes.', basePrice: 18.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600' },
    ],

    // ── WINES (Cat 7) ──
    7: [
        { id: 701, categoryId: 7, name: 'Reserve Cabernet Sauvignon (Glass)', description: '2019 Napa Valley. Deep ruby with dark cherry, blackcurrant & cedar. Full-bodied with velvety tannins. 150ml pour.', basePrice: 16.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600' },
        { id: 702, categoryId: 7, name: 'Côtes du Rhône Grenache Blanc (Glass)', description: '2021 Southern France. Crisp & floral with notes of white peach, apricot & jasmine. Refreshing mineral finish.', basePrice: 13.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600' },
        { id: 703, categoryId: 7, name: 'Moët & Chandon Brut Impérial (Glass)', description: 'The iconic French Champagne. Toasted brioche, white peach & honeysuckle. Fine persistent bubbles. 125ml.', basePrice: 22.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=600' },
        { id: 704, categoryId: 7, name: 'Whispering Angel Provence Rosé (Glass)', description: '2022 Côtes de Provence, France. Delicate pale salmon-pink, notes of dried flowers & fresh red berry cream.', basePrice: 17.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1559526323-cb2f2fe2591b?w=600' },
    ],

    // ── DESSERTS (Cat 8) ──
    8: [
        { id: 801, categoryId: 8, name: 'Molten Dark Chocolate Lava Cake', description: 'Warm 70% Valrhona dark chocolate fondant with flowing molten center, vanilla bean gelato & cacao dust.', basePrice: 11.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600' },
        { id: 802, categoryId: 8, name: 'Crème Brûlée Classique', description: 'Classic Parisian vanilla bean custard with caramelized golden sugar crust & fresh berries.', basePrice: 9.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600' },
        { id: 803, categoryId: 8, name: 'Tiramisu della Casa', description: 'House-made tiramisu with espresso-soaked savoiardi biscuits, Kahlúa mascarpone cream & Dutch cocoa.', basePrice: 10.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600' },
        { id: 804, categoryId: 8, name: 'Mango & Coconut Panna Cotta', description: 'Silky Thai coconut panna cotta layered with fresh Alphonso mango compote & passionfruit coulis.', basePrice: 9.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600' },
        { id: 805, categoryId: 8, name: 'Artisan Gelato Flight (3 Scoops)', description: 'Pistachio di Bronte, Stracciatella, Salted Caramel Swirl, or Yuzu Sorbet scoops.', basePrice: 8.50, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600' },
    ],

    // ── EVENT SPECIALS (Cat 9) ──
    9: [
        { id: 901, categoryId: 9, name: '🎷 Truffle Mushroom Bruschetta (Event)', description: 'Thick-cut sourdough crostini, wild forest mushroom duxelles, truffle glaze & shaved parmesan.', basePrice: 16.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600' },
        { id: 902, categoryId: 9, name: 'Wagyu Beef Slider Trio (Event)', description: 'Three mini sesame brioche sliders with A5 Wagyu smash patties & bone marrow truffle butter.', basePrice: 32.00, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600' },
        { id: 903, categoryId: 9, name: 'Butter Poached Nova Scotia Lobster', description: 'Butter-poached whole lobster tail, Champagne beurre blanc, saffron risotto & Oscietra caviar.', basePrice: 68.00, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1559742811-822863646df1?w=600' },
        { id: 904, categoryId: 9, name: 'Herb-Crusted Rack of Lamb (Event)', description: 'Josper-roasted French rack of lamb, Provençal herb crust, rosemary Pinot jus & truffle potato.', basePrice: 52.00, isAvailable: true, isVeg: false, spicinessLevel: 0, sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1610397095767-84a5b4736cbd?w=600' },
        { id: 905, categoryId: 9, name: 'Moët & Chandon Brut (Event Bottle)', description: 'Crisp, celebratory French Champagne served tableside. Serves 6 flutes.', basePrice: 85.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=600' },
        { id: 906, categoryId: 9, name: '24k Gold Leaf Champagne Cocktail', description: 'Moët Champagne, Grand Marnier liqueur, edible 24-karat gold leaf & rose sugar rim.', basePrice: 38.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 6, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600' },
        { id: 907, categoryId: 9, name: 'Rose & Passion Fruit Jazz Mojito', description: 'White rum, fresh passion fruit, organic rose syrup, muddled mint & lime.', basePrice: 18.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 7, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600' },
        { id: 908, categoryId: 9, name: '🍷 Reserve Cabernet Sauvignon (Event Wine)', description: 'Napa Valley 2018 Vintage, notes of dark cherry, oak, & velvet tannins.', basePrice: 18.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 8, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600' },
        { id: 909, categoryId: 9, name: '🍸 Event Signature Elderflower Cocktail', description: 'Artisanal gin, St-Germain elderflower liqueur, fresh lychee purée & prosecco float.', basePrice: 14.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 9, imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600' },
        { id: 910, categoryId: 9, name: 'Gala Dinner VIP Cover', description: 'Full multi-course event dining cover per guest including champagne toast & dessert pairing.', basePrice: 50.00, isAvailable: true, isVeg: true, spicinessLevel: 0, sortOrder: 10, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600' },
    ]
};

export function loadCatalogFromStorage(): { categories: Category[]; itemsMap: Record<number, MenuItem[]> } {
    try {
        const storedCats = localStorage.getItem('heaven4_catalog_categories_v2');
        const storedItems = localStorage.getItem('heaven4_catalog_items_v2');
        
        const categories = storedCats ? JSON.parse(storedCats) : INITIAL_CATEGORIES;
        const itemsMap = storedItems ? JSON.parse(storedItems) : INITIAL_ITEMS_MAP;
        
        return { categories, itemsMap };
    } catch {
        return { categories: INITIAL_CATEGORIES, itemsMap: INITIAL_ITEMS_MAP };
    }
}

export function saveCatalogToStorage(categories: Category[], itemsMap: Record<number, MenuItem[]>): void {
    try {
        localStorage.setItem('heaven4_catalog_categories_v2', JSON.stringify(categories));
        localStorage.setItem('heaven4_catalog_items_v2', JSON.stringify(itemsMap));
        window.dispatchEvent(new Event('heaven4-catalog-updated'));
    } catch { /* proceed */ }
}
