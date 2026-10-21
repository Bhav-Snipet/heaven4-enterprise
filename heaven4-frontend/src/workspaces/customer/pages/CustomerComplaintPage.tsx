import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageSquare, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

const COMPLAINT_TYPES = [
    { value: 'WRONG_ORDER', label: '🍽️ Wrong Order Received' },
    { value: 'FOOD_QUALITY', label: '😕 Poor Food Quality' },
    { value: 'LONG_WAIT', label: '⏰ Long Wait Time' },
    { value: 'STAFF_BEHAVIOR', label: '👤 Staff Behavior' },
    { value: 'CLEANLINESS', label: '🧹 Cleanliness Issue' },
    { value: 'BILLING_ERROR', label: '💳 Billing Error' },
    { value: 'OTHER', label: '📝 Other' },
];

export default function CustomerComplaintPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const routeState = location.state as { orderId?: number; tableNumber?: string; items?: any[] } | null;

    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [orderId, setOrderId] = useState(routeState?.orderId?.toString() || '');
    const [tableNumber] = useState(routeState?.tableNumber || '');
    const [orderItems] = useState<any[]>(routeState?.items || []);
    const prefilled = !!routeState?.orderId;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!type) { toast.error('Please select a complaint type'); return; }
        if (description.trim().length < 10) { toast.error('Please describe your issue in at least 10 characters'); return; }

        setIsSubmitting(true);
        const complaintRecord = {
            id: Date.now(),
            orderId: orderId ? parseInt(orderId) : null,
            tableNumber: tableNumber || 'B-2',
            type,
            description: description.trim(),
            status: 'OPEN',
            items: orderItems,
            createdAt: new Date().toISOString()
        };

        try {
            await apiClient.post('/complaints', {
                type,
                description: description.trim(),
                orderId: orderId ? parseInt(orderId) : null,
            }).catch(() => null);

            const existing = JSON.parse(localStorage.getItem('heaven4_customer_complaints') || '[]');
            localStorage.setItem('heaven4_customer_complaints', JSON.stringify([complaintRecord, ...existing]));
            window.dispatchEvent(new CustomEvent('heaven4-complaint-submitted', { detail: complaintRecord }));

            setSubmitted(true);
        } catch (err) {
            const existing = JSON.parse(localStorage.getItem('heaven4_customer_complaints') || '[]');
            localStorage.setItem('heaven4_customer_complaints', JSON.stringify([complaintRecord, ...existing]));
            window.dispatchEvent(new CustomEvent('heaven4-complaint-submitted', { detail: complaintRecord }));
            setSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl font-bold mb-2 text-white">
                    Complaint Submitted
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                    className="text-slate-400 mb-8 max-w-sm text-sm">
                    Our manager has been notified and will look into your issue shortly. We sincerely apologize for any inconvenience.
                </motion.p>
                <button onClick={() => navigate('/customer/menu')}
                    className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black transition-all shadow-lg shadow-amber-500/30">
                    Back to Menu
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-10">
            {/* Sticky Top Nav */}
            <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 p-4 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">Report an Issue</h1>
                    <p className="text-xs text-slate-400">We'll have a manager look into it right away</p>
                </div>
            </div>

            <div className="max-w-lg mx-auto p-4 space-y-6">
                {/* Info Banner */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-300">
                        Your feedback helps us improve. Our manager will review your complaint and get back to you.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Complaint Type */}
                    <div>
                        <label className="block text-sm font-bold text-slate-200 mb-3">
                            What went wrong? <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {COMPLAINT_TYPES.map(ct => (
                                <button key={ct.value} type="button" onClick={() => setType(ct.value)}
                                    className={`text-left px-4 py-3 rounded-xl border-2 font-medium transition-all text-sm ${
                                        type === ct.value
                                            ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                                            : 'border-slate-700 bg-slate-900 hover:border-slate-600 text-slate-300 hover:text-white'
                                    }`}>
                                    {ct.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pre-filled context banner */}
                    {prefilled && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex gap-3">
                            <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-300 space-y-1">
                                <p className="font-bold text-blue-200">Auto-filled from your order</p>
                                <p>Order #{orderId} · Table {tableNumber}</p>
                                {orderItems && orderItems.length > 0 && (
                                    <div className="pt-1 text-xs text-blue-400 font-medium">
                                        <p className="font-bold">Order Items:</p>
                                        <p>{orderItems.map(i => `${i.quantity || 1}× ${i.menuItemName || i.name}`).join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Order ID (optional if not pre-filled) */}
                    {!prefilled && (
                        <div>
                            <label className="block text-sm font-bold text-slate-200 mb-2">
                                Order ID <span className="text-slate-500 font-normal">(optional)</span>
                            </label>
                            <input type="number" placeholder="e.g. 42"
                                value={orderId} onChange={e => setOrderId(e.target.value)}
                                className="w-full p-3 rounded-xl bg-slate-900 text-white placeholder-slate-500 border-2 border-slate-700 focus:border-amber-500 outline-none transition-all font-medium" />
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-slate-200 mb-2">
                            Describe the issue <span className="text-red-400">*</span>
                        </label>
                        <textarea rows={4} placeholder="Tell us what happened in detail..."
                            value={description} onChange={e => setDescription(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-900 text-white placeholder-slate-500 border-2 border-slate-700 focus:border-amber-500 outline-none transition-all font-medium resize-none" />
                        <p className="text-xs text-slate-500 mt-1">{description.length} characters · minimum 10</p>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" disabled={isSubmitting || !type || description.trim().length < 10}
                        className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-red-900/40 disabled:text-red-700 disabled:cursor-not-allowed text-white rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
                        {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                            <><MessageSquare className="w-5 h-5" /> Submit Complaint</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
