import { useState, useEffect } from 'react';
import { Award, Crown, Zap, ChevronRight, Star, Shield, TrendingUp } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthProvider';

export default function CustomerMembershipPage() {
    const { user } = useAuth();
    const [tier, setTier] = useState('BRONZE');
    const [points, setPoints] = useState(0);

    // Mock initial fetch
    useEffect(() => {
        // In a real implementation this would fetch from /membership/status
        const timer = setTimeout(() => {
            setTier('SILVER');
            setPoints(1250);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const nextTier = tier === 'BRONZE' ? 'SILVER' : tier === 'SILVER' ? 'GOLD' : 'PLATINUM';
    const nextTierThreshold = tier === 'BRONZE' ? 1000 : tier === 'SILVER' ? 3000 : 10000;
    const progress = Math.min((points / nextTierThreshold) * 100, 100);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white pb-24">
            {/* Header section with modern gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-b-3xl shadow-lg relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-1">Heaven4 VIP</h1>
                    <p className="text-blue-100 mb-6">Welcome back, {user?.displayName || 'Guest'}!</p>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-blue-100 text-sm font-medium mb-1">Current Tier</p>
                                <div className="flex items-center gap-2">
                                    <Crown className="w-6 h-6 text-yellow-300" />
                                    <span className="text-2xl font-bold tracking-wider">{tier}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-100 text-sm font-medium mb-1">Total Points</p>
                                <p className="text-3xl font-black">{points.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium text-blue-100">
                                <span>{points} pts</span>
                                <span>{nextTierThreshold} pts to {nextTier}</span>
                            </div>
                            <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6 space-y-6">
                
                {/* Upgrade Option */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Upgrade Membership</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Unlock Gold instantly for $49.99/mo</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>

                {/* Benefits List */}
                <div>
                    <h2 className="text-xl font-bold mb-4 px-1">Your Benefits</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">1.5x Points</p>
                                <p className="text-xs text-slate-500">On every order</p>
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Free Drink</p>
                                <p className="text-xs text-slate-500">Every 5 visits</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center">
                                <Star className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Priority</p>
                                <p className="text-xs text-slate-500">Fast-track orders</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 flex items-center justify-center">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">VIP Events</p>
                                <p className="text-xs text-slate-500">Exclusive invites</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
