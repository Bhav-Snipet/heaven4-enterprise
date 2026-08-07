import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, MapPin, ShieldCheck, Calendar, Clock, Bell, ArrowLeft, X, Music } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/core/api/client';
import { getCountdownBanner, getPassStatusStyle, formatEventDate, formatEventTime } from '@/shared/utils/eventHelpers';

interface EventPass {
    id: number;
    passCode: string;
    customerName: string;
    customerPhone: string;
    numberOfPasses: number;
    tableNumber?: string;
    totalPaid: number;
    status: 'BOOKED' | 'ATTENDED' | 'CANCELLED';
    bookedAt: string;
    event: {
        title: string;
        location: string;
        address?: string;
        startDate: string;
        endDate: string;
        djName?: string;
        imageUrl?: string;
    };
}

const DEMO_PASSES: EventPass[] = [
    {
        id: 501,
        passCode: 'EVT-PASS-8421',
        customerName: 'Sarah Jenkins',
        customerPhone: '9876543210',
        numberOfPasses: 2,
        tableNumber: 'VIP-1',
        totalPaid: 90.00,
        status: 'BOOKED',
        bookedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        event: {
            title: '🎷 Sunset Rooftop Jazz & Wine Night',
            location: 'Rooftop Sunset Lounge',
            address: '4th Floor, Heaven4 Building',
            startDate: new Date(Date.now() - 3600000).toISOString(),
            endDate: new Date(Date.now() + 7200000).toISOString(),
            djName: 'DJ Pulse & Sax Ensemble',
            imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        }
    },
    {
        id: 502,
        passCode: 'EVT-PASS-5K92',
        customerName: 'Sarah Jenkins',
        customerPhone: '9876543210',
        numberOfPasses: 1,
        totalPaid: 120.00,
        status: 'BOOKED',
        bookedAt: new Date(Date.now() - 86400000).toISOString(),
        event: {
            title: '🎉 New Year\'s Eve Grand Countdown',
            location: 'Main Dining Hall + Rooftop Terrace',
            address: 'Heaven4 Building, All Floors',
            startDate: new Date('2026-12-31T21:00:00').toISOString(),
            endDate: new Date('2027-01-01T02:00:00').toISOString(),
            djName: 'DJ MixMaster Pro',
            imageUrl: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800',
        }
    },
];

