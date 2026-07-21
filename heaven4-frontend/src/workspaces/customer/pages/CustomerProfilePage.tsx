import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Trash2, Edit2, Check, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthProvider';
import apiClient from '../../../core/api/client';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CustomerProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await apiClient.get('/users/me');
                setProfile({
                    firstName: res.data.firstName || '',
                    lastName: res.data.lastName || '',
                    email: res.data.email || '',
                    dateOfBirth: res.data.dateOfBirth || ''
                });
            } catch (e) {
                toast.error('Failed to load profile details');
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            await apiClient.put('/users/me', profile);
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (e) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete your account? You will have 30 days to recover it before permanent deletion.')) return;
        
        try {
            await apiClient.delete('/users/me');
            toast.success('Account scheduled for deletion.');
            logout();
            navigate('/auth/login');
        } catch (e) {
            toast.error('Failed to delete account');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-b-3xl shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Your Profile</h1>
                        <p className="text-blue-100">Manage your personal details</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                        <User className="w-8 h-8 text-white" />
                    </div>
                </div>
            </div>

            <div className="px-4 py-8 max-w-2xl mx-auto space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Personal Information</h2>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors">
                                <Edit2 className="w-5 h-5" />
                            </button>
                        ) : (
                            <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2">
                                <Check className="w-4 h-4" /> Save
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-500 mb-1">First Name</label>
                                <input 
                                    type="text" 
                                    disabled={!isEditing}
                                    value={profile.firstName}
                                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white disabled:opacity-70 outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-500 mb-1">Last Name</label>
                                <input 
                                    type="text" 
                                    disabled={!isEditing}
                                    value={profile.lastName}
                                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white disabled:opacity-70 outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-500 mb-1 flex items-center gap-1"><Mail className="w-4 h-4" /> Email Address</label>
                            <input 
                                type="email" 
                                disabled={!isEditing}
                                value={profile.email}
                                onChange={(e) => setProfile({...profile, email: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white disabled:opacity-70 outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-4 h-4" /> Date of Birth</label>
                            <input 
                                type="date" 
                                disabled={!isEditing}
                                value={profile.dateOfBirth}
                                onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white disabled:opacity-70 outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl p-6 border border-red-200 dark:border-red-800/30">
                    <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Danger Zone</h2>
                    <p className="text-sm text-red-600 dark:text-red-300 mb-4">Deleting your account will temporarily disable it for 30 days before permanent deletion. You will lose all points and benefits.</p>
                    <button 
                        onClick={handleDelete}
                        className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-5 h-5" /> Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}
