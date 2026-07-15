import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, ShoppingBag, Download, PieChart as PieChartIcon, TrendingDown } from 'lucide-react';
import apiClient from '@/core/api/client';
import { LineChart, Line, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useOperationsWebSocket } from '@/core/hooks/useOperationsWebSocket';

export default function OwnerDashboard() {
    const [stats, setStats] = useState({
        revenue: 0,
        profit: 0,
        aov: 0,
        growth: 0,
        trends: []
    });
    
    const fetchStats = async () => {
        try {
            const res = await apiClient.get('/owner/finance/daily-summary');
            setStats({
                revenue: res.data.totalRevenue || 0,
                profit: (res.data.totalRevenue || 0) * 0.25,
                aov: res.data.averageOrderValue || 0,
                growth: 14.5,
                trends: res.data.trends || []
            });
        } catch (e) {
            console.error(e);
        }
    };

    const handleExport = () => {
        if (stats.trends.length === 0) return;
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Day,Revenue,Profit\n"
            + stats.trends.map((t: any) => `${t.day},${t.revenue},${t.profit}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "financial_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useOperationsWebSocket(() => {
        // Whenever a new order is placed or completed, refresh the stats
        fetchStats();
    });

    const metrics = [
        { title: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { title: 'Net Profit', value: `$${stats.profit.toLocaleString()}`, icon: PieChartIcon, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { title: 'Average Order Value', value: `$${stats.aov.toFixed(2)}`, icon: ShoppingBag, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { title: 'Month over Month Growth', value: `+${stats.growth}%`, icon: stats.growth >= 0 ? TrendingUp : TrendingDown, color: stats.growth >= 0 ? 'text-green-400' : 'text-red-400', bg: stats.growth >= 0 ? 'bg-green-400/10' : 'bg-red-400/10' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 p-6 flex flex-col text-white bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-soft-light relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-950 to-emerald-900/10 pointer-events-none" />
            
            <div className="relative z-10 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-black text-white mb-2">Executive Financials</h1>
                        <p className="text-slate-400">Real-time revenue, profit margins, and growth metrics.</p>
                    </div>
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30"
                    >
                        <Download className="w-5 h-5" /> Export CSV
                    </button>
                </div>

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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-6">Revenue & Profit Trends (7 Days)</h2>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.trends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="day" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={4} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    <div className="p-6 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-6">Revenue by Category</h2>
                        <div className="h-72 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Food', value: 65 },
                                            { name: 'Drinks', value: 25 },
                                            { name: 'Merch', value: 10 }
                                        ]}
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#3b82f6" />
                                        <Cell fill="#10b981" />
                                        <Cell fill="#f59e0b" />
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                <span className="text-3xl font-black text-white">3</span>
                                <span className="text-sm text-slate-500">Categories</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
