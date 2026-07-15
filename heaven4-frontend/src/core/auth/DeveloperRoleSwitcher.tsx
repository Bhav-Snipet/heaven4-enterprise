import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Loader2, LogOut, Code } from 'lucide-react';
import apiClient from '@/core/api/client';
import { useAuth } from './AuthProvider';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const ROLES = [
  { name: 'Customer', phone: '7020875435', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  { name: 'Manager', phone: '1234567890', color: 'bg-purple-500', hover: 'hover:bg-purple-600' },
  { name: 'Admin', phone: '70208785435', color: 'bg-rose-500', hover: 'hover:bg-rose-600' },
  { name: 'Owner', phone: '1111111111', color: 'bg-amber-500', hover: 'hover:bg-amber-600' },
  { name: 'Kitchen', phone: '2222222222', color: 'bg-orange-500', hover: 'hover:bg-orange-600' },
  { name: 'Employee', phone: '3333333333', color: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
];

export function DeveloperRoleSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const [loadingRole, setLoadingRole] = useState<string | null>(null);
    const { login, logout, user } = useAuth();
    const navigate = useNavigate();

    // Only show in development!
    if (import.meta.env.PROD) return null;

    const switchRole = async (phone: string, roleName: string) => {
        setLoadingRole(roleName);
        try {
            // Request OTP
            await apiClient.post('/auth/request-otp', { phoneNumber: phone });
            
            // Verify with mock OTP 1234
            const res = await apiClient.post('/auth/verify-otp', { phoneNumber: phone, otpCode: '1234' });
            const data = res.data.data;
            
            login(data.accessToken, data.refreshToken, {
                id: data.userId,
                displayName: data.displayName,
                role: data.role,
                workspace: data.workspace
            });
            
            toast.success(`Switched to ${roleName}`);
            navigate(`/${data.workspace.toLowerCase()}`);
            setIsOpen(false);
        } catch (error) {
            toast.error(`Failed to switch to ${roleName}`);
        } finally {
            setLoadingRole(null);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-16 right-0 w-72 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-4 overflow-hidden"
                    >
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/50">
                            <Code className="w-4 h-4 text-heaven-400" />
                            <h3 className="text-sm font-semibold text-white">Dev Role Switcher</h3>
                        </div>
                        
                        <div className="space-y-2">
                            {ROLES.map((role) => (
                                <button
                                    key={role.name}
                                    disabled={!!loadingRole}
                                    onClick={() => switchRole(role.phone, role.name)}
                                    className={clsx(
                                        "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left text-sm font-medium",
                                        "border border-white/5",
                                        user?.role === role.name.split(' ')[0]?.toUpperCase() 
                                            ? "bg-slate-800 ring-1 ring-heaven-500 text-white" 
                                            : "bg-slate-800/50 hover:bg-slate-800 text-slate-300"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={clsx("w-2 h-2 rounded-full", role.color)} />
                                        {role.name}
                                    </div>
                                    {loadingRole === role.name && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                                </button>
                            ))}
                        </div>

                        {user && (
                            <button
                                onClick={handleLogout}
                                className="w-full mt-4 flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all text-sm font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout Current
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 bg-heaven-600 hover:bg-heaven-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
                <Settings2 className="w-5 h-5" />
            </button>
        </div>
    );
}
