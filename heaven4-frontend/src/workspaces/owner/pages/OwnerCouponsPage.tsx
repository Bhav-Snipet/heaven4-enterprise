import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Plus, Trash2, Edit, RefreshCw, History, ChevronDown, ChevronUp, User, Clock, DollarSign, BarChart2, ShieldAlert, Sparkles, Tag } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface CouponUsage {
    id: string;
    couponCode: string;
    userName: string;
    userPhone?: string;
    orderId?: number;
    orderTotal: number;
    discountAmount: number;
    usedAt: string;
}

export interface Coupon {
    id: number;
    code: string;
    discountPercentage: number;
    isActive: boolean;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    usageLimitPerCustomer?: number;
    totalUsageLimit?: number;
    validUntil?: string;
    description?: string;
}

// ── Storage Keys ───────────────────────────────────────────────────────────────
export const USAGE_STORAGE_KEY = 'heaven4_coupon_usage';
export const MASTER_COUPONS_KEY = 'heaven4_master_coupons';

export const DEFAULT_COUPONS: Coupon[] = [
    {
        id: 101,
        code: 'WELCOME20',
        discountPercentage: 0.20,
        isActive: true,
        minOrderAmount: 25.00,
        maxDiscountAmount: 20.00,
        usageLimitPerCustomer: 1,
        totalUsageLimit: 500,
        validUntil: '2026-12-31',
        description: 'Welcome 20% off for diners on orders above $25 (Max $20 discount)'
    },
    {
        id: 102,
        code: 'VIPGOLD15',
        discountPercentage: 0.15,
        isActive: true,
        minOrderAmount: 40.00,
        maxDiscountAmount: 35.00,
        usageLimitPerCustomer: 2,
        totalUsageLimit: 250,
        validUntil: '2026-12-31',
        description: 'VIP Gold members: 15% off orders above $40 (Up to 2 redemptions)'
    },
    {
        id: 103,
        code: 'HEAVEN10',
        discountPercentage: 0.10,
        isActive: true,
        minOrderAmount: 15.00,
        maxDiscountAmount: 15.00,
        usageLimitPerCustomer: 3,
        totalUsageLimit: 1000,
        validUntil: '2026-12-31',
        description: 'Heaven Lounge 10% off on all regular dining above $15'
    },
    {
        id: 104,
        code: 'SUMMERFEAST',
        discountPercentage: 0.15,
        isActive: true,
        minOrderAmount: 50.00,
        maxDiscountAmount: 25.00,
        usageLimitPerCustomer: 1,
        totalUsageLimit: 100,
        validUntil: '2026-11-30',
        description: 'Summer feast special: 15% off large dining table orders above $50'
    },
    {
        id: 105,
        code: 'FLASH25',
        discountPercentage: 0.25,
        isActive: false,
        minOrderAmount: 60.00,
        maxDiscountAmount: 30.00,
        usageLimitPerCustomer: 1,
        totalUsageLimit: 50,
        validUntil: '2026-08-31',
        description: 'Flash weekend 25% off culinary feasts above $60'
    },
];

