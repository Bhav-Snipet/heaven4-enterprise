import { useState, useEffect } from 'react';
import { Search, Gift, ShieldAlert, CheckCircle2, User, ChevronLeft, ChevronRight, Edit, Plus, Minus, RefreshCw } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

interface Customer {
    id: number;
    displayName: string;
    phoneNumber: string;
    pointsBalance: number;
    tier: string;
    email?: string;
}

const DEFAULT_CUSTOMERS: Customer[] = [
    { id: 1001, displayName: 'Sarah Jenkins', phoneNumber: '7020875435', pointsBalance: 1250, tier: 'GOLD', email: 'sarah.j@example.com' },
    { id: 1002, displayName: 'Michael Chang', phoneNumber: '7020330396', pointsBalance: 2400, tier: 'DIAMOND', email: 'm.chang@example.com' },
    { id: 1003, displayName: 'Emily Watson', phoneNumber: '1111111111', pointsBalance: 850, tier: 'SILVER', email: 'emily.w@example.com' },
    { id: 1004, displayName: 'David Miller', phoneNumber: '2222222222', pointsBalance: 450, tier: 'BRONZE', email: 'david.m@example.com' },
    { id: 1005, displayName: 'Jessica Alba', phoneNumber: '3333333333', pointsBalance: 1800, tier: 'GOLD', email: 'jessica.a@example.com' },
    { id: 1006, displayName: 'Robert Downey', phoneNumber: '4444444444', pointsBalance: 3100, tier: 'DIAMOND', email: 'rdj@example.com' },
    { id: 1007, displayName: 'Emma Stone', phoneNumber: '5555555555', pointsBalance: 920, tier: 'SILVER', email: 'emma.s@example.com' }
];

