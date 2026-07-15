import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, CreditCard, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/core/api/client';

export default function ManagerFinancePage() {
    const navigate = useNavigate();
    const [financeData, setFinanceData] = useState<{
        totalRevenue: number;
        totalTips: number;
        averageOrderValue: number;
        totalOrders: number;
    } | null>(null);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFinance = async () => {
            try {
                const res = await apiClient.get('/manager/finance/daily-summary');
                setFinanceData(res.data);
            } catch (error: any) {
                console.error("Failed to load finance data", error);
                if (error.response && error.response.status === 403) {
                    setError("Access Denied: Only managers can view financial data.");
                } else {
                    setError("Failed to load financial data. Please try again later.");
                }
            }
        };
        fetchFinance();
    }, []);

    if (error) {
        return (
            <div className="p-8 flex flex-col justify-center items-center h-full text-center">
                <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">Error</h2>
                <p className="text-slate-500 mb-6">{error}</p>
                <button onClick={() => navigate(-1)} className="px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full font-bold transition-colors">
                    Go Back
                </button>
            </div>
        );
    }

    if (!financeData) {
        return <div className="p-8 flex justify-center items-center h-full">Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </button>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Daily Financials</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-500">Gross Revenue</h3>
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white">
                        ${financeData.totalRevenue.toFixed(2)}
                    </div>
                    <p className="text-sm text-emerald-500 mt-2 font-medium flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> +14.5% vs yesterday
                    </p>
                </div>

                {/* Total Tips */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-500">Total Tips Collected</h3>
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white">
                        ${financeData.totalTips.toFixed(2)}
                    </div>
                    <p className="text-sm text-slate-400 mt-2">Available for payout pool</p>
                </div>

                {/* Avg Order Value */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-500">Average Order Value</h3>
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white">
                        ${financeData.averageOrderValue.toFixed(2)}
                    </div>
                    <p className="text-sm text-purple-500 mt-2 font-medium">Trending higher</p>
                </div>
                
                {/* Total Orders */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-500">Total Orders</h3>
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white">
                        {financeData.totalOrders}
                    </div>
                    <p className="text-sm text-slate-400 mt-2">Completed today</p>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-96 flex items-center justify-center text-slate-400">
                [Revenue Chart Visualization - Placeholder for next phase]
            </div>
        </div>
    );
}
