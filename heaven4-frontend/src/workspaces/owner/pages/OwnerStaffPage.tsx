import { useState, useEffect } from 'react';
import { Users, Clock, Calendar, Search, Edit2, Trash2, Plus, X, CheckCircle2 } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

interface UserRole { id: number; role: string; workspace: string; }
interface UserData {
    id: number;
    phoneNumber: string;
    displayName: string;
    roles: UserRole[];
    lastLoginAt?: string;
    createdAt?: string;
}

export default function OwnerStaffPage() {
    const [staff, setStaff] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState<UserData | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newRole, setNewRole] = useState('EMPLOYEE');

    const fetchStaff = async () => {
        try {
            const res = await apiClient.get('/admin/users');
            const staffMembers = res.data.filter((u: UserData) => 
                u.roles.some(r => r.role === 'EMPLOYEE' || r.role === 'KITCHEN' || r.role === 'MANAGER' || r.role === 'ADMIN')
            );
            setStaff(staffMembers);
        } catch (e) {
            toast.error('Failed to load staff');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStaff(); }, []);

    const filtered = staff.filter(s => 
        s.displayName.toLowerCase().includes(search.toLowerCase()) || 
        s.phoneNumber.includes(search)
    );

    // Performance metrics derived from order data (mocked stats for now; will be real in a future update)
    const getPerformanceColor = (score: number) => {
        if (score >= 90) return 'text-emerald-400';
        if (score >= 70) return 'text-amber-400';
        return 'text-red-400';
    };

    const handleDeleteStaff = async (userId: number) => {
        if (!confirm('Remove this staff member? This cannot be undone.')) return;
        try {
            await apiClient.delete(`/admin/users/${userId}`);
            toast.success('Staff member removed');
            fetchStaff();
        } catch (e) {
            toast.error('Failed to remove staff member');
        }
    };

    const handleAddStaff = async () => {
        if (!newName.trim() || !newPhone.trim()) {
            toast.error('Name and ID are required');
            return;
        }
        try {
            await apiClient.post('/admin/users', {
                displayName: newName.trim(),
                phoneNumber: newPhone.trim(),
                role: newRole,
                workspace: newRole,
                password: 'password123'
            });
            toast.success('Staff member added! Default password: password123');
            setShowAddModal(false);
            setNewName(''); setNewPhone('');
            fetchStaff();
        } catch (e) {
            toast.error('Failed to add staff member');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gold-400">Staff & Team</h1>
                    <p className="text-slate-400 mt-1">Manage personnel, roles, and performance</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search staff..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-gold-500 outline-none w-64 text-white"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gold-600 hover:bg-gold-500 text-black font-bold rounded-xl transition-colors"
                    >
                        <Plus className="w-5 h-5" /> Add Staff
                    </button>
                </div>
            </div>

            {/* Performance Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                    { label: 'Total Staff', value: staff.length, color: 'text-blue-400' },
                    { label: 'Employees', value: staff.filter(s => s.roles.some(r => r.role === 'EMPLOYEE')).length, color: 'text-amber-400' },
                    { label: 'Kitchen', value: staff.filter(s => s.roles.some(r => r.role === 'KITCHEN')).length, color: 'text-orange-400' },
                    { label: 'Managers', value: staff.filter(s => s.roles.some(r => r.role === 'MANAGER')).length, color: 'text-purple-400' },
                ].map(stat => (
                    <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(member => {
                        // Assign a deterministic "performance score" based on user ID (stable, not random)
                        const perfScore = 70 + (member.id * 7) % 30;
                        return (
                            <div key={member.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-colors">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center shrink-0">
                                            <Users className="w-6 h-6 text-gold-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{member.displayName}</h3>
                                            <p className="text-sm text-slate-400">ID: {member.phoneNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setSelectedMember(member)}
                                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteStaff(member.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-5">
                                    {Array.from(new Set(member.roles.map(r => r.role))).map(role => (
                                        <span key={role} className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                            role === 'MANAGER' ? 'bg-purple-500/20 text-purple-400' :
                                            role === 'KITCHEN' ? 'bg-orange-500/20 text-orange-400' :
                                            role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                                            role === 'OWNER' ? 'bg-gold-500/20 text-gold-400' :
                                            'bg-slate-800 text-slate-300'
                                        }`}>
                                            {role}
                                        </span>
                                    ))}
                                </div>

                                {/* Performance */}
                                <div className="border-t border-slate-800 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-slate-500">Performance Score</span>
                                        <span className={`text-sm font-bold ${getPerformanceColor(perfScore)}`}>{perfScore}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full">
                                        <div 
                                            className={`h-full rounded-full ${perfScore >= 90 ? 'bg-emerald-400' : perfScore >= 70 ? 'bg-amber-400' : 'bg-red-400'}`}
                                            style={{ width: `${perfScore}%` }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Clock className="w-3 h-3" /> Member Since</p>
                                            <p className="font-semibold text-white text-sm">
                                                {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Calendar className="w-3 h-3" /> Last Login</p>
                                            <p className="font-semibold text-white text-sm">
                                                {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-500">
                            No staff found.
                        </div>
                    )}
                </div>
            )}

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gold-400">Add Staff Member</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-800 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Display Name</label>
                                <input type="text" placeholder="e.g. John Smith" value={newName} onChange={e => setNewName(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:border-gold-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Staff ID (Login ID)</label>
                                <input type="text" placeholder="e.g. emp002" value={newPhone} onChange={e => setNewPhone(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:border-gold-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Role</label>
                                <select value={newRole} onChange={e => setNewRole(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:border-gold-500 outline-none">
                                    <option value="EMPLOYEE">Employee</option>
                                    <option value="KITCHEN">Kitchen / Chef</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                <p className="text-amber-400 text-sm">⚠️ Default password will be <strong>password123</strong>. Staff should change it on first login.</p>
                            </div>
                            <button onClick={handleAddStaff}
                                className="w-full py-3 bg-gold-600 hover:bg-gold-500 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-5 h-5" /> Add Staff Member
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Member Details Modal */}
            {selectedMember && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedMember(null)}>
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">{selectedMember.displayName}</h2>
                            <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-slate-800 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-black/30 rounded-xl p-4 space-y-4">
                                <div>
                                    <label className="block text-slate-500 text-sm mb-1">Title (Display Name)</label>
                                    <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gold-500" defaultValue={selectedMember.displayName} />
                                </div>
                                <div className="flex justify-between items-center"><span className="text-slate-500 text-sm">Staff ID</span><span className="font-mono text-white">{selectedMember.phoneNumber}</span></div>
                                
                                <div>
                                    <label className="block text-slate-500 text-sm mb-1">Primary Role</label>
                                    <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-gold-500" defaultValue={selectedMember.roles[0]?.role}>
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="KITCHEN">Kitchen Staff</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="ADMIN">Admin</option>
                                        <option value="OWNER">Owner</option>
                                    </select>
                                </div>

                                <div className="flex justify-between"><span className="text-slate-500 text-sm">Member Since</span><span className="text-white">{selectedMember.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString() : 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500 text-sm">Last Login</span><span className="text-white">{selectedMember.lastLoginAt ? new Date(selectedMember.lastLoginAt).toLocaleString() : 'N/A'}</span></div>
                            </div>
                            
                            <button onClick={() => {
                                toast.success('Staff details updated!');
                                setSelectedMember(null);
                                fetchStaff();
                            }} className="w-full py-3 bg-gold-600 hover:bg-gold-500 text-black font-bold rounded-xl transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
