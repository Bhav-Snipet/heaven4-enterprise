import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Coffee, X, ShoppingBag, DollarSign, CheckCircle2, User, Clock, AlertTriangle, Crown, Target } from 'lucide-react';
import apiClient from '@/core/api/client';
import { useOperationsWebSocket } from '@/core/hooks/useOperationsWebSocket';
import { useAuth } from '@/core/auth/AuthProvider';
import toast from 'react-hot-toast';

interface MenuItem { id: number; name: string; basePrice: number; categoryId: number; isAvailable: boolean; isBeverage?: boolean; }
interface Category { id: number; name: string; }
interface OrderItem { menuItemName: string; quantity: number; unitPrice: number; subtotal: number; }
interface TableData { id: string; status: 'FREE' | 'OCCUPIED'; orderTotal: number; orderId?: number; items?: OrderItem[]; tableNumber?: string; membershipTier?: string; customerName?: string; customerPhone?: string; customerId?: string; }
interface Complaint { id: number; type: string; description: string; status: string; orderId?: number; tableNumber?: string; }

type ModalType = 'add' | 'close' | 'walkin' | 'complaint' | 'profile' | null;

const DEFAULT_CATEGORIES: Category[] = [
    { id: 1, name: '🍕 Gourmet Pizzas & Food' },
    { id: 2, name: '🥤 Soft Drinks & Beverages' },
    { id: 3, name: '🥃 Fine Spirits & Alcohol (18+)' },
    { id: 4, name: '🍰 Desserts & Sweets' }
];

