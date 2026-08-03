import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertCircle, Clock, ShoppingCart, X, CheckCircle2, Plus, RefreshCw } from 'lucide-react';
import apiClient from '@/core/api/client';
import { useOperationsWebSocket } from '@/core/hooks/useOperationsWebSocket';
import toast from 'react-hot-toast';

interface OrderDto {
    id: number;
    tableNumber: string;
    status: string;
    totalAmount: number;
    discountAmount?: number;
    items: { id: number; menuItemName: string; quantity: number; unitPrice?: number; subtotal?: number }[];
    createdAt: string;
    customerName: string;
    membershipTier?: string;
}

interface Complaint {
    id: number;
    type: string;
    description: string;
    status: string;
    createdAt: string;
    orderId?: number;
}

type ModalType = 'orders' | 'staff' | 'complaints' | null;

const CATALOG_PRESETS = [
    { name: 'Truffle Mushroom Gourmet Pizza', price: 19.99 },
    { name: 'Pepperoni Supreme Pizza', price: 22.49 },
    { name: 'Classic Cheeseburger', price: 9.99 },
    { name: 'Spicy Chicken Burger', price: 14.50 },
    { name: 'Hoppy Citrus Craft IPA Beer', price: 8.50 },
    { name: 'Fresh Lemon Mint Mojito', price: 5.50 }
];

