import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

import { useAudioAlerts } from '@/core/contexts/AudioProvider';

interface Complaint {
    id: number;
    orderId?: number;
    tableNumber?: string;
    type: string;
    description: string;
    status: string;
    createdAt: string;
}

export default function EmployeeComplaintsPage() {
    const { playSound } = useAudioAlerts();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchComplaints = async () => {
        try {
            const res = await apiClient.get('/complaints', {
                headers: { 'x-suppress-error-toast': 'true' }
            });
            const data = res.data || [];
            setComplaints(data);
            if (data.some((c: any) => c.status !== 'RESOLVED')) {
                playSound('complaint');
            }
        } catch {
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleResolve = async (id: number) => {
        try {
            await apiClient.put(`/complaints/${id}/status`, { status: 'RESOLVED' });
            toast.success('Complaint resolved');
            fetchComplaints();
        } catch (e) {
            toast.error('Failed to resolve complaint');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">Complaints Overview</h1>
                <p className="text-slate-400 text-xs mt-1">Manage and resolve customer issues</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {complaints.length === 0 && (
                        <div className="col-span-full py-16 text-center text-slate-400 bg-slate-900 rounded-3xl border border-slate-800 font-bold text-sm shadow-xl">
                            🎉 No complaints found. Great job!
                        </div>
                    )}
                    {complaints.map(c => (
                        <div key={c.id} className={`p-6 rounded-3xl border transition-all ${
                            c.status === 'RESOLVED' 
                                ? 'bg-slate-900/60 border-slate-800 opacity-70' 
                                : 'bg-slate-900 border-red-500/50 shadow-xl shadow-red-500/10'
                        }`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        c.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        {c.status === 'RESOLVED' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-base">{c.type.replace(/_/g, ' ')}</h3>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3 h-3" /> {new Date(c.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {c.tableNumber && (
                                    <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-amber-400">
                                        Table {c.tableNumber}
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-slate-950 rounded-2xl p-4 mb-4 border border-slate-800">
                                <p className="text-xs text-slate-300 font-medium leading-relaxed">{c.description}</p>
                                {c.orderId && <p className="text-[10px] text-slate-500 mt-2 font-mono">Order Ticket #{c.orderId}</p>}
                            </div>

                            {c.status !== 'RESOLVED' && (
                                <button
                                    onClick={() => handleResolve(c.id)}
                                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-green-500/20"
                                >
                                    Mark as Resolved
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
