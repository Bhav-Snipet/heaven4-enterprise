import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    QrCode, CheckCircle2, Ticket, Sparkles,
    ShieldCheck, ChefHat, Calendar, History, Radio,
    Camera, X
} from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';
import {
    formatEventDateTime, getDietaryBadge, EventMenuItem
} from '@/shared/utils/eventHelpers';
import { loadEventGuests, updateGuestStatus } from '@/shared/utils/eventGuestHelpers';

interface EventPassBooking {
    id: number; passCode: string; customerName: string; customerPhone: string;
    numberOfPasses: number; tableNumber?: string; totalPaid: number;
    status: 'BOOKED' | 'ATTENDED' | 'CANCELLED'; bookedAt: string; checkedInAt?: string;
}
interface EventData {
    id: number; title: string; description: string;
    eventType: 'PUBLIC' | 'PRIVATE';
    status: 'DRAFT' | 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
    startDate: string; endDate: string; location: string;
    ticketPrice: number; totalCapacity: number; availablePasses: number;
    djName?: string; djGenre?: string; assignedManager: string;
    assignedChef: string; assignedEmployees: string;
    imageUrl?: string; menuItems: EventMenuItem[];
}

const DEMO_EVENTS: EventData[] = [
    {
        id: 901, title: '🎷 Sunset Rooftop Jazz & Wine Night',
        description: 'Exclusive evening with live saxophonist and artisanal wine tasting.',
        eventType: 'PUBLIC', status: 'LIVE',
        startDate: new Date(Date.now() - 3600000).toISOString(),
        endDate: new Date(Date.now() + 7200000).toISOString(),
        location: 'Rooftop Sunset Lounge', ticketPrice: 45.00, totalCapacity: 100, availablePasses: 42,
        djName: 'DJ Pulse & Sax Ensemble', djGenre: 'Deep House & Live Saxophone',
        assignedManager: 'Sarah Jenkins', assignedChef: 'Marco Polo', assignedEmployees: 'Alex Rivera, David Kim',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        menuItems: [
            { name: 'Truffle Mushroom Bruschetta', description: 'Sourdough with truffle cream', price: 16.00, category: 'Event Starters', dietaryType: 'VEG', imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400' },
            { name: 'Wagyu Beef Slider Trio', description: 'Brioche sliders', price: 28.00, category: 'Event Mains', dietaryType: 'NON_VEG', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
            { name: 'Reserve Cabernet Sauvignon', description: 'Vintage Napa Red', price: 18.00, category: 'Event Drinks & Cocktails', dietaryType: 'ALCOHOLIC', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400' },
        ]
    },
    {
        id: 902, title: '💼 Horizon Corp Private Gala',
        description: 'Private corporate dinner for Horizon Corp leadership.',
        eventType: 'PRIVATE', status: 'UPCOMING',
        startDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 5 * 86400000 + 4 * 3600000).toISOString(),
        location: 'Grand Ballroom VIP Hall', ticketPrice: 0, totalCapacity: 60, availablePasses: 34,
        djName: 'DJ ElectroWave', djGenre: 'Ambient Lounge',
        assignedManager: 'Sarah Jenkins', assignedChef: 'Marco Polo', assignedEmployees: 'Alex Rivera',
        imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
        menuItems: []
    },
];

const DEMO_BOOKINGS: EventPassBooking[] = [
    { id: 501, passCode: 'EVT-PASS-8421', customerName: 'Sarah Cooper', customerPhone: '9876543210', numberOfPasses: 2, tableNumber: 'VIP-1', totalPaid: 90, status: 'ATTENDED', bookedAt: '2026-08-02T10:00:00', checkedInAt: '2026-08-04T16:15:00' },
    { id: 502, passCode: 'EVT-PASS-7392', customerName: 'Michael Chang', customerPhone: '9800330396', numberOfPasses: 3, tableNumber: 'T-5', totalPaid: 135, status: 'BOOKED', bookedAt: '2026-08-03T14:30:00' },
    { id: 503, passCode: 'EVT-PASS-5841', customerName: 'Emily Watson', customerPhone: '9700111222', numberOfPasses: 1, totalPaid: 45, status: 'BOOKED', bookedAt: '2026-08-04T09:15:00' },
    { id: 504, passCode: 'EVT-PASS-2294', customerName: 'Raj Mehta', customerPhone: '9600887766', numberOfPasses: 4, tableNumber: 'T-12', totalPaid: 180, status: 'ATTENDED', bookedAt: '2026-08-01T18:00:00', checkedInAt: '2026-08-04T16:05:00' },
    { id: 505, passCode: 'EVT-PASS-9913', customerName: 'Priya Sharma', customerPhone: '9500664433', numberOfPasses: 2, tableNumber: 'T-3', totalPaid: 90, status: 'BOOKED', bookedAt: '2026-08-04T11:00:00' },
];

type Tab = 'live' | 'upcoming' | 'history';

export default function ManagerEventsPage() {
    const [events, setEvents] = useState<EventData[]>(DEMO_EVENTS);
    const [bookings, setBookings] = useState<EventPassBooking[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>('live');
    const [searchCode, setSearchCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [verifyResult, setVerifyResult] = useState<{ pass: EventPassBooking; type: 'success' | 'already' | 'cancelled' | 'notfound' } | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    const syncBookingsFromStorage = () => {
        const liveGuests = loadEventGuests();
        const formatted: EventPassBooking[] = liveGuests.map((g, idx) => ({
            id: 800 + idx,
            passCode: g.passCode,
            customerName: g.guestName,
            customerPhone: g.guestPhone,
            numberOfPasses: g.passesCount,
            tableNumber: g.tableNumber,
            totalPaid: 45 * g.passesCount,
            status: g.status === 'ATTENDED ✓' ? 'ATTENDED' : g.status === 'CANCELLED' ? 'CANCELLED' : 'BOOKED',
            bookedAt: g.bookedAt
        }));
        setBookings(formatted);
    };

    useEffect(() => {
        syncBookingsFromStorage();
        const handleGuestsUpdated = () => syncBookingsFromStorage();
        window.addEventListener('heaven4-guests-updated', handleGuestsUpdated);
        window.addEventListener('storage', handleGuestsUpdated);
        return () => {
            window.removeEventListener('heaven4-guests-updated', handleGuestsUpdated);
            window.removeEventListener('storage', handleGuestsUpdated);
        };
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await apiClient.get('/events').catch(() => null);
                if (res?.data && Array.isArray(res.data) && res.data.length > 0) setEvents(res.data);
            } catch { /* use demo */ }
        };
        fetchEvents();
    }, []);

    const liveEvent = events.find(e => e.status === 'LIVE');
    const upcomingEvents = events.filter(e => e.status === 'UPCOMING' || e.status === 'DRAFT');
    const historyEvents = events.filter(e => e.status === 'COMPLETED' || e.status === 'CANCELLED');

    const totalBookedGuests = bookings.reduce((sum, b) => b.status !== 'CANCELLED' ? sum + b.numberOfPasses : sum, 0);
    const totalAttendedGuests = bookings.reduce((sum, b) => b.status === 'ATTENDED' ? sum + b.numberOfPasses : sum, 0);
    const attendanceRate = totalBookedGuests > 0 ? Math.round((totalAttendedGuests / totalBookedGuests) * 100) : 0;

    // Check-in single pass or coupon code
    const handleCheckIn = async (code: string) => {
        if (!code.trim()) { toast.error('Please enter a coupon or pass code'); return; }
        const cleanCode = code.trim().toUpperCase();
        setIsVerifying(true);
        try {
            const found = bookings.find(b => b.passCode.toUpperCase() === cleanCode || b.passCode.endsWith(cleanCode));
            if (!found) {
                setVerifyResult({ pass: { id: -1, passCode: cleanCode, customerName: '', customerPhone: '', numberOfPasses: 0, totalPaid: 0, status: 'BOOKED', bookedAt: '' }, type: 'notfound' });
                setIsVerifying(false);
                return;
            }
            if (found.status === 'ATTENDED') {
                setVerifyResult({ pass: found, type: 'already' });
                setIsVerifying(false);
                return;
            }
            if (found.status === 'CANCELLED') {
                setVerifyResult({ pass: found, type: 'cancelled' });
                setIsVerifying(false);
                return;
            }

            const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            await apiClient.put(`/events/passes/${found.passCode}/checkin`, {}, { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
            updateGuestStatus(found.passCode, 'ATTENDED ✓');
            setBookings(prev => prev.map(b => b.id === found.id ? { ...b, status: 'ATTENDED', checkedInAt: new Date().toISOString() } : b));
            setVerifyResult({ pass: { ...found, status: 'ATTENDED', checkedInAt: now }, type: 'success' });
            toast.success(`🎉 ${found.customerName} (${found.numberOfPasses} passes) Checked In!`);
        } finally { setIsVerifying(false); }
    };

    // Camera Scan Simulation
    const handleCameraScan = () => {
        setIsCameraActive(true);
        toast.loading('📷 Scanning camera for pass QR code...', { id: 'cam-scan' });
        setTimeout(() => {
            setIsCameraActive(false);
            toast.dismiss('cam-scan');
            const unverified = bookings.find(b => b.status === 'BOOKED');
            if (unverified) {
                setSearchCode(unverified.passCode);
                handleCheckIn(unverified.passCode);
            } else {
                toast.success('📷 Camera scanned pass code EVT-PASS-7392');
                handleCheckIn('EVT-PASS-7392');
            }
        }, 1500);
    };

    const clearVerifyResult = () => { setVerifyResult(null); setSearchCode(''); };

    const filteredBookings = bookings.filter(b =>
        !searchCode.trim() ||
        b.passCode.toLowerCase().includes(searchCode.toLowerCase()) ||
        b.customerName.toLowerCase().includes(searchCode.toLowerCase()) ||
        b.customerPhone.includes(searchCode)
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 max-w-7xl mx-auto space-y-6 pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Manager · Events Host Control</span>
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                        Event Check-in & Attendance Host
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Scan pass coupons, verify tickets, admit groups, monitor live attendance rates, and review dish menus.</p>
                </div>
                {liveEvent && (
                    <span className="px-4 py-2 bg-red-500/20 text-red-300 font-black text-xs rounded-xl border border-red-500/30 flex items-center gap-2 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" /> EVENT LIVE NOW
                    </span>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
                {([
                    { key: 'live' as Tab, label: 'Live Check-in & Host', icon: Radio, count: liveEvent ? 1 : 0 },
                    { key: 'upcoming' as Tab, label: 'Upcoming Events', icon: Calendar, count: upcomingEvents.length },
                    { key: 'history' as Tab, label: 'History & Stats', icon: History, count: historyEvents.length },
                ] as const).map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            activeTab === tab.key
                                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}>
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── LIVE CHECK-IN TAB ── */}
            {activeTab === 'live' && (
                <div className="space-y-6">
                    {/* Live Event Info Card */}
                    {liveEvent && (
                        <div className="bg-slate-900 border border-red-500/20 rounded-3xl p-6 shadow-2xl space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-black text-red-300 uppercase px-2.5 py-1 bg-red-500/20 rounded-full border border-red-500/30 flex items-center gap-1.5 mb-2 w-fit">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" /> LIVE EVENT IN PROGRESS
                                    </span>
                                    <h2 className="text-2xl font-black text-white">{liveEvent.title}</h2>
                                    <p className="text-xs text-slate-400 mt-1">{liveEvent.location} · Manager: {liveEvent.assignedManager} · Chef: {liveEvent.assignedChef}</p>
                                </div>
                                <button onClick={() => setShowMenu(!showMenu)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700">
                                    <ChefHat className="w-3.5 h-3.5 inline mr-1" /> {showMenu ? 'Hide Event Menu' : 'View Event Menu'}
                                </button>
                            </div>

                            {/* Attendance Analytics Progress */}
                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold">Attendance Rate</span>
                                    <span className="text-emerald-400 font-black">{totalAttendedGuests} / {totalBookedGuests} Guests Admitted ({attendanceRate}%)</span>
                                </div>
                                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${attendanceRate}%` }} />
                                </div>
                            </div>

                            {showMenu && liveEvent.menuItems.length > 0 && (
                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                                    <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Tonight's Special Event Menu & Drinks</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {liveEvent.menuItems.map((item, idx) => {
                                            const badge = getDietaryBadge(item.dietaryType || 'VEG');
                                            return (
                                                <div key={idx} className="flex items-center gap-2.5 p-2 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                                                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-slate-950 shrink-0" />}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-white truncate">{item.name}</p>
                                                        <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold ${badge.badge}`}>{badge.icon} {badge.label}</span>
                                                    </div>
                                                    <span className="font-black text-emerald-400">${item.price.toFixed(2)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Scanner & Roster */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Coupon Scanner */}
                        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                <QrCode className="w-5 h-5 text-blue-400" /> Coupon & Pass Code Scanner
                            </h3>
                            <p className="text-xs text-slate-400">Scan QR coupon code with camera or type code to verify and admit guests.</p>

                            <div className="space-y-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="EVT-PASS-XXXX"
                                        value={searchCode}
                                        onChange={e => { setSearchCode(e.target.value.toUpperCase()); setVerifyResult(null); }}
                                        onKeyDown={e => e.key === 'Enter' && handleCheckIn(searchCode)}
                                        className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-mono font-black text-base focus:border-blue-500 outline-none tracking-widest placeholder:text-slate-700 placeholder:font-normal"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        disabled={!searchCode.trim() || isVerifying}
                                        onClick={() => handleCheckIn(searchCode)}
                                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
                                    >
                                        {isVerifying ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Verify Pass</>}
                                    </button>
                                    <button
                                        onClick={handleCameraScan}
                                        disabled={isCameraActive}
                                        className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-all shrink-0"
                                    >
                                        <Camera className="w-4 h-4" /> Camera Scan
                                    </button>
                                </div>
                            </div>

                            {/* Verification Result Feedback */}
                            <AnimatePresence>
                                {verifyResult && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className={`p-4 rounded-2xl border text-xs space-y-2 ${
                                            verifyResult.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                            verifyResult.type === 'already' ? 'bg-blue-500/10 border-blue-500/30' :
                                            verifyResult.type === 'cancelled' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'
                                        }`}>
                                        <div className="flex justify-between items-start">
                                            <p className={`font-black text-sm ${verifyResult.type === 'success' ? 'text-emerald-400' : verifyResult.type === 'already' ? 'text-blue-400' : 'text-amber-400'}`}>
                                                {verifyResult.type === 'success' && '✓ PASS VERIFIED & ADMITTED'}
                                                {verifyResult.type === 'already' && '⚠️ ALREADY CHECKED IN'}
                                                {verifyResult.type === 'cancelled' && '❌ BOOKING CANCELLED'}
                                                {verifyResult.type === 'notfound' && '❌ INVALID COUPON / PASS CODE'}
                                            </p>
                                            <button onClick={clearVerifyResult} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                                        </div>
                                        {verifyResult.type !== 'notfound' && (
                                            <div className="space-y-1">
                                                <p className="text-white font-bold">{verifyResult.pass.customerName}</p>
                                                <p className="text-slate-400">{verifyResult.pass.customerPhone}</p>
                                                <p className="text-amber-400 font-bold">{verifyResult.pass.numberOfPasses} Guest Ticket(s){verifyResult.pass.tableNumber ? ` · Table ${verifyResult.pass.tableNumber}` : ''}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Live Counters */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                    <p className="text-emerald-400 font-black text-2xl">{totalAttendedGuests}</p>
                                    <p className="text-slate-500 font-bold uppercase text-[10px]">Guests Checked In</p>
                                </div>
                                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                    <p className="text-amber-400 font-black text-2xl">{totalBookedGuests - totalAttendedGuests}</p>
                                    <p className="text-slate-500 font-bold uppercase text-[10px]">Remaining Expected</p>
                                </div>
                            </div>
                        </div>

                        {/* Guest Check-in Roster Table */}
                        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-amber-400" /> Guest Bookings & Coupons ({filteredBookings.length})
                                </h3>
                                <input type="text" placeholder="Search name/phone/code..." value={searchCode}
                                    onChange={e => { setSearchCode(e.target.value.toUpperCase()); setVerifyResult(null); }}
                                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-amber-500 w-48 placeholder:text-slate-600" />
                            </div>

                            <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                                        <tr>
                                            <th className="p-3">Pass / Coupon</th>
                                            <th className="p-3">Guest</th>
                                            <th className="p-3">Tickets & Table</th>
                                            <th className="p-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {filteredBookings.map(b => (
                                            <tr key={b.id} className="hover:bg-slate-900/60 transition-colors">
                                                <td className="p-3 font-mono font-black text-blue-400 text-[11px]">{b.passCode}</td>
                                                <td className="p-3">
                                                    <p className="font-bold text-white">{b.customerName}</p>
                                                    <p className="text-[10px] text-slate-400">{b.customerPhone}</p>
                                                </td>
                                                <td className="p-3">
                                                    <span className="font-bold text-amber-400">{b.numberOfPasses} Pass{b.numberOfPasses > 1 ? 'es' : ''}</span>
                                                    {b.tableNumber && <span className="text-[10px] text-slate-400 block">Table {b.tableNumber}</span>}
                                                </td>
                                                <td className="p-3 text-right">
                                                    {b.status === 'ATTENDED' ? (
                                                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded-full border border-emerald-500/30 flex items-center gap-1 w-fit ml-auto">
                                                            <CheckCircle2 className="w-3 h-3" /> ATTENDED
                                                        </span>
                                                    ) : (
                                                        <button onClick={() => handleCheckIn(b.passCode)}
                                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-xl shadow-md shadow-blue-600/20 transition-all">
                                                            Check In ({b.numberOfPasses})
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: UPCOMING */}
            {activeTab === 'upcoming' && (
                <div className="space-y-4">
                    {upcomingEvents.map(evt => (
                        <div key={evt.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                            <h3 className="text-xl font-black text-white">{evt.title}</h3>
                            <p className="text-xs text-slate-400">{evt.description}</p>
                            <p className="text-xs text-amber-400 font-bold">{formatEventDateTime(evt.startDate, evt.endDate)} · {evt.location}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB: HISTORY */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {historyEvents.map(evt => (
                        <div key={evt.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 opacity-80">
                            <h3 className="text-xl font-black text-slate-300">{evt.title}</h3>
                            <p className="text-xs text-slate-500">{formatEventDateTime(evt.startDate, evt.endDate)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
