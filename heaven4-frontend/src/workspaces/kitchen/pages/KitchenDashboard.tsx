import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Flame, History, AlertTriangle, User, LogOut, TrendingUp, Crown } from 'lucide-react';
import apiClient from '@/core/api/client';
import { useOperationsWebSocket } from '@/core/hooks/useOperationsWebSocket';
import { useAuth } from '@/core/auth/AuthProvider';
import toast from 'react-hot-toast';

// Developer toggle: set to false to hide the chef motivation widget
const FEATURE_FLAG_CHEF_MOTIVATION = true;

interface OrderItemDto { id: number; menuItemName: string; quantity: number; }
interface OrderDto {
    id: number;
    customerName: string;
    tableNumber: string;
    status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED';
    createdAt: string;
    items: OrderItemDto[];
    totalAmount: number;
    membershipTier?: string;
}
interface Complaint { id: number; type: string; description: string; status: string; createdAt: string; orderId?: number; tableNumber?: string; }

type Tab = 'live' | 'history' | 'complaints';

// Elapsed time in seconds since a given ISO date string
const getElapsedSeconds = (dateStr: string) =>
    Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);

function OrderTimer({ createdAt }: { createdAt: string }) {
    const [elapsed, setElapsed] = useState(getElapsedSeconds(createdAt));
    useEffect(() => {
        const id = setInterval(() => setElapsed(getElapsedSeconds(createdAt)), 1000);
        return () => clearInterval(id);
    }, [createdAt]);

    const minutes = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const display = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    let colorClass = 'text-green-400 bg-green-400/10';
    if (minutes >= 30) colorClass = 'text-red-800 bg-red-900/30 animate-pulse';
    else if (minutes >= 17) colorClass = 'text-red-400 bg-red-400/10';
    else if (minutes >= 10) colorClass = 'text-orange-400 bg-orange-400/10';

    return (
        <span className={`px-3 py-1 rounded-lg font-mono font-bold text-sm ${colorClass}`}>
            ⏱ {display}
        </span>
    );
}



