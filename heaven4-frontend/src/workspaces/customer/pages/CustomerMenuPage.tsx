import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Leaf, Sparkles, AlertCircle, Ticket, ChevronRight, ArrowRight } from 'lucide-react';
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
    { id: 1, name: '🍔 Burgers & Handhelds', description: 'Gourmet smashed & classic brioche burgers' },
    { id: 2, name: '🍕 Wood-Fired Pizzas', description: 'Artisanal sourdough pizzas with organic toppings' },
    { id: 3, name: '🥗 Starters & Tapas', description: 'Crispy small plates & sharing boards' },
    { id: 4, name: '🥤 Mocktails & Refreshers', description: 'Fresh sparkling fruit infusions & coolers' },
    { id: 5, name: '🍸 Cocktails & Fine Spirits', description: 'Craft cocktails, single malts & aged tequila' },
    { id: 6, name: '🍰 Artisanal Desserts', description: 'Decadent sweet treats & molten cakes' }
];

const DEFAULT_ITEMS: MenuItem[] = [
    // Burgers (Cat 1)
    { id: 101, categoryId: 1, name: 'Classic Cheeseburger', description: 'Juicy beef patty with melted cheddar, lettuce, tomato & brioche bun.', basePrice: 12.99, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
    { id: 102, categoryId: 1, name: 'Spicy Crispy Chicken Burger', description: 'Crispy fried chicken breast with spicy chipotle mayo & jalapeños.', basePrice: 14.50, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400' },
    { id: 103, categoryId: 1, name: 'Double Truffle Smash Burger', description: 'Two smashed patties with black truffle mayo & caramelized onions.', basePrice: 16.99, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400' },
    { id: 104, categoryId: 1, name: 'Avocado Plant-Based Smash', description: 'Plant-based patty with fresh avocado & vegan garlic aioli.', basePrice: 13.99, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400' },

    // Pizzas (Cat 2)
    { id: 201, categoryId: 2, name: 'Truffle Wild Mushroom Pizza', description: 'Wild portobello, mozzarella, fresh thyme & black truffle oil.', basePrice: 19.99, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },
    { id: 202, categoryId: 2, name: 'Pepperoni Supreme & Hot Honey', description: 'Double pepperoni, san marzano tomato & hot chili honey drizzle.', basePrice: 21.50, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400' },
    { id: 203, categoryId: 2, name: 'Margherita Di Bufala', description: 'Fresh buffalo mozzarella, san marzano tomatoes & organic basil leaves.', basePrice: 17.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400' },

    // Starters (Cat 3)
    { id: 301, categoryId: 3, name: 'Truffle Parmesan Loader Fries', description: 'Crispy hand-cut fries tossed with truffle oil, garlic & aged parmesan.', basePrice: 8.99, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400' },
    { id: 302, categoryId: 3, name: 'Crispy Calamari Rings', description: 'Golden breaded squid rings served with garlic lemon aioli.', basePrice: 14.00, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400' },
    { id: 303, categoryId: 3, name: 'Artisan Cheese & Meat Board', description: 'Selection of cured meats, artisan cheeses, fig jam & crostini.', basePrice: 24.00, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400' },

    // Drinks (Cat 4)
    { id: 401, categoryId: 4, name: 'Sparkling Lemon Mint Mojito', description: 'Crushed organic mint, fresh lime juice & sparkling soda.', basePrice: 5.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400' },
    { id: 402, categoryId: 4, name: 'Artisanal Peach Iced Tea', description: 'Brewed black tea infused with natural peach nectar.', basePrice: 4.99, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },

    // Spirits & Cocktails (Cat 5)
    { id: 501, categoryId: 5, name: 'Signature Smoked Old Fashioned', description: 'Bourbon whiskey, Angostura bitters & torched orange peel.', basePrice: 16.00, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400' },
    { id: 502, categoryId: 5, name: 'Botanical Tonic & Gin', description: 'Craft gin with elderflower tonic & fresh cucumber ribbon.', basePrice: 14.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400' },

    // Desserts (Cat 6)
    { id: 601, categoryId: 6, name: 'Molten Dark Chocolate Lava Cake', description: 'Warm dark chocolate cake with a molten center & vanilla bean gelato.', basePrice: 9.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400' }
];

export default function CustomerMenuPage() {
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
    const [items, setItems] = useState<MenuItem[]>(DEFAULT_ITEMS);
    const [activeCategory, setActiveCategory] = useState<number | null>(1);
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
                
                const firstCategoryWithItems = res.data.categories.find((c: any) => res.data.items[c.id]?.length > 0);
                if (firstCategoryWithItems) setActiveCategory(firstCategoryWithItems.id);
                else setActiveCategory(res.data.categories[0].id);
            }
        } catch {
            console.log("Using local default menu items fallback");
        }
    };

    const displayItems = items.filter(i => i.categoryId === activeCategory);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-32 relative">
            {/* Header / Nav */}
            <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center max-w-7xl mx-auto shadow-2xl">
                <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-amber-400" /> Our Culinary & Bar Menu
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">Select gourmet dishes & craft drinks to order directly to your table.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/customer/order-status')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-full font-bold text-xs transition-all shadow-sm"
                    >
                        Track Order
                    </button>
                    <button 
                        onClick={() => navigate('/customer/cart')}
                        className="relative p-3 bg-slate-900 rounded-full shadow-lg border border-slate-800 hover:border-blue-500 transition-all text-white"
                    >
                        <ShoppingBag className="w-5 h-5 text-blue-400" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* 🎭 LIVE & UPCOMING EVENTS FEATURED BANNER */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-gradient-to-r from-purple-950/80 via-slate-900 to-amber-950/80 border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                            <Ticket className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="px-2.5 py-0.5 bg-red-500/20 text-red-300 text-[10px] font-black rounded-full border border-red-500/30 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" /> LIVE EVENT TODAY
                                </span>
                                <span className="text-xs font-black text-amber-300">🎷 Sunset Rooftop Jazz & Wine Night</span>
                            </div>
                            <p className="text-xs text-slate-300">Rooftop Lounge · Live Sax & Wine Tasting · VIP Tables Available</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button
                            onClick={() => navigate('/customer/events')}
                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-1.5 transition-all shrink-0"
                        >
                            Browse & Book Events <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                {/* Category Navigation Tabs */}
                <div className="flex gap-2 border-b border-slate-800 pb-4 overflow-x-auto scrollbar-none">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                                activeCategory === cat.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black scale-105'
                                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Active Category Title */}
                <div className="pt-2">
                    <h2 className="text-xl font-black text-white">
                        {categories.find(c => c.id === activeCategory)?.name || 'Culinary Selection'}
                    </h2>
                    <p className="text-xs text-slate-400">
                        {categories.find(c => c.id === activeCategory)?.description}
                    </p>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayItems.map(item => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -4 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-amber-500/40 transition-all"
                        >
                            <div>
                                {item.imageUrl && (
                                    <div className="h-44 overflow-hidden relative">
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold border border-slate-800 flex items-center gap-1.5">
                                            {item.isVeg ? (
                                                <span className="text-emerald-400 flex items-center gap-1 font-black">
                                                    <Leaf className="w-3 h-3" /> VEG
                                                </span>
                                            ) : (
                                                <span className="text-red-400 font-black">NON-VEG</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="p-5">
                                    <h3 className="font-black text-base text-white group-hover:text-amber-400 transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 pt-0 flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-slate-500 block">Price</span>
                                    <span className="text-xl font-black text-amber-400">
                                        ${item.basePrice.toFixed(2)}
                                    </span>
                                </div>

                                <button
                                    onClick={() => addToCart({ menuItemId: item.id, name: item.name, price: item.basePrice, quantity: 1, imageUrl: item.imageUrl })}
                                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {displayItems.length === 0 && (
                    <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl p-8">
                        <p className="text-slate-400 text-xs font-bold">No dishes found in this category.</p>
                    </div>
                )}
            </main>

            {/* 🛒 FLOATING CART BAR AT SCREEN BOTTOM */}
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-96 z-40"
                    >
                        <div className="p-4 bg-slate-900/95 backdrop-blur-xl border-2 border-amber-500/50 rounded-3xl shadow-2xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="relative p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/30 font-black">
                                    <ShoppingBag className="w-5 h-5" />
                                    <span className="absolute -top-1.5 -right-1.5 bg-slate-950 text-amber-400 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-amber-500">
                                        {cartCount}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-amber-400">{cartCount} Item{cartCount > 1 ? 's' : ''} in Cart</p>
                                    <p className="text-sm font-black text-white">${cartSubtotal.toFixed(2)}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/customer/cart')}
                                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg flex items-center gap-2 transition-all shrink-0"
                            >
                                View Cart & Checkout <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
