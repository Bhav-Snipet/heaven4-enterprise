import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Loader2, LogOut, Code, User } from 'lucide-react';
import apiClient from '@/core/api/client';
import { useAuth } from './AuthProvider';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// These phone numbers must match V6__add_test_users.sql + V8__add_developer_user.sql
const ROLES = [
  { name: 'Customer',  phone: '7020875435',  workspace: 'customer',  color: 'bg-blue-500',    id: 1001 },
  { name: 'Employee',  phone: '3333333333',  workspace: 'employee',  color: 'bg-emerald-500', id: 1002 },
  { name: 'Kitchen',   phone: '2222222222',  workspace: 'kitchen',   color: 'bg-orange-500',  id: 1003 },
  { name: 'Manager',   phone: '1234567890',  workspace: 'manager',   color: 'bg-purple-500',  id: 1004 },
  { name: 'Admin',     phone: '70208785435', workspace: 'admin',     color: 'bg-rose-500',    id: 1005 },
  { name: 'Owner',     phone: '1111111111',  workspace: 'owner',     color: 'bg-amber-500',   id: 1006 },
];

export function DeveloperRoleSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const [loadingRole, setLoadingRole] = useState<string | null>(null);
    const { login, logout, user } = useAuth();
    const navigate = useNavigate();

    // Show when:
    // 1. isDeveloperMode flag is set in localStorage (persists across all role switches), OR
    // 2. user is logged in as the Developer account role/workspace
    const isDeveloper =
        localStorage.getItem('isDeveloperMode') === 'true' ||
        user?.role === 'DEVELOPER' ||
        user?.workspace === 'DEVELOPER';

    if (!isDeveloper) return null;

    const switchRole = async (phone: string, roleName: string, workspace: string, fallbackId: number) => {
        setLoadingRole(roleName);
        // Always persist isDeveloperMode FIRST so the switcher stays visible
        localStorage.setItem('isDeveloperMode', 'true');

        try {
            // Attempt live backend role switch
            await apiClient.post('/auth/request-otp',
                { phoneNumber: phone },
                { headers: { 'x-suppress-error-toast': 'true' } }
            );
            const res = await apiClient.post('/auth/verify-otp',
                { phoneNumber: phone, otpCode: '1234' },
                { headers: { 'x-suppress-error-toast': 'true' } }
            );
            const data = res.data.data;

            login(data.accessToken, data.refreshToken, {
                id: data.userId,
                displayName: data.displayName,
                role: data.role,
                workspace: data.workspace,
            });

            toast.success(`✓ Switched to ${roleName}`);
            navigate(`/${workspace}`);
            setIsOpen(false);
        } catch {
            // Offline fallback — create a mock session for the target role
            login(
                `mock_dev_token_${roleName}_${Date.now()}`,
                'mock_refresh_dev',
                {
                    id: fallbackId,
                    displayName: `Dev ${roleName}`,
                    role: roleName.toUpperCase(),
                    workspace: roleName.toUpperCase(),
                    phoneNumber: phone,
                }
            );
            toast.success(`✓ Switched to ${roleName} (offline mode)`);
            navigate(`/${workspace}`);
            setIsOpen(false);
        } finally {
            setLoadingRole(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isDeveloperMode');
        logout();
        navigate('/auth/login');
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="absolute bottom-16 right-0 w-64 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2">
                            <Code className="w-4 h-4 text-amber-400" />
                            <h3 className="text-sm font-bold text-white">Dev Role Switcher</h3>
                            {user && (
                                <span className="ml-auto text-xs text-slate-500 flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {user.role}
                                </span>
                            )}
                        </div>

                        <div className="p-2 space-y-1">
                            {ROLES.map((role) => {
                                const isActive =
                                    user?.workspace?.toUpperCase() === role.name.toUpperCase() ||
                                    user?.role?.toUpperCase() === role.name.toUpperCase();
                                return (
                                    <button
                                        key={role.name}
                                        disabled={!!loadingRole}
                                        onClick={() => switchRole(role.phone, role.name, role.workspace, role.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                                            isActive
                                                ? 'bg-amber-500/20 ring-1 ring-amber-500/50 text-white'
                                                : 'text-slate-300 hover:bg-white/5'
                                        }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${role.color}`} />
                                        <span className="flex-1 text-left">{role.name}</span>
                                        {loadingRole === role.name
                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                                            : isActive && <span className="text-[10px] text-amber-400 font-bold">ACTIVE</span>
                                        }
                                    </button>
                                );
                            })}
                        </div>

                        <div className="p-2 border-t border-slate-700/50">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all text-sm font-medium"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Exit Developer Mode
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileTap={{ scale: 0.9 }}
                className={`w-12 h-12 text-white rounded-full flex items-center justify-center shadow-lg transition-colors ${
                    isOpen ? 'bg-amber-500' : 'bg-amber-600 hover:bg-amber-500'
                }`}
                title="Developer Role Switcher"
            >
                <Settings2 className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
            </motion.button>
        </div>
    );
}
