import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, RefreshCw, CheckCircle2, Lock, Unlock } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

interface UserRole { id: number; role: string; workspace: string; }
interface UserData {
    id: number;
    phoneNumber: string;
    displayName: string;
    roles: UserRole[];
    lastLoginAt?: string;
    isBlocked?: boolean;
}
interface UnblockRequest {
    id: number;
    reason: string;
    user: UserData;
    createdAt: string;
}

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
    const [appeals, setAppeals] = useState<UnblockRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState<number | null>(null);
    const [filter, setFilter] = useState('');
    const [activeTab, setActiveTab] = useState<'STAFF' | 'CUSTOMERS' | 'APPEALS'>('STAFF');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const [usersRes, appealsRes] = await Promise.all([
                apiClient.get('/admin/users'),
                apiClient.get('/admin/unblock-requests').catch(() => ({ data: [] }))
            ]);
            setUsers(usersRes.data);
            setAppeals(appealsRes.data);
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

    const toggleBlock = async (userId: number, currentBlockState: boolean) => {
        try {
            await apiClient.put(`/admin/users/${userId}/block`, { block: !currentBlockState });
            toast.success(!currentBlockState ? "User blocked" : "User unblocked");
            fetchUsers();
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to update block status");
        }
    };

    const updateTier = async (userId: number, tier: string) => {
        try {
            await apiClient.put(`/admin/users/${userId}/tier`, { tier });
            toast.success(`Tier updated to ${tier}`);
        } catch (e) {
            toast.error("Failed to update tier");
        }
    };

    const handleAppeal = async (id: number, action: 'approve' | 'reject') => {
        try {
            await apiClient.put(`/admin/unblock-requests/${id}/${action}`);
            toast.success(`Appeal ${action}d`);
            fetchUsers();
        } catch (e) {
            toast.error(`Failed to ${action} appeal`);
        }
    };

    const STAFF_ROLES = ['EMPLOYEE', 'KITCHEN', 'MANAGER', 'ADMIN', 'OWNER'];
    const CUSTOMER_ROLES = ['CUSTOMER'];

    const filteredUsers = users.filter(u => {
        const matchesFilter = activeTab === 'CUSTOMERS' 
            ? (u.id.toString() === filter || u.phoneNumber.includes(filter) || filter === '')
            : (u.displayName.toLowerCase().includes(filter.toLowerCase()) || u.phoneNumber.includes(filter));
        if (!matchesFilter) return false;
        
        const isStaff = u.roles.some(r => STAFF_ROLES.includes(r.role));
        const isCustomer = u.roles.some(r => r.role === 'CUSTOMER') || u.roles.length === 0;

        if (activeTab === 'STAFF') return isStaff;
        if (activeTab === 'CUSTOMERS') return isCustomer && !isStaff;
        return false;
    });

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="flex flex-col md:flex-row md:items-center justify-between mb-8 p-6 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-lg">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                        User Management
                    </h1>
                    <p className="text-slate-500 mt-1">{users.length} total users</p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                    <input placeholder="Search by name or phone..." value={filter} onChange={e => setFilter(e.target.value)}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 w-64 outline-none focus:border-heaven-500 transition-all" />
                    <button onClick={fetchUsers} className="p-2.5 bg-heaven-600 hover:bg-heaven-500 text-white rounded-xl transition-all">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 flex-wrap">
                <button 
                    onClick={() => setActiveTab('STAFF')} 
                    className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'STAFF' ? 'bg-heaven-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                    Staff Management
                </button>
                <button 
                    onClick={() => setActiveTab('CUSTOMERS')} 
                    className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'CUSTOMERS' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                    Customers & Memberships
                </button>
                <button 
                    onClick={() => setActiveTab('APPEALS')} 
                    className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${activeTab === 'APPEALS' ? 'bg-red-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                    Unblock Requests {appeals.length > 0 && <span className="bg-white text-red-600 px-2 py-0.5 rounded-full text-xs">{appeals.length}</span>}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="w-10 h-10 border-4 border-heaven-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : activeTab === 'APPEALS' ? (
                <div className="space-y-4">
                    {appeals.map(a => (
                        <div key={a.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4">
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{a.user.displayName || a.user.phoneNumber}</p>
                                <p className="text-sm text-slate-500 mt-1"><span className="font-semibold text-slate-400">Reason:</span> {a.reason}</p>
                                <p className="text-xs text-slate-400 mt-2">Requested at: {new Date(a.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAppeal(a.id, 'approve')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-fit">Approve</button>
                                <button onClick={() => handleAppeal(a.id, 'reject')} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-bold rounded-xl h-fit">Reject</button>
                            </div>
                        </div>
                    ))}
                    {appeals.length === 0 && <div className="text-center p-12 text-slate-500">No pending appeals.</div>}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredUsers.map((user, i) => (
                        <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                            className="bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-heaven-100 dark:bg-heaven-900/30 flex items-center justify-center shrink-0 relative">
                                        <User className="w-6 h-6 text-heaven-600 dark:text-heaven-400" />
                                        {user.isBlocked && <div className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full"><Lock className="w-3 h-3 text-white" /></div>}
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
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-2 items-end">
                                    <div className="flex flex-wrap gap-2 justify-end">
                                        {(activeTab === 'STAFF' ? STAFF_ROLES : CUSTOMER_ROLES).map(role => {
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
                                    <div className="flex gap-2">
                                        {activeTab === 'CUSTOMERS' && (
                                            <select 
                                                onChange={(e) => updateTier(user.id, e.target.value)}
                                                className="px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-slate-200 dark:border-slate-700 bg-transparent text-slate-500 focus:outline-none"
                                            >
                                                <option value="">Edit Tier...</option>
                                                <option value="SILVER">Silver</option>
                                                <option value="GOLD">Gold</option>
                                                <option value="DIAMOND">Diamond</option>
                                            </select>
                                        )}
                                        <button 
                                            onClick={() => toggleBlock(user.id, !!user.isBlocked)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 flex items-center gap-1 transition-colors ${
                                                user.isBlocked 
                                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900' 
                                                : 'text-slate-500 border-slate-200 dark:border-slate-700 hover:border-red-500 hover:text-red-500'
                                            }`}
                                        >
                                            {user.isBlocked ? <><Lock className="w-3 h-3" /> Blocked</> : <><Unlock className="w-3 h-3" /> Block User</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="text-center p-12 text-slate-500">
                            No users found in this category.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
