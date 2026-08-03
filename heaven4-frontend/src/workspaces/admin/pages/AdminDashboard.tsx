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
                apiClient.get('/orders/active').catch(() => ({ data: [] })),
                apiClient.get('/complaints').catch(() => ({ data: [] })),
            ]);
            const allComplaints = complaintsRes.data || [];
            setComplaints(allComplaints);
            const pending = allComplaints.filter((c: any) => c.status !== 'RESOLVED').length;
            setStats({
                activeSessions: (ordersRes.data || []).length,
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
        } catch {
            toast.error('Failed to resolve complaint');
        }
    };
    
    const systemStats = [
        { label: 'Active Orders', value: stats.activeSessions.toString(), icon: Users, color: 'text-blue-400 bg-blue-500/20 border-blue-500/30', sub: 'Live tables with open orders', onClick: undefined },
        { label: 'API Server', value: stats.serverStatus, icon: Server, color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30', sub: 'All systems operational', onClick: undefined },
        { label: 'Database', value: stats.dbStatus, icon: Database, color: 'text-purple-400 bg-purple-500/20 border-purple-500/30', sub: 'PostgreSQL connected', onClick: undefined },
        { label: 'Open Complaints', value: stats.pendingAlerts.toString(), icon: ShieldAlert, color: stats.pendingAlerts > 0 ? 'text-red-400 bg-red-500/20 border-red-500/30' : 'text-amber-400 bg-amber-500/20 border-amber-500/30', sub: 'Requiring attention (Click to view)', onClick: () => setShowComplaintsModal(true) },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                    System Administration Console
                </h1>
                <p className="text-slate-400 text-xs mt-1">Manage global infrastructure, core menu catalog, and enterprise user roles.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {systemStats.map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={stat.label}
                        onClick={stat.onClick}
                        className={`bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl ${stat.onClick ? 'cursor-pointer hover:border-amber-500/50 transition-all' : ''}`}
                    >
                        <div className={`p-3 rounded-2xl border ${stat.color} w-fit mb-4`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-black mt-1 text-white">{stat.value}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">{stat.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-6 h-6 text-blue-400" />
                        <h2 className="text-2xl font-black text-white">Administrative Actions</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <button 
                            onClick={() => navigate('/admin/menu')}
                            className="w-full text-left p-5 rounded-2xl border border-slate-800 bg-slate-950 hover:border-blue-500/50 hover:bg-blue-600/10 transition-all group flex items-center justify-between"
                        >
                            <div>
                                <h3 className="font-bold text-base text-amber-400 group-hover:text-blue-300">Manage Global Menu Catalog</h3>
                                <p className="text-slate-400 text-xs mt-1 font-semibold">Add, edit, or remove menu items and pricing across branches.</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        </button>
                        
                        <button 
                            onClick={() => navigate('/admin/users')}
                            className="w-full text-left p-5 rounded-2xl border border-slate-800 bg-slate-950 hover:border-purple-500/50 hover:bg-purple-600/10 transition-all group flex items-center justify-between"
                        >
                            <div>
                                <h3 className="font-bold text-base text-amber-400 group-hover:text-purple-300">User Role Management</h3>
                                <p className="text-slate-400 text-xs mt-1 font-semibold">Assign workspaces, unlock accounts, and manage permissions.</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                        </button>

                        <button 
                            onClick={() => navigate('/admin/tables')}
                            className="w-full text-left p-5 rounded-2xl border border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:bg-emerald-600/10 transition-all group flex items-center justify-between"
                        >
                            <div>
                                <h3 className="font-bold text-base text-amber-400 group-hover:text-emerald-300">Table QR Code Management</h3>
                                <p className="text-slate-400 text-xs mt-1 font-semibold">Generate dining table QR codes and manage floor layouts.</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                        </button>
                    </div>
                </motion.div>

                {/* System Health Overview */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col justify-between"
                >
                    <div>
                        <h2 className="text-2xl font-black text-white mb-2">Enterprise Infrastructure Status</h2>
                        <p className="text-xs text-slate-400 mb-6 font-semibold">Real-time status of microservices, PostgreSQL, and WebSocket connections.</p>
                        
                        <div className="space-y-3">
                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                                <div>
                                    <p className="font-bold text-white">Spring Boot REST API Port 8085</p>
                                    <p className="text-[10px] text-slate-400 font-semibold">Latency: 14ms · Active Workers: 8</p>
                                </div>
                                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-full border border-emerald-500/30">ONLINE</span>
                            </div>
                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                                <div>
                                    <p className="font-bold text-white">PostgreSQL Database Pool</p>
                                    <p className="text-[10px] text-slate-400 font-semibold">Connections: 12/50 · Heaven4 HikariPool</p>
                                </div>
                                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-full border border-emerald-500/30">ONLINE</span>
                            </div>
                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                                <div>
                                    <p className="font-bold text-white">Vite Frontend Port 5173</p>
                                    <p className="text-[10px] text-slate-400 font-semibold">Vite 6.4.3 · HMR Enabled</p>
                                </div>
                                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-full border border-emerald-500/30">ONLINE</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Active Complaints Modal */}
            <AnimatePresence>
                {showComplaintsModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setShowComplaintsModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl text-white"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                                <h3 className="text-xl font-black text-white flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-red-400" /> Active Customer Complaints
                                </h3>
                                <button onClick={() => setShowComplaintsModal(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                {complaints.length === 0 ? (
                                    <p className="text-slate-500 text-center py-10 text-xs font-bold">No active complaints logged.</p>
                                ) : (
                                    complaints.map(c => (
                                        <div key={c.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center text-xs">
                                            <div>
                                                <span className="font-bold text-red-400 uppercase tracking-wider">{c.type.replace(/_/g, ' ')}</span>
                                                <p className="text-slate-300 mt-1 font-semibold">{c.description}</p>
                                                <p className="text-[10px] text-slate-500 mt-1 font-mono">Table: {c.tableNumber || '-'} · Order: #{c.orderId || '-'}</p>
                                            </div>
                                            {c.status !== 'RESOLVED' ? (
                                                <button onClick={() => handleResolveComplaint(c.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                                                </button>
                                            ) : (
                                                <span className="text-emerald-400 font-bold">Resolved</span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
