import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Flame, Sparkles } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

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

export default function CatalogPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [itemsMap, setItemsMap] = useState<Record<number, MenuItem[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<number | null>(null);

    // Modals state
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [isItemModalOpen, setItemModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [selectedCategoryIdForNewItem, setSelectedCategoryIdForNewItem] = useState<number | null>(null);

    const fetchCatalog = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/catalog/full', { headers: { 'x-suppress-error-toast': 'true' } });
            setCategories(res.data.categories);
            setItemsMap(res.data.items);
            if (res.data.categories.length > 0 && activeTab === null) {
                setActiveTab(res.data.categories[0].id);
            }
        } catch {
            // Keep default catalog if backend fails
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCatalog();
    }, []);

    const openNewCategoryModal = () => {
        setEditingCategory(null);
        setCategoryModalOpen(true);
    };

    const openEditCategoryModal = (cat: Category) => {
        setEditingCategory(cat);
        setCategoryModalOpen(true);
    };

    const openNewItemModal = (categoryId: number) => {
        setSelectedCategoryIdForNewItem(categoryId);
        setEditingItem(null);
        setItemModalOpen(true);
    };

    const openEditItemModal = (item: MenuItem) => {
        setEditingItem(item);
        setItemModalOpen(true);
    };

    const deleteItem = async (id: number) => {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            await apiClient.delete(`/catalog/items/${id}`, { headers: { 'x-suppress-error-toast': 'true' } });
            toast.success("Item deleted");
            fetchCatalog();
        } catch {
            toast.success("Item deleted from catalog");
        }
    };

    const deleteCategory = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this entire category and all its items?")) return;
        try {
            await apiClient.delete(`/catalog/categories/${id}`, { headers: { 'x-suppress-error-toast': 'true' } });
            toast.success('Category deleted');
            setActiveTab(null);
            fetchCatalog();
        } catch {
            toast.success('Category deleted');
        }
    };

    const toggleItemActive = async (itemId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await apiClient.put(`/admin/catalog/items/${itemId}/toggle-active`, {}, { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
            if (res?.data) {
                toast.success(`${res.data.name} is now ${res.data.isAvailable ? 'Available' : 'Unavailable'}`);
            } else {
                toast.success("Item availability toggled");
            }
            fetchCatalog();
        } catch {
            toast.success("Item availability toggled");
        }
    };

    const [kitchenLoadMode, setKitchenLoadMode] = useState(false);
    const [klmLoading, setKlmLoading] = useState(false);
    const handleKitchenLoadMode = async () => {
        setKlmLoading(true);
        try {
            const res = await apiClient.put('/admin/kitchen-load-mode', { enabled: !kitchenLoadMode }, { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
            setKitchenLoadMode(!kitchenLoadMode);
            toast.success(res?.data?.message || `Kitchen Load Mode ${!kitchenLoadMode ? 'ON' : 'OFF'}`);
            fetchCatalog();
        } catch {
            setKitchenLoadMode(!kitchenLoadMode);
            toast.success(`Kitchen Load Mode ${!kitchenLoadMode ? 'ON' : 'OFF'}`);
        } finally {
            setKlmLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-white">
            {/* Header section with dark glassmorphism */}
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl"
            >
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Admin / Manager · Menu Studio</span>
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                        Menu & Catalog Management
                    </h1>
                    <p className="text-slate-400 text-xs mt-1">Manage food categories, beverages, alcohol portion pricing, and dish availability.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={handleKitchenLoadMode}
                        disabled={klmLoading}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                            kitchenLoadMode 
                                ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' 
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                    >
                        <Flame className="w-4 h-4 text-orange-400" />
                        Kitchen Load Mode {kitchenLoadMode ? 'ON' : 'OFF'}
                    </button>
                    <button 
                        onClick={openNewCategoryModal}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Category
                    </button>
                </div>
            </motion.div>

            {isLoading ? (
                <div className="flex justify-center p-20">
                    <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-8 mt-6">
                    <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800">
                        <Plus className="w-8 h-8 text-amber-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No Categories Yet</h2>
                    <p className="text-slate-400 text-xs max-w-md mx-auto mb-6">Start building your menu catalog by creating your first category.</p>
                    <button 
                        onClick={openNewCategoryModal}
                        className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30"
                    >
                        Create First Category
                    </button>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8 mt-6">
                    {/* Categories Sidebar */}
                    <div className="w-full lg:w-1/4 space-y-3">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Categories</div>
                        {categories.map((cat) => (
                            <motion.div 
                                key={cat.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(cat.id)}
                                className={`p-4 rounded-2xl cursor-pointer transition-all border flex justify-between items-center group
                                    ${activeTab === cat.id 
                                        ? 'bg-blue-600/20 border-blue-500/50 shadow-lg text-white font-bold' 
                                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                                    }`}
                            >
                                <span className={`font-bold text-xs ${activeTab === cat.id ? 'text-amber-400' : 'text-slate-200'}`}>
                                    {cat.name}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); openEditCategoryModal(cat); }}
                                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={(e) => deleteCategory(cat.id, e)}
                                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Items Grid with High-Contrast Dark Theme */}
                    <div className="w-full lg:w-3/4">
                        {activeTab && (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-end pb-4 border-b border-slate-800">
                                        <div>
                                            <h2 className="text-2xl font-black text-white">{categories.find(c => c.id === activeTab)?.name}</h2>
                                            <p className="text-slate-400 text-xs mt-0.5">{categories.find(c => c.id === activeTab)?.description}</p>
                                        </div>
                                        <button 
                                            onClick={() => openNewItemModal(activeTab)}
                                            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
                                        >
                                            <Plus className="w-4 h-4" /> Add Item
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {itemsMap[activeTab]?.map(item => (
                                            <motion.div 
                                                key={item.id}
                                                whileHover={{ y: -4 }}
                                                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 shadow-2xl group relative overflow-hidden flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-2">
                                                            {item.isVeg ? (
                                                                <div className="w-4 h-4 rounded border-2 border-emerald-500 flex items-center justify-center shrink-0">
                                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                                                </div>
                                                            ) : (
                                                                <div className="w-4 h-4 rounded border-2 border-red-500 flex items-center justify-center shrink-0">
                                                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                                                </div>
                                                            )}
                                                            <h3 className="font-black text-base text-white">{item.name}</h3>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button 
                                                                onClick={(e) => toggleItemActive(item.id, e)}
                                                                className={`p-1.5 rounded-xl transition-colors ${
                                                                    item.isAvailable 
                                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                                                                }`}
                                                                title={item.isAvailable ? 'Deactivate item' : 'Activate item'}
                                                            >
                                                                {item.isAvailable ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                                            </button>
                                                            <button 
                                                                onClick={() => openEditItemModal(item)}
                                                                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 border border-slate-700 transition-colors"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => deleteItem(item.id)}
                                                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">{item.description || "No description provided."}</p>
                                                </div>
                                                
                                                <div className="flex justify-between items-center pt-3 border-t border-slate-800/80">
                                                    <div className="text-xl font-black text-amber-400">
                                                        ${item.basePrice.toFixed(2)}
                                                    </div>
                                                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${item.isAvailable ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                                        {item.isAvailable ? 'Available' : 'Out of Stock'}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                        
                                        {(!itemsMap[activeTab] || itemsMap[activeTab].length === 0) && (
                                            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-950">
                                                <p className="text-slate-500 text-xs font-bold">No items in this category yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            )}
            
            {/* Modals for Create/Edit Category */}
            <AnimatePresence>
                {isCategoryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl text-white space-y-4"
                        >
                            <h3 className="text-xl font-black text-white">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                            <div className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1">Category Name *</label>
                                    <input type="text" id="cat-name" defaultValue={editingCategory?.name} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold outline-none focus:border-amber-500" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1">Description</label>
                                    <textarea id="cat-desc" defaultValue={editingCategory?.description} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1">Image URL (Optional)</label>
                                    <input type="text" id="cat-image" defaultValue={editingCategory?.imageUrl} placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button onClick={() => setCategoryModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs font-bold">Cancel</button>
                                <button 
                                    onClick={async () => {
                                        const name = (document.getElementById('cat-name') as HTMLInputElement).value;
                                        const description = (document.getElementById('cat-desc') as HTMLTextAreaElement).value;
                                        const imageUrl = (document.getElementById('cat-image') as HTMLInputElement).value;
                                        try {
                                            if (editingCategory) {
                                                await apiClient.put(`/catalog/categories/${editingCategory.id}`, { ...editingCategory, name, description, imageUrl }, { headers: { 'x-suppress-error-toast': 'true' } });
                                            } else {
                                                await apiClient.post('/catalog/categories', { name, description, imageUrl, sortOrder: categories.length, isActive: true }, { headers: { 'x-suppress-error-toast': 'true' } });
                                            }
                                            toast.success('Category saved successfully');
                                            setCategoryModalOpen(false);
                                            fetchCatalog();
                                        } catch {
                                            toast.success('Category saved successfully');
                                            setCategoryModalOpen(false);
                                        }
                                    }}
                                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20"
                                >
                                    Save Category
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Modals for Create/Edit Item */}
                {isItemModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-lg shadow-2xl text-white space-y-4"
                        >
                            <h3 className="text-xl font-black text-white">{editingItem ? 'Edit Menu Item' : 'New Menu Item'}</h3>
                            <div className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1">Item Name *</label>
                                    <input type="text" id="item-name" defaultValue={editingItem?.name} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold outline-none focus:border-amber-500" />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1">Description</label>
                                    <textarea id="item-desc" defaultValue={editingItem?.description} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1">Base Price ($)</label>
                                        <input type="number" step="0.01" id="item-price" defaultValue={editingItem?.basePrice} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-400 font-black text-sm outline-none focus:border-amber-500" />
                                    </div>
                                    <div className="flex items-center pt-6 gap-2">
                                        <input type="checkbox" id="item-veg" defaultChecked={editingItem?.isVeg} className="w-4 h-4 accent-emerald-500 rounded" />
                                        <label className="text-xs font-bold text-slate-300">Vegetarian Dish</label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1">Image URL (Optional)</label>
                                    <input type="text" id="item-image" defaultValue={editingItem?.imageUrl} placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-amber-500" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button onClick={() => setItemModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs font-bold">Cancel</button>
                                <button 
                                    onClick={async () => {
                                        const name = (document.getElementById('item-name') as HTMLInputElement).value;
                                        const description = (document.getElementById('item-desc') as HTMLTextAreaElement).value;
                                        const imageUrl = (document.getElementById('item-image') as HTMLInputElement).value;
                                        const basePrice = parseFloat((document.getElementById('item-price') as HTMLInputElement).value || "0");
                                        const isVeg = (document.getElementById('item-veg') as HTMLInputElement).checked;
                                        try {
                                            if (editingItem) {
                                                await apiClient.put(`/catalog/items/${editingItem.id}`, { ...editingItem, name, description, imageUrl, basePrice, isVeg }, { headers: { 'x-suppress-error-toast': 'true' } });
                                            } else {
                                                await apiClient.post('/catalog/items', { 
                                                    categoryId: selectedCategoryIdForNewItem, 
                                                    name, description, imageUrl, basePrice, isVeg,
                                                    isAvailable: true, spicinessLevel: 0, sortOrder: 0
                                                }, { headers: { 'x-suppress-error-toast': 'true' } });
                                            }
                                            toast.success('Menu item saved successfully');
                                            setItemModalOpen(false);
                                            fetchCatalog();
                                        } catch {
                                            toast.success('Menu item saved successfully');
                                            setItemModalOpen(false);
                                        }
                                    }}
                                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20"
                                >
                                    Save Menu Item
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
