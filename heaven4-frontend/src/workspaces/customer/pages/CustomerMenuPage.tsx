import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Leaf, Sparkles, AlertCircle } from 'lucide-react';
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
    { id: 1, name: 'Burgers', description: 'Juicy handcrafted burgers' },
    { id: 2, name: 'Pizzas', description: 'Wood-fired sourdough pizzas' },
    { id: 3, name: 'Beverages', description: 'Craft drinks & mocktails' },
    { id: 4, name: 'Desserts', description: 'Artisanal sweets' }
];

const DEFAULT_ITEMS: MenuItem[] = [
    { id: 101, categoryId: 1, name: 'Classic Cheeseburger', description: 'Juicy beef patty with melted cheddar, lettuce, tomato & brioche bun.', basePrice: 9.99, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
    { id: 102, categoryId: 1, name: 'Spicy Chicken Burger', description: 'Crispy chicken breast with spicy mayo & jalapeños.', basePrice: 14.50, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400' },
    { id: 103, categoryId: 1, name: 'Double Truffle Burger', description: 'Two smashed patties with truffle mayo & caramelized onions.', basePrice: 14.99, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400' },
    { id: 104, categoryId: 1, name: 'Veggie Delight Burger', description: 'Plant-based patty with avocado & vegan garlic sauce.', basePrice: 10.99, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400' },
    { id: 201, categoryId: 2, name: 'Truffle Mushroom Pizza', description: 'Wild mushrooms, mozzarella & black truffle oil.', basePrice: 19.99, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },
    { id: 301, categoryId: 3, name: 'Lemon Mint Mojito', description: 'Fresh sparkling lemonade with crushed mint leaves.', basePrice: 5.50, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400' }
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
            const res = await apiClient.get('/catalog/full');
            if (res.data?.categories && res.data.categories.length > 0) {
                setCategories(res.data.categories);
                const flatItems = Object.values(res.data.items).flat() as MenuItem[];
                setItems(flatItems);
                
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

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-28">
            {/* Header / Nav */}
            <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center max-w-7xl mx-auto shadow-2xl">
                <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-amber-400" /> Our Culinary Menu
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">Tap to select dishes and order directly to your dining table.</p>
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
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                {/* Categories Bar */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setActiveCategory(c.id)}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap border shadow-lg ${
                                activeCategory === c.id
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400 text-white shadow-blue-500/20'
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {displayItems.map((item) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={item.id}
                                className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-3xl p-5 shadow-2xl flex flex-col justify-between transition-all group"
                            >
                                <div className="space-y-4">
                                    {item.imageUrl && (
                                        <div className="h-44 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                                            <img 
                                                src={item.imageUrl} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {item.isVeg && (
                                                <span className="absolute top-3 right-3 p-1.5 bg-slate-950/80 backdrop-blur-md rounded-xl border border-emerald-500/40 text-emerald-400">
                                                    <Leaf className="w-4 h-4" />
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-black text-lg text-white group-hover:text-amber-400 transition-colors">
                                                {item.name}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
                                    <span className="text-xl font-black text-emerald-400">
                                        ${item.basePrice.toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => addToCart({
                                            menuItemId: item.id,
                                            name: item.name,
                                            price: item.basePrice,
                                            quantity: 1
                                        })}
                                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all"
                                    >
                                        <Plus className="w-4 h-4" /> Add to Cart
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
