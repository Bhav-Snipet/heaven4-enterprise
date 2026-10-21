import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Leaf, Sparkles, AlertCircle, Ticket, ChevronRight, Star, Flame, Search, Clock, AlertTriangle } from 'lucide-react';
import apiClient from '@/core/api/client';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Category, MenuItem, loadCatalogFromStorage } from '@/shared/utils/catalogData';

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
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | null>(1);
    const [menuTab, setMenuTab] = useState<MenuTab>('regular');
    const [activeEventCategory, setActiveEventCategory] = useState<string>('🥂 Event Starters');
    const [error, setError] = useState<string | null>(null);
    const [vegOnly, setVegOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { addToCart, items: cartItems } = useCart();
    const navigate = useNavigate();

    const syncCatalogWithStorage = () => {
        const localData = loadCatalogFromStorage();
        if (localData.categories.length > 0) {
            setCategories(localData.categories);
            const flatItems = Object.values(localData.itemsMap).flat();
            setItems(flatItems);
            if (!activeCategory && localData.categories[0]) {
                setActiveCategory(localData.categories[0].id);
            }
        }
    };

    const fetchCatalog = async () => {
        try {
            setError(null);
            const localData = loadCatalogFromStorage();
            let finalCategories = [...localData.categories];
            let finalItemsMap: Record<number, MenuItem[]> = { ...localData.itemsMap };

            const res = await apiClient.get('/catalog/full', { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
            if (res?.data?.categories && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
                res.data.categories.forEach((bCat: Category) => {
                    if (!finalCategories.some(c => c.id === bCat.id)) {
                        finalCategories.push(bCat);
                    }
                });
                if (res.data.items) {
                    Object.keys(res.data.items).forEach(k => {
                        const numK = Number(k);
                        const bList = res.data.items[k] || [];
                        const currentList = finalItemsMap[numK] || [];
                        bList.forEach((bItem: MenuItem) => {
                            if (!currentList.some(c => c.id === bItem.id)) {
                                currentList.push(bItem);
                            }
                        });
                        finalItemsMap[numK] = currentList;
                    });
                }
            }

            setCategories(finalCategories);
            const flatItems = Object.values(finalItemsMap).flat();
            setItems(flatItems);
            if (!activeCategory && finalCategories[0]) {
                setActiveCategory(finalCategories[0].id);
            }
        } catch {
            syncCatalogWithStorage();
        }
    };

    useEffect(() => {
        syncCatalogWithStorage();
        fetchCatalog();

        const handleCatalogUpdated = () => {
            syncCatalogWithStorage();
        };
        window.addEventListener('heaven4-catalog-updated', handleCatalogUpdated);
        return () => window.removeEventListener('heaven4-catalog-updated', handleCatalogUpdated);
    }, []);

    const rawCategoryItems = items.filter(i => i.categoryId === activeCategory);
    let displayItems = rawCategoryItems;
    if (vegOnly) {
        displayItems = displayItems.filter(i => i.isVeg);
    }
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        displayItems = displayItems.filter(i => i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
    }

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
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/customer/order-status')}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-300 border border-blue-500/30 font-bold text-xs transition-all shadow-sm"
                        title="Track Live Order Status"
                    >
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="hidden sm:inline">Track Order</span>
                    </button>
                    <button
                        onClick={() => navigate('/customer/complaint')}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-red-300 border border-red-500/30 font-bold text-xs transition-all shadow-sm"
                        title="Submit Feedback or Raise a Complaint"
                    >
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="hidden sm:inline">Raise Complaint</span>
                    </button>
                    {cartCount > 0 && (
                        <button
                            onClick={() => navigate('/customer/cart')}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/30 animate-pulse"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>{cartCount} items · ${cartSubtotal.toFixed(2)}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
                {/* ── Event Night Banner ── */}
                <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="p-4 bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
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

                {/* ── Menu Mode Toggle + Search & Veg Filter ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

                    {menuTab === 'regular' && (
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                            {/* Veg Filter Toggle */}
                            <button
                                onClick={() => setVegOnly(!vegOnly)}
                                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                                    vegOnly
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                                }`}
                            >
                                <Leaf className="w-3.5 h-3.5" />
                                <span>{vegOnly ? '✓ Pure Veg Only' : 'Filter Veg Only'}</span>
                            </button>

                            {/* Search bar */}
                            <div className="relative flex-1 md:w-60">
                                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search dishes..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {menuTab === 'regular' ? (
                        <motion.div key="regular" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                            {/* Category Tabs */}
                            <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-none">
                                {categories.map(cat => {
                                    const count = (items.filter(i => i.categoryId === cat.id) || []).length;
                                    return (
                                        <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                                            className={`px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                                                activeCategory === cat.id
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                                                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                                            }`}>
                                            <span>{cat.name}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-blue-800 text-blue-200' : 'bg-slate-800 text-slate-500'}`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Category Header */}
                            <div className="flex justify-between items-baseline">
                                <div>
                                    <h2 className="text-xl font-black text-white">{categories.find(c => c.id === activeCategory)?.name}</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">{categories.find(c => c.id === activeCategory)?.description}</p>
                                </div>
                                <span className="text-xs text-slate-500 font-bold">
                                    {displayItems.length} {displayItems.length === 1 ? 'dish' : 'dishes'}
                                    {vegOnly ? ' (Veg)' : ''}
                                </span>
                            </div>

                            {/* Items Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                <AnimatePresence>
                                    {displayItems.map(item => {
                                        const imgSrc = item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
                                        return (
                                            <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ y: -4 }}
                                                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col group hover:border-amber-500/40 transition-all">
                                                <div className="h-48 overflow-hidden relative">
                                                    <img src={imgSrc} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"; }} />
                                                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                                        <span className="bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold border border-slate-800">
                                                            {item.isVeg
                                                                ? <span className="text-emerald-400 flex items-center gap-1 font-black"><Leaf className="w-3 h-3" /> VEG</span>
                                                                : <span className="text-red-400 font-black flex items-center gap-1"><Flame className="w-3 h-3" /> NON-VEG</span>}
                                                        </span>
                                                        {item.spicinessLevel && item.spicinessLevel > 0 ? (
                                                            <span className="bg-orange-500/90 text-white px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-0.5">
                                                                <Flame className="w-2.5 h-2.5 fill-current" /> {item.spicinessLevel === 1 ? 'Mild' : item.spicinessLevel === 2 ? 'Spicy' : 'Hot'}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <div className="absolute bottom-3 right-3 bg-amber-500/95 text-slate-950 px-3 py-1 rounded-xl text-sm font-black shadow-lg">
                                                        ${item.basePrice.toFixed(2)}
                                                    </div>
                                                    {item.isAvailable === false && (
                                                        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex items-center justify-center">
                                                            <span className="px-3.5 py-1 bg-red-500 text-white font-black text-xs rounded-full shadow-lg tracking-wider">
                                                                SOLD OUT
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-black text-sm text-white group-hover:text-amber-400 transition-colors leading-tight">{item.name}</h3>
                                                        <p className="text-slate-400 text-xs mt-1.5 line-clamp-3 leading-relaxed">{item.description}</p>
                                                    </div>
                                                    {item.isAvailable === false ? (
                                                        <div className="mt-4 w-full py-2.5 bg-slate-800/80 text-slate-500 rounded-xl font-bold text-xs flex items-center justify-center border border-slate-700/50 cursor-not-allowed">
                                                            Out of Stock
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => addToCart({ menuItemId: item.id, name: item.name, price: item.basePrice, quantity: 1, imageUrl: imgSrc })}
                                                            className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5 transition-all">
                                                            <Plus className="w-4 h-4" /> Add to Order
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {displayItems.length === 0 && (
                                <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl">
                                    <p className="text-slate-400 text-xs font-bold">
                                        {vegOnly ? 'No vegetarian dishes match your search in this category.' : 'No dishes found matching your search.'}
                                    </p>
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
                                        className={`px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${activeEventCategory === cat ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Event Items Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayEventItems.map(item => (
                                    <motion.div key={item.id} whileHover={{ y: -4 }}
                                        className="bg-slate-900 border border-amber-500/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col group hover:border-amber-500/50 transition-all">
                                        <div className="h-48 overflow-hidden relative">
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold border border-slate-800">
                                                <span className={item.badgeColor}>{item.badge}</span>
                                            </div>
                                            <div className="absolute bottom-3 right-3 bg-amber-500 text-slate-950 px-3 py-1 rounded-xl text-sm font-black shadow-lg">
                                                ${item.price.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-black text-sm text-white group-hover:text-amber-400 transition-colors leading-tight">{item.name}</h3>
                                                <p className="text-slate-400 text-xs mt-1.5 line-clamp-3 leading-relaxed">{item.description}</p>
                                            </div>
                                            <button onClick={() => addToCart({ menuItemId: Number(item.id.replace('ev', '9000')), name: item.name, price: item.price, quantity: 1, imageUrl: item.imageUrl })}
                                                className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-1.5 transition-all">
                                                <Plus className="w-4 h-4" /> Add Event Dish
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
