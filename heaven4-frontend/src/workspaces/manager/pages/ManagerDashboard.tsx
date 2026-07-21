import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertCircle, Clock, ShoppingCart, X, CheckCircle2, MessageSquare, Crown } from 'lucide-react';
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
            setStats(opsRes.data);
            const sortedOrders = [...ordersRes.data].sort((a, b) => 
                getTierWeight(b.membershipTier) - getTierWeight(a.membershipTier) || 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setRecentOrders(sortedOrders);
            setComplaints(complaintsRes.data);
            
            // Filter to only staff roles
            const staffMembers = staffRes.data.filter((u: any) => 
                u.roles?.some((r: any) => ['EMPLOYEE', 'KITCHEN', 'MANAGER', 'OWNER'].includes(r.role))
            );
            setStaffList(staffMembers);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { fetchData(); }, []);
    useOperationsWebSocket(() => { fetchData(); });

    const handleResolveComplaint = async (id: number) => {
        try {
            await apiClient.put(`/complaints/${id}/resolve`, { note: 'Resolved by manager' });
            toast.success('Complaint resolved');
            fetchData();
        } catch (e) {
            toast.error('Failed to resolve complaint');
        }
    };

    const handleApplyDiscount = async () => {
        if (!editingOrder || !discountInput) return;
        try {
            const res = await apiClient.put(`/orders/${editingOrder.id}/discount`, { discountAmount: parseFloat(discountInput) });
            toast.success('Discount applied');
            setEditingOrder(res.data);
            fetchData();
        } catch (e) { toast.error('Failed to apply discount'); }
    };

    const handleRemoveItem = async (itemId: number) => {
        if (!editingOrder) return;
        try {
            const res = await apiClient.delete(`/orders/${editingOrder.id}/items/${itemId}`);
            toast.success('Item removed');
            setEditingOrder(res.data);
            fetchData();
        } catch (e) { toast.error('Failed to remove item'); }
    };

    const openComplaints = complaints.filter(c => c.status === 'OPEN' || c.status === 'IN_REVIEW');

    const metrics = [
        { title: 'Active Orders', value: stats.activeOrders, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/10', modal: 'orders' as ModalType },
        { title: 'Staff on Shift', value: staffList.length || stats.staffOnShift, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10', modal: 'staff' as ModalType },
        { title: 'Avg Turnaround', value: `${stats.tableTurnaroundMins}m`, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10', modal: null },
        { title: 'Complaints', value: openComplaints.length, icon: MessageSquare, color: 'text-red-400', bg: 'bg-red-400/10', modal: 'complaints' as ModalType },
    ];

    const getTimeAgo = (dateStr: string) => {
        const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 flex flex-col text-white bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-soft-light relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-950 to-purple-900/10 pointer-events-none" />
            
            <div className="relative z-10 max-w-7xl mx-auto w-full">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Operations Control</h1>
                        <p className="text-slate-400 mt-2 text-lg">Real-time floor & kitchen metrics</p>
                    </div>
                </header>

                {/* Clickable Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {metrics.map((m, i) => (
                        <motion.button 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={m.title}
                            onClick={() => m.modal && setModal(m.modal)}
                            className={`bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden group text-left ${m.modal ? 'hover:border-white/30 hover:scale-[1.02] transition-all cursor-pointer' : 'cursor-default'}`}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                                <m.icon className={`w-16 h-16 ${m.color}`} />
                            </div>
                            <div className={`w-12 h-12 rounded-2xl ${m.bg} flex items-center justify-center mb-4 relative z-10`}>
                                <m.icon className={`w-6 h-6 ${m.color}`} />
                            </div>
                            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1 relative z-10">{m.title}</h3>
                            <p className="text-3xl font-bold text-white relative z-10">{m.value}</p>
                            {m.modal && <p className="text-xs text-slate-500 mt-1 relative z-10">Click to view details →</p>}
                        </motion.button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Orders Panel */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl h-[400px] flex flex-col">
                        <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2 mb-4">
                            <ShoppingCart className="w-5 h-5 text-blue-400" /> Active Orders
                        </h2>
                        <div className="flex-1 overflow-auto space-y-3 pr-2">
                            {recentOrders.length === 0 && <p className="text-slate-500">No active orders</p>}
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                                            #{order.id}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-slate-200">Table {order.tableNumber || '—'}</p>
                                                {order.membershipTier && order.membershipTier !== 'BRONZE' && (
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                                        order.membershipTier === 'DIAMOND' ? 'bg-indigo-900/40 text-indigo-300' :
                                                        order.membershipTier === 'GOLD' ? 'bg-yellow-900/40 text-yellow-300' :
                                                        'bg-slate-700 text-slate-300'
                                                    }`}>
                                                        <Crown className="w-3 h-3" /> {order.membershipTier}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500">{order.items?.length || 0} items • {order.status}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white">${(order.totalAmount || 0).toFixed(2)}</p>
                                        <p className="text-xs text-slate-500">{getTimeAgo(order.createdAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Complaints Panel */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                        className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl h-[400px] flex flex-col">
                        <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-red-400" /> Customer Complaints
                        </h2>
                        <div className="flex-1 overflow-auto space-y-3 pr-2">
                            {complaints.length === 0 && <p className="text-slate-500">No complaints 🎉</p>}
                            {complaints.map(c => (
                                <div key={c.id} className={`p-4 rounded-2xl border flex gap-3 ${c.status === 'RESOLVED' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                    <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${c.status === 'RESOLVED' ? 'text-green-500' : 'text-red-400'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm ${c.status === 'RESOLVED' ? 'text-green-400' : 'text-red-400'}`}>{c.type.replace(/_/g, ' ')}</p>
                                        <p className="text-xs text-slate-400 mt-1 truncate">{c.description}</p>
                                        <p className="text-xs text-slate-600 mt-1">{getTimeAgo(c.createdAt)}</p>
                                    </div>
                                    {c.status !== 'RESOLVED' && (
                                        <button onClick={() => handleResolveComplaint(c.id)}
                                            className="shrink-0 p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors">
                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setModal(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">
                                    {modal === 'orders' && 'All Active Orders'}
                                    {modal === 'staff' && 'Staff on Shift'}
                                    {modal === 'complaints' && 'Open Complaints'}
                                </h3>
                                <button onClick={() => setModal(null)} className="p-2 hover:bg-white/10 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto space-y-3">
                                {modal === 'orders' && recentOrders.map(order => (
                                    <div key={order.id} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">Order #{order.id} — Table {order.tableNumber || '—'}</span>
                                                {order.membershipTier && order.membershipTier !== 'BRONZE' && (
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                                        order.membershipTier === 'DIAMOND' ? 'bg-indigo-900/40 text-indigo-300' :
                                                        order.membershipTier === 'GOLD' ? 'bg-yellow-900/40 text-yellow-300' :
                                                        'bg-slate-700 text-slate-300'
                                                    }`}>
                                                        <Crown className="w-3 h-3" /> {order.membershipTier}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${order.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : order.status === 'PREPARING' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-slate-400">
                                            {order.items?.map((i, idx) => <span key={idx}>{i.quantity}x {i.menuItemName}{idx < order.items.length - 1 ? ', ' : ''}</span>)}
                                        </div>
                                        <div className="flex justify-between mt-2 text-sm">
                                            <span className="text-slate-500">{getTimeAgo(order.createdAt)}</span>
                                            <span className="font-bold">${(order.totalAmount || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="mt-3 border-t border-white/5 pt-3">
                                            <button 
                                                onClick={() => { setEditingOrder(order); setDiscountInput((order.discountAmount || 0).toString()); }}
                                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors"
                                            >
                                                Edit Order
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {modal === 'staff' && (
                                    <div className="space-y-3">
                                        {staffList.length === 0 ? (
                                            <div className="text-center text-slate-500 py-8">
                                                <Users className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                                                <p>No active staff found.</p>
                                            </div>
                                        ) : (
                                            staffList.map((staffMember, i) => (
                                                <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                                                            {staffMember.displayName?.charAt(0) || 'S'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white">{staffMember.displayName || 'Unknown Staff'}</p>
                                                            <p className="text-xs text-slate-400">{staffMember.phoneNumber}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex gap-1 justify-end mb-1">
                                                            {staffMember.roles?.map((r: any, idx: number) => (
                                                                <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
                                                                    {r.role}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-emerald-400 flex items-center gap-1 justify-end">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                                {modal === 'complaints' && openComplaints.map(c => (
                                    <div key={c.id} className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold text-red-400">{c.type.replace(/_/g, ' ')}</span>
                                            <span className="text-xs text-slate-500">{getTimeAgo(c.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-slate-300 mb-3">{c.description}</p>
                                        <button onClick={() => { handleResolveComplaint(c.id); setModal(null); }}
                                            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> Mark Resolved
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Order Modal */}
            <AnimatePresence>
                {editingOrder && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                        onClick={() => setEditingOrder(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md flex flex-col shadow-2xl"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Edit Order #{editingOrder.id}</h3>
                                <button onClick={() => setEditingOrder(null)} className="p-2 hover:bg-white/10 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                                <h4 className="font-bold text-slate-400 text-sm">Items</h4>
                                {editingOrder.items.length === 0 && <p className="text-sm text-slate-500">No items left.</p>}
                                {editingOrder.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                                        <div>
                                            <p className="font-semibold">{item.quantity}x {item.menuItemName}</p>
                                        </div>
                                        <button onClick={() => handleRemoveItem(item.id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-6 space-y-2">
                                <h4 className="font-bold text-slate-400 text-sm">Apply Discount</h4>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-7 pr-3 text-white focus:border-blue-500 outline-none"
                                            value={discountInput}
                                            onChange={e => setDiscountInput(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <button onClick={handleApplyDiscount} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm">
                                        Apply
                                    </button>
                                </div>
                                {editingOrder.discountAmount && editingOrder.discountAmount > 0 && (
                                    <p className="text-xs text-green-400">Current discount: ${editingOrder.discountAmount.toFixed(2)}</p>
                                )}
                            </div>

                            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                                <span className="font-bold text-slate-400">Total</span>
                                <span className="text-2xl font-black text-white">${editingOrder.totalAmount.toFixed(2)}</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
