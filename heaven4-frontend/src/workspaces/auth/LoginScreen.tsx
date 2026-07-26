import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/auth/AuthProvider';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

export default function LoginScreen() {
    const [step, setStep] = useState<'phone' | 'otp' | 'blocked'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiClient.post('/auth/request-otp', { phoneNumber: phone });
            toast.success(res.data.message || "OTP Sent!");
            setStep('otp');
        } catch (error) {
            // Error is handled by interceptor
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 4) {
            toast.error("Please enter the complete OTP");
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiClient.post('/auth/verify-otp', { phoneNumber: phone, otpCode: otp });
            const data = res.data.data;
            
            login(data.accessToken, data.refreshToken, {
                id: data.userId,
                displayName: data.displayName,
                role: data.role,
                workspace: data.workspace
            });
            
            toast.success("Welcome to Heaven4!");
            
            // Route based on workspace
            navigate(`/${data.workspace.toLowerCase()}`);
            
        } catch (error: any) {
            if (error?.response?.data?.message === 'ACCOUNT_BLOCKED') {
                setStep('blocked');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const [appealReason, setAppealReason] = useState('');
    const handleAppealSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await apiClient.post('/auth/unblock-request', { identifier: phone, reason: appealReason });
            toast.success("Appeal submitted successfully. We will review it shortly.");
            setStep('phone');
        } catch (e) {
            toast.error("Failed to submit appeal");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#030712] relative overflow-hidden">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-heaven-900/30 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md p-6">
                <div className="text-center mb-10">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md mb-6"
                    >
                        <ShieldCheck className="w-8 h-8 text-heaven-400" />
                    </motion.div>
                    <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="text-4xl font-bold text-white tracking-tight"
                    >
                        Heaven<span className="text-heaven-400">4</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-slate-400 mt-2 text-sm font-medium"
                    >
                        Intelligent Restaurant Operations
                    </motion.p>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.05] backdrop-blur-xl rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        {step === 'blocked' ? (
                            <motion.form 
                                key="blocked-form"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                onSubmit={handleAppealSubmit}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-3 mb-6">
                                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Account Blocked</h3>
                                    <p className="text-slate-400 text-sm">Your access to the platform has been restricted. You can submit an appeal to the administration.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reason for Appeal</label>
                                    <textarea
                                        value={appealReason}
                                        onChange={(e) => setAppealReason(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all h-24 resize-none"
                                        placeholder="Please explain why your account should be unblocked..."
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                                
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep('phone')}
                                        disabled={isLoading}
                                        className="flex-1 py-3 px-4 rounded-xl font-medium border border-white/10 text-white hover:bg-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || appealReason.length < 10}
                                        className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Appeal'}
                                    </button>
                                </div>
                            </motion.form>
                        ) : step === 'phone' ? (
                            <motion.form 
                                key="phone-form"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                onSubmit={handleRequestOtp}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-heaven-500/50 transition-all"
                                            placeholder="Enter your phone number"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={isLoading || phone.length < 5}
                                    className="w-full group relative flex items-center justify-center gap-2 bg-gradient-to-r from-heaven-600 to-indigo-600 hover:from-heaven-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                                        {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                    </span>
                                </button>

                                <div className="relative flex items-center py-2">
                                    <div className="flex-grow border-t border-white/10"></div>
                                    <span className="flex-shrink-0 mx-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">or</span>
                                    <div className="flex-grow border-t border-white/10"></div>
                                </div>

                                <button
                                    type="button"
                                    onClick={async () => {
                                        setIsLoading(true);
                                        try {
                                            // Mock Google login flow for demo
                                            const res = await apiClient.post('/auth/google', { token: "mock_google_token" });
                                            const data = res.data.data;
                                            
                                            // Show toast about phase 2
                                            toast.success("OAuth will be fully integrated before release. Simulating login...", { duration: 4000 });
                                            
                                            login(data.accessToken, data.refreshToken, {
                                                id: data.userId,
                                                displayName: data.displayName,
                                                role: data.role,
                                                workspace: data.workspace
                                            });
                                            navigate(`/${data.workspace.toLowerCase()}`);
                                        } catch (e: any) {
                                            if (e.response?.data?.error === 'ACCOUNT_BLOCKED') {
                                                setStep('blocked');
                                                toast.error(e.response.data.message || 'Account is blocked');
                                                return;
                                            }
                                            toast.error('Google Sign-In failed');
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                    Sign in with Google
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form 
                                key="otp-form"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                onSubmit={handleVerifyOtp}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                                        <span>Enter OTP</span>
                                        <button 
                                            type="button" 
                                            onClick={() => setStep('phone')}
                                            className="text-heaven-400 hover:text-heaven-300 capitalize text-xs"
                                        >
                                            Change Number
                                        </button>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            maxLength={4}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-center tracking-[1em] font-mono text-xl focus:outline-none focus:ring-2 focus:ring-heaven-500/50 transition-all"
                                            placeholder="••••"
                                            disabled={isLoading}
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 text-center mt-2">
                                        Demo OTP is always <strong className="text-slate-300">1234</strong>
                                    </p>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={isLoading || otp.length < 4}
                                    className="w-full group relative flex items-center justify-center gap-2 bg-gradient-to-r from-heaven-600 to-indigo-600 hover:from-heaven-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
                
                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-xs flex justify-center gap-4">
                        <a href="/staff-login" className="hover:text-white transition-colors">Staff Access</a>
                        <a href="/developer" className="hover:text-white transition-colors">Developer Portal</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
