import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, Filter, MessageSquare } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

interface Complaint {
    id: number;
    type: string;
    description: string;
    status: string;
    createdAt: string;
    orderId?: number;
    resolutionNote?: string;
}

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_REVIEW', 'RESOLVED'];

export default function ManagerComplaintsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [resolvingId, setResolvingId] = useState<number | null>(null);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/complaints');
            setComplaints(res.data);
        } catch (e) {
            toast.error('Failed to load complaints');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchComplaints(); }, []);

    const handleResolve = async (id: number) => {
        setResolvingId(id);
        try {
            await apiClient.put(`/complaints/${id}/resolve`, { note: 'Resolved by manager' });
            toast.success('Complaint marked as resolved');
            fetchComplaints();
        } catch (e) {
            toast.error('Failed to resolve complaint');
        } finally {
            setResolvingId(null);
        }
    };

    const getTimeAgo = (dateStr: string) => {
        const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const filtered = complaints.filter(c => statusFilter === 'ALL' || c.status === statusFilter);
    const openCount = complaints.filter(c => c.status !== 'RESOLVED').length;

    return (
        <div className="min-h-screen bg-slate-950 p-6 text-white">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
                        Complaint Center
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {openCount > 0 
                            ? `${openCount} complaint${openCount > 1 ? 's' : ''} requiring attention` 
                            : 'No open complaints — everything is good! 🎉'}
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {STATUS_FILTERS.map(f => (
                        <button key={f} onClick={() => setStatusFilter(f)}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                statusFilter === f 
                                    ? 'bg-white text-slate-900' 
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}>
                            <span className="flex items-center gap-2">
                                <Filter className="w-3.5 h-3.5" />
                                {f}
                                {f !== 'ALL' && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                        f === 'OPEN' ? 'bg-red-500/20 text-red-400' :
                                        f === 'IN_REVIEW' ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-green-500/20 text-green-400'
                                    }`}>
                                        {complaints.filter(c => c.status === f).length}
                                    </span>
                                )}
                            </span>
                        </button>
                    ))}
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg">No complaints in this category</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((c, i) => (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className={`rounded-2xl border p-5 flex gap-4 ${
                                    c.status === 'RESOLVED'
                                        ? 'bg-green-500/5 border-green-500/20'
                                        : 'bg-red-500/5 border-red-500/20'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    c.status === 'RESOLVED' ? 'bg-green-500/20' : 'bg-red-500/20'
                                }`}>
                                    {c.status === 'RESOLVED'
                                        ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        : <AlertCircle className="w-5 h-5 text-red-400" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                                        <span className={`font-bold text-sm ${c.status === 'RESOLVED' ? 'text-green-400' : 'text-red-400'}`}>
                                            {c.type.replace(/_/g, ' ')}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {getTimeAgo(c.createdAt)}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                                c.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' :
                                                c.status === 'IN_REVIEW' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>
                                                {c.status}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{c.description}</p>
                                    {c.orderId && (
                                        <p className="text-xs text-slate-500 mt-2">Order #{c.orderId}</p>
                                    )}
                                    {c.resolutionNote && c.status === 'RESOLVED' && (
                                        <p className="text-xs text-green-500/70 mt-2 italic">Note: {c.resolutionNote}</p>
                                    )}
                                </div>

                                {c.status !== 'RESOLVED' && (
                                    <button
                                        onClick={() => handleResolve(c.id)}
                                        disabled={resolvingId === c.id}
                                        className="flex-shrink-0 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 disabled:opacity-50 text-green-400 rounded-xl text-sm font-bold transition-all flex items-center gap-2 self-start"
                                    >
                                        {resolvingId === c.id
                                            ? <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                                            : <><CheckCircle2 className="w-4 h-4" /> Resolve</>
                                        }
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
