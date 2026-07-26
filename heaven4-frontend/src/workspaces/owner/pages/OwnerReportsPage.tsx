import { useState, useEffect } from 'react';
import { BarChart3, PieChart as PieChartIcon, Calendar, AlertCircle, FileText, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8B5CF6'];

export default function OwnerReportsPage() {
    const [period, setPeriod] = useState('7d');
    const [orders, setOrders] = useState<any[]>([]);
    const [reports, setReports] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            const res = await apiClient.get('/owner/finance/reports');
            setReports(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await apiClient.get('/orders/all');
                setOrders(res.data.filter((o: any) => o.status === 'COMPLETED'));
            } catch (error) {
                toast.error("Failed to fetch reports data");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
        fetchReports();
    }, []);

    // Aggregate revenue by date string
    const getRevenueData = () => {
        const revenueMap: Record<string, number> = {};
        orders.forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            revenueMap[date] = (revenueMap[date] || 0) + (order.totalAmount || 0);
        });
        return Object.entries(revenueMap).map(([name, revenue]) => ({ name, revenue }));
    };

    // Aggregate top selling items
    const getItemsData = () => {
        const itemCounts: Record<string, number> = {};
        orders.forEach(order => {
            if (order.items) {
                order.items.forEach((item: any) => {
                    itemCounts[item.menuItemName] = (itemCounts[item.menuItemName] || 0) + item.quantity;
                });
            }
        });
        return Object.entries(itemCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5
    };

    const revenueData = getRevenueData();
    const itemsData = getItemsData();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gold-400">Financial Reports</h1>
                    <p className="text-slate-400 mt-1">Advanced analytics and revenue tracking</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setPeriod('7d')} className={`px-4 py-2 rounded-xl transition-colors font-semibold flex items-center gap-2 ${period === '7d' ? 'bg-gold-500 text-slate-900' : 'bg-slate-800 hover:bg-slate-700'}`}>
                        <Calendar className="w-4 h-4" /> Last 7 Days
                    </button>
                    <button onClick={() => setPeriod('30d')} className={`px-4 py-2 rounded-xl transition-colors font-semibold flex items-center gap-2 ${period === '30d' ? 'bg-gold-500 text-slate-900' : 'bg-slate-800 hover:bg-slate-700'}`}>
                        <Calendar className="w-4 h-4" /> This Month
                    </button>
                </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-amber-200 text-sm">
                    <strong>Disclaimer:</strong> Financial figures shown here are aggregated in real-time from completed orders. 
                    They do not account for refunds, chargebacks, or manual adjustments made outside the system.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[400px] flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="w-6 h-6 text-gold-400" />
                            <h3 className="text-xl font-bold text-slate-200">Revenue by Day</h3>
                        </div>
                        <div className="flex-1 w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155'}} />
                                    <Bar dataKey="revenue" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-[400px] flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChartIcon className="w-6 h-6 text-gold-400" />
                            <h3 className="text-xl font-bold text-slate-200">Top Selling Items</h3>
                        </div>
                        <div className="flex-1 w-full h-full">
                            {itemsData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-500">No data available</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={itemsData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {itemsData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155'}} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Historical Reports */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Historical Encrypted Reports</h2>
                    <button 
                        onClick={async () => {
                            try {
                                await apiClient.post('/owner/finance/reports/generate');
                                toast.success('Report generated successfully!');
                                fetchReports();
                            } catch (e) {
                                toast.error('Failed to generate report');
                            }
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors"
                    >
                        <FileText className="w-4 h-4" /> Generate Now
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-500 text-sm">
                                <th className="pb-3 font-medium">Filename</th>
                                <th className="pb-3 font-medium">Date</th>
                                <th className="pb-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((filename: string) => {
                                const parts = filename.split('_');
                                const dateStr = parts.length > 2 ? parts[2] : 'Unknown';
                                return (
                                    <tr key={filename} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                                        <td className="py-4 font-medium text-slate-300">{filename}</td>
                                        <td className="py-4 text-slate-400">{dateStr}</td>
                                        <td className="py-4 text-right">
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        const res = await apiClient.get(`/owner/finance/reports/download/${filename}`, { responseType: 'blob' });
                                                        const url = window.URL.createObjectURL(new Blob([res.data]));
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', filename);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        link.remove();
                                                    } catch (e) {
                                                        toast.error('Failed to download report');
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 inline-flex"
                                            >
                                                <Download className="w-4 h-4" /> Download (.enc)
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-8 text-center text-slate-500">
                                        No historical reports found. Reports are generated automatically at 11 PM every day.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
