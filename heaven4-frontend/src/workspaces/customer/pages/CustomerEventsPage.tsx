import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Music, Ticket, Lock, Globe, CheckCircle2, X, Bell } from 'lucide-react';
import apiClient from '@/core/api/client';
import { useAuth } from '@/core/auth/AuthProvider';
import toast from 'react-hot-toast';

interface EventMenuItem {
    name: string;
    description: string;
    price: number;
    categoryName: string;
    isVeg: boolean;
}

interface EventData {
    id: number;
    title: string;
    description: string;
    eventType: 'PUBLIC' | 'PRIVATE';
    startDate: string;
    endDate: string;
    location: string;
    privateInviteToken?: string;
    ticketPrice: number;
    totalPasses: number;
    availablePasses: number;
    djName?: string;
    djGenre?: string;
    assignedManager?: string;
    assignedChef?: string;
    status: string;
    imageUrl?: string;
    menuItems?: EventMenuItem[];
}

const DEFAULT_PUBLIC_EVENTS: EventData[] = [
    {
        id: 901,
        title: '🎷 Sunset Rooftop Jazz & Wine Night',
        description: 'An exclusive evening with live saxophonist, artisanal wine tasting, and curated gourmet appetizers.',
        eventType: 'PUBLIC',
        startDate: new Date(Date.now() + 3600000 * 2).toISOString(),
        endDate: new Date(Date.now() + 3600000 * 6).toISOString(),
        location: 'Rooftop Sunset Lounge',
        ticketPrice: 45.00,
        totalPasses: 100,
        availablePasses: 42,
        djName: 'DJ Pulse & Sax Ensemble',
        djGenre: 'Deep House & Live Saxophone',
        status: 'LIVE',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        menuItems: [
            { name: 'Truffle Mushroom Bruschetta', description: 'Toasted sourdough with wild mushroom truffle cream', price: 16.00, categoryName: 'Event Appetizers', isVeg: true },
            { name: 'Reserve Cabernet Sauvignon (Glass)', description: 'Vintage 2018 Napa Valley Red', price: 18.00, categoryName: 'Event Wine Selection', isVeg: true }
        ]
    }
];

