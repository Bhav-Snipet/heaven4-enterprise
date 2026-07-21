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
    const routeState = location.state as { orderId?: number; tableNumber?: string } | null;
    
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    // Pre-fill from route state (passed from order status page)
    const [orderId, setOrderId] = useState(routeState?.orderId?.toString() || '');
    const [tableNumber] = useState(routeState?.tableNumber || '');
    const prefilled = !!routeState?.orderId;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!type) { toast.error('Please select a complaint type'); return; }
        if (description.trim().length < 10) { toast.error('Please describe your issue in at least 10 characters'); return; }

        setIsSubmitting(true);
        try {
            await apiClient.post('/complaints', {
                type,
                description: description.trim(),
                orderId: orderId ? parseInt(orderId) : null,
            });
            setSubmitted(true);
        } catch (err) {
            toast.error('Failed to submit complaint. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl font-bold mb-2">
                    Complaint Submitted
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                    className="text-slate-500 mb-8 max-w-sm">
                    Our manager has been notified and will look into your issue shortly. We apologize for the inconvenience.
                </motion.p>
                <button onClick={() => navigate('/customer/menu')}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all">
                    Back to Menu
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10">
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-xl font-bold">Report an Issue</h1>
                    <p className="text-xs text-slate-500">We'll have a manager look into it right away</p>
                </div>
            </div>

            <div className="max-w-lg mx-auto p-4 space-y-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                        Your feedback helps us improve. Our manager will review your complaint and get back to you.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Complaint Type */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                            What went wrong? <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {COMPLAINT_TYPES.map(ct => (
                                <button key={ct.value} type="button" onClick={() => setType(ct.value)}
                                    className={`text-left px-4 py-3 rounded-xl border-2 font-medium transition-all text-sm ${
                                        type === ct.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                                    }`}>
                                    {ct.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pre-filled context */}
                    {prefilled && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4 flex gap-3">
                            <Lock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                <p className="font-bold mb-1">Auto-filled from your order</p>
                                <p>Order #{orderId} · Table {tableNumber}</p>
                            </div>
                        </div>
                    )}

                    {/* Order ID (optional if not pre-filled) */}
                    {!prefilled && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Order ID <span className="text-slate-400 font-normal">(optional)</span>
                            </label>
                            <input type="number" placeholder="e.g. 42"
                                value={orderId} onChange={e => setOrderId(e.target.value)}
                                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none transition-all font-medium" />
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                            Describe the issue <span className="text-red-500">*</span>
                        </label>
                        <textarea rows={4} placeholder="Tell us what happened in detail..."
                            value={description} onChange={e => setDescription(e.target.value)}
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none transition-all font-medium resize-none" />
                        <p className="text-xs text-slate-400 mt-1">{description.length} characters</p>
                    </div>

                    <button type="submit" disabled={isSubmitting || !type || description.trim().length < 10}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                        {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                            <><MessageSquare className="w-5 h-5" /> Submit Complaint</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
