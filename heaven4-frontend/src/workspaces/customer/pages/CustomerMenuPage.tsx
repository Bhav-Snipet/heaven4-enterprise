import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Leaf, Sparkles, AlertCircle, Ticket, ChevronRight, ArrowRight, Star, Flame, Wine } from 'lucide-react';
import apiClient from '@/core/api/client';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

interface Category {
    id: number;
    name: string;
    description: string;
    imageUrl?: string;
}

interface MenuItem {
    id: number;
    categoryId: number;
    name: string;
    description: string;
    basePrice: number;
    isVeg: boolean;
    imageUrl?: string;
}

const DEFAULT_CATEGORIES: Category[] = [
    { id: 1, name: '🍔 Burgers & Handhelds', description: 'Gourmet smashed & classic brioche burgers crafted with premium ingredients' },
    { id: 2, name: '🍕 Wood-Fired Pizzas', description: 'Artisanal sourdough pizzas stone-baked to perfection with organic toppings' },
    { id: 3, name: '🥗 Starters & Tapas', description: 'Crispy small plates, sharing boards & premium antipasti' },
    { id: 4, name: '🍝 Mains & Signatures', description: 'Chef curated signature entrées and slow-cooked classics' },
    { id: 5, name: '🥤 Mocktails & Refreshers', description: 'House-crafted zero-proof drinks, fresh pressed juices & sparkling infusions' },
    { id: 6, name: '🍸 Cocktails & Fine Spirits', description: 'Award-winning craft cocktails, rare whiskeys & aged tequila' },
    { id: 7, name: '🍷 Wines & Champagne', description: 'Curated old-world & new-world wine list with rare vintages' },
    { id: 8, name: '🍰 Artisanal Desserts', description: 'Decadent patisserie-grade sweet treats, molten cakes & handcrafted gelato' },
];

