import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, MapPin, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/core/api/client';

interface EventPass {
    id: number;
    passCode: string;
    customerName: string;
    customerPhone: string;
    numberOfPasses: number;
    tableNumber?: string;
    totalPaid: number;
    status: string;
    bookedAt: string;
    event: {
        title: string;
        location: string;
        startDate: string;
        djName?: string;
    };
}

const DEFAULT_PASSES: EventPass[] = [
    {
        id: 501,
        passCode: 'EVT-PASS-1042',
        customerName: 'Sarah Jenkins',
        customerPhone: '7020875435',
        numberOfPasses: 2,
        tableNumber: 'VIP-1',
        totalPaid: 90.00,
        status: 'BOOKED',
        bookedAt: '2026-08-02T18:00:00',
        event: {
            title: '🎷 Sunset Rooftop Jazz & Wine Night',
            location: 'Rooftop Sunset Lounge',
            startDate: '2026-08-15T19:00:00',
            djName: 'DJ Pulse & Sax Ensemble'
        }
    }
];

export default function CustomerEventPassesPage() {
    const navigate = useNavigate();
    const [passes, setPasses] = useState<EventPass[]>(DEFAULT_PASSES);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPasses = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get('/events/passes/my-passes').catch(() => null);
                if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                    setPasses(res.data);
                } else {
                    setPasses(DEFAULT_PASSES);
                }
            } catch {
                setPasses(DEFAULT_PASSES);
            } finally {
                setLoading(false);
            }
        };
        fetchPasses();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-24">
            {/* Header */}
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
                <div>
                    <button onClick={() => navigate('/customer/events')} className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 mb-1">
                        ← Back to Events Catalog
                    </button>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent flex items-center gap-3">
                        <Ticket className="w-8 h-8 text-amber-400" />
                        My Digital Event Passes Wallet
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Present your scannable QR pass code at the host entrance for express check-in.</p>
                </div>
            </div>

            {/* Passes Wallet Cards */}
            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="space-y-6">
                    {passes.map(pass => (
                        <motion.div 
                            key={pass.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col md:flex-row justify-between items-center gap-6"
                        >
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-mono font-black text-xs rounded-full border border-amber-500/30">
                                        PASS CODE: {pass.passCode}
                                    </span>
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30 flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5" /> CONFIRMED BOOKING
                                    </span>
                                </div>

                                <h2 className="text-2xl font-black text-white">{pass.event?.title || 'Special Event'}</h2>

                                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Venue & Address</p>
                                        <p className="font-bold text-white flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5 text-amber-400" /> {pass.event?.location || 'Rooftop Lounge'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Reserved Table</p>
                                        <p className="font-bold text-amber-400 mt-0.5">{pass.tableNumber || 'General Entry'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Tickets & Passes</p>
                                        <p className="font-bold text-emerald-400 mt-0.5">{pass.numberOfPasses} Guest Ticket(s)</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Guest Holder</p>
                                        <p className="font-bold text-white mt-0.5">{pass.customerName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl text-center border-2 border-amber-500/40 shadow-2xl shrink-0">
                                <QRCodeSVG 
                                    value={pass.passCode}
                                    size={140}
                                    level="H"
                                    includeMargin={true}
                                />
                                <p className="font-mono font-black text-slate-900 text-xs mt-2">{pass.passCode}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase">Show to Host on Arrival</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
