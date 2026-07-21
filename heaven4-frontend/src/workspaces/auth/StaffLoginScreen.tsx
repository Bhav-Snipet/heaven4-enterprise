import { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, ArrowRight, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/core/auth/AuthProvider';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

/**
 * StaffLoginScreen — Separate, staff-only login page at /staff-login
 * This page is intentionally NOT linked from the customer login page,
 * so customers cannot accidentally stumble upon it.
 * Staff access via: /staff-login
 */
export default function StaffLoginScreen() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim() || !password) {
            toast.error('Please enter your Staff ID and Password');
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiClient.post('/auth/login/password', { identifier: identifier.trim(), password });
            const data = res.data.data;

            // Ensure this is actually a staff member
            const staffWorkspaces = ['EMPLOYEE', 'KITCHEN', 'MANAGER', 'ADMIN', 'OWNER', 'DEVELOPER'];
            if (!staffWorkspaces.includes(data.workspace?.toUpperCase())) {
                toast.error('This portal is for staff only. Please use the customer login.');
                return;
            }

            login(data.accessToken, data.refreshToken, {
                id: data.userId,
                displayName: data.displayName,
                role: data.role,
                workspace: data.workspace
            });

            toast.success(`Welcome, ${data.displayName}!`);
            navigate(`/${data.workspace.toLowerCase()}`);
        } catch {
            // Error handled by axios interceptor
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#030712] relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-slate-800/50 blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/30 blur-[100px]" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFmMjkzNyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
            </div>

            <div className="relative z-10 w-full max-w-sm p-6">
                {/* Logo & Heading */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md mb-6"
                    >
                        <Lock className="w-8 h-8 text-slate-300" />
                    </motion.div>
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="text-3xl font-bold text-white"
                    >
                        Staff Portal
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-slate-400 mt-2 text-sm"
                    >
                        Heaven4 — Authorized Personnel Only
                    </motion.p>
                </div>

                {/* Login Card */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
                >
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Staff ID</label>
                            <div className="relative">
                                <KeyRound className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    id="staff-id"
                                    type="text"
                                    placeholder="e.g. emp001, mgr001"
                                    value={identifier}
                                    onChange={e => setIdentifier(e.target.value)}
                                    autoComplete="username"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-white/30 focus:ring-0 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    id="staff-password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-white/30 focus:ring-0 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 mt-2 bg-white hover:bg-slate-100 disabled:bg-slate-600 text-black font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-5 h-5 animate-spin text-slate-600" /> Signing in...</>
                            ) : (
                                <>Sign In <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Back to Customer Login */}
                <p className="text-center text-slate-600 text-xs mt-6">
                    Are you a customer?{' '}
                    <Link to="/auth/login" className="text-slate-400 hover:text-white transition-colors font-semibold">
                        Customer Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