const DEFAULT_ITEMS: MenuItem[] = [
    // ── BURGERS (Cat 1) ──
    { id: 101, categoryId: 1, name: 'Black Angus Double Smash Burger', description: 'Two 100g Black Angus smashed patties, aged cheddar, house pickles, caramelized onion jam & secret smash sauce on a toasted brioche bun.', basePrice: 17.99, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600' },
    { id: 102, categoryId: 1, name: 'Nashville Hot Chicken Burger', description: 'Crispy buttermilk-brined chicken thigh tossed in Nashville spice blend, creamy slaw, dill pickles & jalapeño mayo on a toasted brioche bun.', basePrice: 15.50, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600' },
    { id: 103, categoryId: 1, name: 'Black Truffle Mushroom Melt', description: 'Crispy portobello mushroom patty, black truffle aioli, gruyère cheese, wild rocket & caramelized shallots on toasted sourdough.', basePrice: 14.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600' },
    { id: 104, categoryId: 1, name: 'Wagyu Beef Cheese Royale', description: 'Premium A5 Wagyu beef patty, triple-smoked cheddar, bone marrow butter, crispy shallots & Dijon aioli on a buttered pretzel bun.', basePrice: 29.99, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600' },
    { id: 105, categoryId: 1, name: 'Beyond Avocado Smash Burger', description: 'Juicy plant-based patty, smashed fresh avocado, roasted tomato salsa, pickled red onion & oat-milk cheddar on a vegan brioche bun.', basePrice: 14.99, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600' },

    // ── PIZZAS (Cat 2) ──
    { id: 201, categoryId: 2, name: 'Black Truffle & Wild Mushroom', description: 'Sourdough base, portobello, shiitake & oyster mushrooms, fresh mozzarella, wild rocket, black truffle oil & aged pecorino shavings.', basePrice: 22.99, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600' },
    { id: 202, categoryId: 2, name: 'Pepperoni & Hot Honey Royale', description: 'Double-layer Calabrese pepperoni, san marzano tomato base, fresh mozzarella, drizzled hot chili honey & fresh torn basil.', basePrice: 20.50, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600' },
    { id: 203, categoryId: 2, name: 'Burrata di Bufala Margherita', description: 'Imported buffalo burrata, vine-ripened san marzano tomatoes, cold-pressed extra-virgin olive oil, organic basil & Sicilian sea salt.', basePrice: 19.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600' },
    { id: 204, categoryId: 2, name: 'Prosciutto & Arugula White Pizza', description: 'White roasted garlic cream base, 24-month aged prosciutto di Parma, wild rocket, shaved parmesan & fresh lemon zest.', basePrice: 23.99, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600' },
    { id: 205, categoryId: 2, name: 'BBQ Pulled Jackfruit Vegan Pizza', description: 'House BBQ tomato base, slow-braised spiced jackfruit, caramelized onions, roasted red peppers, vegan mozzarella & fresh coriander.', basePrice: 18.99, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600' },

    // ── STARTERS (Cat 3) ──
    { id: 301, categoryId: 3, name: 'Black Truffle Parmesan Fries', description: 'Twice-fried hand-cut Belgian fries, black truffle butter, shaved aged parmesan, confit roasted garlic & flat-leaf parsley.', basePrice: 9.99, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600' },
    { id: 302, categoryId: 3, name: 'Tempura Tiger Prawns', description: 'Crispy light tempura-battered tiger prawns, shiso leaf, micro greens, yuzu ponzu dipping sauce & spicy sriracha mayo.', basePrice: 18.00, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600' },
    { id: 303, categoryId: 3, name: 'Heaven4 Signature Charcuterie Board', description: 'Curated aged mortadella, copa, soppressata, aged comté & manchego cheese, cornichons, fig chutney, sourdough crostini & candied walnuts.', basePrice: 28.00, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600' },
    { id: 304, categoryId: 3, name: 'Burrata & Heirloom Tomato Salad', description: 'Creamy fresh Italian burrata, rainbow heirloom tomatoes, aged balsamic reduction, basil oil, fleur de sel & toasted pine nuts.', basePrice: 16.00, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600' },
    { id: 305, categoryId: 3, name: 'Crispy Calamari Fritti', description: 'Panko-dusted squid rings fried golden, lemon zest, sea salt flakes, house garlic aioli, fresh marinara & charred lemon wedges.', basePrice: 15.00, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=600' },

    // ── MAINS (Cat 4) ──
    { id: 401, categoryId: 4, name: 'Grilled Atlantic Salmon Fillet', description: 'Pan-seared Atlantic salmon, lemon caper beurre blanc, wilted baby spinach, baby roasted potatoes & fresh micro herbs.', basePrice: 28.50, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600' },
    { id: 402, categoryId: 4, name: '28-Day Dry Aged Ribeye (300g)', description: 'Premium bone-in ribeye aged 28 days, compound herb butter, roasted garlic head, hand-cut chips & rich black peppercorn jus.', basePrice: 52.00, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600' },
    { id: 403, categoryId: 4, name: 'Slow-Braised Beef Short Rib Pasta', description: 'Wide pappardelle pasta, 6-hour red wine braised beef short rib ragu, San Marzano tomatoes, fresh parmesan & torn basil.', basePrice: 24.99, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600' },
    { id: 404, categoryId: 4, name: 'Wild Mushroom & Truffle Risotto', description: 'Carnaroli rice, mixed wild mushroom duxelles, black truffle paste, whipped parmesan foam, crispy sage & white truffle oil drizzle.', basePrice: 21.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600' },
    { id: 405, categoryId: 4, name: 'Pan-Seared Duck Breast', description: 'French Magret duck breast, sour cherry & Pinot Noir reduction, creamy celeriac purée, haricots verts & crispy potato rosti.', basePrice: 34.00, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600' },

    // ── MOCKTAILS (Cat 5) ──
    { id: 501, categoryId: 5, name: 'Cucumber & Elderflower Spritz', description: 'Fresh muddled cucumber, St-Germain elderflower cordial, fresh lime juice, ginger beer & a fresh rosemary sprig. Elegantly zero-proof.', basePrice: 6.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1498603993951-8a027a8a8f84?w=600' },
    { id: 502, categoryId: 5, name: 'Watermelon Jalapeño Cooler', description: 'Fresh-pressed watermelon juice, lightly muddled jalapeño, lime, young coconut water & a Himalayan pink salt rim.', basePrice: 7.00, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1559181567-c3190bbb0f93?w=600' },
    { id: 503, categoryId: 5, name: 'House Artisanal Peach Iced Tea', description: 'Cold-brewed Darjeeling black tea infused with white peach purée, fresh mint, raw Acacia honey & sparkling water.', basePrice: 5.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600' },
    { id: 504, categoryId: 5, name: 'Virgin Passion Fruit Mojito', description: 'Crushed fresh mint, ripe passion fruit pulp, freshly squeezed lime, organic cane sugar syrup & premium sparkling soda over crushed ice.', basePrice: 6.00, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600' },
    { id: 505, categoryId: 5, name: 'Blue Butterfly Pea Lemonade', description: 'Color-changing butterfly pea flower brew, freshly squeezed lemon, lavender honey syrup & sparkling water. Watch it turn violet-pink!', basePrice: 7.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600' },

    // ── COCKTAILS (Cat 6) ──
    { id: 601, categoryId: 6, name: 'Heaven4 Smoked Cherry Negroni', description: 'Campari, Tanqueray gin, sweet vermouth, cherry bitters, hand-torched orange smoke & Angostura. Served over a single polished ice sphere.', basePrice: 18.00, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600' },
    { id: 602, categoryId: 6, name: 'Hendricks Botanical Gin & Tonic', description: "Hendrick's gin, Fever-Tree elderflower tonic water, thinly sliced fresh cucumber, pink grapefruit twist & dried juniper berries.", basePrice: 15.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600' },
    { id: 603, categoryId: 6, name: 'Dark Rum Passion Fruit Daiquiri', description: 'Havana Club 7yr dark rum, fresh passion fruit coulis, freshly squeezed lime, brown cane sugar & Angostura. Shaken hard over ice.', basePrice: 16.00, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1572490122747-3a3d536e4b47?w=600' },
    { id: 604, categoryId: 6, name: 'Aged Reserve Whisky Flight (60ml)', description: 'Rotating reserve cask selection — Glenfarclas 15yr, Macallan Amber or Oban 14yr. Served neat with a drop of Scottish water & a palate note card.', basePrice: 18.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600' },

    // ── WINES (Cat 7) ──
    { id: 701, categoryId: 7, name: 'Reserve Cabernet Sauvignon (Glass)', description: '2019 Napa Valley. Deep ruby with dark cherry, blackcurrant & cedar. Full-bodied with velvety tannins & a long oak-aged finish. 150ml pour.', basePrice: 16.00, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600' },
    { id: 702, categoryId: 7, name: 'Côtes du Rhône Grenache Blanc (Glass)', description: '2021 Southern France. Crisp & floral with notes of white peach, apricot & jasmine. Refreshing mineral finish. 150ml pour.', basePrice: 13.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600' },
    { id: 703, categoryId: 7, name: 'Moët & Chandon Brut Impérial (Glass)', description: 'The iconic French Champagne. Toasted brioche, white peach & honeysuckle on the nose. Fine persistent bubbles & a vibrant chalky finish. 125ml.', basePrice: 22.00, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=600' },
    { id: 704, categoryId: 7, name: 'Whispering Angel Provence Rosé (Glass)', description: '2022 Côtes de Provence, France. Delicate pale salmon-pink, notes of dried flowers, red berry & fresh cream. The ultimate summer Rosé. 150ml.', basePrice: 17.00, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1559526323-cb2f2fe2591b?w=600' },

    // ── DESSERTS (Cat 8) ──
    { id: 801, categoryId: 8, name: 'Molten Dark Chocolate Lava Cake', description: 'Warm 70% Valrhona dark chocolate fondant with a flowing molten center, Madagascar vanilla bean gelato, candied hazelnut praline & cacao dust.', basePrice: 11.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600' },
    { id: 802, categoryId: 8, name: 'Crème Brûlée Classique', description: 'Classic Parisian vanilla bean custard with a perfectly caramelized golden sugar crust, fresh seasonal berries & a wafer-thin almond tuile.', basePrice: 9.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600' },
    { id: 803, categoryId: 8, name: 'Tiramisu della Casa', description: 'House-made tiramisu with espresso-soaked savoiardi biscuits, Kahlúa-spiked mascarpone cream & premium Dutch cocoa. Set overnight for depth.', basePrice: 10.00, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600' },
    { id: 804, categoryId: 8, name: 'Mango & Coconut Panna Cotta', description: 'Silky Thai coconut panna cotta layered with fresh Alphonso mango compote, passionfruit coulis, toasted coconut flakes & micro lime zest.', basePrice: 9.00, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600' },
    { id: 805, categoryId: 8, name: 'Artisan Gelato Flight (3 Scoops)', description: 'Your choice of 3 scoops from our daily rotation: Pistachio di Bronte, Stracciatella, Salted Caramel Swirl, Yuzu Sorbet or Fresh Raspberry.', basePrice: 8.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600' },
];

// ── DEDICATED EVENT MENU ──────────────────────────────────────────────────────
const EVENT_MENU_ITEMS = [
    { id: 'ev1', name: 'Truffle Mushroom Bruschetta', description: 'Thick-cut toasted sourdough, wild mushroom & black truffle cream, aged parmesan shavings, roasted cherry tomatoes & Sicilian micro basil.', price: 16.00, category: '🥂 Event Starters', badge: 'VEG', badgeColor: 'text-emerald-400 bg-emerald-400/10', imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600' },
    { id: 'ev2', name: 'Wagyu Beef Slider Trio', description: 'Three mini gold-sesame brioche sliders with A5 Wagyu smash patties, caramelized onion, aged cheddar & event-exclusive bone marrow truffle butter.', price: 32.00, category: '🥂 Event Starters', badge: 'NON-VEG', badgeColor: 'text-red-400 bg-red-400/10', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600' },
    { id: 'ev3', name: 'Butter Poached Nova Scotia Lobster', description: 'Butter-poached whole lobster tail, Champagne beurre blanc, hand-made saffron risotto cake, Oscietra caviar pearls & micro chervil.', price: 68.00, category: '🍽 Event Mains', badge: 'NON-VEG', badgeColor: 'text-red-400 bg-red-400/10', imageUrl: 'https://images.unsplash.com/photo-1559742811-822863646df1?w=600' },
    { id: 'ev4', name: 'Herb-Crusted Rack of Lamb', description: 'Josper-roasted French rack of lamb, Provençal herb crust, rosemary & Pinot jus, whipped truffle potato, glazed Chantenay carrots & mint gremolata.', price: 52.00, category: '🍽 Event Mains', badge: 'NON-VEG', badgeColor: 'text-red-400 bg-red-400/10', imageUrl: 'https://images.unsplash.com/photo-1610397095767-84a5b4736cbd?w=600' },
    { id: 'ev5', name: 'Moët & Chandon Brut NV (Bottle)', description: 'The official event champagne. Crisp, celebratory Moët & Chandon Brut Impérial served tableside. Serves up to 6 flutes for the full table.', price: 85.00, category: '🥃 Event Drinks', badge: 'ALCOHOLIC', badgeColor: 'text-amber-400 bg-amber-400/10', imageUrl: 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=600' },
    { id: 'ev6', name: '24k Gold Leaf Champagne Cocktail', description: 'Moët Champagne, Grand Marnier liqueur, edible 24-karat gold leaf flakes & a hand-dipped rose petal sugar rim. The most iconic event drink.', price: 38.00, category: '🥃 Event Drinks', badge: 'ALCOHOLIC', badgeColor: 'text-amber-400 bg-amber-400/10', imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600' },
    { id: 'ev7', name: 'Rose & Passion Fruit Jazz Mojito', description: 'White rum, fresh passion fruit, organic rose syrup, hand-muddled mint, freshly squeezed lime & sparkling soda. The signature event cocktail.', price: 18.00, category: '🥃 Event Drinks', badge: 'ALCOHOLIC', badgeColor: 'text-amber-400 bg-amber-400/10', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600' },
    { id: 'ev8', name: 'Hibiscus & Berry Sparkler (Mocktail)', description: 'Zero-proof celebration drink: deep-brewed hibiscus tea, mixed berry purée, rose water, fresh lime & Fever-Tree elderflower tonic. Stunning colour.', price: 10.00, category: '🥃 Event Drinks', badge: 'NO-ALCOHOL', badgeColor: 'text-blue-400 bg-blue-400/10', imageUrl: 'https://images.unsplash.com/photo-1498603993951-8a027a8a8f84?w=600' },
    { id: 'ev9', name: 'Valrhona Gold Fondant & Baileys Dome', description: 'Valrhona 80% dark chocolate fondant, molten Baileys Irish Cream core, hand-painted 24k gold chocolate dome & Tahitian vanilla ice cream.', price: 16.00, category: '🍮 Event Desserts', badge: 'VEG', badgeColor: 'text-emerald-400 bg-emerald-400/10', imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600' },
    { id: 'ev10', name: 'Alphonso Mango Rose Panna Cotta Tower', description: 'Rose-water scented Italian panna cotta tower, Alphonso mango gel layers, passionfruit coulis, hand-spun sugar cage & freeze-dried berry dust.', price: 14.00, category: '🍮 Event Desserts', badge: 'VEG', badgeColor: 'text-emerald-400 bg-emerald-400/10', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600' },
];

type MenuTab = 'regular' | 'events';

export default function CustomerMenuPage() {
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
    const [items, setItems] = useState<MenuItem[]>(DEFAULT_ITEMS);
    const [activeCategory, setActiveCategory] = useState<number | null>(1);
    const [menuTab, setMenuTab] = useState<MenuTab>('regular');
    const [activeEventCategory, setActiveEventCategory] = useState<string>('🥂 Event Starters');
    const [error, setError] = useState<string | null>(null);
    const { addToCart, items: cartItems } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        try {
            setError(null);
            const res = await apiClient.get('/catalog/full', { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
            if (res?.data?.categories && res.data.categories.length > 0) {
                setCategories(res.data.categories);
                const flatItems = Object.values(res.data.items).flat() as MenuItem[];
                if (flatItems.length > 0) setItems(flatItems);
                const firstWithItems = res.data.categories.find((c: any) => res.data.items[c.id]?.length > 0);
                setActiveCategory(firstWithItems ? firstWithItems.id : res.data.categories[0].id);
            }
        } catch {
            // Offline — rich fallback menu is set by default
        }
    };

    const displayItems = items.filter(i => i.categoryId === activeCategory);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const eventCategories = [...new Set(EVENT_MENU_ITEMS.map(i => i.category))];
    const displayEventItems = EVENT_MENU_ITEMS.filter(i => i.category === activeEventCategory);

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-32 relative">
            {/* ── Top Header Bar ── */}
            <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center max-w-7xl mx-auto shadow-2xl">
                <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-amber-400" /> Heaven4 Menu
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">Gourmet dining, craft cocktails & curated events — all at your table.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/customer/order-status')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-full font-bold text-xs transition-all">
                        Track Order
                    </button>
                    <button onClick={() => navigate('/customer/cart')} className="relative p-3 bg-slate-900 rounded-full shadow-lg border border-slate-800 hover:border-blue-500 transition-all">
                        <ShoppingBag className="w-5 h-5 text-blue-400" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">{cartCount}</span>
                        )}
                    </button>
                </div>
            </div>

            <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* ── Live Events Banner ── */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-gradient-to-r from-purple-950/80 via-slate-900 to-amber-950/80 border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                            <Ticket className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="px-2.5 py-0.5 bg-red-500/20 text-red-300 text-[10px] font-black rounded-full border border-red-500/30 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" /> LIVE EVENT TONIGHT
                                </span>
                                <span className="text-xs font-black text-amber-300">🎷 Sunset Rooftop Jazz & Wine Night</span>
                            </div>
                            <p className="text-xs text-slate-300">Rooftop Lounge · Live Sax & Wine Tasting · VIP Tables Available Now</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/customer/events')}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-1.5 transition-all shrink-0">
                        Browse & Book Events <ChevronRight className="w-4 h-4" />
                    </button>
                </motion.div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                {/* ── Menu Mode Toggle ── */}
                <div className="flex gap-2">
                    <button onClick={() => setMenuTab('regular')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all ${menuTab === 'regular' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'}`}>
                        🍽 Dining Menu
                    </button>
                    <button onClick={() => setMenuTab('events')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all ${menuTab === 'events' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'}`}>
                        <Star className="w-4 h-4" /> Event Special Menu
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {menuTab === 'regular' ? (
                        <motion.div key="regular" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                            {/* Category Tabs */}
                            <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-none">
                                {categories.map(cat => (
                                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                                        className={`px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'}`}>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {/* Category Header */}
                            <div>
                                <h2 className="text-xl font-black text-white">{categories.find(c => c.id === activeCategory)?.name}</h2>
                                <p className="text-xs text-slate-400 mt-0.5">{categories.find(c => c.id === activeCategory)?.description}</p>
                            </div>

                            {/* Items Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                <AnimatePresence>
                                    {displayItems.map(item => (
                                        <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ y: -4 }}
                                            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col group hover:border-amber-500/40 transition-all">
                                            {item.imageUrl && (
                                                <div className="h-48 overflow-hidden relative">
                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                    <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold border border-slate-800">
                                                        {item.isVeg
                                                            ? <span className="text-emerald-400 flex items-center gap-1 font-black"><Leaf className="w-3 h-3" /> VEG</span>
                                                            : <span className="text-red-400 font-black flex items-center gap-1"><Flame className="w-3 h-3" /> NON-VEG</span>}
                                                    </div>
                                                    <div className="absolute bottom-3 right-3 bg-amber-500/95 text-slate-950 px-3 py-1 rounded-xl text-sm font-black shadow-lg">
                                                        ${item.basePrice.toFixed(2)}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="p-4 flex-1 flex flex-col">
                                                <h3 className="font-black text-sm text-white group-hover:text-amber-400 transition-colors leading-tight">{item.name}</h3>
                                                <p className="text-slate-400 text-xs mt-1.5 line-clamp-3 leading-relaxed flex-1">{item.description}</p>
                                                <button onClick={() => addToCart({ menuItemId: item.id, name: item.name, price: item.basePrice, quantity: 1, imageUrl: item.imageUrl })}
                                                    className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all">
                                                    <Plus className="w-4 h-4" /> Add to Order
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {displayItems.length === 0 && (
                                <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl">
                                    <p className="text-slate-400 text-xs font-bold">No dishes found in this category.</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="events" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            {/* Event Menu Banner */}
                            <div className="p-6 bg-gradient-to-br from-amber-950/60 via-slate-900 to-purple-950/60 border border-amber-500/30 rounded-3xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <Star className="w-5 h-5 text-amber-400" />
                                    <h2 className="text-lg font-black text-amber-300">🎷 Event Night Exclusive Menu</h2>
                                    <span className="px-2.5 py-0.5 bg-red-500/20 text-red-300 text-[10px] font-black rounded-full border border-red-500/30 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" /> LIVE TONIGHT
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300">Exclusively crafted event dishes, reserve cocktails & curated wines available only during tonight's Sunset Rooftop Jazz & Wine Night. Each item is prepared fresh to order by our event chef.</p>
                            </div>

                            {/* Event Category Tabs */}
                            <div className="flex gap-2 overflow-x-auto scrollbar-none">
                                {eventCategories.map(cat => (
                                    <button key={cat} onClick={() => setActiveEventCategory(cat)}
                                        className={`px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${activeEventCategory === cat ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Event Items Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {displayEventItems.map(item => (
                                        <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ y: -4 }}
                                            className="bg-slate-900 border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col group hover:border-amber-500/50 transition-all">
                                            <div className="h-48 overflow-hidden relative">
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black border backdrop-blur-sm ${item.badgeColor} border-current`}>{item.badge}</div>
                                                <div className="absolute top-3 right-3 bg-amber-500/95 text-slate-950 px-3 py-1 rounded-xl text-sm font-black shadow-lg">${item.price.toFixed(2)}</div>
                                                <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-900 to-transparent" />
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <h3 className="font-black text-sm text-white group-hover:text-amber-400 transition-colors leading-tight mb-1.5">{item.name}</h3>
                                                <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed flex-1">{item.description}</p>
                                                <button onClick={() => addToCart({ menuItemId: parseInt(item.id.replace('ev', '')) + 9900, name: `[EVENT] ${item.name}`, price: item.price, quantity: 1, imageUrl: item.imageUrl })}
                                                    className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1.5 transition-all">
                                                    <Wine className="w-4 h-4" /> Add to Event Order
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-xs text-slate-500 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>Event menu items are exclusively available during tonight's live event. Prices include a premium event service charge. For bookings & VIP tables, visit the <button onClick={() => navigate('/customer/events')} className="text-amber-400 font-bold hover:underline">Events page</button>.</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* ── Floating Cart Bar ── */}
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
                        className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-96 z-40">
                        <div className="p-4 bg-slate-900/95 backdrop-blur-xl border-2 border-amber-500/50 rounded-3xl shadow-2xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="relative p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/30">
                                    <ShoppingBag className="w-5 h-5" />
                                    <span className="absolute -top-1.5 -right-1.5 bg-slate-950 text-amber-400 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-amber-500">{cartCount}</span>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-amber-400">{cartCount} Item{cartCount > 1 ? 's' : ''} in Cart</p>
                                    <p className="text-sm font-black text-white">${cartSubtotal.toFixed(2)}</p>
                                </div>
                            </div>
                            <button onClick={() => navigate('/customer/cart')}
                                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg flex items-center gap-2 transition-all shrink-0">
                                View Cart & Checkout <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