export default function KitchenDashboard() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [history, setHistory] = useState<OrderDto[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [tab, setTab] = useState<Tab>('live');
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [shiftStart] = useState(new Date().toISOString());
    const [shiftElapsed, setShiftElapsed] = useState('0:00');
    const getTimeAgo = (dateStr: string) => {
        const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins/60)}h ${mins%60}m ago`;
    };

    // Shift timer
    useEffect(() => {
        const id = setInterval(() => {
            const elapsed = Math.floor((Date.now() - new Date(shiftStart).getTime()) / 1000);
            const h = Math.floor(elapsed / 3600);
            const m = Math.floor((elapsed % 3600) / 60);
            setShiftElapsed(`${h}h ${m}m`);
        }, 30000);
        return () => clearInterval(id);
    }, [shiftStart]);

    const fetchData = useCallback(async () => {
        try {
            const [activeRes, complaintsRes] = await Promise.all([
                apiClient.get('/orders/active'),
                apiClient.get('/complaints'),
            ]);
            setOrders(activeRes.data);
            setComplaints(complaintsRes.data);
        } catch (e) { console.error(e); }
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await apiClient.get('/orders/all');
            setHistory(res.data.filter((o: OrderDto) => o.status === 'COMPLETED').slice(0, 30));
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { if (tab === 'history') fetchHistory(); }, [tab]);
    useOperationsWebSocket(() => { fetchData(); });

    const updateStatus = async (orderId: number, status: string) => {
        try {
            await apiClient.put(`/orders/${orderId}/status`, { status });
            toast.success(`Order #${orderId} → ${status}`);
            fetchData();
        } catch { toast.error('Failed to update status'); }
    };

    const getTierWeight = (tier?: string) => {
        if (tier === 'DIAMOND') return 3;
        if (tier === 'GOLD') return 2;
        if (tier === 'SILVER') return 1;
        return 0; // BRONZE or undefined
    };

    const pendingOrders = orders
        .filter(o => o.status === 'PENDING')
        .sort((a, b) => getTierWeight(b.membershipTier) - getTierWeight(a.membershipTier) || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    const preparingOrders = orders
        .filter(o => o.status === 'PREPARING')
        .sort((a, b) => getTierWeight(b.membershipTier) - getTierWeight(a.membershipTier) || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    const readyOrders = orders.filter(o => o.status === 'READY');

    const renderOrderCard = (order: OrderDto, nextStatus: string | null) => {
        const orderComplaint = complaints.find(c => c.orderId === order.id && c.status !== 'RESOLVED');
        return (
        <motion.div 
            layout 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }}
            key={order.id}
            className={`bg-slate-800/80 backdrop-blur-md rounded-xl p-5 shadow-lg border transition-all ${
                orderComplaint ? 'border-red-500 shadow-red-500/20' : 'border-white/5 hover:border-white/20'
            }`}
        >
            <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-3">
                <div>
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        Order #{order.id}
                        {orderComplaint && (
                            <button 
                                onClick={() => setSelectedComplaint(orderComplaint)}
                                className="bg-red-500/20 text-red-400 p-1 rounded-full animate-pulse hover:bg-red-500/30 transition-colors"
                            >
                                <AlertTriangle className="w-4 h-4" />
                            </button>
                        )}
                        {order.membershipTier && order.membershipTier !== 'BRONZE' && (
                             <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                 order.membershipTier === 'DIAMOND' ? 'bg-indigo-900/40 text-indigo-300' :
                                 order.membershipTier === 'GOLD' ? 'bg-yellow-900/40 text-yellow-300' :
                                 'bg-slate-700 text-slate-300'
                             }`}>
                                 <Crown className="w-3 h-3" /> {order.membershipTier}
                             </span>
                        )}
                    </h3>
                    <p className="text-sm text-slate-400">Table {order.tableNumber || '—'} · {order.customerName || 'Walk-in'}</p>
                </div>
                <OrderTimer createdAt={order.createdAt} />
            </div>
            
            <ul className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                        <span className="font-bold text-orange-400">{item.quantity}×</span>
                        <span className="text-slate-200">{item.menuItemName}</span>
                    </li>
                ))}
            </ul>

            {nextStatus ? (
                <button onClick={() => updateStatus(order.id, nextStatus)}
                    className="w-full py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
                    → Move to {nextStatus}
                </button>
            ) : (
                <button onClick={() => updateStatus(order.id, 'COMPLETED')}
                    className="w-full py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold text-sm hover:bg-emerald-500/30 transition-colors">
                    ✓ Mark Completed
                </button>
            )}
        </motion.div>
        );
    };


    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-6 flex flex-col text-white relative">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <header className="mb-4 relative z-10">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-lg">
                            <Flame className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Kitchen Display</h1>
                            <p className="text-slate-400 text-sm">Live Order Tracking & Execution</p>
                        </div>
                    </div>
                    {/* Chef Identity & Shift — right side */}
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900/60 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-white">{user?.displayName || 'Chef'}</p>
                                <p className="text-xs text-slate-400">Shift: {shiftElapsed}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-bold transition-all"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>

                {/* Chef Motivation Widget — FEATURE_FLAG_CHEF_MOTIVATION */}
                {FEATURE_FLAG_CHEF_MOTIVATION && (() => {
                    const completedToday = 0; // will be populated from history in a future phase
                    const totalInQueue = pendingOrders.length + preparingOrders.length + readyOrders.length;
                    const totalSeen = completedToday + totalInQueue;
                    const pct = totalSeen > 0 ? Math.round((completedToday / totalSeen) * 100) : 0;
                    return (
                        <div className="mt-4 bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-orange-400" />
                                    <span className="font-bold text-sm">Shift Progress</span>
                                </div>
                                <span className="text-sm text-slate-400">
                                    {totalInQueue > 0 ? `${totalInQueue} orders in queue` : '🎉 All clear!'}
                                </span>
                            </div>
                            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-emerald-400 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.max(5, pct)}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                {pendingOrders.length} incoming · {preparingOrders.length} cooking · {readyOrders.length} ready to serve
                            </p>
                        </div>
                    );
                })()}
            </header>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 relative z-10">
                {(['live', 'history', 'complaints'] as Tab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-xl font-bold text-sm capitalize transition-all ${tab === t ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                        {t === 'complaints' && complaints.filter(c => c.status !== 'RESOLVED').length > 0 && (
                            <span className="mr-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{complaints.filter(c => c.status !== 'RESOLVED').length}</span>
                        )}
                        {t}
                    </button>
                ))}
            </div>

            {/* Live Orders — no overflow-hidden so all cards are visible */}
            {tab === 'live' && (
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Pending */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-6 h-6 text-amber-400" />
                            <h2 className="font-bold text-xl">Incoming</h2>
                            <span className="ml-auto bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">{pendingOrders.length}</span>
                        </div>
                        <div className="space-y-4">
                            <AnimatePresence>{pendingOrders.map(o => renderOrderCard(o, 'PREPARING'))}</AnimatePresence>
                            {pendingOrders.length === 0 && <p className="text-center text-slate-600 py-8 text-sm">No incoming orders</p>}
                        </div>
                    </div>
                    {/* Preparing */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Flame className="w-6 h-6 text-orange-400" />
                            <h2 className="font-bold text-xl">Cooking</h2>
                            <span className="ml-auto bg-orange-500/20 text-orange-400 text-xs font-bold px-2.5 py-1 rounded-full">{preparingOrders.length}</span>
                        </div>
                        <div className="space-y-4">
                            <AnimatePresence>{preparingOrders.map(o => renderOrderCard(o, 'READY'))}</AnimatePresence>
                            {preparingOrders.length === 0 && <p className="text-center text-slate-600 py-8 text-sm">No orders cooking</p>}
                        </div>
                    </div>
                    {/* Ready */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            <h2 className="font-bold text-xl">Ready</h2>
                            <span className="ml-auto bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">{readyOrders.length}</span>
                        </div>
                        <div className="space-y-4">
                            <AnimatePresence>{readyOrders.map(o => renderOrderCard(o, null))}</AnimatePresence>
                            {readyOrders.length === 0 && <p className="text-center text-slate-600 py-8 text-sm">No orders ready</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* History */}
            {tab === 'history' && (
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3 mb-4">
                        <History className="w-6 h-6 text-blue-400" />
                        <h2 className="text-xl font-bold">Completed Orders (Last 30)</h2>
                    </div>
                    {history.length === 0 && <p className="text-slate-500">No completed orders yet.</p>}
                    {history.map(order => (
                        <div key={order.id} className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                            <div>
                                <p className="font-bold">Order #{order.id} — Table {order.tableNumber || '—'}</p>
                                <ul className="space-y-1 mb-2 text-sm text-slate-300">
                                    {order.items.map((item, i) => (
                                        <li key={i}>- {item.quantity}x {item.menuItemName}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-emerald-400">${(order.totalAmount || 0).toFixed(2)}</p>
                                <p className="text-xs text-slate-500 mt-1">{getTimeAgo(order.createdAt)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Complaints */}
            {tab === 'complaints' && (
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                        <h2 className="text-xl font-bold">Customer Complaints</h2>
                    </div>
                    {complaints.length === 0 && <p className="text-slate-500">No complaints 🎉</p>}
                    {complaints.map(c => (
                        <div key={c.id} className={`p-4 rounded-2xl border ${c.status === 'RESOLVED' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <div className="flex justify-between mb-1">
                                <span className={`font-bold text-sm ${c.status === 'RESOLVED' ? 'text-green-400' : 'text-red-400'}`}>{c.type.replace(/_/g, ' ')}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${c.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{c.status}</span>
                            </div>
                            <p className="text-sm text-slate-300">{c.description}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Complaint Detail Modal */}
            <AnimatePresence>
                {selectedComplaint && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedComplaint(null)}
                    >
                        <motion.div 
                            initial={{ y: 50, scale: 0.95 }} 
                            animate={{ y: 0, scale: 1 }} 
                            exit={{ y: 50, scale: 0.95 }}
                            className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl shadow-red-500/20" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Active Complaint</h3>
                                    <p className="text-sm text-slate-400">Order #{selectedComplaint.orderId}</p>
                                </div>
                            </div>
                            
                            <div className="bg-red-500/5 rounded-2xl p-4 space-y-3 mb-6 border border-red-500/10">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 text-sm">Issue Type</span>
                                    <span className="font-bold text-red-400">{selectedComplaint.type.replace(/_/g, ' ')}</span>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-sm mb-1">Customer Notes</p>
                                    <p className="text-white font-medium">{selectedComplaint.description}</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setSelectedComplaint(null)} 
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
