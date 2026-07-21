import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

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
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchComplaints = async () => {
        try {
            const res = await apiClient.get('/complaints');
            setComplaints(res.data);
        } catch (e) {
            toast.error('Failed to load complaints');
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
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Complaints Overview</h1>
                <p className="text-slate-500 mt-1">Manage and resolve customer issues</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {complaints.length === 0 && (
                        <div className="col-span-full py-20 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                            No complaints found. Great job!
                        </div>
                    )}
                    {complaints.map(c => (
                        <div key={c.id} className={`p-6 rounded-3xl border-2 transition-all ${
                            c.status === 'RESOLVED' 
                                ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-70' 
                                : 'bg-white dark:bg-slate-800 border-red-500 shadow-xl shadow-red-500/10'
                        }`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        c.status === 'RESOLVED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                        {c.status === 'RESOLVED' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{c.type.replace(/_/g, ' ')}</h3>
                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {new Date(c.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                {c.tableNumber && (
                                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Table {c.tableNumber}
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-200 dark:border-slate-700">
                                <p className="text-sm text-slate-700 dark:text-slate-300">{c.description}</p>
                                {c.orderId && <p className="text-xs text-slate-500 mt-2 font-mono">Order #{c.orderId}</p>}
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
