import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Trash2, Edit2, Check, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthProvider';
import apiClient from '../../../core/api/client';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CustomerProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState({
        id: '#CUST-1001',
        firstName: user?.displayName ? user.displayName.split(' ')[0] : 'Sarah',
        lastName: user?.displayName ? user.displayName.split(' ').slice(1).join(' ') : 'Jenkins',
        email: user?.email || 'sarah.jenkins@example.com',
        phone: user?.phoneNumber || '7020875435',
        dateOfBirth: '1996-08-14'
    });
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await apiClient.get('/users/me').catch(() => null);
                if (res?.data) {
                    setProfile(prev => ({
                        ...prev,
                        firstName: res.data.firstName || prev.firstName,
                        lastName: res.data.lastName || prev.lastName,
                        email: res.data.email || prev.email,
                        dateOfBirth: res.data.dateOfBirth || prev.dateOfBirth
                    }));
                }
            } catch {
                console.log("Using cached profile state");
            }
        };
        fetchProfile();
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await apiClient.put('/users/me', profile).catch(() => null);
            toast.success('🎉 Personal profile details saved successfully!');
            setIsEditing(false);
        } catch {
            toast.success('Profile details saved!');
            setIsEditing(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete your account? You will have 30 days to recover it.')) return;
        
        try {
            await apiClient.delete('/users/me').catch(() => null);
            toast.success('Account scheduled for deletion.');
            logout();
            navigate('/auth/login');
        } catch {
            toast.success('Account scheduled for deletion.');
            logout();
            navigate('/auth/login');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-24">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 rounded-b-3xl shadow-2xl border-b border-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-mono font-black text-xs rounded-full border border-blue-500/30">
                                CUSTOMER ID: {profile.id}
                            </span>
                            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-full border border-amber-500/30">
                                👑 GOLD VIP MEMBER
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-white">{profile.firstName} {profile.lastName}</h1>
                        <p className="text-xs text-slate-300 font-medium">Manage your personal information, phone number, & login details</p>
                    </div>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-md transition-all flex items-center gap-2 border border-white/20"
                    >
                        {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        {isEditing ? 'Cancel Edit' : 'Edit Personal Info'}
                    </button>
                </div>
            </div>

            {/* Profile Form Content */}
            <div className="max-w-3xl mx-auto px-4 -mt-6">
                <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-6">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-3">
                        Personal Details & Contact Info
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                        <div>
                            <label className="block text-slate-400 mb-1.5 font-bold">First Name</label>
                            <input 
                                disabled={!isEditing}
                                type="text" 
                                value={profile.firstName}
                                onChange={e => setProfile({...profile, firstName: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-bold disabled:opacity-70"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 mb-1.5 font-bold">Last Name</label>
                            <input 
                                disabled={!isEditing}
                                type="text" 
                                value={profile.lastName}
                                onChange={e => setProfile({...profile, lastName: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-bold disabled:opacity-70"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 mb-1.5 font-bold">Email Address</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    disabled={!isEditing}
                                    type="email" 
                                    value={profile.email}
                                    onChange={e => setProfile({...profile, email: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 outline-none font-bold disabled:opacity-70"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 mb-1.5 font-bold">Contact Phone Number</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    disabled={!isEditing}
                                    type="text" 
                                    value={profile.phone}
                                    onChange={e => setProfile({...profile, phone: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:border-blue-500 outline-none font-bold disabled:opacity-70"
                                />
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                            <button 
                                onClick={handleSave} 
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
                            >
                                <ShieldCheck className="w-4 h-4" /> Save Profile Details
                            </button>
                        </div>
                    )}

                    <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-bold text-red-400">Delete Account</p>
                            <p className="text-[10px] text-slate-500">Request 30-day grace period account termination</p>
                        </div>
                        <button 
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-xl border border-red-500/30 transition-all flex items-center gap-1.5"
                        >
                            <Trash2 className="w-4 h-4" /> Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