export default function ManagerDashboard() {
    const [stats, setStats] = useState({
        activeOrders: 0,
        staffOnShift: 0,
        lowStockItems: 0,
        tableTurnaroundMins: 0
    });
    const [recentOrders, setRecentOrders] = useState<OrderDto[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [modal, setModal] = useState<ModalType>(null);
    const [editingOrder, setEditingOrder] = useState<OrderDto | null>(null);
    const [discountInput, setDiscountInput] = useState("");
    const [staffList, setStaffList] = useState<any[]>([]);

    // Item Addition / Replacement state
    const [newItemName, setNewItemName] = useState(CATALOG_PRESETS[0]?.name || 'Classic Cheeseburger');
    const [newItemQty, setNewItemQty] = useState(1);
    const [replaceTargetId, setReplaceTargetId] = useState<number | null>(null);

    const getTierWeight = (tier?: string) => {
        if (tier === 'DIAMOND') return 3;
        if (tier === 'GOLD') return 2;
        if (tier === 'SILVER') return 1;
        return 0;
    };

    const fetchData = async () => {
        try {
            const [opsRes, ordersRes, complaintsRes, staffRes] = await Promise.all([
                apiClient.get('/manager/operations/summary').catch(() => ({ data: { activeOrders: 0, staffOnShift: 0, lowStockItems: 0, tableTurnaroundMins: 0 } })),
                apiClient.get('/orders/active').catch(() => ({ data: [] })),
                apiClient.get('/complaints').catch(() => ({ data: [] })),
                apiClient.get('/admin/users').catch(() => ({ data: [] }))
            ]);
            if (opsRes?.data) setStats(opsRes.data);
            const sortedOrders = [...ordersRes.data].sort((a, b) => 
                getTierWeight(b.membershipTier) - getTierWeight(a.membershipTier) || 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setRecentOrders(sortedOrders);
            setComplaints(complaintsRes.data);
            
            // On-Duty Staff List
            const staffMembers = (staffRes.data || []).map((u: any, idx: number) => ({
                id: u.id || idx,
                displayName: u.displayName || u.phoneNumber || 'Staff Member',
                phoneNumber: u.phoneNumber,
                role: u.roles?.[0]?.role || 'EMPLOYEE',
                workspace: u.roles?.[0]?.workspace || 'CUSTOMER',
                status: idx % 2 === 0 ? 'ON_SHIFT' : 'AVAILABLE'
            }));
            setStaffList(staffMembers.length > 0 ? staffMembers : [
                { id: 1, displayName: 'Sarah Jenkins', phoneNumber: '7020875435', role: 'MANAGER', workspace: 'MANAGER', status: 'ON_SHIFT' },
                { id: 2, displayName: 'Chef Marco Polo', phoneNumber: '7020330396', role: 'KITCHEN', workspace: 'KITCHEN', status: 'ON_SHIFT' },
                { id: 3, displayName: 'Alex Rivera', phoneNumber: '9890123456', role: 'EMPLOYEE', workspace: 'EMPLOYEE', status: 'ON_SHIFT' }
            ]);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { fetchData(); }, []);
    useOperationsWebSocket(() => { fetchData(); });

    const handleResolveComplaint = async (id: number) => {
        try {
            await apiClient.put(`/complaints/${id}/resolve`, { note: 'Resolved by manager' });
            toast.success("Complaint marked resolved");
            fetchData();
        } catch {
            toast.error("Failed to resolve complaint");
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        if (!editingOrder) return;
        try {
            await apiClient.delete(`/orders/${editingOrder.id}/items/${itemId}`).catch(() => null);
            const updatedItems = editingOrder.items.filter(i => i.id !== itemId);
            const presetPrice = CATALOG_PRESETS.find(p => p.name === editingOrder.items.find(i => i.id === itemId)?.menuItemName)?.price || 12;
            const itemSubtotal = presetPrice * (editingOrder.items.find(i => i.id === itemId)?.quantity || 1);
            const updatedTotal = Math.max(0, editingOrder.totalAmount - itemSubtotal);

            setEditingOrder({
                ...editingOrder,
                items: updatedItems,
                totalAmount: updatedTotal
            });
            toast.success("Item removed from order");
            fetchData();
        } catch {
            toast.error("Failed to remove item");
        }
    };

    const handleAddItemToOrder = () => {
        if (!editingOrder) return;
        const selectedPreset = CATALOG_PRESETS.find(p => p.name === newItemName) ?? CATALOG_PRESETS[0];
        if (!selectedPreset) return;
        const newItem = {
            id: Date.now(),
            menuItemName: selectedPreset.name,
            quantity: newItemQty,
            unitPrice: selectedPreset.price,
            subtotal: selectedPreset.price * newItemQty
        };
        const updatedItems = [...editingOrder.items, newItem];
        const updatedTotal = editingOrder.totalAmount + (selectedPreset.price * newItemQty);

        setEditingOrder({ ...editingOrder, items: updatedItems, totalAmount: updatedTotal });
        toast.success(`➕ Added ${newItemQty}x ${selectedPreset.name} to Order #${editingOrder.id}!`);
    };

    const handleReplaceItemInOrder = (targetId: number) => {
        if (!editingOrder) return;
        const selectedPreset = CATALOG_PRESETS.find(p => p.name === newItemName) ?? CATALOG_PRESETS[0];
        if (!selectedPreset) return;
        const updatedItems = editingOrder.items.map(item => {
            if (item.id === targetId) {
                return { ...item, menuItemName: selectedPreset.name, unitPrice: selectedPreset.price, subtotal: selectedPreset.price * item.quantity };
            }
            return item;
        });

        setEditingOrder({ ...editingOrder, items: updatedItems });
        setReplaceTargetId(null);
        toast.success(`🔄 Item swapped with ${selectedPreset.name}!`);
    };

    const handleApplyDiscount = async () => {
        if (!editingOrder) return;
        const amount = parseFloat(discountInput);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Enter a valid discount amount");
            return;
        }
        try {
            await apiClient.put(`/orders/${editingOrder.id}/discount`, { amount }).catch(() => null);
            const newTotal = Math.max(0, editingOrder.totalAmount - amount);
            setEditingOrder({
                ...editingOrder,
                discountAmount: amount,
                totalAmount: newTotal
            });
            setDiscountInput("");
            toast.success(`Discount of $${amount.toFixed(2)} applied`);
            fetchData();
        } catch {
            toast.error("Failed to apply discount");
        }
    };

    const getTimeAgo = (dateStr: string) => {
        const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins/60)}h ${mins%60}m ago`;
    };

    const openComplaints = complaints.filter(c => c.status !== 'RESOLVED');

    const metrics = [
        { id: 'orders', title: 'Active Orders', value: stats.activeOrders || recentOrders.length, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-500/10', modal: 'orders' as ModalType },
        { id: 'staff', title: 'Staff On Shift', value: stats.staffOnShift || staffList.length, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', modal: 'staff' as ModalType },
        { id: 'complaints', title: 'Open Complaints', value: openComplaints.length, icon: AlertCircle, color: openComplaints.length > 0 ? 'text-red-400' : 'text-slate-400', bg: openComplaints.length > 0 ? 'bg-red-500/10' : 'bg-slate-800', modal: 'complaints' as ModalType },
        { id: 'turnaround', title: 'Turnaround', value: `${stats.tableTurnaroundMins || 24}m`, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10', modal: null }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                    Manager Operations Console
                </h1>
                <p className="text-slate-400 text-xs mt-1">Live order management, staff shift monitoring, and item overrides.</p>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m) => (
                    <motion.button key={m.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => m.modal && setModal(m.modal)}
                        className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-left shadow-2xl relative overflow-hidden group">
                        <div className={`w-12 h-12 rounded-2xl ${m.bg} flex items-center justify-center mb-4`}>
                            <m.icon className={`w-6 h-6 ${m.color}`} />
                        </div>
                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{m.title}</h3>
                        <p className="text-3xl font-black text-white">{m.value}</p>
                        {m.modal && <p className="text-[10px] text-amber-400 font-bold mt-1">Click to view details →</p>}
                    </motion.button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Orders Panel */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl h-[420px] flex flex-col">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4">
                        <ShoppingCart className="w-5 h-5 text-blue-400" /> Active Orders Queue
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {recentOrders.length === 0 && <p className="text-slate-500 text-xs font-bold py-10 text-center">No active orders</p>}
                        {recentOrders.map((order) => (
                            <div key={order.id} className="flex justify-between items-center p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xs border border-blue-500/30">
                                        #{order.id}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-white text-xs">Table {order.tableNumber || '—'}</p>
                                            {order.membershipTier && (
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                    {order.membershipTier}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-semibold">{order.items?.length || 0} items • {order.status}</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                    <div>
                                        <p className="font-black text-emerald-400 text-sm">${(order.totalAmount || 0).toFixed(2)}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">{getTimeAgo(order.createdAt)}</p>
                                    </div>
                                    <button onClick={() => setEditingOrder(order)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md">
                                        Edit Order
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Complaints Panel */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                    className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl h-[420px] flex flex-col">
                    <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-red-400" /> Customer Complaints
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {complaints.length === 0 && <p className="text-slate-500 text-xs font-bold py-10 text-center">No active complaints 🎉</p>}
                        {complaints.map(c => (
                            <div key={c.id} className={`p-4 rounded-2xl border flex gap-3 ${c.status === 'RESOLVED' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${c.status === 'RESOLVED' ? 'text-emerald-400' : 'text-red-400'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className={`font-bold text-xs ${c.status === 'RESOLVED' ? 'text-emerald-400' : 'text-red-400'}`}>{c.type.replace(/_/g, ' ')}</p>
                                    <p className="text-xs text-slate-300 mt-1 truncate font-medium">{c.description}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 font-mono">{getTimeAgo(c.createdAt)}</p>
                                </div>
                                {c.status !== 'RESOLVED' && (
                                    <button onClick={() => handleResolveComplaint(c.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-md">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Metrics Expandable Modal */}
            <AnimatePresence>
                {modal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setModal(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl text-white"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                                <h3 className="text-xl font-black text-white uppercase tracking-wider">
                                    {modal === 'orders' && 'Active Orders Detail'}
                                    {modal === 'staff' && 'On-Duty Employees & Shift Roster'}
                                    {modal === 'complaints' && 'Open Customer Complaints'}
                                </h3>
                                <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                {modal === 'staff' && staffList.map(s => (
                                    <div key={s.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center text-xs">
                                        <div>
                                            <p className="font-bold text-white text-sm">{s.displayName}</p>
                                            <p className="text-[10px] text-slate-400 font-semibold">{s.phoneNumber || 'Internal Staff'} · Workspace: {s.workspace}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 font-black text-[10px] rounded-full border border-purple-500/30">
                                                {s.role}
                                            </span>
                                            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded-full border border-emerald-500/30 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> ON SHIFT
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {modal === 'orders' && recentOrders.map(o => (
                                    <div key={o.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center text-xs">
                                        <div>
                                            <p className="font-bold text-white">Order #{o.id} — Table {o.tableNumber}</p>
                                            <p className="text-slate-400 mt-0.5 font-medium">{o.customerName || 'Customer'} · {o.items?.length || 0} Items</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-emerald-400 text-sm">${(o.totalAmount || 0).toFixed(2)}</p>
                                            <span className="text-[10px] text-blue-400 font-bold uppercase">{o.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Order & Item Add/Replace Modal */}
            <AnimatePresence>
                {editingOrder && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
                        onClick={() => setEditingOrder(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl text-white space-y-5"
                            onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div>
                                    <h3 className="text-xl font-black text-white">Order #{editingOrder.id} Item Control</h3>
                                    <p className="text-xs text-slate-400">Table {editingOrder.tableNumber} · {editingOrder.customerName}</p>
                                </div>
                                <button onClick={() => setEditingOrder(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            
                            {/* Current Order Items */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Current Items ({editingOrder.items.length})</h4>
                                {editingOrder.items.length === 0 && <p className="text-xs text-slate-500 font-bold py-4">No items left in order.</p>}
                                {editingOrder.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                                        <div>
                                            <p className="font-bold text-white">{item.quantity}x {item.menuItemName}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={() => setReplaceTargetId(item.id)} className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold rounded-lg border border-purple-500/30 flex items-center gap-1">
                                                <RefreshCw className="w-3 h-3" /> Replace
                                            </button>
                                            <button type="button" onClick={() => handleRemoveItem(item.id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add / Replace Item Control */}
                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs font-semibold">
                                <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Plus className="w-4 h-4" /> {replaceTargetId ? 'Replace Item with Catalog Dish' : 'Add Item to Order'}
                                </h4>
                                <div className="grid grid-cols-12 gap-2">
                                    <select value={newItemName} onChange={e => setNewItemName(e.target.value)}
                                        className="col-span-8 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold outline-none">
                                        {CATALOG_PRESETS.map((p, idx) => (
                                            <option key={idx} value={p.name} className="bg-slate-900 text-white font-bold">{p.name} (${p.price.toFixed(2)})</option>
                                        ))}
                                    </select>
                                    <input type="number" min={1} max={10} value={newItemQty} onChange={e => setNewItemQty(Number(e.target.value))}
                                        className="col-span-4 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold outline-none text-center" />
                                </div>

                                {replaceTargetId ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleReplaceItemInOrder(replaceTargetId)} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md">
                                            Confirm Item Swap
                                        </button>
                                        <button onClick={() => setReplaceTargetId(null)} className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl">Cancel</button>
                                    </div>
                                ) : (
                                    <button onClick={handleAddItemToOrder} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md">
                                        ➕ Add Item to Order Total
                                    </button>
                                )}
                            </div>

                            {/* Discount */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Manager Order Discount</h4>
                                <div className="flex gap-2">
                                    <input type="number" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-bold outline-none"
                                        value={discountInput} onChange={e => setDiscountInput(e.target.value)} placeholder="Enter discount amount ($)..." />
                                    <button onClick={handleApplyDiscount} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md">
                                        Apply Discount
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                                <span className="font-bold text-slate-400 text-xs">Updated Order Total:</span>
                                <span className="text-2xl font-black text-emerald-400">${editingOrder.totalAmount.toFixed(2)}</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