export default function CustomerEventPassesPage() {
    const navigate = useNavigate();
    const [passes, setPasses] = useState<EventPass[]>(DEMO_PASSES);
    const [loading, setLoading] = useState(false);
    const [expandedQr, setExpandedQr] = useState<string | null>(null);

    useEffect(() => {
        const fetchPasses = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get('/events/passes/my-passes').catch(() => null);
                if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                    setPasses(res.data);
                } else {
                    setPasses(DEMO_PASSES);
                }
            } catch { setPasses(DEMO_PASSES); } finally { setLoading(false); }
        };
        fetchPasses();
    }, []);

    // Compute countdown banners for each pass
    const getPassBanner = (pass: EventPass) => {
        if (pass.status !== 'BOOKED') return null;
        return getCountdownBanner(pass.event.startDate, pass.event.endDate);
    };

    // Separate active vs past passes
    const activePasses = passes.filter(p => p.status !== 'CANCELLED');
    const cancelledPasses = passes.filter(p => p.status === 'CANCELLED');

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 max-w-3xl mx-auto space-y-6 pb-24">

            {/* ── Header ── */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
                <button onClick={() => navigate('/customer/events')}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 mb-3 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Events
                </button>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent flex items-center gap-3">
                            <Ticket className="w-8 h-8 text-amber-400" /> My Pass Wallet
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">Present your QR pass code at the venue entrance for express check-in.</p>
                    </div>
                    <div className="text-center bg-slate-800 rounded-2xl p-3 border border-slate-700 shrink-0">
                        <p className="text-2xl font-black text-amber-400">{activePasses.length}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Active Passes</p>
                    </div>
                </div>
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* ── Active Passes ── */}
            {!loading && activePasses.length > 0 && (
                <div className="space-y-4">
                    {activePasses.map(pass => {
                        const banner = getPassBanner(pass);
                        const statusStyle = getPassStatusStyle(pass.status);
                        const isExpanded = expandedQr === pass.passCode;

                        return (
                            <motion.div key={pass.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                className={`bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-2 ${
                                    pass.status === 'ATTENDED' ? 'border-emerald-500/40' : 'border-amber-500/30'
                                } ${pass.status === 'ATTENDED' ? 'shadow-emerald-900/20' : 'shadow-amber-900/20'}`}>

                                {/* Event Image Banner */}
                                {pass.event.imageUrl && (
                                    <div className="h-28 relative overflow-hidden">
                                        <img src={pass.event.imageUrl} alt={pass.event.title} className="w-full h-full object-cover opacity-50" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                                        <div className="absolute bottom-3 left-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${statusStyle.badge}`}>
                                                {statusStyle.label}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Countdown Banner */}
                                {banner && (
                                    <div className={`px-4 py-2.5 bg-gradient-to-r ${banner.color} border-b ${banner.borderColor} flex items-center gap-2.5`}>
                                        <Bell className={`w-4 h-4 ${banner.textColor} shrink-0 ${banner.level === 'live' ? 'animate-bounce' : ''}`} />
                                        <div>
                                            <p className={`text-xs font-black ${banner.textColor}`}>{banner.icon} {banner.title}</p>
                                            <p className="text-[10px] text-slate-300">{banner.subtitle}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="p-5 flex flex-col md:flex-row gap-5 items-start md:items-center">
                                    {/* Pass Info */}
                                    <div className="flex-1 space-y-3 min-w-0">
                                        {/* Pass Code */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 font-mono font-black text-xs rounded-full border border-amber-500/30 tracking-wider">
                                                {pass.passCode}
                                            </span>
                                            {!pass.event.imageUrl && (
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${statusStyle.badge}`}>
                                                    {statusStyle.label}
                                                </span>
                                            )}
                                        </div>

                                        {/* Event Title */}
                                        <h2 className="text-xl font-black text-white leading-tight">{pass.event.title}</h2>

                                        {/* Details */}
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="flex items-center gap-1.5 text-slate-300">
                                                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                <span>{formatEventDate(pass.event.startDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-300">
                                                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                                <span>{formatEventTime(pass.event.startDate)} – {formatEventTime(pass.event.endDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-300">
                                                <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                                <span className="truncate">{pass.event.location}</span>
                                            </div>
                                            {pass.event.djName && (
                                                <div className="flex items-center gap-1.5 text-slate-300">
                                                    <Music className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                                                    <span className="truncate">{pass.event.djName}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Pass Summary */}
                                        <div className="flex flex-wrap gap-3 text-xs">
                                            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-1.5">
                                                <Ticket className="w-3 h-3 text-emerald-400" />
                                                <span className="font-bold text-emerald-400">{pass.numberOfPasses} Guest Ticket{pass.numberOfPasses > 1 ? 's' : ''}</span>
                                            </div>
                                            {pass.tableNumber && (
                                                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                                    <span className="font-bold text-amber-400">Table {pass.tableNumber}</span>
                                                </div>
                                            )}
                                            {!pass.tableNumber && (
                                                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                                    <span className="text-slate-500">General Entry</span>
                                                </div>
                                            )}
                                            {pass.totalPaid > 0 && (
                                                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                                    <span className="font-bold text-slate-300">Paid: <span className="text-emerald-400">${pass.totalPaid.toFixed(2)}</span></span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-xs text-slate-500">
                                            Holder: <span className="text-slate-300 font-bold">{pass.customerName}</span> · {pass.customerPhone}
                                        </div>
                                    </div>

                                    {/* QR Code */}
                                    <div className="flex flex-col items-center gap-2 shrink-0">
                                        <div className={`bg-white p-4 rounded-2xl border-2 cursor-pointer transition-transform hover:scale-105 ${pass.status === 'ATTENDED' ? 'border-emerald-400/60 shadow-lg shadow-emerald-500/20' : 'border-amber-400/60 shadow-lg shadow-amber-500/20'}`}
                                            onClick={() => setExpandedQr(isExpanded ? null : pass.passCode)}
                                            title="Click to enlarge QR code">
                                            <QRCodeSVG value={pass.passCode} size={120} level="H" includeMargin={false} />
                                            <p className="font-mono font-black text-slate-900 text-[10px] text-center mt-2">{pass.passCode}</p>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                            {pass.status === 'ATTENDED' ? '✓ Checked In' : 'Show at Entrance'}
                                        </p>
                                        <button onClick={() => setExpandedQr(isExpanded ? null : pass.passCode)}
                                            className="text-[10px] text-amber-400 hover:text-amber-300 font-bold">
                                            {isExpanded ? 'Collapse' : 'Enlarge QR'}
                                        </button>
                                    </div>
                                </div>

                                {/* Attended overlay */}
                                {pass.status === 'ATTENDED' && (
                                    <div className="mx-5 mb-5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <p className="text-xs font-bold text-emerald-400">Check-in completed! We hope you enjoyed the event.</p>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* ── Empty State ── */}
            {!loading && activePasses.length === 0 && (
                <div className="text-center py-20">
                    <Ticket className="w-16 h-16 mx-auto text-slate-700 mb-4" />
                    <h2 className="text-xl font-black text-slate-400">No Event Passes Yet</h2>
                    <p className="text-sm text-slate-600 mt-2">Browse upcoming events and book your passes!</p>
                    <button onClick={() => navigate('/customer/events')}
                        className="mt-6 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/30">
                        Browse Events
                    </button>
                </div>
            )}

            {/* ── Cancelled Passes ── */}
            {!loading && cancelledPasses.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cancelled Bookings</h3>
                    {cancelledPasses.map(pass => (
                        <div key={pass.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 opacity-60">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-mono text-xs text-slate-500">{pass.passCode}</span>
                                    <p className="font-bold text-slate-400 text-sm">{pass.event.title}</p>
                                    <p className="text-xs text-slate-600">{formatEventDate(pass.event.startDate)}</p>
                                </div>
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-900/30 text-red-400 border border-red-800">
                                    CANCELLED
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Enlarged QR Modal ── */}
            <AnimatePresence>
                {expandedQr && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-8"
                        onClick={() => setExpandedQr(null)}>
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                            className="bg-white rounded-3xl p-8 text-center shadow-2xl"
                            onClick={e => e.stopPropagation()}>
                            <QRCodeSVG value={expandedQr} size={240} level="H" includeMargin={false} />
                            <p className="font-mono font-black text-slate-900 text-lg mt-4">{expandedQr}</p>
                            <p className="text-slate-500 text-sm mt-1">Show this QR code at the venue entrance</p>
                            <button onClick={() => setExpandedQr(null)}
                                className="mt-4 px-6 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto">
                                <X className="w-4 h-4" /> Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
