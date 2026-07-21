import { useState, useEffect } from 'react';
import { DollarSign, Check, X, Search, FileText, User } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

interface Staff {
    id: number;
    displayName: string;
    phoneNumber: string;
}

interface PayrollRecord {
    id: number;
    periodStart: string;
    periodEnd: string;
    baseSalary: number;
    bonusAmount: number;
    deductions: number;
    netPay: number;
    status: string;
    paidAt?: string;
    reason?: string;
    user: Staff;
}

export default function OwnerPayrollPage() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    // Form states
    const [baseSalary, setBaseSalary] = useState('2000');
    const [bonus, setBonus] = useState('0');
    const [deductions, setDeductions] = useState('0');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [staffRes, payrollRes] = await Promise.all([
                apiClient.get('/admin/users'),
                apiClient.get('/owner/payroll')
            ]);
            
            const staffMembers = staffRes.data.filter((u: any) => 
                u.roles.some((r: any) => ['EMPLOYEE', 'KITCHEN', 'MANAGER'].includes(r.role))
            );
            
            setStaffList(staffMembers);
            setPayrolls(payrollRes.data);
        } catch (e) {
            toast.error('Failed to load payroll data');
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handlePay = async () => {
        if (!selectedStaff) return;
        setLoading(true);
        try {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

            const reqBody = {
                userId: selectedStaff.id,
                periodStart: firstDay,
                periodEnd: lastDay,
                baseSalary: Number(baseSalary),
                bonusAmount: Number(bonus),
                deductions: Number(deductions),
                reason: reason
            };
            
            const res = await apiClient.post('/owner/payroll', reqBody);
            
            // Mark as paid immediately since owner is registering it as paid
            await apiClient.put(`/owner/payroll/${res.data.id}/pay`, reqBody);
            
            toast.success('Salary payment registered successfully!');
            setShowModal(false);
            fetchData();
        } catch (e) {
            toast.error('Failed to process payment');
        } finally {
            setLoading(false);
        }
    };

    const filteredPayrolls = payrolls.filter(p => 
        p.user?.displayName?.toLowerCase().includes(search.toLowerCase()) || 
        p.reason?.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => new Date(b.paidAt || 0).getTime() - new Date(a.paidAt || 0).getTime());

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payroll & HR</h1>
                    <p className="text-slate-500">Manage employee salaries, bonuses, and deductions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Staff List for Quick Pay */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto max-h-[600px]">
                    <h2 className="font-bold text-lg mb-4">Pay Staff</h2>
                    <div className="space-y-3">
                        {staffList.map(staff => (
                            <div key={staff.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <User className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{staff.displayName}</p>
                                        <p className="text-xs text-slate-500">{staff.phoneNumber}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        setSelectedStaff(staff);
                                        setBaseSalary('2000');
                                        setBonus('0');
                                        setDeductions('0');
                                        setReason('');
                                        setShowModal(true);
                                    }}
                                    className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                                >
                                    <DollarSign className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payroll History */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg">Payment History</h2>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search records..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="p-3">Staff</th>
                                    <th className="p-3">Amount</th>
                                    <th className="p-3">Date Paid</th>
                                    <th className="p-3">Reason / Note</th>
                                    <th className="p-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayrolls.map(p => (
                                    <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                                        <td className="p-3">
                                            <p className="font-medium text-slate-900 dark:text-white">{p.user?.displayName}</p>
                                        </td>
                                        <td className="p-3">
                                            <p className="font-bold text-emerald-600 dark:text-emerald-400">${p.netPay.toFixed(2)}</p>
                                            {(p.bonusAmount > 0 || p.deductions > 0) && (
                                                <p className="text-[10px] text-slate-500">
                                                    Base: ${p.baseSalary} 
                                                    {p.bonusAmount > 0 ? ` + Bonus: $${p.bonusAmount}` : ''}
                                                    {p.deductions > 0 ? ` - Deduct: $${p.deductions}` : ''}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                                            {p.paidAt ? new Date(p.paidAt).toLocaleString() : '-'}
                                        </td>
                                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                                            {p.reason || '-'}
                                        </td>
                                        <td className="p-3 text-right">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                <Check className="w-3 h-3" /> Paid
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPayrolls.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500">
                                            No payroll records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showModal && selectedStaff && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Process Salary: {selectedStaff.displayName}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Base Salary ($)</label>
                                <input type="number" value={baseSalary} onChange={e => setBaseSalary(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:border-blue-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">Bonus ($)</label>
                                    <input type="number" value={bonus} onChange={e => setBonus(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/50 rounded-xl px-4 py-2 outline-none focus:border-emerald-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-1">Deductions ($)</label>
                                    <input type="number" value={deductions} onChange={e => setDeductions(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-2 outline-none focus:border-red-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason / Note</label>
                                <textarea 
                                    value={reason} 
                                    onChange={e => setReason(e.target.value)} 
                                    placeholder="e.g. Extra performance, damager charges..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none focus:border-blue-500 min-h-[80px] resize-none" 
                                />
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex justify-between items-center mt-6">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Net Pay:</span>
                                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                    ${(Number(baseSalary) + Number(bonus) - Number(deductions)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl font-medium">Cancel</button>
                            <button onClick={handlePay} disabled={loading} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2">
                                <Check className="w-4 h-4" /> Mark as Paid
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
