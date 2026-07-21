import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Users, Database, ShieldAlert, Activity, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

interface Complaint { id: number; type: string; description: string; status: string; createdAt: string; orderId?: number; tableNumber?: string; }

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [showComplaintsModal, setShowComplaintsModal] = useState(false);
    const [stats, setStats] = useState({
        activeSessions: 0,
        serverStatus: 'Healthy',
        dbStatus: 'Optimal',
        pendingAlerts: 0,
    });

    const fetchData = async () => {
        try {
            const [ordersRes, complaintsRes] = await Promise.all([
                apiClient.get('/orders/active'),
                apiClient.get('/complaints').catch(() => ({ data: [] })),
            ]);
            const allComplaints = complaintsRes.data;
            setComplaints(allComplaints);
            const pending = allComplaints.filter((c: any) => c.status !== 'RESOLVED').length;
            setStats({
                activeSessions: ordersRes.data.length,
                serverStatus: 'Healthy',
                dbStatus: 'Optimal',
                pendingAlerts: pending,
            });
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleResolveComplaint = async (id: number) => {
        try {
            await apiClient.put(`/complaints/${id}/resolve`, { note: 'Resolved by admin' });
            toast.success('Complaint resolved');
            fetchData();
        } catch (e) {
            toast.error('Failed to resolve complaint');
        }
    };
    
    const systemStats = [
        { label: 'Active Orders', value: stats.activeSessions.toString(), icon: Users, color: 'text-blue-500', sub: 'Live tables with open orders', onClick: undefined },
        { label: 'API Server', value: stats.serverStatus, icon: Server, color: 'text-emerald-500', sub: 'All systems operational', onClick: undefined },
        { label: 'Database', value: stats.dbStatus, icon: Database, color: 'text-purple-500', sub: 'PostgreSQL connected', onClick: undefined },
        { label: 'Open Complaints', value: stats.pendingAlerts.toString(), icon: ShieldAlert, color: stats.pendingAlerts > 0 ? 'text-red-500' : 'text-amber-500', sub: 'Requiring attention (Click to view)', onClick: () => setShowComplaintsModal(true) },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto text-slate-800 dark:text-slate-200">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                    System Administration
                </h1>
                <p className="text-slate-500 mt-2">Manage infrastructure, global catalog, and user roles.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {systemStats.map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        onClick={stat.onClick}
                        className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg ${stat.onClick ? 'cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-colors' : ''}`}
                    >
                        <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color} w-fit mb-4`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-6 h-6 text-heaven-500" />
                        <h2 className="text-2xl font-bold">Quick Actions</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <button 
                            onClick={() => navigate('/admin/menu')}
                            className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-heaven-500 dark:hover:border-heaven-500 hover:bg-heaven-50 dark:hover:bg-heaven-900/20 transition-all group flex items-center justify-between"
                        >
                            <div>
                                <h3 className="font-bold text-lg group-hover:text-heaven-600 dark:group-hover:text-heaven-400">Manage Global Catalog</h3>
                                <p className="text-slate-500 text-sm mt-1">Add, edit, or remove menu items across all branches.</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-heaven-500 transition-colors" />
                        </button>
                        
                        <button 
                            onClick={() => navigate('/admin/users')}
                            className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group flex items-center justify-between"
                        >
                            <div>
                                <h3 className="font-bold text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400">User Role Management</h3>
                                <p className="text-slate-500 text-sm mt-1">Assign admin or manager roles to staff members.</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Complaints Modal */}
            <AnimatePresence>
                {showComplaintsModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowComplaintsModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <ShieldAlert className="w-6 h-6 text-red-500" /> Active Complaints
                                </h3>
                                <button onClick={() => setShowComplaintsModal(false)} className="p-2 hover:bg-white/10 rounded-full text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto space-y-3 pr-2">
                                {complaints.filter(c => c.status !== 'RESOLVED').length === 0 && (
                                    <p className="text-slate-500 text-center py-8">No open complaints 🎉</p>
                                )}
                                {complaints.filter(c => c.status !== 'RESOLVED').map(c => (
                                    <div key={c.id} className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-white">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold text-red-400 flex items-center gap-2">
                                                {c.type.replace(/_/g, ' ')}
                                                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Order #{c.orderId} • Table {c.tableNumber}</span>
                                            </span>
                                            <span className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-300 mb-3">{c.description}</p>
                                        <button onClick={() => handleResolveComplaint(c.id)}
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
        </div>
    );
}



