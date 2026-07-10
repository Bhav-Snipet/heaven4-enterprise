import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/core/auth/AuthProvider';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

export default function LoginScreen() {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
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
            
        } catch (error) {
            // Handled by interceptor
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
                        {step === 'phone' ? (
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
            </div>
        </div>
    );
}
