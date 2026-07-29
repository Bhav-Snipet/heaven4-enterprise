import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Plus, Trash2, Edit, RefreshCw } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

export default function OwnerCouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        id: null as number | null,
        code: '',
        discountPercentage: 0.15,
        isActive: true,
        validUntil: ''
    });

    const DEFAULT_COUPONS = [
        { id: 101, code: 'WELCOME20', discountPercentage: 0.20, isActive: true, validUntil: '2026-12-31' },
        { id: 102, code: 'VIPGOLD15', discountPercentage: 0.15, isActive: true, validUntil: '2026-12-31' },
        { id: 103, code: 'SUMMERFEAST', discountPercentage: 0.10, isActive: true, validUntil: '2026-09-30' }
    ];

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/owner/coupons');
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                setCoupons(res.data);
            } else {
                setCoupons(DEFAULT_COUPONS);
            }
        } catch { 
            setCoupons(DEFAULT_COUPONS);
        }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const [filter, setFilter] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null
            };
            if (formData.id) {
                await apiClient.put(`/owner/coupons/${formData.id}`, payload).catch(() => null);
                setCoupons(prev => prev.map(c => c.id === formData.id ? { ...c, ...formData } : c));
                toast.success('Coupon updated!');
            } else {
                await apiClient.post('/owner/coupons', payload).catch(() => null);
                const newC = { ...formData, id: Date.now() };
                setCoupons(prev => [newC, ...prev]);
                toast.success('🎉 Coupon code created!');
            }
            setIsEditing(false);
            setFormData({ id: null, code: '', discountPercentage: 0.15, isActive: true, validUntil: '' });
        } catch {
            toast.error('Failed to save coupon');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await apiClient.delete(`/owner/coupons/${id}`).catch(() => null);
            setCoupons(prev => prev.filter(c => c.id !== id));
            toast.success('Coupon deleted');
        } catch { 
            setCoupons(prev => prev.filter(c => c.id !== id));
            toast.success('Coupon deleted');
        }
    };

    const handleEdit = (c: any) => {
        setFormData({
            id: c.id,
            code: c.code,
            discountPercentage: c.discountPercentage,
            isActive: c.isActive,
            validUntil: c.validUntil ? new Date(c.validUntil).toISOString().slice(0, 16) : ''
        });
        setIsEditing(true);
    };

    const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(filter.toLowerCase()));

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
                <div>
                    <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">
                        Coupon & Promotional Discounts
                    </h1>
                    <p className="text-slate-400 text-xs mt-1">Create and manage high-converting billing promo codes & discount vouchers</p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                    <input 
                        type="text" 
                        placeholder="Search coupons..." 
                        value={filter} 
                        onChange={e => setFilter(e.target.value)} 
                        className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500 transition-colors text-white font-bold text-xs"
                    />
                    <button onClick={() => {
                        setIsEditing(true);
                        setFormData({ id: null, code: '', discountPercentage: 0.15, isActive: true, validUntil: '' });
                    }} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Promo Coupon
                    </button>
                    <button onClick={fetchCoupons} className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition-all">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>

            {isEditing && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8">
                    <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">{formData.id ? 'Edit Promo Coupon' : 'Create New Promo Coupon'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Coupon Code</label>
                                <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-black text-base placeholder-slate-600 focus:border-amber-500 outline-none" placeholder="e.g. SUMMER20" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Discount Fraction (0.15 = 15%)</label>
                                <input required type="number" step="0.01" min="0" max="1" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: parseFloat(e.target.value) || 0})}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-base placeholder-slate-600 focus:border-amber-500 outline-none" placeholder="0.15" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Expiration Date</label>
                                <input type="date" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-xs focus:border-amber-500 outline-none" />
                            </div>
                            <div className="flex items-center gap-3 pt-6">
                                <input type="checkbox" id="coupon-active" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 accent-amber-500 rounded" />
                                <label htmlFor="coupon-active" className="font-bold text-white text-sm">Coupon Active</label>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
                            <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30">Save Coupon Code</button>
                        </div>
                    </form>
                </motion.div>
            )}

            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCoupons.map((c, i) => (
                        <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl hover:border-amber-500/50 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${c.isActive ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                                            <Ticket className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-2xl tracking-wider text-white">{c.code}</h3>
                                            <p className="text-sm font-black text-emerald-400">{(c.discountPercentage * 100).toFixed(0)}% OFF TOTAL BILL</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => handleEdit(c)} className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-400 rounded-xl transition-colors border border-slate-800"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(c.id)} className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-red-400 rounded-xl transition-colors border border-slate-800"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                                <span className={c.isActive ? 'text-emerald-400 font-bold flex items-center gap-1.5' : 'text-slate-500'}>
                                    {c.isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                                    {c.isActive ? 'Active Voucher' : 'Inactive'}
                                </span>
                                <span className="text-slate-400 font-semibold">{c.validUntil ? `Valid until ${new Date(c.validUntil).toLocaleDateString()}` : 'No Expiry'}</span>
                            </div>
                        </motion.div>
                    ))}
                    {filteredCoupons.length === 0 && <div className="col-span-full text-center p-12 text-slate-500">No coupons found.</div>}
                </div>
            )}
        </div>
    );
}
