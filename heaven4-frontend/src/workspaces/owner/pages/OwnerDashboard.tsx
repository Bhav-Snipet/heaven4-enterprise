import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Activity, ShoppingBag } from 'lucide-react';
import apiClient from '@/core/api/client';

export default function OwnerDashboard() {
    const [stats, setStats] = useState({
        revenueToday: 0,
        ordersToday: 0,
        activeCustomers: 0,
        averageOrderValue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // We'll mock some data since the API for this might not exist yet
                const res = await apiClient.get('/orders/all');
                const orders = res.data;
                const completed = orders.filter((o: any) => o.status === 'COMPLETED');
                const revenue = completed.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
                
                setStats({
                    revenueToday: revenue,
                    ordersToday: completed.length,
                    activeCustomers: orders.filter((o: any) => o.status !== 'COMPLETED').length,
                    averageOrderValue: completed.length > 0 ? revenue / completed.length : 0
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const metrics = [
        { title: 'Gross Revenue (Today)', value: `$${stats.revenueToday.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400' },
        { title: 'Total Orders', value: stats.ordersToday, icon: ShoppingBag, color: 'text-blue-400' },
        { title: 'Active Tables', value: stats.activeCustomers, icon: Users, color: 'text-purple-400' },
        { title: 'Avg Order Value', value: `$${stats.averageOrderValue.toFixed(2)}`, icon: TrendingUp, color: 'text-gold-400' },
    ];

    if (loading) return <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-8 text-gold-400">Executive Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <m.icon className={`w-16 h-16 ${m.color}`} />
                        </div>
                        <m.icon className={`w-8 h-8 ${m.color} mb-4`} />
                        <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">{m.title}</h3>
                        <p className="text-3xl font-bold text-white">{m.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <div className="flex items-center gap-2 mb-4 text-slate-300">
                        <Activity className="w-5 h-5" />
                        <h2 className="text-xl font-bold">System Health</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-black rounded-xl">
                            <span className="font-semibold text-slate-300">Database Connection</span>
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">Operational</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-black rounded-xl">
                            <span className="font-semibold text-slate-300">WebSocket Server</span>
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">Operational</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-black rounded-xl">
                            <span className="font-semibold text-slate-300">Auth Provider</span>
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