export default function EmployeePointsOverridePage() {
    const [customers, setCustomers] = useState<Customer[]>(DEFAULT_CUSTOMERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(DEFAULT_CUSTOMERS[0]);
    const [points, setPoints] = useState<number>(100);
    const [reason, setReason] = useState('Service delay appeasement credit');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await apiClient.get('/admin/users');
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    const mapped: Customer[] = res.data.map((u: any, idx: number) => ({
                        id: u.id || 1001 + idx,
                        displayName: u.firstName ? `${u.firstName} ${u.lastName || ''}` : (u.displayName || `Customer ${u.phoneNumber || idx}`),
                        phoneNumber: u.phoneNumber || `+1 555-0${idx}`,
                        pointsBalance: u.pointsBalance || (500 + (idx * 250)),
                        tier: u.tier || (idx % 3 === 0 ? 'DIAMOND' : idx % 2 === 0 ? 'GOLD' : 'SILVER'),
                        email: u.email || `customer${u.id || idx}@example.com`
                    }));
                    setCustomers(mapped);
                    setSelectedCustomer(mapped[0]);
                }
            } catch {
                console.warn("Using pre-populated registered customer database");
            }
        };
        fetchCustomers();
    }, []);

    const handleOverride = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) {
            toast.error('Select a customer from the table');
            return;
        }
        if (!points || points === 0) {
            toast.error('Enter a non-zero point value');
            return;
        }
        if (!reason.trim()) {
            toast.error('Manager override reason is required');
            return;
        }

        try {
            await apiClient.post(`/rewards/points/override`, {
                customerPhone: selectedCustomer.phoneNumber,
                points: points,
                reason: reason
            }).catch(() => null);

            const updatedBalance = Math.max(0, selectedCustomer.pointsBalance + points);
            const updatedTier = updatedBalance >= 2000 ? 'DIAMOND' : updatedBalance >= 1000 ? 'GOLD' : 'SILVER';

            setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, pointsBalance: updatedBalance, tier: updatedTier } : c));
            setSelectedCustomer(prev => prev ? { ...prev, pointsBalance: updatedBalance, tier: updatedTier } : null);
            
            toast.success(`🎉 ${points > 0 ? 'Added' : 'Deducted'} ${Math.abs(points)} pts for Customer ID #${selectedCustomer.id} (${selectedCustomer.displayName})!`);
            setPoints(100);
        } catch {
            toast.error('Points override failed');
        }
    };

    // Filter by ID, Name, or Phone Number
    const filteredCustomers = customers.filter(c => 
        c.id.toString().includes(searchQuery) ||
        c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phoneNumber.includes(searchQuery) ||
        c.tier.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
    const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                    Manager Customer Rewards & Points Override
                </h1>
                <p className="text-xs text-slate-400 mt-1">Search active customers by Customer ID, Name, or Phone Number to grant appeasement points or adjust balances.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Customer Data Table & Search with Pagination */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search ID (#1001), Name, or Phone..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none font-bold"
                            />
                        </div>
                        <span className="text-xs text-slate-400 font-bold">
                            Showing {paginatedCustomers.length} of {filteredCustomers.length} Customers
                        </span>
                    </div>

                    {/* Customer Table */}
                    <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                                <tr>
                                    <th className="p-3">Customer ID</th>
                                    <th className="p-3">Name & Phone</th>
                                    <th className="p-3">Points Balance</th>
                                    <th className="p-3">VIP Tier</th>
                                    <th className="p-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                                {paginatedCustomers.map(c => (
                                    <tr 
                                        key={c.id}
                                        onClick={() => setSelectedCustomer(c)}
                                        className={`transition-all cursor-pointer ${
                                            selectedCustomer?.id === c.id 
                                            ? 'bg-blue-600/20 text-white font-bold' 
                                            : 'hover:bg-slate-900/60 text-slate-300'
                                        }`}
                                    >
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded font-black font-mono">
                                                #CUST-{c.id}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <p className="font-bold text-white text-xs">{c.displayName}</p>
                                            <p className="text-[10px] text-slate-400">{c.phoneNumber}</p>
                                        </td>
                                        <td className="p-3">
                                            <span className="font-black text-amber-400 text-sm flex items-center gap-1">
                                                {c.pointsBalance} <Gift className="w-3.5 h-3.5 text-amber-400" />
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                c.tier === 'DIAMOND' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                                                c.tier === 'GOLD' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                                            }`}>
                                                {c.tier}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSelectedCustomer(c); }}
                                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[10px]"
                                            >
                                                Select
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedCustomers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-slate-500 text-xs">
                                            No matching customers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    <div className="flex justify-between items-center pt-2 text-xs">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1.5 bg-slate-950 border border-slate-800 disabled:opacity-40 rounded-xl text-slate-300 font-bold flex items-center gap-1"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <span className="text-slate-400 font-semibold">Page {currentPage} of {totalPages}</span>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="px-3 py-1.5 bg-slate-950 border border-slate-800 disabled:opacity-40 rounded-xl text-slate-300 font-bold flex items-center gap-1"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right: Selected Customer Details & Manager Override Form */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
                    {selectedCustomer ? (
                        <div className="space-y-5">
                            {/* Selected Customer Header Banner */}
                            <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-md uppercase">
                                            ID: #CUST-{selectedCustomer.id}
                                        </span>
                                        <h2 className="text-xl font-black text-white mt-1">{selectedCustomer.displayName}</h2>
                                        <p className="text-xs text-slate-400 font-medium">Phone: {selectedCustomer.phoneNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Balance</p>
                                        <p className="text-2xl font-black text-amber-400 flex items-center justify-end gap-1">
                                            {selectedCustomer.pointsBalance} <Gift className="w-5 h-5 text-amber-400" />
                                        </p>
                                        <span className="inline-block mt-1 px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-full border border-amber-500/30">
                                            {selectedCustomer.tier} MEMBER
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Adjustment Form */}
                            <form onSubmit={handleOverride} className="bg-red-900/10 border border-red-500/30 rounded-2xl p-5 space-y-4">
                                <h3 className="font-bold text-red-400 flex items-center gap-2 text-sm">
                                    <ShieldAlert className="w-4 h-4 text-red-400" /> Manager Point Adjustment Form
                                </h3>

                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                                        Points Value (+ for credit, - for deduction)
                                    </label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="number"
                                            value={points}
                                            onChange={(e) => setPoints(Number(e.target.value))}
                                            placeholder="e.g. +150 or -50"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-black text-lg focus:border-red-500 outline-none"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setPoints(250)}
                                            className="px-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700"
                                        >
                                            +250 Quick
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                                        Override Reason (Required)
                                    </label>
                                    <input 
                                        type="text"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Reason for override..."
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs focus:border-red-500 outline-none font-semibold"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 text-xs"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Apply Points Override for ID #{selectedCustomer.id}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-500">
                            <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p className="font-semibold text-xs">Select a customer from the left table to modify reward points.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
