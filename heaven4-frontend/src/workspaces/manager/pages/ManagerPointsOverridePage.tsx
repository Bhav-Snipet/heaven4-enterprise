import { useState } from 'react';
import { Search, Gift, ShieldAlert, CheckCircle2 } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

export default function EmployeePointsOverridePage() {
    const [searchId, setSearchId] = useState('');
    const [customer, setCustomer] = useState<any>(null);
    const [points, setPoints] = useState(0);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchId.trim()) return;
        setLoading(true);
        try {
            // Mocking user lookup for now
            const res = await apiClient.get('/admin/users');
            const found = res.data.find((u: any) => 
                u.phoneNumber === searchId
            );
            if (found) {
                setCustomer({ ...found, pointsBalance: 1250, tier: 'GOLD' }); // mock data
            } else {
                toast.error('Customer not found');
                setCustomer(null);
            }
        } catch (e) {
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOverride = async () => {
        if (!customer) return;
        if (!points) {
            toast.error('Enter points to add/deduct');
            return;
        }
        if (!reason.trim()) {
            toast.error('Reason is required for override');
            return;
        }

        try {
            // Since there's no backend endpoint yet, we just mock the success
            // In a real scenario we'd call an admin/override endpoint
            toast.success(`Successfully ${points > 0 ? 'added' : 'deducted'} ${Math.abs(points)} points`);
            setCustomer({ ...customer, pointsBalance: customer.pointsBalance + points });
            setPoints(0);
            setReason('');
        } catch (e) {
            toast.error('Override failed');
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Points Override</h1>
                <p className="text-slate-500 mt-1">Manual point adjustment for customer appeasement</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                <form onSubmit={handleSearch} className="flex gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Enter Customer Phone Number..."
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none font-semibold text-slate-900 dark:text-white transition-colors"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-2xl transition-colors">
                        {loading ? 'Searching...' : 'Find Customer'}
                    </button>
                </form>

                {customer && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{customer.displayName}</h2>
                                <p className="text-slate-500">ID: {customer.phoneNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">Current Balance</p>
                                <p className="text-3xl font-black text-blue-600 dark:text-blue-400 flex items-center gap-2 justify-end">
                                    {customer.pointsBalance} <Gift className="w-6 h-6" />
                                </p>
                                <span className="inline-block mt-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold text-xs rounded-full">
                                    {customer.tier} TIER
                                </span>
                            </div>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                            <h3 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-4">
                                <ShieldAlert className="w-5 h-5" /> Manager Override Panel
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Points Adjustment</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            value={points || ''}
                                            onChange={(e) => setPoints(Number(e.target.value))}
                                            placeholder="e.g. 500 or -200"
                                            className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-800 rounded-xl focus:border-red-500 outline-none font-bold text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <p className="text-xs text-red-500 mt-2">Use negative numbers to deduct points.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Override Reason (Required)</label>
                                    <input
                                        type="text"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="e.g. Compensation for delayed order"
                                        className="w-full p-4 bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-800 rounded-xl focus:border-red-500 outline-none text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleOverride}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Confirm Points Override
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
