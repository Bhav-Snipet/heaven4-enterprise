import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';
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
            const res = await apiClient.get('/catalog/full');
            setCategories(res.data.categories);
            setItemsMap(res.data.items);
            if (res.data.categories.length > 0 && activeTab === null) {
                setActiveTab(res.data.categories[0].id);
            }
        } catch (error) {
            toast.error("Failed to load catalog");
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
            await apiClient.delete(`/catalog/items/${id}`);
            toast.success("Item deleted");
            fetchCatalog();
        } catch (e) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header section with glassmorphism */}
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col md:flex-row md:items-center justify-between mb-8 p-6 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                        Menu & Catalog
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage categories, items, and pricing globally.</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-3">
                    <button 
                        onClick={openNewCategoryModal}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-heaven-600 hover:bg-heaven-500 text-white font-medium transition-all shadow-lg shadow-heaven-500/30"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Category</span>
                    </button>
                </div>
            </motion.div>

            {isLoading ? (
                <div className="flex justify-center p-20">
                    <div className="w-10 h-10 border-4 border-heaven-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-20 bg-white/20 dark:bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
                    <div className="w-20 h-20 bg-heaven-100 dark:bg-heaven-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-10 h-10 text-heaven-500" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No Categories Yet</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">Start building your menu by adding your first category, like "Appetizers" or "Main Course".</p>
                    <button 
                        onClick={openNewCategoryModal}
                        className="px-6 py-2 rounded-xl bg-heaven-600 text-white font-medium hover:bg-heaven-500 transition-colors"
                    >
                        Create Category
                    </button>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Categories Sidebar */}
                    <div className="w-full lg:w-1/4 space-y-3">
                        <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 pl-2">Categories</div>
                        {categories.map((cat) => (
                            <motion.div 
                                key={cat.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(cat.id)}
                                className={`p-4 rounded-2xl cursor-pointer transition-all border backdrop-blur-md flex justify-between items-center group
                                    ${activeTab === cat.id 
                                        ? 'bg-heaven-500/10 border-heaven-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)] dark:bg-heaven-500/20' 
                                        : 'bg-white/40 dark:bg-white/5 border-white/20 hover:bg-white/60 dark:hover:bg-white/10'
                                    }`}
                            >
                                <span className={`font-medium ${activeTab === cat.id ? 'text-heaven-600 dark:text-heaven-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {cat.name}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); openEditCategoryModal(cat); }}
                                        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Items Grid */}
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
                                    <div className="flex justify-between items-end pb-4 border-b border-slate-200 dark:border-slate-800">
                                        <div>
                                            <h2 className="text-2xl font-bold">{categories.find(c => c.id === activeTab)?.name}</h2>
                                            <p className="text-slate-500">{categories.find(c => c.id === activeTab)?.description}</p>
                                        </div>
                                        <button 
                                            onClick={() => openNewItemModal(activeTab)}
                                            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:scale-105 transition-transform flex items-center gap-2 shadow-xl"
                                        >
                                            <Plus className="w-4 h-4" /> Add Item
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {itemsMap[activeTab]?.map(item => (
                                            <motion.div 
                                                key={item.id}
                                                whileHover={{ y: -5 }}
                                                className="bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-xl rounded-3xl p-5 shadow-lg group relative overflow-hidden"
                                            >
                                                {/* Decorative background glow */}
                                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-heaven-400/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                
                                                <div className="flex justify-between items-start mb-4 relative z-10">
                                                    <div className="flex items-center gap-2">
                                                        {item.isVeg ? (
                                                            <div className="w-5 h-5 rounded border-2 border-green-500 flex items-center justify-center p-0.5">
                                                                <div className="w-full h-full bg-green-500 rounded-full"></div>
                                                            </div>
                                                        ) : (
                                                            <div className="w-5 h-5 rounded border-2 border-red-500 flex items-center justify-center p-0.5">
                                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                            </div>
                                                        )}
                                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => openEditItemModal(item)}
                                                            className="p-2 bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm shadow-sm text-slate-600 dark:text-slate-300"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteItem(item.id)}
                                                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-colors backdrop-blur-sm"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-slate-500 text-sm mb-6 line-clamp-2 relative z-10">{item.description || "No description provided."}</p>
                                                
                                                <div className="flex justify-between items-center relative z-10">
                                                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-heaven-600 to-indigo-600 dark:from-heaven-400 dark:to-indigo-400">
                                                        ${item.basePrice.toFixed(2)}
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${item.isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                        {item.isAvailable ? 'Available' : 'Out of Stock'}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                        
                                        {(!itemsMap[activeTab] || itemsMap[activeTab].length === 0) && (
                                            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                                                <p className="text-slate-500">No items in this category yet.</p>
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl"
                        >
                            <h3 className="text-xl font-bold mb-4">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input type="text" id="cat-name" defaultValue={editingCategory?.name} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea id="cat-desc" defaultValue={editingCategory?.description} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                                    <input type="text" id="cat-image" defaultValue={editingCategory?.imageUrl} placeholder="https://..." className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setCategoryModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Cancel</button>
                                <button 
                                    onClick={async () => {
                                        const name = (document.getElementById('cat-name') as HTMLInputElement).value;
                                        const description = (document.getElementById('cat-desc') as HTMLTextAreaElement).value;
                                        const imageUrl = (document.getElementById('cat-image') as HTMLInputElement).value;
                                        try {
                                            if (editingCategory) {
                                                await apiClient.put(`/catalog/categories/${editingCategory.id}`, { ...editingCategory, name, description, imageUrl });
                                            } else {
                                                await apiClient.post('/catalog/categories', { name, description, imageUrl, sortOrder: categories.length, isActive: true });
                                            }
                                            toast.success('Saved successfully');
                                            setCategoryModalOpen(false);
                                            fetchCatalog();
                                        } catch(e) {
                                            toast.error('Error saving category');
                                        }
                                    }}
                                    className="px-4 py-2 bg-heaven-600 text-white rounded-xl"
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Modals for Create/Edit Item */}
                {isItemModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl w-full max-w-lg shadow-2xl"
                        >
                            <h3 className="text-xl font-bold mb-4">{editingItem ? 'Edit Item' : 'New Menu Item'}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input type="text" id="item-name" defaultValue={editingItem?.name} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea id="item-desc" defaultValue={editingItem?.description} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Base Price ($)</label>
                                        <input type="number" step="0.01" id="item-price" defaultValue={editingItem?.basePrice} className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3" />
                                    </div>
                                    <div className="flex items-center pt-6 gap-2">
                                        <input type="checkbox" id="item-veg" defaultChecked={editingItem?.isVeg} className="w-5 h-5 accent-green-500 rounded" />
                                        <label className="text-sm font-medium">Vegetarian</label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                                    <input type="text" id="item-image" defaultValue={editingItem?.imageUrl} placeholder="https://..." className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl p-3" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button onClick={() => setItemModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">Cancel</button>
                                <button 
                                    onClick={async () => {
                                        const name = (document.getElementById('item-name') as HTMLInputElement).value;
                                        const description = (document.getElementById('item-desc') as HTMLTextAreaElement).value;
                                        const imageUrl = (document.getElementById('item-image') as HTMLInputElement).value;
                                        const basePrice = parseFloat((document.getElementById('item-price') as HTMLInputElement).value || "0");
                                        const isVeg = (document.getElementById('item-veg') as HTMLInputElement).checked;
                                        try {
                                            if (editingItem) {
                                                await apiClient.put(`/catalog/items/${editingItem.id}`, { ...editingItem, name, description, imageUrl, basePrice, isVeg });
                                            } else {
                                                await apiClient.post('/catalog/items', { 
                                                    categoryId: selectedCategoryIdForNewItem, 
                                                    name, description, imageUrl, basePrice, isVeg,
                                                    isAvailable: true, spicinessLevel: 0, sortOrder: 0
                                                });
                                            }
                                            toast.success('Saved successfully');
                                            setItemModalOpen(false);
                                            fetchCatalog();
                                        } catch(e) {
                                            toast.error('Error saving item');
                                        }
                                    }}
                                    className="px-4 py-2 bg-heaven-600 text-white rounded-xl shadow-lg shadow-heaven-500/30"
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
