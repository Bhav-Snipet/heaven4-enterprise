import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Gift, Star, ShoppingBag, Clock } from 'lucide-react';
import apiClient from '@/core/api/client';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function CustomerRewardsPage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<{ pointsBalance: number, tier: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [rewardHistory, setRewardHistory] = useState<{ item: string; points: number; time: string }[]>([]);

    useEffect(() => {
        const hist = JSON.parse(localStorage.getItem('rewardHistory') || '[]');
        setRewardHistory(hist);
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await apiClient.get('/rewards/profile');
                setProfile(res.data);
            } catch (error: any) {
                console.error("Failed to load rewards profile", error);
                if (error.response && error.response.status === 403) {
                    setError("Access Denied: Only customers can view rewards.");
                } else {
                    setError("Failed to load rewards. Please try again later.");
                }
            }
        };
        fetchProfile();
    }, []);

    const getProgress = () => {
        if (!profile) return 0;
        if (profile.tier === 'BRONZE') return Math.min(100, (profile.pointsBalance / 3000) * 100);
        if (profile.tier === 'SILVER') return Math.min(100, (profile.pointsBalance / 10000) * 100);
        return 100;
    };

    const getNextTier = () => {
        if (!profile) return 'SILVER';
        if (profile.tier === 'BRONZE') return 'SILVER';
        if (profile.tier === 'SILVER') return 'GOLD';
        return 'MAX';
    };

    const { addToCart } = useCart();

    const redeemReward = (itemName: string, pointsCost: number) => {
        if (!profile || profile.pointsBalance < pointsCost) {
            toast.error("Not enough points for this reward.");
            return;
        }
        const newBalance = profile.pointsBalance - pointsCost;
        setProfile({ ...profile, pointsBalance: newBalance });
        
        // Add reward item to cart with isReward flag — this is filtered from backend order payload
        addToCart({
            menuItemId: -(Date.now()), // Negative ID to avoid collision with real items
            name: `🎁 Free ${itemName}`,
            price: 0.00,
            quantity: 1,
            isReward: true
        });

        // Save redemption history to localStorage
        const history = JSON.parse(localStorage.getItem('rewardHistory') || '[]');
        history.unshift({ item: itemName, points: pointsCost, time: new Date().toISOString() });
        localStorage.setItem('rewardHistory', JSON.stringify(history.slice(0, 20)));
        
        toast.success(`🎉 Redeemed ${itemName}! Added to your cart for FREE.`);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="text-red-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Error</h2>
                <p className="text-slate-400 mb-6">{error}</p>
                <button onClick={() => navigate(-1)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold transition-colors">
                    Go Back
                </button>
            </div>
        );
    }

    if (!profile) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-slate-900/50 backdrop-blur-md p-4 flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Heaven Rewards</h1>
            </div>

            <div className="p-6">
                {/* Points Card */}
                <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl mb-8">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
                            <Star className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-slate-300 font-medium mb-1">Available Points</h2>
                        <div className="text-6xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
                            {profile.pointsBalance}
                        </div>
                        <div className="px-4 py-1.5 bg-white/10 rounded-full text-sm font-semibold tracking-wider text-blue-200">
                            {profile.tier} MEMBER
                        </div>
                    </div>
                </div>

                {/* Progress to Next Tier */}
                {profile.tier !== 'GOLD' && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                        <div className="flex justify-between text-sm font-semibold mb-3">
                            <span className="text-slate-400">Progress to {getNextTier()}</span>
                            <span className="text-blue-400">{Math.round(getProgress())}%</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${getProgress()}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 text-center">
                            Keep ordering to unlock {getNextTier()} tier benefits!
                        </p>
                    </div>
                )}

                {/* Benefits */}
                <h3 className="text-xl font-bold mb-4">Your Benefits</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3">
                            <Gift className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h4 className="font-semibold text-sm mb-1">Free Item</h4>
                        <p className="text-xs text-slate-400">Every 1000 pts</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mb-3">
                            <Award className="w-6 h-6 text-pink-400" />
                        </div>
                        <h4 className="font-semibold text-sm mb-1">Tier Bonus</h4>
                        <p className="text-xs text-slate-400">Extra points</p>
                    </div>
                </div>
                
                {/* Rewards Catalog */}
                <h3 className="text-xl font-bold mt-8 mb-4">Rewards Catalog</h3>
                <div className="space-y-4">
                    {/* Item 1 */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                                🍟
                            </div>
                            <div>
                                <h4 className="font-bold">Free Classic Fries</h4>
                                <p className="text-sm text-slate-400">500 pts</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => redeemReward("Classic Fries", 500)}
                            disabled={profile.pointsBalance < 500}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                profile.pointsBalance >= 500 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            Redeem
                        </button>
                    </div>

                    {/* Item 2 */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                🍔
                            </div>
                            <div>
                                <h4 className="font-bold">Free Signature Burger</h4>
                                <p className="text-sm text-slate-400">1500 pts</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => redeemReward("Signature Burger", 1500)}
                            disabled={profile.pointsBalance < 1500}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                profile.pointsBalance >= 1500 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            Redeem
                        </button>
                    </div>

                    {/* Item 3 */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                                🥤
                            </div>
                            <div>
                                <h4 className="font-bold">Free Milkshake</h4>
                                <p className="text-sm text-slate-400">800 pts</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => redeemReward("Milkshake", 800)}
                            disabled={profile.pointsBalance < 800}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                profile.pointsBalance >= 800 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            Redeem
                        </button>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/customer/cart')}
                    className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/10"
                >
                    <ShoppingBag className="w-5 h-5" /> Go to Cart
                </button>

                {/* Redemption History */}
                {rewardHistory.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-400" /> Redemption History
                        </h3>
                        <div className="space-y-2">
                            {rewardHistory.map((h, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm">{h.item}</p>
                                        <p className="text-xs text-slate-400">{new Date(h.time).toLocaleString()}</p>
                                    </div>
                                    <span className="text-red-400 font-bold text-sm">-{h.points} pts</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
