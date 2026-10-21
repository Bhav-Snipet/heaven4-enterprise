import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Flame, Sparkles, Link2, Upload, X, Search, RotateCcw, Clock } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';
import {
    Category, MenuItem, loadCatalogFromStorage, saveCatalogToStorage, resetCatalogToDefaults
} from '@/shared/utils/catalogData';

// ── ITEM FORM STATE ────────────────────────────────────────────────────────────
interface ItemFormState {
    name: string;
    description: string;
    basePrice: string;
    isVeg: boolean;
    imageUrl: string;
    imageTab: 'url' | 'upload';
    spicinessLevel: number;
    prepTimeMinutes: number;
}

const emptyItemForm: ItemFormState = {
    name: '',
    description: '',
    basePrice: '',
    isVeg: false,
    imageUrl: '',
    imageTab: 'url',
    spicinessLevel: 0,
    prepTimeMinutes: 15
};

export default function CatalogPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [itemsMap, setItemsMap] = useState<Record<number, MenuItem[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals state
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [isItemModalOpen, setItemModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [selectedCategoryIdForNewItem, setSelectedCategoryIdForNewItem] = useState<number | null>(null);

    // Category form state
    const [catFormName, setCatFormName] = useState('');
    const [catFormDesc, setCatFormDesc] = useState('');

    // Item form state
    const [itemForm, setItemForm] = useState<ItemFormState>(emptyItemForm);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchCatalog = async () => {
        setIsLoading(true);
        const localData = loadCatalogFromStorage();
        let finalCategories = [...localData.categories];
        let finalItemsMap: Record<number, MenuItem[]> = { ...localData.itemsMap };

        try {
            const res = await apiClient.get('/catalog/full', { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
            if (res?.data?.categories && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
                // Merge extra categories from backend
                res.data.categories.forEach((bCat: Category) => {
                    if (!finalCategories.some(c => c.id === bCat.id)) {
                        finalCategories.push(bCat);
                    }
                });

                // Merge items from backend without overwriting local custom creations
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
        } catch { /* proceed with local storage */ }

        setCategories(finalCategories);
        setItemsMap(finalItemsMap);
        saveCatalogToStorage(finalCategories, finalItemsMap);

        if (finalCategories.length > 0 && (activeTab === null || !finalCategories.some(c => c.id === activeTab))) {
            setActiveTab(finalCategories[0]!.id);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCatalog();

        const handleCatalogUpdated = () => {
            const localData = loadCatalogFromStorage();
            setCategories(localData.categories);
            setItemsMap(localData.itemsMap);
        };
        window.addEventListener('heaven4-catalog-updated', handleCatalogUpdated);
        return () => window.removeEventListener('heaven4-catalog-updated', handleCatalogUpdated);
    }, []);

    const persistCatalogChange = (updatedCats: Category[], updatedItems: Record<number, MenuItem[]>) => {
        setCategories(updatedCats);
        setItemsMap(updatedItems);
        saveCatalogToStorage(updatedCats, updatedItems);
    };

    // ── Category Modal Helpers ──────────────────────────────────────────────────
    const openNewCategoryModal = () => {
        setEditingCategory(null);
        setCatFormName('');
        setCatFormDesc('');
        setCategoryModalOpen(true);
    };

    const openEditCategoryModal = (cat: Category) => {
        setEditingCategory(cat);
        setCatFormName(cat.name);
        setCatFormDesc(cat.description || '');
        setCategoryModalOpen(true);
    };

    // ── Item Modal Helpers ──────────────────────────────────────────────────────
    const openNewItemModal = (categoryId: number) => {
        setSelectedCategoryIdForNewItem(categoryId);
        setEditingItem(null);
        setItemForm(emptyItemForm);
        setItemModalOpen(true);
    };

    const openEditItemModal = (item: MenuItem) => {
        setEditingItem(item);
        setItemForm({
            name: item.name,
            description: item.description || '',
            basePrice: String(item.basePrice),
            isVeg: item.isVeg,
            imageUrl: item.imageUrl || '',
            imageTab: 'url',
            spicinessLevel: item.spicinessLevel ?? 0,
            prepTimeMinutes: 15
        });
        setItemModalOpen(true);
    };

    // ── File Upload Handler ─────────────────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            setItemForm(f => ({ ...f, imageUrl: ev.target?.result as string }));
            toast.success('Image loaded!');
        };
        reader.readAsDataURL(file);
    };

    // ── CRUD Actions ────────────────────────────────────────────────────────────
    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this menu item?')) return;
        try {
            await apiClient.delete(`/catalog/items/${id}`, { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
        } catch { /* proceed */ }

        if (!activeTab) return;
        const updatedTabItems = (itemsMap[activeTab] || []).filter(i => i.id !== id);
        const newItemsMap = { ...itemsMap, [activeTab]: updatedTabItems };
        persistCatalogChange(categories, newItemsMap);
        toast.success('Menu item removed from catalog');
    };

    const deleteCategory = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this entire category and all its items?')) return;
        try {
            await apiClient.delete(`/catalog/categories/${id}`, { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
        } catch { /* proceed */ }

        const updatedCats = categories.filter(c => c.id !== id);
        const newItemsMap = { ...itemsMap };
        delete newItemsMap[id];
        if (activeTab === id) setActiveTab(updatedCats.length > 0 && updatedCats[0] ? updatedCats[0].id : null);
        persistCatalogChange(updatedCats, newItemsMap);
        toast.success('Category deleted');
    };

    const toggleItemActive = async (item: MenuItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedStatus = !item.isAvailable;
        try {
            await apiClient.put(`/admin/catalog/items/${item.id}/toggle-active`, {}, { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
        } catch { /* proceed */ }

        const catId = item.categoryId;
        const catItems = itemsMap[catId] || [];
        const updatedCatItems = catItems.map(i => i.id === item.id ? { ...i, isAvailable: updatedStatus } : i);
        const newItemsMap = { ...itemsMap, [catId]: updatedCatItems };
        persistCatalogChange(categories, newItemsMap);
        toast.success(`${item.name} is now ${updatedStatus ? 'Available 🟢' : 'Out of Stock 🔴'}`);
    };

    const [kitchenLoadMode, setKitchenLoadMode] = useState(false);
    const [klmLoading, setKlmLoading] = useState(false);
    const handleKitchenLoadMode = async () => {
        setKlmLoading(true);
        try {
            const res = await apiClient.put('/admin/kitchen-load-mode', { enabled: !kitchenLoadMode }, { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
            setKitchenLoadMode(!kitchenLoadMode);
            toast.success(res?.data?.message || `Kitchen Load Mode ${!kitchenLoadMode ? 'ON' : 'OFF'}`);
        } catch {
            setKitchenLoadMode(!kitchenLoadMode);
            toast.success(`Kitchen Load Mode ${!kitchenLoadMode ? 'ON' : 'OFF'}`);
        } finally {
            setKlmLoading(false);
        }
    };

    const handleResetDefaults = () => {
        if (!confirm('Restore factory menu catalog? This will re-seed all 9 signature categories and menu items.')) return;
        const restored = resetCatalogToDefaults();
        setCategories(restored.categories);
        setItemsMap(restored.itemsMap);
        if (restored.categories[0]) {
            setActiveTab(restored.categories[0].id);
        }
        toast.success('🎉 Factory menu catalog restored!');
    };

    // ── Save Category (Backend + LocalStorage) ──────────────────────────────────
    const saveCategory = async () => {
        if (!catFormName.trim()) { toast.error('Category name is required'); return; }
        let updatedCats: Category[] = [];
        let updatedMap = { ...itemsMap };

        if (editingCategory) {
            const catPayload = {
                id: editingCategory.id,
                name: catFormName,
                description: catFormDesc,
                sortOrder: editingCategory.sortOrder,
                isActive: editingCategory.isActive
            };
            try {
                await apiClient.put(`/catalog/categories/${editingCategory.id}`, catPayload, { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
            } catch { /* proceed */ }

            updatedCats = categories.map(c => c.id === editingCategory.id ? { ...c, name: catFormName, description: catFormDesc } : c);
            toast.success('Category updated!');
        } else {
            const createPayload = {
                name: catFormName,
                description: catFormDesc,
                sortOrder: categories.length + 1,
                isActive: true
            };

            let createdCatId: number | null = null;
            try {
                const res = await apiClient.post('/catalog/categories', createPayload, { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
                if (res?.data?.id) {
                    createdCatId = res.data.id;
                }
            } catch { /* proceed */ }

            const newId = createdCatId || (Math.max(...categories.map(c => c.id), 0) + 1);
            const newCat: Category = { id: newId, name: catFormName, description: catFormDesc, sortOrder: categories.length + 1, isActive: true };
            updatedCats = [...categories, newCat];
            updatedMap[newId] = [];
            setActiveTab(newId);
            toast.success('🎉 Category added to catalog!');
        }

        persistCatalogChange(updatedCats, updatedMap);
        setCategoryModalOpen(false);
    };

    // ── Save Item (Backend + LocalStorage) ───────────────────────────────────────
    const saveItem = async () => {
        const { name, description, basePrice, isVeg, imageUrl, spicinessLevel, prepTimeMinutes } = itemForm;
        if (!name.trim()) { toast.error('Item name is required'); return; }
        const price = parseFloat(basePrice || '0');
        if (isNaN(price) || price < 0) { toast.error('Enter a valid price'); return; }
        if (!activeTab && !selectedCategoryIdForNewItem) { toast.error('No category selected'); return; }

        const targetCatId = selectedCategoryIdForNewItem || activeTab!;
        const catItems = itemsMap[targetCatId] || [];

        let updatedCatItems: MenuItem[] = [];
        if (editingItem) {
            const updatePayload = {
                id: editingItem.id,
                categoryId: targetCatId,
                name,
                description,
                basePrice: price,
                isVeg,
                isAvailable: editingItem.isAvailable,
                spicinessLevel: spicinessLevel ?? 0,
                sortOrder: editingItem.sortOrder ?? 0,
                imageUrl: imageUrl || editingItem.imageUrl,
                prepTimeMinutes: prepTimeMinutes || 15
            };

            try {
                await apiClient.put(`/catalog/items/${editingItem.id}`, updatePayload, { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
            } catch { /* proceed */ }

            updatedCatItems = catItems.map(i => i.id === editingItem.id ? {
                ...i,
                name,
                description,
                imageUrl: imageUrl || i.imageUrl,
                basePrice: price,
                isVeg,
                spicinessLevel: spicinessLevel ?? 0
            } : i);
            toast.success('Menu item updated!');
        } else {
            const fallbackImg = isVeg
                ? 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600'
                : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';

            const createPayload = {
                categoryId: targetCatId,
                name,
                description,
                basePrice: price,
                isVeg,
                isAvailable: true,
                spicinessLevel: spicinessLevel ?? 0,
                sortOrder: catItems.length + 1,
                imageUrl: imageUrl || fallbackImg,
                prepTimeMinutes: prepTimeMinutes || 15
            };

            let createdItemId: number | null = null;
            try {
                const res = await apiClient.post('/catalog/items', createPayload, { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
                if (res?.data?.id) {
                    createdItemId = res.data.id;
                }
            } catch { /* proceed */ }

            const newId = createdItemId || Math.floor(10000 + Math.random() * 90000);
            const newItem: MenuItem = {
                id: newId,
                categoryId: targetCatId,
                name,
                description,
                basePrice: price,
                isVeg,
                isAvailable: true,
                spicinessLevel: spicinessLevel ?? 0,
                sortOrder: catItems.length + 1,
                imageUrl: imageUrl || fallbackImg
            };
            updatedCatItems = [...catItems, newItem];
            toast.success('🎉 Menu item added to catalog!');
        }

        const newItemsMap = { ...itemsMap, [targetCatId]: updatedCatItems };
        persistCatalogChange(categories, newItemsMap);
        setItemModalOpen(false);
        setSelectedCategoryIdForNewItem(null);
    };

    const currentTabItems = activeTab ? (itemsMap[activeTab] || []) : [];
    const filteredItems = searchQuery.trim()
        ? currentTabItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || (i.description || '').toLowerCase().includes(searchQuery.toLowerCase()))
        : currentTabItems;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-white pb-20">
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl"
            >
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Admin & Manager · Master Menu Studio</span>
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                        Menu & Catalog Management
                    </h1>
                    <p className="text-slate-400 text-xs mt-1">Full control over menu items, real-time pricing, photos, category structure & out-of-stock toggles.</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    <button
                        onClick={handleResetDefaults}
                        title="Restore initial 9 categories and items"
                        className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Defaults
                    </button>
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
                    <p className="text-slate-400 text-xs max-w-md mx-auto mb-6">Start building your menu catalog by creating your first category, or restore the factory catalog.</p>
                    <div className="flex justify-center gap-3">
                        <button onClick={openNewCategoryModal} className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30">
                            Create First Category
                        </button>
                        <button onClick={handleResetDefaults} className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700">
                            Restore Factory Menu
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8 mt-6">
                    {/* Categories Sidebar */}
                    <div className="w-full lg:w-1/4 space-y-2.5">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex justify-between items-center px-1">
                            <span>Categories ({categories.length})</span>
                            <span className="text-[10px] text-slate-500">Click to view items</span>
                        </div>
                        {categories.map((cat) => {
                            const itemCount = (itemsMap[cat.id] || []).length;
                            return (
                                <motion.div
                                    key={cat.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex justify-between items-center group ${
                                        activeTab === cat.id
                                            ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-lg shadow-amber-500/10'
                                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                                    }`}
                                >
                                    <div className="flex flex-col">
                                        <span className={`font-black text-xs ${activeTab === cat.id ? 'text-amber-400' : 'text-slate-200'}`}>
                                            {cat.name}
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-0.5">{itemCount} menu items</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openEditCategoryModal(cat); }}
                                            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                                            title="Edit Category"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={(e) => deleteCategory(cat.id, e)}
                                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400"
                                            title="Delete Category"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
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
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-slate-800">
                                        <div>
                                            <h2 className="text-2xl font-black text-white">{categories.find(c => c.id === activeTab)?.name || 'Category'}</h2>
                                            <p className="text-slate-400 text-xs mt-0.5">{categories.find(c => c.id === activeTab)?.description || ''}</p>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <div className="relative flex-1 sm:w-56">
                                                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={e => setSearchQuery(e.target.value)}
                                                    placeholder="Search in category..."
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                                                />
                                            </div>
                                            <button
                                                onClick={() => openNewItemModal(activeTab)}
                                                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 whitespace-nowrap"
                                            >
                                                <Plus className="w-4 h-4" /> Add Item
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredItems.map(item => (
                                            <motion.div
                                                key={item.id}
                                                whileHover={{ y: -4 }}
                                                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 shadow-2xl group relative overflow-hidden flex flex-col justify-between"
                                            >
                                                <div>
                                                    {item.imageUrl && (
                                                        <div className="h-40 -mx-5 -mt-5 mb-4 overflow-hidden relative border-b border-slate-800">
                                                            <img
                                                                src={item.imageUrl}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'; }}
                                                            />
                                                            <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                                                <span className="bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black border border-slate-800">
                                                                    {item.isVeg ? <span className="text-emerald-400">VEG</span> : <span className="text-red-400">NON-VEG</span>}
                                                                </span>
                                                                {item.spicinessLevel && item.spicinessLevel > 0 ? (
                                                                    <span className="bg-orange-500/90 text-white px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-0.5">
                                                                        <Flame className="w-2.5 h-2.5 fill-current" /> {item.spicinessLevel === 1 ? 'Mild' : item.spicinessLevel === 2 ? 'Spicy' : 'Fire'}
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            {!item.isAvailable && (
                                                                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center">
                                                                    <span className="px-3 py-1 bg-red-500/90 text-white font-black text-xs rounded-full shadow-lg">
                                                                        OUT OF STOCK
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-black text-base text-white group-hover:text-amber-400 transition-colors leading-tight">{item.name}</h3>
                                                        <div className="flex gap-1 shrink-0">
                                                            <button
                                                                onClick={(e) => toggleItemActive(item, e)}
                                                                className={`p-1.5 rounded-xl transition-colors ${
                                                                    item.isAvailable
                                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                                                                }`}
                                                                title={item.isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
                                                            >
                                                                {item.isAvailable ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => openEditItemModal(item)}
                                                                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 border border-slate-700 transition-colors"
                                                                title="Edit Item"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteItem(item.id)}
                                                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 transition-colors"
                                                                title="Delete Item"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-400 text-xs mb-4 line-clamp-3 leading-relaxed">{item.description || 'No description provided.'}</p>
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

                                        {filteredItems.length === 0 && (
                                            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-950">
                                                <p className="text-slate-500 text-xs font-bold">
                                                    {searchQuery ? `No menu items matching "${searchQuery}"` : "No items in this category yet. Click 'Add Item' to create one."}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            )}

            {/* ── Category Modal ──────────────────────────────────────────────────── */}
            <AnimatePresence>
                {isCategoryModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl text-white space-y-4"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black text-white">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                                <button onClick={() => setCategoryModalOpen(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1">Category Name *</label>
                                    <input
                                        type="text"
                                        value={catFormName}
                                        onChange={e => setCatFormName(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold outline-none focus:border-amber-500"
                                        placeholder="e.g. 🍕 Wood-Fired Pizzas"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1">Description</label>
                                    <textarea
                                        value={catFormDesc}
                                        onChange={e => setCatFormDesc(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-amber-500"
                                        placeholder="Short description of this category..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button onClick={() => setCategoryModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs font-bold">Cancel</button>
                                <button onClick={saveCategory} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20">
                                    Save Category
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* ── Item Modal ──────────────────────────────────────────────────────── */}
                {isItemModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-lg shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black text-white">{editingItem ? 'Edit Menu Item' : 'New Menu Item'}</h3>
                                <button onClick={() => setItemModalOpen(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="space-y-4 text-xs">
                                {/* Item Name */}
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1">Item Name *</label>
                                    <input
                                        type="text"
                                        value={itemForm.name}
                                        onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold outline-none focus:border-amber-500"
                                        placeholder="e.g. Truffle Mushroom Burger"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1">Description</label>
                                    <textarea
                                        value={itemForm.description}
                                        onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-amber-500"
                                        rows={3}
                                        placeholder="Describe the dish, ingredients, cooking style..."
                                    />
                                </div>

                                {/* Price + Veg */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1">Base Price ($) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={itemForm.basePrice}
                                            onChange={e => setItemForm(f => ({ ...f, basePrice: e.target.value }))}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-amber-400 font-black text-sm outline-none focus:border-amber-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="flex items-center pt-5 gap-2">
                                        <input
                                            type="checkbox"
                                            id="item-veg-chk"
                                            checked={itemForm.isVeg}
                                            onChange={e => setItemForm(f => ({ ...f, isVeg: e.target.checked }))}
                                            className="w-4 h-4 accent-emerald-500 rounded"
                                        />
                                        <label htmlFor="item-veg-chk" className="text-xs font-bold text-slate-300">Vegetarian Dish</label>
                                    </div>
                                </div>

                                {/* Spiciness + Prep Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1">Spice Level</label>
                                        <select
                                            value={itemForm.spicinessLevel}
                                            onChange={e => setItemForm(f => ({ ...f, spicinessLevel: Number(e.target.value) }))}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-amber-500"
                                        >
                                            <option value={0}>0 — Mild / Non-Spicy</option>
                                            <option value={1}>1 — Medium Kick 🌶</option>
                                            <option value={2}>2 — Spicy 🌶🌶</option>
                                            <option value={3}>3 — Extra Hot 🔥</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1">Kitchen Prep Time (mins)</label>
                                        <div className="relative">
                                            <Clock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="number"
                                                min="1"
                                                max="120"
                                                value={itemForm.prepTimeMinutes}
                                                onChange={e => setItemForm(f => ({ ...f, prepTimeMinutes: parseInt(e.target.value) || 15 }))}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-white outline-none focus:border-amber-500 font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Image Input – URL or Upload */}
                                <div>
                                    <label className="block font-bold text-slate-400 mb-2">Item Image</label>
                                    {/* Tab Toggle */}
                                    <div className="flex gap-1 mb-3 bg-slate-950 p-1 rounded-xl w-fit border border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => setItemForm(f => ({ ...f, imageTab: 'url' }))}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${itemForm.imageTab === 'url' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            <Link2 className="w-3.5 h-3.5" /> URL Link
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setItemForm(f => ({ ...f, imageTab: 'upload' }))}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${itemForm.imageTab === 'upload' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            <Upload className="w-3.5 h-3.5" /> Upload File
                                        </button>
                                    </div>

                                    {itemForm.imageTab === 'url' ? (
                                        <input
                                            type="text"
                                            value={itemForm.imageUrl.startsWith('data:') ? '' : itemForm.imageUrl}
                                            onChange={e => setItemForm(f => ({ ...f, imageUrl: e.target.value }))}
                                            placeholder="https://images.unsplash.com/..."
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-amber-500 font-mono text-[11px]"
                                        />
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
                                        >
                                            <Upload className="w-6 h-6 text-slate-500 group-hover:text-amber-400 transition-colors" />
                                            <p className="text-slate-400 text-xs font-bold group-hover:text-white">Click to upload image from device</p>
                                            <p className="text-slate-600 text-[10px]">PNG, JPG, WEBP – max 5 MB</p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    )}

                                    {/* Image Preview */}
                                    {itemForm.imageUrl && (
                                        <div className="mt-3 relative">
                                            <img
                                                src={itemForm.imageUrl}
                                                alt="Preview"
                                                className="w-full h-32 object-cover rounded-xl border border-slate-800"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setItemForm(f => ({ ...f, imageUrl: '' }))}
                                                className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            <p className="text-[10px] text-emerald-400 font-bold mt-1">✓ Image ready</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button onClick={() => setItemModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs font-bold">Cancel</button>
                                <button
                                    onClick={saveItem}
                                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20"
                                >
                                    {editingItem ? 'Update Item' : 'Add to Catalog'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