export function loadMasterCoupons(): Coupon[] {
    try {
        const raw = localStorage.getItem(MASTER_COUPONS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch { /* proceed */ }
    return DEFAULT_COUPONS;
}

export function saveMasterCoupons(coupons: Coupon[]): void {
    try {
        localStorage.setItem(MASTER_COUPONS_KEY, JSON.stringify(coupons));
        window.dispatchEvent(new CustomEvent('heaven4-coupons-updated', { detail: coupons }));
    } catch { /* noop */ }
}

export function loadUsageHistory(): CouponUsage[] {
    try {
        const raw = localStorage.getItem(USAGE_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

export function saveUsageHistory(history: CouponUsage[]): void {
    try {
        localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(history));
    } catch { /* noop */ }
}

// Seed some demo usage history if none exists
function seedDemoHistory(coupons: Coupon[]): CouponUsage[] {
    if (!coupons.length) return [];
    const existing = loadUsageHistory();
    if (existing.length > 0) return existing;

    const names = ['Michael Chang', 'Sarah Jenkins', 'Emily Watson', 'Alex Rivera', 'David Kim', 'Elena Rostova', 'Marcus Vance', 'Chloe Bennett'];
    const phones = ['+1 (555) 234-5678', '+1 (555) 345-6789', '+1 (555) 456-7890', '+1 (555) 567-8901', '+1 (555) 678-9012'];
    const now = Date.now();

    const demo: CouponUsage[] = [];
    coupons.forEach((c, ci) => {
        const uses = 2 + ci * 2;
        for (let i = 0; i < uses; i++) {
            const orderTotal = (c.minOrderAmount || 20) + Math.floor(Math.random() * 80) + 10;
            const rawDiscount = orderTotal * c.discountPercentage;
            const cappedDiscount = c.maxDiscountAmount && rawDiscount > c.maxDiscountAmount ? c.maxDiscountAmount : rawDiscount;
            demo.push({
                id: `demo-${c.id}-${i}`,
                couponCode: c.code,
                userName: names[(ci * 2 + i) % names.length]!,
                userPhone: phones[i % phones.length],
                orderId: 1000 + ci * 10 + i,
                orderTotal,
                discountAmount: parseFloat(cappedDiscount.toFixed(2)),
                usedAt: new Date(now - (i * 3600000 * 12) - ci * 86400000).toISOString(),
            });
        }
    });
    saveUsageHistory(demo);
    return demo;
}

export default function OwnerCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [usageHistory, setUsageHistory] = useState<CouponUsage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [expandedCoupon, setExpandedCoupon] = useState<number | null>(null);
    const [filter, setFilter] = useState('');

    const [formData, setFormData] = useState({
        id: null as number | null,
        code: '',
        discountPercentage: 0.20,
        isActive: true,
        minOrderAmount: 25,
        maxDiscountAmount: 20,
        usageLimitPerCustomer: 1,
        totalUsageLimit: 100,
        validUntil: '2026-12-31',
        description: ''
    });

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const localMaster = loadMasterCoupons();
            setCoupons(localMaster);
            const history = seedDemoHistory(localMaster);
            setUsageHistory(history);

            // Fetch from backend API to sync if available
            try {
                const res = await apiClient.get('/owner/coupons');
                if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                    const merged = [...localMaster];
                    res.data.forEach((backendC: any) => {
                        const existingIdx = merged.findIndex(m => m.code.toUpperCase() === backendC.code.toUpperCase());
                        if (existingIdx >= 0) {
                            merged[existingIdx] = { ...merged[existingIdx], ...backendC };
                        } else {
                            merged.push(backendC);
                        }
                    });
                    setCoupons(merged);
                    saveMasterCoupons(merged);
                }
            } catch { /* proceed with local master */ }
        } catch {
            const fallback = loadMasterCoupons();
            setCoupons(fallback);
            setUsageHistory(loadUsageHistory());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    // Listen for coupon usage events (from checkout/cart)
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as CouponUsage;
            if (!detail?.couponCode) return;
            setUsageHistory(prev => {
                const updated = [detail, ...prev];
                saveUsageHistory(updated);
                return updated;
            });
        };
        window.addEventListener('heaven4-coupon-used', handler);
        return () => window.removeEventListener('heaven4-coupon-used', handler);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const codeClean = formData.code.trim().toUpperCase();
        if (!codeClean) {
            toast.error('Coupon code is required.');
            return;
        }

        const payload: Coupon = {
            id: formData.id || Date.now(),
            code: codeClean,
            discountPercentage: Number(formData.discountPercentage) || 0.15,
            isActive: formData.isActive,
            minOrderAmount: Number(formData.minOrderAmount) || 0,
            maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
            usageLimitPerCustomer: Number(formData.usageLimitPerCustomer) || 1,
            totalUsageLimit: formData.totalUsageLimit ? Number(formData.totalUsageLimit) : undefined,
            validUntil: formData.validUntil ? formData.validUntil : undefined,
            description: formData.description || `${Math.round((Number(formData.discountPercentage) || 0.15) * 100)}% off orders above $${(Number(formData.minOrderAmount) || 0).toFixed(0)}`
        };

        try {
            if (formData.id) {
                await apiClient.put(`/owner/coupons/${formData.id}`, payload).catch(() => null);
                const updated = coupons.map(c => c.id === formData.id ? payload : c);
                setCoupons(updated);
                saveMasterCoupons(updated);
                toast.success(`✓ Coupon "${codeClean}" rules updated!`);
            } else {
                await apiClient.post('/owner/coupons', payload).catch(() => null);
                const updated = [payload, ...coupons];
                setCoupons(updated);
                saveMasterCoupons(updated);
                toast.success(`🎉 Coupon "${codeClean}" created with activation rules!`);
            }
            setIsEditing(false);
            setFormData({
                id: null,
                code: '',
                discountPercentage: 0.20,
                isActive: true,
                minOrderAmount: 25,
                maxDiscountAmount: 20,
                usageLimitPerCustomer: 1,
                totalUsageLimit: 100,
                validUntil: '2026-12-31',
                description: ''
            });
        } catch {
            toast.error('Failed to save coupon rules');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this promotional coupon code?')) return;
        try {
            await apiClient.delete(`/owner/coupons/${id}`).catch(() => null);
        } catch { /* proceed */ }
        const updated = coupons.filter(c => c.id !== id);
        setCoupons(updated);
        saveMasterCoupons(updated);
        toast.success('Coupon removed');
    };

    const handleEdit = (c: Coupon) => {
        setFormData({
            id: c.id,
            code: c.code,
            discountPercentage: c.discountPercentage,
            isActive: c.isActive,
            minOrderAmount: c.minOrderAmount ?? 0,
            maxDiscountAmount: c.maxDiscountAmount ?? 20,
            usageLimitPerCustomer: c.usageLimitPerCustomer ?? 1,
            totalUsageLimit: c.totalUsageLimit ?? 100,
            validUntil: c.validUntil ? new Date(c.validUntil).toISOString().slice(0, 10) : '',
            description: c.description || ''
        });
        setIsEditing(true);
    };

    const getUsageForCoupon = (code: string) =>
        usageHistory.filter(u => u.couponCode === code)
            .sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime());

    const getTotalSaved = (code: string) =>
        getUsageForCoupon(code).reduce((s, u) => s + u.discountAmount, 0);

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(filter.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 max-w-7xl mx-auto space-y-6 pb-24">

            {/* ── Header ── */}
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-5 h-5 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Executive Marketing & Billing</span>
                    </div>
                    <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">
                        Coupon Rules & Promotions Manager
                    </h1>
                    <p className="text-slate-400 text-xs mt-1">
                        Configure minimum spend requirements, discount caps, usage limits, and track detailed redemption history.
                    </p>
                </div>

                {/* Summary stats */}
                <div className="flex gap-3 shrink-0 text-center">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 min-w-[70px]">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Coupons</p>
                        <p className="text-xl font-black text-white">{coupons.length}</p>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 min-w-[70px]">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Redemptions</p>
                        <p className="text-xl font-black text-amber-400">{usageHistory.length}</p>
                    </div>
                    <div className="bg-slate-950 border border-emerald-500/20 rounded-2xl px-4 py-2.5 min-w-[90px]">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Total Saved</p>
                        <p className="text-xl font-black text-emerald-400">
                            ${usageHistory.reduce((s, u) => s + u.discountAmount, 0).toFixed(0)}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <input
                        type="text"
                        placeholder="Search coupon code or rule..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500 transition-colors text-white font-bold text-xs"
                    />
                    <button onClick={() => {
                        setIsEditing(true);
                        setFormData({
                            id: null,
                            code: '',
                            discountPercentage: 0.20,
                            isActive: true,
                            minOrderAmount: 25,
                            maxDiscountAmount: 20,
                            usageLimitPerCustomer: 1,
                            totalUsageLimit: 100,
                            validUntil: '2026-12-31',
                            description: ''
                        });
                    }} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create Coupon
                    </button>
                    <button onClick={fetchCoupons} className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition-all" title="Reload Master Coupons">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>

            {/* ── Create / Edit Form with Standard Rules ── */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-3xl border border-amber-500/40 shadow-2xl space-y-5">
                            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                                <div>
                                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-amber-400" />
                                        {formData.id ? 'Edit Coupon & Eligibility Rules' : 'Create New Promotional Coupon & Rules'}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Establish strict activation parameters to protect margins and drive higher average basket value.</p>
                                </div>
                                <button type="button" onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-white font-bold text-xs">
                                    ✕ Close
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Coupon Code */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Coupon Code *</label>
                                    <input required value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-black text-sm uppercase tracking-wider placeholder-slate-600 focus:border-amber-500 outline-none"
                                        placeholder="e.g. WELCOME25" />
                                </div>

                                {/* Discount Percentage */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Discount Rate (0.20 = 20%) *</label>
                                    <input required type="number" step="0.01" min="0.01" max="1" value={formData.discountPercentage}
                                        onChange={e => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-black text-sm placeholder-slate-600 focus:border-amber-500 outline-none"
                                        placeholder="0.20" />
                                </div>

                                {/* Minimum Spend Rule (User Request) */}
                                <div>
                                    <label className="block text-[10px] font-black text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <span>🏷️ Min Order Spend ($) *</span>
                                    </label>
                                    <input required type="number" step="0.50" min="0" value={formData.minOrderAmount}
                                        onChange={e => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-slate-950 border border-amber-500/40 rounded-xl text-white font-black text-sm placeholder-slate-600 focus:border-amber-500 outline-none"
                                        placeholder="25.00" />
                                    <p className="text-[9px] text-slate-500 mt-1">Order subtotal must meet or exceed this amount</p>
                                </div>

                                {/* Max Discount Cap Rule */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Max Discount Cap ($)</label>
                                    <input type="number" step="0.50" min="1" value={formData.maxDiscountAmount || ''}
                                        onChange={e => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-sm placeholder-slate-600 focus:border-amber-500 outline-none"
                                        placeholder="20.00" />
                                    <p className="text-[9px] text-slate-500 mt-1">Capped dollar savings (prevents margin abuse)</p>
                                </div>

                                {/* Per-Customer Limit */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Limit Per Customer</label>
                                    <input type="number" min="1" max="100" value={formData.usageLimitPerCustomer}
                                        onChange={e => setFormData({ ...formData, usageLimitPerCustomer: parseInt(e.target.value) || 1 })}
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-sm placeholder-slate-600 focus:border-amber-500 outline-none"
                                        placeholder="1" />
                                    <p className="text-[9px] text-slate-500 mt-1">Max redemptions per user phone / identity</p>
                                </div>

                                {/* Total Restaurant Redemptions Cap */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Total Usage Cap</label>
                                    <input type="number" min="1" value={formData.totalUsageLimit || ''}
                                        onChange={e => setFormData({ ...formData, totalUsageLimit: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-sm placeholder-slate-600 focus:border-amber-500 outline-none"
                                        placeholder="e.g. 500" />
                                    <p className="text-[9px] text-slate-500 mt-1">Total orders across restaurant before expiry</p>
                                </div>

                                {/* Expiration Date */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Expiration Date</label>
                                    <input type="date" value={formData.validUntil}
                                        onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-xs focus:border-amber-500 outline-none" />
                                    <p className="text-[9px] text-slate-500 mt-1">Code automatically expires at midnight</p>
                                </div>

                                {/* Active Toggle */}
                                <div className="flex items-center gap-3 pt-4">
                                    <input type="checkbox" id="coupon-active" checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 accent-amber-500 rounded" />
                                    <label htmlFor="coupon-active" className="font-black text-white text-sm cursor-pointer">
                                        Activate Code for Diners
                                    </label>
                                </div>
                            </div>

                            {/* Promo Description */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Promotional Description / Terms Summary</label>
                                <input value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium text-xs placeholder-slate-600 focus:border-amber-500 outline-none"
                                    placeholder="e.g. 20% off all gourmet entrees for dining tables above $25 (Max savings $20)" />
                            </div>

                            <div className="flex gap-3 justify-end pt-3 border-t border-slate-800">
                                <button type="button" onClick={() => setIsEditing(false)}
                                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 transition-colors flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Save Coupon & Rules
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Coupon Cards with Rule Indicators & Usage History ── */}
            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredCoupons.map((c, i) => {
                        const uses = getUsageForCoupon(c.code);
                        const totalSaved = getTotalSaved(c.code);
                        const isOpen = expandedCoupon === c.id;

                        return (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-3xl shadow-2xl transition-all overflow-hidden"
                            >
                                {/* Coupon Header */}
                                <div className="p-6 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border mt-0.5 ${c.isActive ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                                            <Ticket className="w-7 h-7" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="font-black text-2xl tracking-widest text-white">{c.code}</h3>
                                                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                                                    {(c.discountPercentage * 100).toFixed(0)}% OFF
                                                </span>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${c.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                                    {c.isActive ? '● Active' : '● Inactive'}
                                                </span>
                                            </div>

                                            {c.description && (
                                                <p className="text-xs text-slate-300 font-semibold">{c.description}</p>
                                            )}

                                            {/* Rule Badges Pill Row */}
                                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold">
                                                {/* Min Spend Badge */}
                                                <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg flex items-center gap-1">
                                                    <span>🏷️</span> Min Spend: ${(c.minOrderAmount || 0).toFixed(2)}
                                                </span>

                                                {/* Max Cap Badge */}
                                                {c.maxDiscountAmount && (
                                                    <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-lg flex items-center gap-1">
                                                        <span>🛡️</span> Max Cap: ${c.maxDiscountAmount.toFixed(2)}
                                                    </span>
                                                )}

                                                {/* Per-User Limit Badge */}
                                                <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-lg flex items-center gap-1">
                                                    <span>👤</span> {c.usageLimitPerCustomer || 1}x per user
                                                </span>

                                                {/* Total Usage Limit Badge */}
                                                {c.totalUsageLimit && (
                                                    <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg flex items-center gap-1">
                                                        <span>📊</span> Cap: {uses.length}/{c.totalUsageLimit}
                                                    </span>
                                                )}

                                                {/* Expiry Badge */}
                                                <span className="px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg flex items-center gap-1">
                                                    <span>⏳</span> {c.validUntil ? `Expires: ${new Date(c.validUntil).toLocaleDateString()}` : 'No Expiry'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats + Actions */}
                                    <div className="flex items-center gap-4 flex-wrap self-end lg:self-center">
                                        <div className="flex gap-4">
                                            <div className="text-center bg-slate-950 p-2.5 rounded-2xl border border-slate-800 min-w-[70px]">
                                                <p className="text-base font-black text-amber-400">{uses.length}</p>
                                                <p className="text-[9px] text-slate-500 font-black uppercase">Redeemed</p>
                                            </div>
                                            <div className="text-center bg-slate-950 p-2.5 rounded-2xl border border-emerald-500/20 min-w-[80px]">
                                                <p className="text-base font-black text-emerald-400">${totalSaved.toFixed(0)}</p>
                                                <p className="text-[9px] text-slate-500 font-black uppercase">Saved</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(c)}
                                                className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-400 rounded-xl border border-slate-800 transition-colors" title="Edit Rules">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(c.id)}
                                                className="p-2.5 bg-slate-950 hover:bg-red-500/10 text-slate-300 hover:text-red-400 rounded-xl border border-slate-800 transition-colors" title="Delete Coupon">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setExpandedCoupon(isOpen ? null : c.id)}
                                                className={`px-3 py-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-black ${isOpen ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}
                                            >
                                                <History className="w-4 h-4" />
                                                <span>Audit History ({uses.length})</span>
                                                {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Detailed Usage History Panel ── */}
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="border-t border-slate-800 bg-slate-950/60"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <BarChart2 className="w-4 h-4 text-amber-400" />
                                                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                                                        Detailed Redemption Audit Log for {c.code}
                                                    </h4>
                                                    <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-0.5 rounded-full font-black ml-auto">
                                                        {uses.length} redemptions recorded
                                                    </span>
                                                </div>

                                                {uses.length === 0 ? (
                                                    <div className="text-center py-8 bg-slate-900/60 rounded-2xl border border-slate-800">
                                                        <Ticket className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                                        <p className="text-slate-400 text-xs font-bold">No customer redemptions recorded yet for this coupon.</p>
                                                        <p className="text-slate-600 text-[10px] mt-0.5">When customers apply this code during cart checkout, their usage record will appear here.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                                        {uses.map((u) => (
                                                            <div key={u.id}
                                                                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-3">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-amber-400 text-sm shrink-0">
                                                                        {u.userName.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <User className="w-3.5 h-3.5 text-slate-500" />
                                                                            <p className="font-black text-white text-xs">{u.userName}</p>
                                                                            {u.userPhone && <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">{u.userPhone}</span>}
                                                                        </div>
                                                                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                                                                            <div className="flex items-center gap-1">
                                                                                <Clock className="w-3 h-3 text-slate-500" />
                                                                                {new Date(u.usedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                            </div>
                                                                            {u.orderId && (
                                                                                <span className="text-amber-400 font-mono font-bold">Order #{u.orderId}</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-5 shrink-0 self-end sm:self-center">
                                                                    <div className="text-right">
                                                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 justify-end">
                                                                            <DollarSign className="w-3 h-3" /> Order Total
                                                                        </div>
                                                                        <p className="font-black text-white text-sm">${u.orderTotal.toFixed(2)}</p>
                                                                    </div>
                                                                    <div className="text-right bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                                                                        <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Discount Saved</p>
                                                                        <p className="font-black text-emerald-400 text-base">-${u.discountAmount.toFixed(2)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Summary footer */}
                                                {uses.length > 0 && (
                                                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs font-black">
                                                        <span className="text-slate-400">{uses.length} verified uses · Average bill ${(uses.reduce((s, u) => s + u.orderTotal, 0) / uses.length).toFixed(2)}</span>
                                                        <span className="text-emerald-400">Total Discount Granted: ${totalSaved.toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}

                    {filteredCoupons.length === 0 && (
                        <div className="text-center p-12 text-slate-500 bg-slate-900 rounded-3xl border border-slate-800">
                            <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                            <p className="text-slate-400 font-bold text-sm">No coupons found matching your search filter.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
