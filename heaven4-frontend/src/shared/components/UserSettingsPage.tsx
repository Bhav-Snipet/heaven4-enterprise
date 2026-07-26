import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Lock, Save, AlertTriangle } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';
import { useAuth } from '@/core/auth/AuthProvider';

export default function UserSettingsPage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        password: '',
        confirmPassword: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await apiClient.get('/users/me');
                setFormData(prev => ({
                    ...prev,
                    firstName: res.data.firstName || '',
                    lastName: res.data.lastName || '',
                    email: res.data.email || '',
                    dateOfBirth: res.data.dateOfBirth || ''
                }));
            } catch (error) {
                console.error(error);
                toast.error('Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password && formData.password !== formData.confirmPassword) {
            return toast.error("Passwords don't match");
        }

        setIsSaving(true);
        try {
            const updates: any = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                dateOfBirth: formData.dateOfBirth
            };
            if (formData.password) {
                updates.password = formData.password;
            }

            const res = await apiClient.put('/users/me', updates);
            toast.success('Profile updated successfully!');
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            
            // Assuming the token is preserved, or we might need to refresh user state
            // If the user context needs updating:
            if (user && res.data) {
                 // user context update if we tracked names
            }
            
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you sure you want to delete your account? It will be recoverable for 30 days.")) return;
        
        try {
            const res = await apiClient.delete('/users/me');
            toast.success(res.data.message || 'Account deleted');
            // Log out
            window.location.href = '/auth/login';
        } catch (error) {
            toast.error('Failed to delete account');
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Account Settings</h1>
                <p className="text-slate-500">Manage your personal information and security preferences.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
                    
                    {/* Personal Info */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-500" /> Personal Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required
                                        className="w-full p-3 pl-10 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all" />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                                <div className="relative">
                                    <Calendar className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required
                                        className="w-full p-3 pl-10 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-200 dark:border-slate-700" />

                    {/* Security */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-indigo-500" /> Security
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">Leave password fields blank if you do not wish to change your current password.</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange}
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-all" placeholder="••••••••" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end">
                        <button type="submit" disabled={isSaving}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50">
                            {isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Danger Zone */}
            <div className="mt-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-5 h-5" /> Danger Zone
                    </h3>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80">Delete your account and all associated personal data.</p>
                </div>
                <button onClick={handleDeleteAccount}
                    className="px-6 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-bold rounded-xl transition-all whitespace-nowrap">
                    Delete Account
                </button>
            </div>
        </div>
    );
}