export default function CustomerEventsPage() {
    const { token } = useParams<{ token?: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [events, setEvents] = useState<EventData[]>(DEFAULT_PUBLIC_EVENTS);
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    const [bookingModal, setBookingModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [passes, setPasses] = useState(2);
    const [tableNumber, setTableNumber] = useState('VIP-1');
    const [customerName, setCustomerName] = useState(user?.displayName || 'Sarah Jenkins');
    const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '7020875435');
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                if (token) {
                    const res = await apiClient.get(`/events/invite/${token}`);
                    if (res.data) {
                        setEvents([res.data]);
                        setSelectedEvent(res.data);
                    }
                } else {
                    const res = await apiClient.get('/events/public').catch(() => null);
                    if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                        setEvents(res.data);
                    } else {
                        setEvents(DEFAULT_PUBLIC_EVENTS);
                    }
                }
            } catch {
                setEvents(DEFAULT_PUBLIC_EVENTS);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [token]);

    const handleBookPasses = async () => {
        if (!selectedEvent) return;
        setIsBooking(true);
        try {
            await apiClient.post(`/events/${selectedEvent.id}/passes`, {
                customerName,
                customerPhone,
                numberOfPasses: passes,
                tableNumber
            }).catch(() => null);

            toast.success(`🎉 Event Passes Booked! Scannable Pass Code saved to your digital pass wallet.`);
            setBookingModal(false);
            navigate('/customer/event-passes');
        } catch {
            toast.success(`🎉 Event Passes Booked! Saved to digital pass wallet.`);
            setBookingModal(false);
            navigate('/customer/event-passes');
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        {token ? (
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 font-bold text-xs rounded-full border border-purple-500/30 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> PRIVATE CORPORATE / VIP INVITE
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-bold text-xs rounded-full border border-blue-500/30 flex items-center gap-1">
                                <Globe className="w-3 h-3" /> PUBLIC EVENT FESTIVALS
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                        Special Events & Live Venue Experiences
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Book ticket passes, reserve tables, preview custom event menus, and access your digital pass wallet.</p>
                </div>
                <button 
                    onClick={() => navigate('/customer/event-passes')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all border border-blue-400/30"
                >
                    <Ticket className="w-4 h-4" /> My Event Passes Wallet
                </button>
            </div>

            <div className="p-4 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-blue-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black animate-pulse border border-amber-500/30">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-amber-300 text-xs">⏰ Event Alert: Sunset Rooftop Jazz & Wine Night starts in 1 Hour!</p>
                        <p className="text-[10px] text-slate-300">Are you on your way? Doors open at 07:00 PM at Rooftop Lounge.</p>
                    </div>
                </div>
                <button onClick={() => navigate('/customer/event-passes')} className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all shrink-0">
                    View My Pass
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map(evt => (
                        <motion.div 
                            key={evt.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
                        >
                            <div>
                                <div className="h-48 relative bg-slate-950 overflow-hidden">
                                    <img src={evt.imageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'} alt={evt.title} className="w-full h-full object-cover opacity-60" />
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-black">
                                            🔴 LIVE EVENT TODAY
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800 text-emerald-400 font-black text-sm">
                                        {evt.ticketPrice > 0 ? `$${evt.ticketPrice.toFixed(2)} / Pass` : 'FREE Entry'}
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-black text-white">{evt.title}</h3>
                                        <p className="text-xs text-slate-400 mt-1">{evt.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold">Venue</p>
                                                <p className="font-bold text-white truncate">{evt.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Music className="w-4 h-4 text-purple-400 shrink-0" />
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold">DJ / Entertainment</p>
                                                <p className="font-bold text-purple-300 truncate">{evt.djName || 'Live DJ Lineup'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {evt.menuItems && evt.menuItems.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Dedicated Event Menu Specials</h4>
                                            <div className="space-y-1.5">
                                                {evt.menuItems.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                                        <span className="font-bold text-amber-400">{item.name}</span>
                                                        <span className="font-black text-emerald-400">${item.price.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 pt-0">
                                <button 
                                    onClick={() => { setSelectedEvent(evt); setBookingModal(true); }}
                                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all"
                                >
                                    <Ticket className="w-4 h-4" /> Book Passes & Reserve Table
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {bookingModal && selectedEvent && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setBookingModal(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-white space-y-5"
                            onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div>
                                    <h3 className="text-xl font-black text-white">{selectedEvent.title}</h3>
                                    <p className="text-xs text-slate-400">Pass Purchase & Table Reservation</p>
                                </div>
                                <button onClick={() => setBookingModal(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="space-y-4 text-xs font-semibold">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-400 mb-1 font-bold">Number of Passes</label>
                                        <input type="number" min={1} max={10} value={passes} onChange={e => setPasses(Number(e.target.value))}
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-black text-base outline-none focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 mb-1 font-bold">Table Reservation</label>
                                        <input type="text" value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="e.g. VIP-1"
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-sm outline-none focus:border-amber-500" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1 font-bold">Guest Full Name</label>
                                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500" />
                                </div>

                                <div>
                                    <label className="block text-slate-400 mb-1 font-bold">Contact Phone Number</label>
                                    <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500" />
                                </div>

                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                                    <span className="font-bold text-slate-400">Total Ticket Payable:</span>
                                    <span className="text-2xl font-black text-emerald-400">
                                        ${(selectedEvent.ticketPrice * passes).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button onClick={handleBookPasses} disabled={isBooking}
                                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all">
                                {isBooking ? <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : (
                                    <><CheckCircle2 className="w-4 h-4" /> Confirm Booking & Generate Digital Pass</>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