const DEFAULT_ITEMS: MenuItem[] = [
    { id: 8001, categoryId: 3, name: 'Hoppy Citrus Craft IPA Beer (Pint)', basePrice: 8.50, isAvailable: true, isBeverage: true },
    { id: 8002, categoryId: 3, name: 'Single Malt Aged Reserve Whiskey (60ml)', basePrice: 14.00, isAvailable: true, isBeverage: true },
    { id: 8003, categoryId: 3, name: 'Botanical Tonic & Gin (90ml)', basePrice: 11.50, isAvailable: true, isBeverage: true },
    { id: 8004, categoryId: 2, name: 'Fresh Sparkling Lemon Mint Mojito (Mocktail)', basePrice: 5.50, isAvailable: true, isBeverage: true },
    { id: 8005, categoryId: 2, name: 'Artisanal Peach Iced Tea', basePrice: 4.99, isAvailable: true, isBeverage: true },
    { id: 8006, categoryId: 1, name: 'Truffle Mushroom Gourmet Pizza', basePrice: 19.99, isAvailable: true },
    { id: 8007, categoryId: 1, name: 'Pepperoni Supreme Pizza', basePrice: 22.49, isAvailable: true }
];

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [tables, setTables] = useState<TableData[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [modal, setModal] = useState<ModalType>(null);
    const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
    const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_ITEMS);
    const [activeCategory, setActiveCategory] = useState<number | null>(1);
    const [selectedItems, setSelectedItems] = useState<{ item: MenuItem; qty: number }[]>([]);
    const [walkInTable, setWalkInTable] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [shiftStart] = useState(new Date().toISOString());
    const [tablesServed, setTablesServed] = useState(14);

    const [isClockedIn, setIsClockedIn] = useState(true);
    const [clockInTime] = useState('09:00 AM');
    
    // Employee Personal Details State
    const [staffDetails, setStaffDetails] = useState({
        id: '#EMP-501',
        name: user?.displayName || 'Alex Rivera',
        role: 'Floor Captain / POS Waiter',
        phone: user?.phoneNumber || '7020875435',
        email: 'alex.rivera@heaven4.com',
        shiftHours: '09:00 AM - 05:00 PM',
        department: 'Dining Floor Operations',
        tablesGoal: 20,
        currentScore: 98
    });

    const toggleClockIn = () => {
        setIsClockedIn(!isClockedIn);
        toast.success(!isClockedIn ? 'Clocked IN for shift!' : 'Clocked OUT from shift.');
    };

    const fetchActiveTables = useCallback(async () => {
        try {
            const [ordersRes, complaintsRes] = await Promise.all([
                apiClient.get('/orders/active').catch(() => ({ data: [] })),
                apiClient.get('/complaints').catch(() => ({ data: [] })),
            ]);
            const orders = ordersRes.data || [];
            setComplaints((complaintsRes.data || []).filter((c: Complaint) => c.status !== 'RESOLVED'));
            const activeTablesMap = new Map<string, TableData>();
            orders.forEach((order: any) => {
                if (order.tableNumber) {
                    activeTablesMap.set(order.tableNumber, {
                        id: order.tableNumber,
                        status: 'OCCUPIED',
                        orderTotal: order.totalAmount || 0,
                        orderId: order.id,
                        items: order.items || [],
                        tableNumber: order.tableNumber,
                        membershipTier: order.membershipTier || 'GOLD VIP',
                        customerName: order.customerName || 'Sarah Jenkins',
                        customerPhone: order.customerPhone || '7020875435',
                        customerId: order.customerId || '#CUST-1001'
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
            if (res.data?.categories && res.data.categories.length > 0) setCategories(res.data.categories);
            const flat: MenuItem[] = Object.values(res.data.items || {}).flat() as MenuItem[];
            if (flat.length > 0) setMenuItems([...flat, ...DEFAULT_ITEMS]);
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
        setSelectedTable({
            ...table,
            customerName: table.customerName || 'Sarah Jenkins',
            customerPhone: table.customerPhone || '7020875435',
            customerId: table.customerId || '#CUST-1001',
            membershipTier: table.membershipTier || 'GOLD VIP'
        });
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
        setSelectedItems(prev => prev.map(s => {
            if (s.item.id === itemId) return { ...s, qty: Math.max(1, s.qty + delta) };
            return s;
        }));
    };

    const handleAddItems = async () => {
        if (!selectedTable?.orderId || selectedItems.length === 0) return;
        setIsProcessing(true);
        try {
            await apiClient.post(`/orders/${selectedTable.orderId}/items`, {
                items: selectedItems.map(s => ({ menuItemId: s.item.id, quantity: s.qty }))
            });
            toast.success('Items added to order!');
            setModal(null);
            setSelectedItems([]);
            fetchActiveTables();
        } catch { toast.error('Failed to add items'); }
        finally { setIsProcessing(false); }
    };

    const handleCloseTable = async () => {
        if (!selectedTable?.orderId) return;
        setIsProcessing(true);
        try {
            await apiClient.put(`/orders/${selectedTable.orderId}/status`, { status: 'COMPLETED' });
            toast.success(`🎉 Table ${selectedTable.id} closed & bill settled!`);
            setTablesServed(prev => prev + 1);
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
            toast.success(`🎉 Walk-in order placed for Table ${walkInTable}!`);
            setModal(null);
            setSelectedItems([]);
            setWalkInTable('');
            fetchActiveTables();
        } catch { toast.error('Failed to create order'); }
        finally { setIsProcessing(false); }
    };

    const tax = (selectedTable?.orderTotal || 0) * 0.05;
    const grandTotal = (selectedTable?.orderTotal || 0) + tax;

    const displayItems = menuItems.filter(i => activeCategory === null || i.categoryId === activeCategory);

    const shiftElapsed = () => {
        const mins = Math.floor((Date.now() - new Date(shiftStart).getTime()) / 60000);
        return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                        Floor POS & Staff Operations
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Real-time table orders, cash settlement & waiter service</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Clock In / Out Toggle */}
                    <button 
                        onClick={toggleClockIn}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all ${
                            isClockedIn 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                            : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
                        {isClockedIn ? `Clocked In (${clockInTime})` : 'Clocked Out'}
                    </button>

                    {/* Staff Profile & Personal Info Edit Button */}
                    <button 
                        onClick={() => setModal('profile')}
                        className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl px-4 py-2 flex items-center gap-2.5 text-left shadow-sm transition-all"
                    >
                        <User className="w-4 h-4 text-blue-400" />
                        <div>
                            <p className="font-bold text-xs text-amber-400">{staffDetails.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{staffDetails.id} · Edit Details</p>
                        </div>
                    </button>

                    <button onClick={() => { setSelectedItems([]); setWalkInTable(''); setModal('walkin'); }}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all text-xs border border-blue-400/30">
                        <Plus className="w-4 h-4" /> New Walk-in Order
                    </button>
                </div>
            </header>

            {/* Prominent 4-Card Staff Attendance, Information, Shift Goals & Performance Banner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Personal Details */}
                <div 
                    onClick={() => setModal('profile')}
                    className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 cursor-pointer rounded-2xl p-4 flex items-center gap-3 shadow-xl transition-all"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                        {staffDetails.name[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-amber-400">{staffDetails.name}</p>
                            <span className="text-[9px] font-black bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30">{staffDetails.id}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{staffDetails.role}</p>
                        <p className="text-[10px] text-slate-500">{staffDetails.phone}</p>
                    </div>
                </div>

                {/* Shift Attendance */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 shadow-xl">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-emerald-400">{isClockedIn ? '🟢 ON SHIFT' : '🔴 CLOCKED OUT'}</p>
                        <p className="text-[10px] text-slate-400">{staffDetails.shiftHours}</p>
                        <p className="text-[10px] text-slate-500">{shiftElapsed()} elapsed</p>
                    </div>
                </div>

                {/* Shift Goals Progress */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-1">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-indigo-300 flex items-center gap-1">
                            <Target className="w-3.5 h-3.5" /> Shift Tables Goal
                        </span>
                        <span className="text-blue-400 font-bold">{tablesServed} / {staffDetails.tablesGoal}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (tablesServed/staffDetails.tablesGoal)*100)}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 text-right">{Math.round((tablesServed/staffDetails.tablesGoal)*100)}% Completed</p>
                </div>

                {/* Performance & Tips */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-around text-center shadow-xl">
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold">Rating</p>
                        <p className="text-base font-black text-amber-400">⭐ {staffDetails.currentScore}%</p>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold">Tips Earned</p>
                        <p className="text-base font-black text-emerald-400">$65.00</p>
                    </div>
                </div>
            </div>

            {/* Complaints Alert Banner */}
            {complaints.length > 0 && (
                <div className="p-4 bg-red-900/20 border border-red-500/40 rounded-2xl flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                    <div className="flex-1">
                        <p className="font-bold text-red-400 text-sm">
                            {complaints.length} Active Customer Complaint{complaints.length > 1 ? 's' : ''} — Action Needed
                        </p>
                        <p className="text-xs text-red-300 mt-0.5">{complaints.map(c => c.type.replace(/_/g, ' ')).join(' · ')}</p>
                    </div>
                    <button
                        onClick={() => setModal('complaint')}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                        View Complaints
                    </button>
                </div>
            )}

            {/* Table Grid (Dark Glassmorphic Cards) */}
            <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Restaurant Dining Tables Roster</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {tables.map(table => {
                        const tableComplaint = complaints.find(c => 
                            c.tableNumber === table.id || 
                            (table.orderId && c.orderId === table.orderId)
                        );
                        return (
                            <motion.div key={table.id} whileHover={{ y: -4 }}
                                className={`p-5 rounded-3xl border-2 transition-all ${
                                    table.status === 'OCCUPIED' 
                                        ? tableComplaint
                                            ? 'bg-slate-900 border-red-500 shadow-xl shadow-red-500/20'
                                            : 'bg-slate-900 border-blue-500 shadow-xl shadow-blue-500/10' 
                                        : 'bg-slate-950 border-slate-800 hover:border-blue-500/50'
                                }`}>
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className={`text-2xl font-black ${
                                        tableComplaint ? 'text-red-400' :
                                        table.status === 'OCCUPIED' ? 'text-blue-400' : 'text-slate-400'
                                    }`}>
                                        T{table.id}
                                    </h3>
                                    <div className="flex gap-1.5">
                                        {tableComplaint && (
                                            <button
                                                onClick={() => setModal('complaint')}
                                                className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 animate-pulse border border-red-500/30"
                                            >
                                                <AlertTriangle className="w-3 h-3" /> Complaint
                                            </button>
                                        )}
                                        {table.status === 'OCCUPIED' && !tableComplaint && (
                                            <div className="bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-blue-500/30">
                                                Occupied
                                                {table.membershipTier && (
                                                    <Crown className={`w-3 h-3 ${table.membershipTier.includes('DIAMOND') ? 'text-indigo-400' : table.membershipTier.includes('GOLD') ? 'text-amber-400' : 'text-slate-400'}`} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {table.status === 'OCCUPIED' ? (
                                    <div>
                                        <div className="mb-3 max-h-28 overflow-y-auto pr-1 space-y-1.5 text-xs font-semibold">
                                            {table.items && table.items.length > 0 ? (
                                                table.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-slate-300">
                                                        <span className="truncate pr-2"><span className="text-blue-400 font-bold">{item.quantity}x</span> {item.menuItemName}</span>
                                                        <span className="font-bold text-amber-400">${item.subtotal.toFixed(2)}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-[10px] text-slate-500 italic">No items yet</p>
                                            )}
                                        </div>
                                        <div className="border-t border-slate-800 pt-2 flex justify-between items-end mb-3">
                                            <p className="text-[10px] text-slate-400 font-bold">Total Bill</p>
                                            <p className="text-lg font-black text-emerald-400">${table.orderTotal.toFixed(2)}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {/* Clearly Visible High-Contrast + Add Button */}
                                            <button onClick={() => openAddModal(table)}
                                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 border border-blue-400/40 transition-colors">
                                                + Add
                                            </button>
                                            <button onClick={() => openCloseModal(table)}
                                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 border border-emerald-400/40 transition-colors">
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-5">
                                        <Coffee className="w-7 h-7 text-slate-600 mb-1" />
                                        <p className="font-bold text-slate-500 text-xs">Available</p>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {/* Professional Walk-in Order Entry Modal with Glowing Neon Borders */}
                {modal === 'walkin' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[80] flex items-center justify-center p-4"
                        onClick={() => setModal(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border-2 border-blue-500/60 rounded-3xl p-6 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_0_40px_rgba(59,130,246,0.3)] text-white"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                                <div>
                                    <h3 className="text-xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                                        New Walk-in Table Order Entry
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Enter table number and append items to live order</p>
                                </div>
                                <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-300 mb-2">Table Number <span className="text-red-400">*</span></label>
                                <input type="text" placeholder="e.g. 5, 12, VIP-1" value={walkInTable} onChange={e => setWalkInTable(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-950 text-white placeholder-slate-500 border border-slate-800 focus:border-blue-500 outline-none font-bold text-sm" />
                            </div>

                            {/* Category tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                                {categories.map(cat => (
                                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                                        className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all ${activeCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'}`}>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
                                {displayItems.map(item => {
                                    const sel = selectedItems.find(s => s.item.id === item.id);
                                    return (
                                        <div key={item.id} onClick={() => toggleItem(item)}
                                            className={`flex justify-between items-center p-3.5 rounded-2xl border cursor-pointer transition-all ${sel ? 'border-blue-500 bg-blue-600/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}>
                                            <div>
                                                <p className="font-bold text-amber-400 text-sm">{item.name}</p>
                                                <p className="text-xs font-black text-emerald-400 mt-0.5">${item.basePrice.toFixed(2)}</p>
                                            </div>
                                            {sel ? (
                                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => updateItemQty(item.id, -1)} className="w-7 h-7 bg-slate-800 text-white rounded-lg font-bold flex items-center justify-center">-</button>
                                                    <span className="font-black text-white w-4 text-center">{sel.qty}</span>
                                                    <button onClick={() => updateItemQty(item.id, 1)} className="w-7 h-7 bg-slate-800 text-white rounded-lg font-bold flex items-center justify-center">+</button>
                                                </div>
                                            ) : (
                                                <div className="w-7 h-7 border border-slate-700 rounded-lg flex items-center justify-center text-slate-500 font-bold">+</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedItems.length > 0 && walkInTable.trim() && (
                                <div className="border-t border-slate-800 pt-4">
                                    <div className="flex justify-between text-xs text-slate-400 mb-3 font-semibold">
                                        <span>Table {walkInTable} · {selectedItems.reduce((a, s) => a + s.qty, 0)} items</span>
                                        <span className="text-emerald-400 font-bold">${selectedItems.reduce((a, s) => a + s.item.basePrice * s.qty, 0).toFixed(2)}</span>
                                    </div>
                                    <button onClick={handleWalkIn} disabled={isProcessing}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
                                        {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                                            <><Plus className="w-4 h-4" /> Place Walk-in Order</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}

                {/* Add Items Modal */}
                {modal === 'add' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[80] flex items-center justify-center p-4"
                        onClick={() => setModal(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl text-white"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Add Items to Table {selectedTable?.id}</h3>
                                    <p className="text-xs text-slate-400">Select drinks, pizzas, or meals to append to order</p>
                                </div>
                                <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            {/* Category tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                                {categories.map(cat => (
                                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                                        className={`px-4 py-2 rounded-full whitespace-nowrap text-xs font-bold transition-all ${activeCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'}`}>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {/* Items */}
                            <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
                                {displayItems.map(item => {
                                    const sel = selectedItems.find(s => s.item.id === item.id);
                                    return (
                                        <div key={item.id} onClick={() => toggleItem(item)}
                                            className={`flex justify-between items-center p-3.5 rounded-2xl border cursor-pointer transition-all ${sel ? 'border-blue-500 bg-blue-600/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}>
                                            <div>
                                                <p className="font-bold text-amber-400 text-sm">{item.name}</p>
                                                <p className="text-xs font-black text-emerald-400 mt-0.5">${item.basePrice.toFixed(2)}</p>
                                            </div>
                                            {sel ? (
                                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => updateItemQty(item.id, -1)} className="w-7 h-7 bg-slate-800 text-white rounded-lg font-bold flex items-center justify-center">-</button>
                                                    <span className="font-black text-white w-4 text-center">{sel.qty}</span>
                                                    <button onClick={() => updateItemQty(item.id, 1)} className="w-7 h-7 bg-slate-800 text-white rounded-lg font-bold flex items-center justify-center">+</button>
                                                </div>
                                            ) : (
                                                <div className="w-7 h-7 border border-slate-700 rounded-lg flex items-center justify-center text-slate-500 font-bold">+</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedItems.length > 0 && (
                                <div className="border-t border-slate-800 pt-4">
                                    <div className="flex justify-between text-xs text-slate-400 mb-3 font-semibold">
                                        <span>{selectedItems.reduce((a, s) => a + s.qty, 0)} items selected</span>
                                        <span className="text-emerald-400 font-bold">+${selectedItems.reduce((a, s) => a + s.item.basePrice * s.qty, 0).toFixed(2)}</span>
                                    </div>
                                    <button onClick={handleAddItems} disabled={isProcessing}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
                                        {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                                            <><ShoppingBag className="w-4 h-4" /> Add Items to Table Order</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}

                {/* Close Table / Bill Settlement Modal with Visible Customer Details & High-Contrast Colors */}
                {modal === 'close' && selectedTable && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[80] flex items-center justify-center p-4"
                        onClick={() => setModal(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(16,185,129,0.2)] text-white"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                                <div>
                                    <h3 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                                        Close Order & Settle Bill
                                    </h3>
                                    <p className="text-xs text-slate-400">Table {selectedTable.id} · Order #{selectedTable.orderId || 1042}</p>
                                </div>
                                <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            {/* Customer Details Box */}
                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4 space-y-1.5 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 font-bold uppercase text-[10px]">Customer Name</span>
                                    <span className="font-bold text-amber-400">{selectedTable.customerName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 font-bold uppercase text-[10px]">Customer ID & Phone</span>
                                    <span className="font-mono text-blue-400 font-bold">{selectedTable.customerId} · {selectedTable.customerPhone}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                                    <span className="text-slate-400 font-bold uppercase text-[10px]">Membership Tier</span>
                                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold text-[10px] rounded-full border border-amber-500/30">
                                        👑 {selectedTable.membershipTier}
                                    </span>
                                </div>
                            </div>

                            {/* Bill Breakdown */}
                            <div className="bg-slate-950 rounded-2xl p-4 mb-4 border border-slate-800">
                                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Itemized Summary</h4>
                                {selectedTable.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-xs py-1.5 border-b border-slate-800/80 last:border-0">
                                        <span className="text-slate-300 font-semibold">{item.quantity}× {item.menuItemName}</span>
                                        <span className="font-bold text-amber-400">${(item.subtotal || 0).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="mt-3 pt-3 border-t border-slate-800 space-y-1 text-xs">
                                    <div className="flex justify-between text-slate-400"><span>Items Subtotal</span><span>${selectedTable.orderTotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-slate-400"><span>GST / Service Tax (5%)</span><span>${tax.toFixed(2)}</span></div>
                                    <div className="flex justify-between font-black text-lg text-emerald-400 mt-2"><span>Total Amount Payable</span><span>${grandTotal.toFixed(2)}</span></div>
                                </div>
                            </div>

                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 mb-4 flex items-center gap-3">
                                <DollarSign className="w-6 h-6 text-emerald-400" />
                                <div>
                                    <p className="font-bold text-xs text-emerald-300">Cash to collect from customer</p>
                                    <p className="text-2xl font-black text-emerald-400">${grandTotal.toFixed(2)}</p>
                                </div>
                            </div>

                            <button onClick={handleCloseTable} disabled={isProcessing}
                                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30">
                                {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                                    <><CheckCircle2 className="w-5 h-5" /> Confirm Cash Settlement & Close Table</>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Edit Personal Information Modal */}
                {modal === 'profile' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[80] flex items-center justify-center p-4"
                        onClick={() => setModal(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-white relative"
                            onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
                                        {staffDetails.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{staffDetails.name}</h3>
                                        <p className="text-xs text-slate-400">{staffDetails.role} · <span className="text-blue-400 font-bold">{staffDetails.id}</span></p>
                                    </div>
                                </div>
                                <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Edit Personal Information</h4>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <label className="text-slate-400 block mb-1">Full Name</label>
                                            <input type="text" value={staffDetails.name} onChange={e => setStaffDetails({ ...staffDetails, name: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold outline-none focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="text-slate-400 block mb-1">Phone Number</label>
                                            <input type="text" value={staffDetails.phone} onChange={e => setStaffDetails({ ...staffDetails, phone: e.target.value })}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold outline-none focus:border-blue-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-slate-400 block mb-1 text-xs">Email Address</label>
                                        <input type="email" value={staffDetails.email} onChange={e => setStaffDetails({ ...staffDetails, email: e.target.value })}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold outline-none focus:border-blue-500" />
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => { toast.success('Personal profile details saved!'); setModal(null); }}
                                className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 text-xs">
                                Save Profile Details
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Complaint Overview List Modal (High Z-Index Fix) */}
                {modal === 'complaint' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[80] flex items-center justify-center p-4"
                        onClick={() => setModal(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-white"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                    <h3 className="text-xl font-bold text-white">Active Customer Complaints</h3>
                                </div>
                                <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                                {complaints.length === 0 && <p className="text-slate-500 text-center py-8">No active complaints</p>}
                                {complaints.map(c => (
                                    <div key={c.id} className="p-4 rounded-2xl bg-red-900/20 border border-red-500/40">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-red-400 text-xs uppercase">{c.type.replace(/_/g, ' ')}</span>
                                            {c.orderId && <span className="text-[10px] text-slate-400 font-bold">Order #{c.orderId}</span>}
                                        </div>
                                        <p className="text-xs text-slate-300">{c.description}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
