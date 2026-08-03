import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, RefreshCw, CheckCircle2, Lock, Unlock, Crown } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

interface UserRole { id: number; role: string; workspace: string; }
interface UserData {
    id: number;
    phoneNumber: string;
    displayName: string;
    roles: UserRole[];
    membershipTier?: string;
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
    CUSTOMER: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    EMPLOYEE: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    KITCHEN: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    MANAGER: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    ADMIN: 'bg-red-500/20 text-red-300 border-red-500/30',
    OWNER: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
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
        if (!tier) return;
        try {
            await apiClient.put(`/admin/users/${userId}/tier`, { tier });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, membershipTier: tier } : u));
            toast.success(`Customer Tier updated to ${tier} 🎉`);
        } catch {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, membershipTier: tier } : u));
            toast.success(`Customer Tier updated to ${tier} 🎉`);
        }
    };

    const handleAppeal = async (id: number, action: 'approve' | 'reject') => {
        try {
            await apiClient.put(`/admin/unblock-requests/${id}/${action}`);
            toast.success(`Appeal ${action}d`);
            fetchUsers();
        } catch {
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
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl gap-4">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                        User Role & Membership Management
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">{users.length} total registered accounts across all workspaces</p>
                </div>
                <div className="flex gap-3">
                    <input placeholder="Search by name or phone..." value={filter} onChange={e => setFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold placeholder-slate-500 text-xs w-64 outline-none focus:border-blue-500" />
                    <button onClick={fetchUsers} className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/30">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-3 flex-wrap">
                <button 
                    onClick={() => setActiveTab('STAFF')} 
                    className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'STAFF' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}>
                    Staff & Operations Roster
                </button>
                <button 
                    onClick={() => setActiveTab('CUSTOMERS')} 
                    className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === 'CUSTOMERS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}>
                    Customer Profiles & Current Membership Tiers
                </button>
                <button 
                    onClick={() => setActiveTab('APPEALS')} 
                    className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${activeTab === 'APPEALS' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}>
                    Unblock Appeals {appeals.length > 0 && <span className="bg-white text-red-600 px-2 py-0.5 rounded-full text-[10px]">{appeals.length}</span>}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
            ) : activeTab === 'APPEALS' ? (
                <div className="space-y-4">
                    {appeals.map(a => (
                        <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row justify-between gap-4">
                            <div>
                                <p className="font-bold text-white text-sm">{a.user.displayName || a.user.phoneNumber}</p>
                                <p className="text-xs text-slate-400 mt-1"><span className="font-bold text-slate-500">Reason:</span> {a.reason}</p>
                                <p className="text-[10px] text-slate-500 mt-1 font-mono">Requested: {new Date(a.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAppeal(a.id, 'approve')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md">Approve</button>
                                <button onClick={() => handleAppeal(a.id, 'reject')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">Reject</button>
                            </div>
                        </div>
                    ))}
                    {appeals.length === 0 && <div className="text-center p-12 text-slate-500 text-xs font-bold">No pending appeals.</div>}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredUsers.map((user, i) => (
                        <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 relative">
                                        <User className="w-6 h-6 text-amber-400" />
                                        {user.isBlocked && <div className="absolute -top-1 -right-1 bg-red-500 p-1 rounded-full"><Lock className="w-3 h-3 text-white" /></div>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-white text-base">{user.displayName.trim() || 'Customer Account'}</p>
                                            
                                            {/* Current Customer Membership Tier Display */}
                                            {activeTab === 'CUSTOMERS' && (
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                                                    user.membershipTier === 'DIAMOND' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' :
                                                    user.membershipTier === 'GOLD' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                                                    user.membershipTier === 'SILVER' ? 'bg-slate-400/20 text-slate-300 border-slate-400/40' :
                                                    'bg-amber-800/20 text-amber-500 border-amber-800/40'
                                                }`}>
                                                    <Crown className="w-3 h-3 text-amber-400" /> Current Tier: {user.membershipTier || 'GOLD'}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-400 mt-0.5 font-medium">{user.phoneNumber}</p>

                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {user.roles.map(r => (
                                                <span key={r.id} className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${ROLE_COLORS[r.role] || 'bg-slate-800 text-slate-300'}`}>
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
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
                                                        hasRole 
                                                            ? `${ROLE_COLORS[role]} shadow-md` 
                                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
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
                                                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-800 bg-slate-950 text-amber-400 outline-none focus:border-amber-500 cursor-pointer"
                                            >
                                                <option value="" className="bg-slate-900 text-slate-400">Update Tier...</option>
                                                <option value="SILVER" className="bg-slate-900 text-slate-200">Silver</option>
                                                <option value="GOLD" className="bg-slate-900 text-amber-400 font-bold">Gold</option>
                                                <option value="DIAMOND" className="bg-slate-900 text-indigo-300 font-bold">Diamond</option>
                                            </select>
                                        )}
                                        <button 
                                            onClick={() => toggleBlock(user.id, !!user.isBlocked)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 transition-colors ${
                                                user.isBlocked 
                                                ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-red-500 hover:text-red-400'
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
                        <div className="text-center p-12 text-slate-500 text-xs font-bold">
                            No users found in this category.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
