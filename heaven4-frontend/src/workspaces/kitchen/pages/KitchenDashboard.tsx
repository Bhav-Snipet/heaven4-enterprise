import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, CheckCircle2, Clock, Flame } from 'lucide-react';
import { apiClient } from '@/core/api/client';
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
        // Auto refresh every 10 seconds (Simulated WebSockets)
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

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
                            className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex justify-between items-start mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <div>
                                    <h3 className="font-bold text-lg">Order #{order.id}</h3>
                                    <p className="text-sm text-slate-500">{order.customerName}</p>
                                </div>
                                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
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
                                    className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                                >
                                    Move to {nextStatus}
                                </button>
                            )}
                            {!nextStatus && (
                                <button 
                                    onClick={() => updateStatus(order.id, 'COMPLETED')}
                                    className="w-full py-2 bg-green-500 text-white rounded-lg font-bold text-sm hover:bg-green-600 transition-colors"
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Kitchen Display System</h1>
                    <p className="text-slate-500">Live Order Tracking</p>
                </div>
            </header>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {renderColumn('Incoming', <Clock className="w-6 h-6 text-amber-500" />, pendingOrders, 'PREPARING', 'bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30')}
                {renderColumn('Cooking', <Flame className="w-6 h-6 text-orange-500" />, preparingOrders, 'READY', 'bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30')}
                {renderColumn('Ready for Pickup', <CheckCircle2 className="w-6 h-6 text-green-500" />, readyOrders, null, 'bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30')}
            </div>
        </div>
    );
}
