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
        discountPercentage: 0,
        isActive: true,
        validUntil: ''
    });

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/owner/coupons');
            setCoupons(res.data);
        } catch { toast.error('Failed to load coupons'); }
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
                await apiClient.put(`/owner/coupons/${formData.id}`, payload);
                toast.success('Coupon updated');
            } else {
                await apiClient.post('/owner/coupons', payload);
                toast.success('Coupon created');
            }
            setIsEditing(false);
            setFormData({ id: null, code: '', discountPercentage: 0, isActive: true, validUntil: '' });
            fetchCoupons();
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed to save coupon');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await apiClient.delete(`/owner/coupons/${id}`);
            toast.success('Coupon deleted');
            fetchCoupons();
        } catch { toast.error('Failed to delete coupon'); }
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
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="flex flex-col md:flex-row md:items-center justify-between mb-8 p-6 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-lg">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-400 dark:from-amber-400 dark:to-amber-200">
                        Coupon Management
                    </h1>
                    <p className="text-slate-500 mt-1">Create and manage billing discount codes</p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                    <input 
                        type="text" 
                        placeholder="Search coupons..." 
                        value={filter} 
                        onChange={e => setFilter(e.target.value)} 
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-amber-500 transition-colors text-slate-900 dark:text-white"
                    />
                    <button onClick={() => {
                        setIsEditing(true);
                        setFormData({ id: null, code: '', discountPercentage: 0, isActive: true, validUntil: '' });
                    }} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2">
                        <Plus className="w-5 h-5" /> New Coupon
                    </button>
                    <button onClick={fetchCoupons} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

            {isEditing && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{formData.id ? 'Edit Coupon' : 'Create New Coupon'}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Code</label>
                                <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400" placeholder="e.g. SUMMER10" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Discount %</label>
                                <input required type="number" step="0.01" min="0" max="1" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: parseFloat(e.target.value)})}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400" placeholder="e.g. 0.1 for 10%" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Valid Until</label>
                                <input type="datetime-local" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
                            </div>
                            <div className="flex items-center gap-3 pt-8">
                                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5" />
                                <label className="font-semibold text-slate-900 dark:text-white">Active</label>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20">Save Coupon</button>
                        </div>
                    </form>
                </motion.div>
            )}

            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCoupons.map((c, i) => (
                        <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                            className="bg-white/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 backdrop-blur-xl rounded-2xl p-5 shadow-sm hover:border-amber-500 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.isActive ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                                        <Ticket className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl tracking-wider text-slate-900 dark:text-white">{c.code}</h3>
                                        <p className="text-sm font-bold text-amber-600">{(c.discountPercentage * 100).toFixed(0)}% OFF</p>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={() => handleEdit(c)} className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 dark:bg-slate-700 dark:hover:bg-blue-900/40 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(c.id)} className="p-2 bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 dark:bg-slate-700 dark:hover:bg-red-900/40 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm">
                                <span className={c.isActive ? 'text-green-500 font-bold' : 'text-slate-400'}>{c.isActive ? 'Active' : 'Inactive'}</span>
                                <span className="text-slate-500">{c.validUntil ? `Until ${new Date(c.validUntil).toLocaleDateString()}` : 'No expiry'}</span>
                            </div>
                        </motion.div>
                    ))}
                    {filteredCoupons.length === 0 && <div className="col-span-full text-center p-12 text-slate-500">No coupons found.</div>}
                </div>
            )}
        </div>
    );
}
