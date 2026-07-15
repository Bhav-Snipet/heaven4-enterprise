import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle, Clock, ShoppingCart } from 'lucide-react';
import apiClient from '@/core/api/client';
import { useOperationsWebSocket } from '@/core/hooks/useOperationsWebSocket';

export default function ManagerDashboard() {
    const [stats, setStats] = useState({
        activeOrders: 0,
        staffOnShift: 0,
        lowStockItems: 0,
        tableTurnaroundMins: 0
    });
    
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    
    const fetchData = async () => {
        try {
            const [opsRes, ordersRes] = await Promise.all([
                apiClient.get('/manager/operations/summary'),
                apiClient.get('/orders/active')
            ]);
            setStats(opsRes.data);
            setRecentOrders(ordersRes.data.slice(0, 5)); // just show top 5
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useOperationsWebSocket(() => {
        fetchData();
    });

    const metrics = [
        { title: 'Active Orders', value: stats.activeOrders, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { title: 'Staff on Shift', value: stats.staffOnShift, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { title: 'Avg Table Turnaround', value: `${stats.tableTurnaroundMins}m`, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { title: 'Low Stock Alerts', value: stats.lowStockItems, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    ];

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {metrics.map((m, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={m.title}
                            className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                                <m.icon className={`w-16 h-16 ${m.color}`} />
                            </div>
                            <div className={`w-12 h-12 rounded-2xl ${m.bg} flex items-center justify-center mb-4 relative z-10`}>
                                <m.icon className={`w-6 h-6 ${m.color}`} />
                            </div>
                            <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1 relative z-10">{m.title}</h3>
                            <p className="text-3xl font-bold text-white relative z-10">{m.value}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl h-[400px] flex flex-col"
                    >
                        <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2 mb-4">
                            <ShoppingCart className="w-5 h-5 text-blue-400" /> Recent Active Orders
                        </h2>
                        <div className="flex-1 overflow-auto space-y-3 pr-2">
                            {recentOrders.length === 0 && (
                                <p className="text-slate-500">No active orders</p>
                            )}
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                                            #{order.id}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-200">Table {order.tableNumber || "Takeout"}</p>
                                            <p className="text-sm text-slate-500">{order.items.length} items • {order.status}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl h-[400px] flex flex-col"
                    >
                        <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-amber-400" /> Urgent Alerts
                        </h2>
                        <div className="flex-1 overflow-auto space-y-3 pr-2">
                            <div className="flex gap-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                                <div>
                                    <p className="font-semibold text-amber-500">Low Stock: Tomatoes</p>
                                    <p className="text-sm text-slate-400 mt-1">Only 2.5 kg remaining in prep station A.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                                <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                                <div>
                                    <p className="font-semibold text-red-500">Service Delay: Table 14</p>
                                    <p className="text-sm text-slate-400 mt-1">Order #1032 has been waiting for 25 minutes.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
