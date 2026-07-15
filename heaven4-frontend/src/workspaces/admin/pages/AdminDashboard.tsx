import { motion } from 'framer-motion';
import { Server, Users, Database, ShieldAlert, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const navigate = useNavigate();
    
    const systemStats = [
        { label: 'Active Sessions', value: '1,248', icon: Users, color: 'text-blue-500' },
        { label: 'Server Load', value: '42%', icon: Server, color: 'text-emerald-500' },
        { label: 'Database Health', value: 'Optimal', icon: Database, color: 'text-purple-500' },
        { label: 'Pending Alerts', value: '3', icon: ShieldAlert, color: 'text-amber-500' },
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
                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-4"
                    >
                        <div className={`p-4 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                            <stat.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                            <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Global Settings Block */}
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
                            className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-heaven-500 dark:hover:border-heaven-500 hover:bg-heaven-50 dark:hover:bg-heaven-900/20 transition-all group"
                        >
                            <h3 className="font-bold text-lg group-hover:text-heaven-600 dark:group-hover:text-heaven-400">Manage Global Catalog</h3>
                            <p className="text-slate-500 text-sm mt-1">Add, edit, or remove menu items across all branches.</p>
                        </button>
                        
                        <button className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group">
                            <h3 className="font-bold text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400">User Role Management</h3>
                            <p className="text-slate-500 text-sm mt-1">Assign admin or manager roles to staff.</p>
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
