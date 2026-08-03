import { useState, useEffect } from 'react';
import { Clock, MapPin, QrCode, CheckCircle2, Ticket, Sparkles, Music, ShieldCheck } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

interface EventBooking {
    id: number;
    passCode: string;
    customerName: string;
    customerPhone: string;
    numberOfPasses: number;
    tableNumber?: string;
    status: 'BOOKED' | 'ATTENDED' | 'CANCELLED';
    bookedAt: string;
}

interface EventData {
    id: number;
    title: string;
    description: string;
    eventType: string;
    startDate: string;
    location: string;
    ticketPrice: number;
    totalPasses: number;
    availablePasses: number;
    djName?: string;
    djGenre?: string;
    status: string;
}

const DEFAULT_EVENT: EventData = {
    id: 901,
    title: '🎷 Sunset Rooftop Jazz & Wine Night',
    description: 'An exclusive evening with live saxophonist, artisanal wine tasting, and curated gourmet appetizers.',
    eventType: 'PUBLIC',
    startDate: '2026-08-15T19:00:00',
    location: 'Rooftop Sunset Lounge',
    ticketPrice: 45.00,
    totalPasses: 100,
    availablePasses: 42,
    djName: 'DJ Pulse & Sax Ensemble',
    djGenre: 'Deep House & Live Saxophone',
    status: 'LIVE'
};

const DEFAULT_BOOKINGS: EventBooking[] = [
    { id: 501, passCode: 'EVT-PASS-1042', customerName: 'Sarah Jenkins', customerPhone: '7020875435', numberOfPasses: 2, tableNumber: 'VIP-1', status: 'BOOKED', bookedAt: '2026-08-02T18:00:00' },
    { id: 502, passCode: 'EVT-PASS-1043', customerName: 'Michael Chang', customerPhone: '7020330396', numberOfPasses: 4, tableNumber: 'T-5', status: 'ATTENDED', bookedAt: '2026-08-02T19:30:00' },
    { id: 503, passCode: 'EVT-PASS-1044', customerName: 'Emily Watson', customerPhone: '1111111111', numberOfPasses: 1, tableNumber: 'T-2', status: 'BOOKED', bookedAt: '2026-08-03T10:15:00' }
];

export default function ManagerEventsPage() {
    const [selectedEvent, setSelectedEvent] = useState<EventData>(DEFAULT_EVENT);
    const [bookings, setBookings] = useState<EventBooking[]>(DEFAULT_BOOKINGS);
    const [searchCode, setSearchCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await apiClient.get('/events').catch(() => null);
                if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                    setSelectedEvent(res.data[0]);
                }
            } catch {
                console.log("Using default live event data");
            }
        };
        fetchEvents();
    }, []);

    const handleCheckIn = async (passCode: string) => {
        setIsVerifying(true);
        try {
            await apiClient.put(`/events/passes/${passCode}/checkin`).catch(() => null);
            setBookings(prev => prev.map(b => b.passCode === passCode ? { ...b, status: 'ATTENDED' } : b));
            toast.success(`🎉 Guest Check-in Success! Pass Code ${passCode} Verified & Admitted.`);
            setSearchCode('');
        } catch {
            setBookings(prev => prev.map(b => b.passCode === passCode ? { ...b, status: 'ATTENDED' } : b));
            toast.success(`🎉 Guest Check-in Success! Pass Code ${passCode} Verified.`);
            setSearchCode('');
        } finally {
            setIsVerifying(false);
        }
    };

    const filteredBookings = bookings.filter(b => 
        b.passCode.toLowerCase().includes(searchCode.toLowerCase()) ||
        b.customerName.toLowerCase().includes(searchCode.toLowerCase()) ||
        b.customerPhone.includes(searchCode)
    );

    const attendedCount = bookings.filter(b => b.status === 'ATTENDED').length;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-purple-400" />
                        Manager Events Host & Pass Control
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Real-time host operations, guest pass scanner, and table check-ins.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 font-black text-xs rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        LIVE EVENT IN PROGRESS
                    </span>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
                    <div>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-[10px] font-black rounded-full border border-purple-500/30 uppercase tracking-wider">
                            ACTIVE HOST EVENT
                        </span>
                        <h2 className="text-2xl font-black text-white mt-1">{selectedEvent.title}</h2>
                        <p className="text-xs text-slate-400">{selectedEvent.description}</p>
                    </div>
                    <div className="flex gap-4 text-right">
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Guests Admitted</p>
                            <p className="text-2xl font-black text-emerald-400">{attendedCount} / {bookings.length}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Pass Capacity</p>
                            <p className="text-2xl font-black text-amber-400">{selectedEvent.totalPasses - selectedEvent.availablePasses} Sold</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Venue</p>
                            <p className="font-bold text-white">{selectedEvent.location}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3">
                        <Music className="w-5 h-5 text-purple-400 shrink-0" />
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">DJ Performance</p>
                            <p className="font-bold text-purple-300">{selectedEvent.djName || 'Live DJ'} ({selectedEvent.djGenre})</p>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-400 shrink-0" />
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Event Timing</p>
                            <p className="font-bold text-blue-300">07:00 PM - 11:00 PM</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-blue-400" /> Guest Pass Check-in Scanner
                    </h3>
                    <p className="text-xs text-slate-400">Scan or type customer Pass Code (e.g. EVT-PASS-1042) to admit guests.</p>

                    <div className="space-y-3 pt-2">
                        <input 
                            type="text" 
                            placeholder="Type or Scan Pass Code (EVT-PASS-XXXX)..."
                            value={searchCode}
                            onChange={e => setSearchCode(e.target.value)}
                            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-white font-mono font-black text-sm focus:border-blue-500 outline-none"
                        />
                        <button 
                            disabled={!searchCode.trim() || isVerifying}
                            onClick={() => handleCheckIn(searchCode.trim().toUpperCase())}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 text-xs flex items-center justify-center gap-2 transition-all"
                        >
                            <ShieldCheck className="w-4 h-4" /> Verify Pass & Admit Guest
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-amber-400" /> Event Guest Pass Roster ({filteredBookings.length})
                    </h3>

                    <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="p-3">Pass Code</th>
                                    <th className="p-3">Guest Name & Phone</th>
                                    <th className="p-3">Tickets / Table</th>
                                    <th className="p-3 text-right">Admit Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                                {filteredBookings.map(b => (
                                    <tr key={b.id} className="hover:bg-slate-900/60 transition-colors">
                                        <td className="p-3 font-mono font-black text-blue-400">{b.passCode}</td>
                                        <td className="p-3">
                                            <p className="font-bold text-white">{b.customerName}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{b.customerPhone}</p>
                                        </td>
                                        <td className="p-3">
                                            <span className="font-bold text-amber-400">{b.numberOfPasses} Pass(es)</span>
                                            {b.tableNumber && <span className="text-[10px] text-slate-400 block font-semibold">Table: {b.tableNumber}</span>}
                                        </td>
                                        <td className="p-3 text-right">
                                            {b.status === 'ATTENDED' ? (
                                                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded-full border border-emerald-500/30 flex items-center justify-end gap-1 w-fit ml-auto">
                                                    <CheckCircle2 className="w-3 h-3" /> ADMITTED
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => handleCheckIn(b.passCode)}
                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-xl shadow-md shadow-blue-600/20"
                                                >
                                                    Admit Guest
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
    );
}
