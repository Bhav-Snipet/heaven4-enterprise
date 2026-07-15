import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Flame } from 'lucide-react';
import apiClient from '@/core/api/client';
import { useOperationsWebSocket } from '@/core/hooks/useOperationsWebSocket';
import toast from 'react-hot-toast';

interface OrderItemDto {
    id: number;
    menuItemName: string;
    quantity: number;
}

interface OrderDto {
    id: number;
    customerName: string;
    status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED';
    createdAt: string;
    items: OrderItemDto[];
}

export default function KitchenDashboard() {
    const [orders, setOrders] = useState<OrderDto[]>([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    useOperationsWebSocket(() => {
        // Refetch all orders on any update for consistency
        fetchOrders();
    });

    const fetchOrders = async () => {
        try {
            const res = await apiClient.get('/orders/active');
            setOrders(res.data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        }
    };

    const updateStatus = async (orderId: number, status: string) => {
        try {
            await apiClient.put(`/orders/${orderId}/status`, { status });
            toast.success(`Order #${orderId} moved to ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const pendingOrders = orders.filter(o => o.status === 'PENDING');
    const preparingOrders = orders.filter(o => o.status === 'PREPARING');
    const readyOrders = orders.filter(o => o.status === 'READY');

    const renderColumn = (title: string, icon: React.ReactNode, colOrders: OrderDto[], nextStatus: string | null, bgClass: string) => (
        <div className={`flex-1 rounded-2xl p-4 flex flex-col gap-4 ${bgClass}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <h2 className="font-bold text-xl">{title} ({colOrders.length})</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 hide-scrollbar">
                <AnimatePresence>
                    {colOrders.map(order => (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={order.id} 
                            className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 shadow-lg border border-white/5 hover:border-white/20 transition-all"
                        >
                            <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
                                <div>
                                    <h3 className="font-bold text-lg text-white">Order #{order.id}</h3>
                                    <p className="text-sm text-slate-400">{order.customerName}</p>
                                </div>
                                <span className="text-xs font-mono font-medium bg-slate-900 px-2 py-1 rounded text-slate-300 border border-white/5">
                                    {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            
                            <ul className="space-y-2 mb-4">
                                {order.items.map((item, idx) => (
                                    <li key={idx} className="flex gap-2 text-sm">
                                        <span className="font-bold text-blue-600">{item.quantity}x</span>
                                        <span>{item.menuItemName}</span>
                                    </li>
                                ))}
                            </ul>

                            {nextStatus && (
                                <button 
                                    onClick={() => updateStatus(order.id, nextStatus)}
                                    className="w-full py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
                                >
                                    Move to {nextStatus}
                                </button>
                            )}
                            {!nextStatus && (
                                <button 
                                    onClick={() => updateStatus(order.id, 'COMPLETED')}
                                    className="w-full py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold text-sm hover:bg-emerald-500/30 transition-colors"
                                >
                                    Mark Completed
                                </button>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 p-6 flex flex-col text-white bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-soft-light relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <header className="mb-8 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-glow">
                        <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Kitchen Display</h1>
                        <p className="text-slate-400">Live Order Tracking & Execution</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden relative z-10">
                {renderColumn('Incoming', <Clock className="w-6 h-6 text-amber-400" />, pendingOrders, 'PREPARING', 'bg-slate-900/60 backdrop-blur-xl border border-white/10')}
                {renderColumn('Cooking', <Flame className="w-6 h-6 text-orange-400" />, preparingOrders, 'READY', 'bg-slate-900/60 backdrop-blur-xl border border-white/10')}
                {renderColumn('Ready', <CheckCircle2 className="w-6 h-6 text-emerald-400" />, readyOrders, null, 'bg-slate-900/60 backdrop-blur-xl border border-white/10')}
            </div>
        </div>
    );
}
