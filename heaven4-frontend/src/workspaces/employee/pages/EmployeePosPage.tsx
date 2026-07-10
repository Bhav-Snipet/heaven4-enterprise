import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Trash2, Search, Coffee } from 'lucide-react';
import { apiClient } from '@/core/api/client';
import toast from 'react-hot-toast';

interface Category {
    id: number;
    name: string;
}

interface MenuItem {
    id: number;
    categoryId: number;
    name: string;
    basePrice: number;
    imageUrl?: string;
}

interface CartItem extends MenuItem {
    quantity: number;
}

export default function EmployeePosPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isPlacing, setIsPlacing] = useState(false);

    useEffect(() => {
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        try {
            const [catRes, itemRes] = await Promise.all([
                apiClient.get('/catalog/categories'),
                apiClient.get('/catalog/items')
            ]);
            setCategories(catRes.data);
            setItems(itemRes.data);
            if (catRes.data.length > 0) setActiveCategory(catRes.data[0].id);
        } catch (error) {
            console.error('Failed to fetch POS catalog', error);
        }
    };

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const updateQuantity = (id: number, qty: number) => {
        if (qty <= 0) {
            setCart(prev => prev.filter(i => i.id !== id));
            return;
        }
        setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    };

    const placeOrder = async () => {
        if (cart.length === 0) return;
        setIsPlacing(true);
        try {
            const payload = {
                items: cart.map(i => ({ menuItemId: i.id, quantity: i.quantity }))
            };
            await apiClient.post('/orders', payload);
            toast.success('Order Sent to Kitchen!');
            setCart([]);
        } catch (error) {
            toast.error('Failed to place order');
        } finally {
            setIsPlacing(false);
        }
    };

    const filteredItems = items.filter(i => {
        const matchesCategory = activeCategory === null || i.categoryId === activeCategory;
        const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalAmount = cart.reduce((acc, curr) => acc + (curr.basePrice * curr.quantity), 0);

    return (
        <div className="h-[calc(100vh-64px)] bg-slate-100 dark:bg-slate-950 flex overflow-hidden">
            
            {/* Left: Menu Area */}
            <div className="flex-1 flex flex-col">
                <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search menu items..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar max-w-xl">
                        <button 
                            onClick={() => setActiveCategory(null)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold ${activeCategory === null ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                        >
                            All Items
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold ${activeCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => addToCart(item)}
                            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center text-center h-48"
                        >
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-xl mb-3" />
                            ) : (
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3 flex items-center justify-center">
                                    <Coffee className="w-8 h-8 text-slate-400" />
                                </div>
                            )}
                            <h3 className="font-bold text-sm line-clamp-2 leading-tight mb-1">{item.name}</h3>
                            <p className="text-blue-600 font-bold mt-auto">${item.basePrice.toFixed(2)}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Cart Sidebar */}
            <div className="w-[380px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold">Current Order</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <ShoppingBag className="w-12 h-12 mb-2 opacity-50" />
                            <p>No items added yet</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-sm leading-tight flex-1">{item.name}</h4>
                                    <span className="font-bold">${(item.basePrice * item.quantity).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded p-1 border border-slate-200 dark:border-slate-800">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded font-bold">-</button>
                                        <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded font-bold">+</button>
                                    </div>
                                    <button onClick={() => updateQuantity(item.id, 0)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-500 font-semibold">Total</span>
                        <span className="text-2xl font-bold">${totalAmount.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={placeOrder}
                        disabled={cart.length === 0 || isPlacing}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl font-bold text-lg transition-colors flex justify-center items-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                        {isPlacing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send to Kitchen'}
                    </button>
                </div>
            </div>
        </div>
    );
}
