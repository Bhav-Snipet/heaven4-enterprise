import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, RefreshCw, CheckCircle2 } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

interface UserRole { id: number; role: string; workspace: string; }
interface UserData {
    id: number;
    phoneNumber: string;
    displayName: string;
    roles: UserRole[];
    lastLoginAt?: string;
}

const AVAILABLE_ROLES = ['CUSTOMER', 'EMPLOYEE', 'KITCHEN', 'MANAGER', 'ADMIN', 'OWNER'];
const ROLE_COLORS: Record<string, string> = {
    CUSTOMER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    EMPLOYEE: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    KITCHEN: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    MANAGER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    OWNER: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function AdminUserManagementPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState<number | null>(null);
    const [filter, setFilter] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/admin/users');
            setUsers(res.data);
        } catch { toast.error('Failed to load users'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const assignRole = async (userId: number, role: string) => {
        setAssigningId(userId);
        try {
            await apiClient.put(`/admin/users/${userId}/role`, { role, workspace: role });
            toast.success(`Role updated to ${role}`);
            fetchUsers();
        } catch { toast.error('Failed to assign role'); }
        finally { setAssigningId(null); }
    };

    const filteredUsers = users.filter(u => 
        u.displayName.toLowerCase().includes(filter.toLowerCase()) ||
        u.phoneNumber.includes(filter) ||
        u.roles.some(r => r.role.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="flex flex-col md:flex-row md:items-center justify-between mb-8 p-6 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-lg">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                        User Management
                    </h1>
                    <p className="text-slate-500 mt-1">{users.length} users · Assign and manage roles</p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                    <input placeholder="Search by name, phone, or role..." value={filter} onChange={e => setFilter(e.target.value)}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 w-64 outline-none focus:border-heaven-500 transition-all" />
                    <button onClick={fetchUsers} className="p-2.5 bg-heaven-600 hover:bg-heaven-500 text-white rounded-xl transition-all">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="w-10 h-10 border-4 border-heaven-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredUsers.map((user, i) => (
                        <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                            className="bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-heaven-100 dark:bg-heaven-900/30 flex items-center justify-center shrink-0">
                                        <User className="w-6 h-6 text-heaven-600 dark:text-heaven-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{user.displayName.trim() || 'Unnamed User'}</p>
                                        <p className="text-sm text-slate-500">{user.phoneNumber}</p>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {user.roles.map(r => (
                                                <span key={r.id} className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${ROLE_COLORS[r.role] || 'bg-slate-100 text-slate-700'}`}>
                                                    <Shield className="w-3 h-3" /> {r.role}
                                                </span>
                                            ))}
                                            {user.roles.length === 0 && <span className="text-xs text-slate-400 italic">No roles assigned</span>}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_ROLES.map(role => {
                                        const hasRole = user.roles.some(r => r.role === role);
                                        return (
                                            <button key={role} onClick={() => assignRole(user.id, role)}
                                                disabled={assigningId === user.id}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2 flex items-center gap-1 ${
                                                    hasRole 
                                                        ? `${ROLE_COLORS[role]} border-current` 
                                                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'
                                                }`}>
                                                {hasRole && <CheckCircle2 className="w-3 h-3" />}
                                                {role}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
