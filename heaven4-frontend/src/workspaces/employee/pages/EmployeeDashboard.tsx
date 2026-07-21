import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Coffee, X, ShoppingBag, DollarSign, CheckCircle2, User, Clock, AlertTriangle } from 'lucide-react';
import apiClient from '@/core/api/client';
import { useOperationsWebSocket } from '@/core/hooks/useOperationsWebSocket';
import { useAuth } from '@/core/auth/AuthProvider';
import toast from 'react-hot-toast';

interface MenuItem { id: number; name: string; basePrice: number; categoryId: number; isAvailable: boolean; }
interface Category { id: number; name: string; }
interface OrderItem { menuItemName: string; quantity: number; unitPrice: number; subtotal: number; }
interface TableData { id: string; status: 'FREE' | 'OCCUPIED'; orderTotal: number; orderId?: number; items?: OrderItem[]; tableNumber?: string; }
interface Complaint { id: number; type: string; description: string; status: string; orderId?: number; tableNumber?: string; }

type ModalType = 'add' | 'close' | 'walkin' | 'complaint' | null;

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [tables, setTables] = useState<TableData[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [modal, setModal] = useState<ModalType>(null);
    const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [selectedItems, setSelectedItems] = useState<{ item: MenuItem; qty: number }[]>([]);
    const [walkInTable, setWalkInTable] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [shiftStart] = useState(new Date().toISOString());
    const [tablesServed, setTablesServed] = useState(0);

    const fetchActiveTables = useCallback(async () => {
        try {
            const [ordersRes, complaintsRes] = await Promise.all([
                apiClient.get('/orders/active'),
                apiClient.get('/complaints').catch(() => ({ data: [] })),
            ]);
            const orders = ordersRes.data;
            setComplaints(complaintsRes.data.filter((c: Complaint) => c.status !== 'RESOLVED'));
            const activeTablesMap = new Map<string, TableData>();
            orders.forEach((order: any) => {
                if (order.tableNumber) {
                    activeTablesMap.set(order.tableNumber, {
                        id: order.tableNumber,
                        status: 'OCCUPIED',
                        orderTotal: order.totalAmount || 0,
                        orderId: order.id,
                        items: order.items || [],
                        tableNumber: order.tableNumber
                    });
                }
            });
            const allTables: TableData[] = [];
            for (let i = 1; i <= 15; i++) {
                const tId = i.toString();
                if (activeTablesMap.has(tId)) {
                    allTables.push(activeTablesMap.get(tId)!);
                    activeTablesMap.delete(tId);
                } else {
                    allTables.push({ id: tId, status: 'FREE', orderTotal: 0 });
                }
            }
            activeTablesMap.forEach(val => allTables.push(val));
            setTables(allTables);
        } catch (e) { console.error(e); }
    }, []);

    const fetchCatalog = async () => {
        try {
            const res = await apiClient.get('/catalog/full');
            setCategories(res.data.categories || []);
            const flat: MenuItem[] = Object.values(res.data.items).flat() as MenuItem[];
            setMenuItems(flat);
            if (res.data.categories?.[0]) setActiveCategory(res.data.categories[0].id);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchActiveTables(); fetchCatalog(); }, [fetchActiveTables]);
    useOperationsWebSocket(() => { fetchActiveTables(); });

    const openAddModal = (table: TableData) => {
        setSelectedTable(table);
        setSelectedItems([]);
        setModal('add');
    };

    const openCloseModal = (table: TableData) => {
        setSelectedTable(table);
        setModal('close');
    };

    const toggleItem = (item: MenuItem) => {
        setSelectedItems(prev => {
            const existing = prev.find(s => s.item.id === item.id);
            if (existing) return prev.filter(s => s.item.id !== item.id);
            return [...prev, { item, qty: 1 }];
        });
    };

    const updateItemQty = (itemId: number, delta: number) => {
        setSelectedItems(prev => prev.map(s => s.item.id === itemId ? { ...s, qty: Math.max(1, s.qty + delta) } : s));
    };

    const handleAddItems = async () => {
        if (!selectedTable?.orderId || selectedItems.length === 0) return;
        setIsProcessing(true);
        try {
            await apiClient.post(`/orders/${selectedTable.orderId}/add-items`, {
                tableNumber: selectedTable.tableNumber || selectedTable.id,
                items: selectedItems.map(s => ({ menuItemId: s.item.id, quantity: s.qty }))
            });
            toast.success(`✅ Items added to Table ${selectedTable.id}!`);
            setModal(null);
            fetchActiveTables();
        } catch { toast.error('Failed to add items'); } 
        finally { setIsProcessing(false); }
    };

    const handleCloseTable = async () => {
        if (!selectedTable?.orderId) return;
        setIsProcessing(true);
        try {
            await apiClient.put(`/orders/${selectedTable.orderId}/status`, { status: 'COMPLETED' });
            toast.success(`💰 Table ${selectedTable.id} closed — Cash collected!`);
            setTablesServed(t => t + 1);
            setModal(null);
            fetchActiveTables();
        } catch { toast.error('Failed to close table'); }
        finally { setIsProcessing(false); }
    };

    const handleWalkIn = async () => {
        if (!walkInTable.trim() || selectedItems.length === 0) return;
        setIsProcessing(true);
        try {
            await apiClient.post('/orders', {
                tableNumber: walkInTable.trim(),
                items: selectedItems.map(s => ({ menuItemId: s.item.id, quantity: s.qty }))
            });
            toast.success(`🎉 Walk-in order created for Table ${walkInTable}!`);
            setModal(null);
            setSelectedItems([]);
            setWalkInTable('');
            fetchActiveTables();
        } catch { toast.error('Failed to create order'); }
        finally { setIsProcessing(false); }
    };

    const tax = (selectedTable?.orderTotal || 0) * 0.08;
    const grandTotal = (selectedTable?.orderTotal || 0) + tax;

    const displayItems = menuItems.filter(i => i.categoryId === activeCategory && i.isAvailable !== false);

    const shiftElapsed = () => {
        const mins = Math.floor((Date.now() - new Date(shiftStart).getTime()) / 60000);
        return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6">
            {/* Header */}
            <header className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        Floor POS
                    </h1>
                    <p className="text-slate-500 mt-1">Manage tables and take orders.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Shift Info */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-right shadow-sm">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <User className="w-4 h-4 text-blue-500" />
                            <span className="font-bold text-sm">{user?.displayName || 'Employee'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{shiftElapsed()} on shift · {tablesServed} closed</span>
                        </div>
                    </div>
                    <button onClick={() => { setSelectedItems([]); setWalkInTable(''); setModal('walkin'); }}
                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all">
                        <Plus className="w-5 h-5" /> New Walk-in
                    </button>
                </div>
            </header>

            {/* Complaints Alert Banner */}
            {complaints.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                    <div className="flex-1">
                        <p className="font-bold text-red-700 dark:text-red-300">
                            {complaints.length} Active Complaint{complaints.length > 1 ? 's' : ''} — Requires Attention
                        </p>
                        <p className="text-sm text-red-500">{complaints.map(c => c.type.replace(/_/g, ' ')).join(' · ')}</p>
                    </div>
                    <button
                        onClick={() => setModal('complaint')}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors"
                    >
                        View All
                    </button>
                </div>
            )}

            {/* Table Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {tables.map(table => {
                    // Check if this table has an active complaint
                    const tableComplaint = complaints.find(c => 
                        c.tableNumber === table.id || 
                        (table.orderId && c.orderId === table.orderId)
                    );
                    return (
                    <motion.div key={table.id} whileHover={{ y: -4 }}
                        className={`p-5 rounded-3xl border-2 transition-all ${
                            table.status === 'OCCUPIED' 
                                ? tableComplaint
                                    ? 'bg-white dark:bg-slate-800 border-red-500 shadow-xl shadow-red-500/20'
                                    : 'bg-white dark:bg-slate-800 border-blue-500 shadow-xl shadow-blue-500/10' 
                                : 'bg-slate-100 dark:bg-slate-800/50 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                        }`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className={`text-2xl font-black ${
                                tableComplaint ? 'text-red-600 dark:text-red-400' :
                                table.status === 'OCCUPIED' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                            }`}>
                                T{table.id}
                            </h3>
                            <div className="flex gap-1.5">
                                {tableComplaint && (
                                    <button
                                        onClick={() => setSelectedComplaint(tableComplaint)}
                                        className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse"
                                    >
                                        <AlertTriangle className="w-3 h-3" /> Complaint
                                    </button>
                                )}
                                {table.status === 'OCCUPIED' && !tableComplaint && (
                                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-bold">
                                        Occupied
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {table.status === 'OCCUPIED' ? (
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Current Bill</p>
                                <p className="text-xl font-bold dark:text-white">${table.orderTotal.toFixed(2)}</p>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => openAddModal(table)}
                                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl font-bold text-sm transition-colors">
                                        Add
                                    </button>
                                    <button onClick={() => openCloseModal(table)}
                                        className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-green-500/20">
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 opacity-50">
                                <Coffee className="w-8 h-8 text-slate-400 mb-2" />
                                <p className="font-medium text-slate-500 text-sm">Available</p>
                            </div>
                        )}
                    </motion.div>
                    );
                })}
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {/* Add Items Modal */}
                {modal === 'add' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
                        onClick={() => setModal(null)}>
                        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">Add Items to Table {selectedTable?.id}</h3>
                                    <p className="text-sm text-slate-500">Select items to add to this order</p>
                                </div>
                                <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>
                            </div>

                            {/* Category tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                                {categories.map(cat => (
                                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                                        className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${activeCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {/* Items */}
                            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                                {displayItems.map(item => {
                                    const sel = selectedItems.find(s => s.item.id === item.id);
                                    return (
                                        <div key={item.id} onClick={() => toggleItem(item)}
                                            className={`flex justify-between items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${sel ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-blue-600">${item.basePrice.toFixed(2)}</p>
                                            </div>
                                            {sel ? (
                                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => updateItemQty(item.id, -1)} className="w-7 h-7 bg-white dark:bg-slate-700 rounded-lg shadow font-bold flex items-center justify-center">-</button>
                                                    <span className="font-bold w-4 text-center">{sel.qty}</span>
                                                    <button onClick={() => updateItemQty(item.id, 1)} className="w-7 h-7 bg-white dark:bg-slate-700 rounded-lg shadow font-bold flex items-center justify-center">+</button>
                                                </div>
                                            ) : (
                                                <div className="w-7 h-7 border-2 border-slate-300 dark:border-slate-600 rounded-lg" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedItems.length > 0 && (
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                    <div className="flex justify-between text-sm text-slate-500 mb-3">
                                        <span>{selectedItems.reduce((a, s) => a + s.qty, 0)} items selected</span>
                                        <span>+${selectedItems.reduce((a, s) => a + s.item.basePrice * s.qty, 0).toFixed(2)}</span>
                                    </div>
                                    <button onClick={handleAddItems} disabled={isProcessing}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                        {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                                            <><ShoppingBag className="w-4 h-4" /> Add Items</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}

                {/* Close Table / Bill Modal */}
                {modal === 'close' && selectedTable && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
                        onClick={() => setModal(null)}>
                        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Close Table {selectedTable.id}</h3>
                                <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>
                            </div>

                            {/* Bill Breakdown */}
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6">
                                <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3">Bill Summary</h4>
                                {selectedTable.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm py-1 border-b border-slate-200 dark:border-slate-700 last:border-0">
                                        <span>{item.quantity}× {item.menuItemName}</span>
                                        <span className="font-semibold">${(item.subtotal || 0).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-600 space-y-1 text-sm">
                                    <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>${selectedTable.orderTotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-slate-500"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                                    <div className="flex justify-between font-bold text-lg mt-2"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
                                </div>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-3 mb-4 flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-green-500" />
                                <div>
                                    <p className="font-bold text-green-700 dark:text-green-400">Cash to collect</p>
                                    <p className="text-2xl font-black text-green-600 dark:text-green-300">${grandTotal.toFixed(2)}</p>
                                </div>
                            </div>

                            <button onClick={handleCloseTable} disabled={isProcessing}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all">
                                {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                                    <><CheckCircle2 className="w-5 h-5" /> Confirm Cash Collection</>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Walk-in Modal */}
                {modal === 'walkin' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
                        onClick={() => setModal(null)}>
                        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">New Walk-in Order</h3>
                                    <p className="text-sm text-slate-500">Enter table number and select items</p>
                                </div>
                                <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Table Number <span className="text-red-500">*</span></label>
                                <input type="text" placeholder="e.g. 5, 12, VIP-1" value={walkInTable} onChange={e => setWalkInTable(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none font-bold" />
                            </div>

                            {/* Category tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                                {categories.map(cat => (
                                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                                        className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${activeCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                                {displayItems.map(item => {
                                    const sel = selectedItems.find(s => s.item.id === item.id);
                                    return (
                                        <div key={item.id} onClick={() => toggleItem(item)}
                                            className={`flex justify-between items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${sel ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-blue-600">${item.basePrice.toFixed(2)}</p>
                                            </div>
                                            {sel ? (
                                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => updateItemQty(item.id, -1)} className="w-7 h-7 bg-white dark:bg-slate-700 rounded-lg shadow font-bold flex items-center justify-center">-</button>
                                                    <span className="font-bold w-4 text-center">{sel.qty}</span>
                                                    <button onClick={() => updateItemQty(item.id, 1)} className="w-7 h-7 bg-white dark:bg-slate-700 rounded-lg shadow font-bold flex items-center justify-center">+</button>
                                                </div>
                                            ) : (
                                                <div className="w-7 h-7 border-2 border-slate-300 dark:border-slate-600 rounded-lg" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedItems.length > 0 && walkInTable.trim() && (
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                    <div className="flex justify-between text-sm text-slate-500 mb-3">
                                        <span>Table {walkInTable} · {selectedItems.reduce((a, s) => a + s.qty, 0)} items</span>
                                        <span>${selectedItems.reduce((a, s) => a + s.item.basePrice * s.qty, 0).toFixed(2)}</span>
                                    </div>
                                    <button onClick={handleWalkIn} disabled={isProcessing}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                        {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                                            <><Plus className="w-4 h-4" /> Place Walk-in Order</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}

                {/* Complaints List Modal */}
                {modal === 'complaint' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setModal(null)}>
                        <motion.div initial={{ y: 50 }} animate={{ y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                    <h3 className="text-xl font-bold">Active Complaints</h3>
                                </div>
                                <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                {complaints.length === 0 && <p className="text-slate-500 text-center py-8">No active complaints</p>}
                                {complaints.map(c => (
                                    <div key={c.id} className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-red-700 dark:text-red-300 text-sm">{c.type.replace(/_/g, ' ')}</span>
                                            {c.orderId && <span className="text-xs text-slate-500">Order #{c.orderId}</span>}
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{c.description}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Complaint Detail Pop-over */}
            {selectedComplaint && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedComplaint(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                                <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Customer Complaint</h3>
                            </div>
                            <button onClick={() => setSelectedComplaint(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500 text-sm">Type</span>
                                <span className="font-bold text-red-700 dark:text-red-300">{selectedComplaint.type.replace(/_/g, ' ')}</span>
                            </div>
                            {selectedComplaint.orderId && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Order</span>
                                    <span className="font-bold">#{selectedComplaint.orderId}</span>
                                </div>
                            )}
                            <div>
                                <p className="text-slate-500 text-sm mb-1">Description</p>
                                <p className="text-slate-800 dark:text-slate-200 font-medium">{selectedComplaint.description}</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 text-center mt-4">Escalate to Manager if you cannot resolve this immediately.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
