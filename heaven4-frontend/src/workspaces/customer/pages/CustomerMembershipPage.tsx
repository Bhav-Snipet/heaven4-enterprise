import { useState, useEffect } from 'react';
import { Crown, Zap, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthProvider';
import apiClient from '../../../core/api/client';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CustomerMembershipPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tier, setTier] = useState('BRONZE');
    const [points, setPoints] = useState(0);
    const [history, setHistory] = useState<any[]>([]);
    const [isUpgrading, setIsUpgrading] = useState(false);

    useEffect(() => {
        const fetchMembership = async () => {
            try {
                const res = await apiClient.get('/rewards/profile');
                if (res.data) {
                    setTier(res.data.tier || 'BRONZE');
                    setPoints(res.data.pointsBalance || 0);
                }
            } catch (e) {
                console.error('Failed to fetch membership data', e);
            }
        };
        const fetchHistory = async () => {
            try {
                const res = await apiClient.get('/rewards/history');
                setHistory(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                console.error('Failed to fetch points history', e);
                setHistory([]);
            }
        };
        fetchMembership();
        fetchHistory();
    }, []);

    const handleUpgrade = async () => {
        if (isUpgrading) return;
        setIsUpgrading(true);
        try {
            const res = await apiClient.post('/rewards/upgrade');
            if (res.data) {
                setTier(res.data.tier || 'SILVER');
                setPoints(res.data.pointsBalance || 0);
                toast.success(res.data.message || '🎉 Upgraded to VIP tier successfully!');
            }
        } catch (e) {
            console.error('Failed to upgrade', e);
            toast.error('Failed to upgrade membership. Please try again.');
        } finally {
            setIsUpgrading(false);
        }
    };

    const nextTier = tier === 'BRONZE' ? 'SILVER' : tier === 'SILVER' ? 'GOLD' : 'PLATINUM';
    const nextTierThreshold = tier === 'BRONZE' ? 1000 : tier === 'SILVER' ? 3000 : 10000;
    const progress = Math.min((points / nextTierThreshold) * 100, 100);

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-24">
            {/* Header section */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 text-white p-6 rounded-b-3xl shadow-xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                    <button onClick={() => navigate(-1)} className="p-2 mb-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-3xl font-bold mb-1">Heaven4 VIP Rewards</h1>
                    <p className="text-blue-200 mb-6">Welcome back, {user?.displayName || 'Valued Customer'}!</p>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-blue-200 text-sm font-medium mb-1">Current Tier</p>
                                <div className="flex items-center gap-2">
                                    <Crown className="w-6 h-6 text-amber-400" />
                                    <span className="text-2xl font-black tracking-wider text-amber-300">{tier}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-200 text-sm font-medium mb-1">Total Points</p>
                                <p className="text-3xl font-black text-white">{points.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-blue-200">
                                <span>{points} pts</span>
                                <span>{nextTierThreshold} pts to {nextTier}</span>
                            </div>
                            <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6 space-y-6">
                
                {/* Upgrade Option */}
                <div onClick={handleUpgrade}
                    className={`bg-slate-900 rounded-2xl p-5 border ${isUpgrading ? 'border-amber-500 opacity-75' : 'border-slate-800 hover:border-amber-500 cursor-pointer'} flex items-center justify-between transition-colors group shadow-lg`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                            {isUpgrading ? <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /> : <Zap className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">Upgrade Membership Tier</h3>
                            <p className="text-sm text-slate-400">Unlock {nextTier} tier benefits & instant bonus points</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                </div>

                {/* Benefits List */}
                <div>
                    <h2 className="text-xl font-bold mb-4 px-1 text-white">Tier Benefits</h2>
                    <div className="space-y-4">
                        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex gap-4 items-start shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                <Crown className="w-6 h-6 text-slate-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-200">Silver Tier (Default)</h4>
                                <p className="text-sm text-slate-400 mt-1">Earn 10 points per $1 spent on all orders.</p>
                            </div>
                        </div>
                        <div className="bg-slate-900 rounded-2xl p-5 border border-amber-500/30 flex gap-4 items-start relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                <Crown className="w-6 h-6 text-amber-400" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="font-bold text-lg text-amber-400">Gold Tier</h4>
                                <p className="text-sm text-slate-400 mt-1">5% discount on all items & gold badge on your orders.</p>
                            </div>
                        </div>
                        <div className="bg-slate-900 rounded-2xl p-5 border border-indigo-500/30 flex gap-4 items-start relative overflow-hidden shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                                <Crown className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="font-bold text-lg text-indigo-400">Diamond Tier</h4>
                                <p className="text-sm text-slate-400 mt-1">15% discount, priority kitchen routing & glowing badge.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Points History */}
                <div>
                    <h2 className="text-xl font-bold mb-4 px-1 text-white">Points History</h2>
                    {history.length === 0 ? (
                        <p className="text-slate-500 text-sm px-1">No points transactions recorded yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {history.map((tx: any, idx: number) => (
                                <div key={idx} className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex justify-between items-center shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                                            (tx.pointsChange || 0) > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            {(tx.pointsChange || 0) > 0 ? '+' : ''}{tx.pointsChange || 0}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-200">{tx.reason || 'Points Activity'}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'Recent'}
                                            </p>
                                        </div>
                                    </div>
                                    {tx.invoice && (
                                        <div className="text-right text-sm">
                                            <span className="text-slate-500 text-xs">Order</span>
                                            <p className="font-bold text-slate-300">#{tx.invoice.id}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
