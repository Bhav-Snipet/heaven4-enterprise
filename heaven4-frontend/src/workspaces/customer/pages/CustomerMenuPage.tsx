import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Star, Leaf } from 'lucide-react';
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

export default function CustomerMenuPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
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
            setCategories(res.data.categories);
            const flatItems = Object.values(res.data.items).flat() as MenuItem[];
            setItems(flatItems);
            
            const firstCategoryWithItems = res.data.categories.find((c: any) => res.data.items[c.id]?.length > 0);
            if (firstCategoryWithItems) setActiveCategory(firstCategoryWithItems.id);
            else if (res.data.categories.length > 0) setActiveCategory(res.data.categories[0].id);
        } catch (err: any) {
            console.error('Failed to fetch catalog', err);
            setError("Failed to load menu. Please ensure you are logged in and connected.");
        }
    };

    const displayItems = items.filter(i => i.categoryId === activeCategory);
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            {/* Header / Nav */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Our Menu
                    </h1>
                    <p className="text-sm text-slate-500">Tap to order instantly</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/customer/order-status')}
                        className="relative px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full shadow-sm font-semibold text-sm transition-all flex items-center gap-2"
                    >
                        Track Order
                    </button>
                    <button 
                        onClick={() => navigate('/customer/cart')}
                        className="relative p-3 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
                    >
                        <ShoppingBag className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Categories Scroll */}
            {error ? (
                <div className="p-8 text-center text-red-500 font-semibold bg-red-50 mx-4 rounded-xl border border-red-100">
                    {error}
                </div>
            ) : (
                <div className="overflow-x-auto p-4 hide-scrollbar">
                    <div className="flex gap-3">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                                    activeCategory === cat.id 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Items Grid */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayItems.map(item => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={item.id} 
                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex gap-4"
                    >
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-28 h-28 object-cover rounded-xl" />
                        ) : (
                            <div className="w-28 h-28 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                                <Star className="w-8 h-8 text-slate-300" />
                            </div>
                        )}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-white">{item.name}</h3>
                                    {item.isVeg && <Leaf className="w-4 h-4 text-green-500 flex-shrink-0" />}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-bold text-lg text-slate-900 dark:text-white">${item.basePrice.toFixed(2)}</span>
                                <button 
                                    onClick={() => addToCart({
                                        menuItemId: item.id,
                                        name: item.name,
                                        price: item.basePrice,
                                        quantity: 1,
                                        imageUrl: item.imageUrl
                                    })}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" /> Add to Cart
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            {displayItems.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    No items found in this category.
                </div>
            )}

            {/* Floating Cart Button (FAB) */}
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50"
                    >
                        <button
                            onClick={() => navigate('/customer/cart')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-4 shadow-2xl shadow-blue-600/40 flex items-center justify-between transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 px-3 py-1 rounded-lg font-bold text-sm">
                                    {cartCount}
                                </div>
                                <span className="font-semibold tracking-wide">View Cart</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">${cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}</span>
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
