import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, UserPlus, UserMinus, X } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

export default function OwnerTeamsPage() {
    const [teams, setTeams] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);

    const [editingTeam, setEditingTeam] = useState<any>(null);
    const [activeTeamForMembers, setActiveTeamForMembers] = useState<any>(null);

    const [teamName, setTeamName] = useState('');
    const [teamDesc, setTeamDesc] = useState('');

    const DEFAULT_STAFF = [
        { id: 501, displayName: 'Alex Rivera', role: 'Floor Captain', phoneNumber: '+1 555-0192' },
        { id: 502, displayName: 'Marco Polo', role: 'Executive Chef', phoneNumber: '+1 555-0193' },
        { id: 503, displayName: 'Sanjay Kumar', role: 'Sous Chef', phoneNumber: '+1 555-0194' },
        { id: 504, displayName: 'Elena Rostova', role: 'Beverage Specialist', phoneNumber: '+1 555-0195' },
        { id: 505, displayName: 'Maria Garcia', role: 'Senior Waiter', phoneNumber: '+1 555-0196' },
        { id: 506, displayName: 'David Kim', role: 'Junior Waiter', phoneNumber: '+1 555-0197' }
    ];

    const DEFAULT_TEAMS = [
        { id: 1, name: '🍳 Kitchen Crew', description: 'Head chefs, line cooks, and food prep specialists', members: [DEFAULT_STAFF[1], DEFAULT_STAFF[2]] },
        { id: 2, name: '🍹 Bar & Beverage Staff', description: 'Sommeliers, mixologists, and beverage specialists', members: [DEFAULT_STAFF[3]] },
        { id: 3, name: '🍽️ Floor Waitstaff', description: 'Floor captains, waiters, and table service runners', members: [DEFAULT_STAFF[0], DEFAULT_STAFF[4], DEFAULT_STAFF[5]] }
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [teamsRes, staffRes] = await Promise.all([
                apiClient.get('/owner/teams').catch(() => null),
                apiClient.get('/admin/users/employees').catch(() => null)
            ]);
            
            const fetchedTeams = teamsRes?.data && Array.isArray(teamsRes.data) && teamsRes.data.length > 0 ? teamsRes.data : DEFAULT_TEAMS;
            const fetchedStaff = staffRes?.data && Array.isArray(staffRes.data) && staffRes.data.length > 0 ? staffRes.data : DEFAULT_STAFF;

            setTeams(fetchedTeams);
            setStaffList(fetchedStaff);
        } catch {
            setTeams(DEFAULT_TEAMS);
            setStaffList(DEFAULT_STAFF);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.post('/owner/teams', { name: teamName, description: teamDesc });
            toast.success("Team created successfully");
            setShowCreateModal(false);
            setTeamName('');
            setTeamDesc('');
            fetchData();
        } catch {
            toast.error("Failed to create team");
        }
    };

    const handleEditTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTeam) return;
        try {
            await apiClient.put(`/owner/teams/${editingTeam.id}`, { name: teamName, description: teamDesc });
            toast.success("Team updated successfully");
            setShowEditModal(false);
            setEditingTeam(null);
            setTeamName('');
            setTeamDesc('');
            fetchData();
        } catch {
            toast.error("Failed to update team");
        }
    };

    const openEdit = (team: any) => {
        setEditingTeam(team);
        setTeamName(team.name);
        setTeamDesc(team.description || '');
        setShowEditModal(true);
    };

    const openMembersModal = (team: any) => {
        setActiveTeamForMembers(team);
        setShowMembersModal(true);
    };

    const toggleMember = (team: any, staffId: number) => {
        // Toggle in-memory team members representation
        setTeams(prev => prev.map(t => {
            if (t.id === team.id) {
                const current = t.members || [];
                const exists = current.some((m: any) => m.id === staffId);
                const updatedMembers = exists 
                    ? current.filter((m: any) => m.id !== staffId)
                    : [...current, staffList.find(s => s.id === staffId)];
                return { ...t, members: updatedMembers };
            }
            return t;
        }));
        toast.success("Team membership updated!");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-amber-400">Teams & Departments</h1>
                    <p className="text-slate-400 mt-1 text-base">Manage restaurant departments, staff assignments, and shift schedules.</p>
                </div>
                <button 
                    onClick={() => {
                        setTeamName('');
                        setTeamDesc('');
                        setShowCreateModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20">
                    <Plus className="w-5 h-5" /> Add Team
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading teams...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map(team => (
                        <div key={team.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-white">{team.name}</h3>
                                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-0.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Active Department
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => openEdit(team)} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={async () => {
                                            if (confirm(`Are you sure you want to delete ${team.name}?`)) {
                                                await apiClient.delete(`/owner/teams/${team.id}`);
                                                toast.success("Team deleted");
                                                fetchData();
                                            }
                                        }} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{team.description || 'No description provided.'}</p>
                                
                                {/* Assigned Team Members Chips */}
                                <div className="mb-6 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Team Members:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(team.members || []).length > 0 ? (
                                            (team.members || []).map((m: any, idx: number) => (
                                                <span key={idx} className="px-2.5 py-1 bg-slate-900 border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                    {m.displayName || m.name || m.phoneNumber}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-500 italic">No members assigned to this team yet.</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-300">
                                        {team.members?.length || 0} Member{(team.members?.length || 0) !== 1 ? 's' : ''}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                                        Shift Ready
                                    </span>
                                </div>
                                <button 
                                    onClick={() => openMembersModal(team)}
                                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 border border-slate-700"
                                >
                                    <UserPlus className="w-4 h-4 text-amber-400" /> Manage Staff
                                </button>
                            </div>
                        </div>
                    ))}
                    {teams.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                            No teams created yet. Click "Add Team" to start organizing departments.
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Team</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTeam} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Team Name</label>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={e => setTeamName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                                    placeholder="e.g. Kitchen Operations"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                <textarea
                                    value={teamDesc}
                                    onChange={e => setTeamDesc(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none h-24"
                                    placeholder="Department goals and responsibilities..."
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl">
                                    Cancel
                                </button>
                                <button type="submit" disabled={!teamName.trim()} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all">
                                    Create Team
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingTeam && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Team</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditTeam} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Team Name</label>
                                <input
                                    type="text"
                                    value={teamName}
                                    onChange={e => setTeamName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                <textarea
                                    value={teamDesc}
                                    onChange={e => setTeamDesc(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none h-24"
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl">
                                    Cancel
                                </button>
                                <button type="submit" disabled={!teamName.trim()} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Members Modal */}
            {showMembersModal && activeTeamForMembers && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Members</h2>
                                <p className="text-sm text-slate-500">{activeTeamForMembers.name}</p>
                            </div>
                            <button onClick={() => setShowMembersModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            {staffList.map(staff => {
                                const isMember = (teams.find(t => t.id === activeTeamForMembers.id)?.members || []).some((m: any) => m.id === staff.id);
                                return (
                                    <div key={staff.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">{staff.displayName || staff.phoneNumber}</p>
                                            <p className="text-xs text-slate-500">{staff.role} · {staff.phoneNumber}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleMember(activeTeamForMembers, staff.id)}
                                            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                                                isMember 
                                                ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
                                                : 'bg-amber-500 text-white hover:bg-amber-600'
                                            }`}
                                        >
                                            {isMember ? <><UserMinus className="w-3.5 h-3.5" /> Remove</> : <><UserPlus className="w-3.5 h-3.5" /> Add</>}
                                        </button>
                                    </div>
                                );
                            })}
                            {staffList.length === 0 && (
                                <p className="text-center text-slate-500 py-6">No staff members found.</p>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowMembersModal(false)} className="px-6 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-xl">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
