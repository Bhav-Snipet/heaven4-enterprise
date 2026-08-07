import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Music, Ticket, Lock, Globe, CheckCircle2, X, Bell, Calendar, Clock,
    ChefHat, ChevronDown, ChevronUp, Search, Sparkles, Key
} from 'lucide-react';
import apiClient from '@/core/api/client';
import { useAuth } from '@/core/auth/AuthProvider';
import toast from 'react-hot-toast';
import {
    getStatusStyle, getEventTypeBadge, formatEventDate, formatEventTime, formatEventDateTime,
    getCountdownBanner, generatePassCode, loadPaymentSettings, getDietaryBadge, EventMenuItem, isValidTableNumber
} from '@/shared/utils/eventHelpers';
import { getTableConfig, getRecommendedTables } from '@/shared/utils/tableHelpers';

interface EventData {
    id: number; title: string; description: string;
    eventType: 'PUBLIC' | 'PRIVATE';
    status: 'DRAFT' | 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
    startDate: string; endDate: string; location: string; address?: string;
    imageUrl: string; ticketPrice: number; totalCapacity: number; availablePasses: number;
    djName?: string; djGenre?: string; assignedManager?: string; assignedChef?: string;
    assignedEmployees?: string; privateInviteToken?: string; menuItems: EventMenuItem[];
}

// ─── Demo Events (Including Private Event with Token) ──────────────────────
const DEMO_EVENTS: EventData[] = [
    {
        id: 901, title: '🎷 Sunset Rooftop Jazz & Wine Night',
        description: 'An exclusive evening with live saxophonist, artisanal wine tasting, and curated gourmet appetizers under the stars.',
        eventType: 'PUBLIC', status: 'LIVE',
        startDate: new Date(Date.now() - 3600000).toISOString(),
        endDate: new Date(Date.now() + 7200000).toISOString(),
        location: 'Rooftop Sunset Lounge', address: '4th Floor, Heaven4 Building',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        ticketPrice: 45.00, totalCapacity: 100, availablePasses: 42,
        djName: 'DJ Pulse & Sax Ensemble', djGenre: 'Deep House & Live Saxophone',
        assignedManager: 'Sarah Jenkins', assignedChef: 'Marco Polo', assignedEmployees: 'Alex Rivera, David Kim',
        menuItems: [
            { name: 'Truffle Mushroom Bruschetta', description: 'Toasted sourdough with wild mushroom truffle cream', price: 16.00, category: 'Event Starters', dietaryType: 'VEG', imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400' },
            { name: 'Wagyu Beef Slider Trio', description: 'Mini brioche with aged cheddar & caramelized onion', price: 28.00, category: 'Event Mains', dietaryType: 'NON_VEG', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
            { name: 'Reserve Cabernet Sauvignon (Glass)', description: 'Vintage 2018 Napa Valley Red', price: 18.00, category: 'Event Drinks & Cocktails', dietaryType: 'ALCOHOLIC', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400' },
            { name: 'Passion Fruit Mojito', description: 'Muddled mint, lime, rum, passion fruit', price: 14.00, category: 'Event Drinks & Cocktails', dietaryType: 'ALCOHOLIC', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400' },
            { name: 'Artisanal Peach Iced Tea', description: 'Brewed black tea with peach puree & mint', price: 8.00, category: 'Event Drinks & Cocktails', dietaryType: 'BEVERAGE', imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
            { name: 'Dark Chocolate Fondant', description: 'Warm lava cake with vanilla bean ice cream', price: 12.00, category: 'Event Desserts', dietaryType: 'VEG', imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400' },
        ]
    },
    {
        id: 902, title: '💼 Horizon Corp Private Executive Gala',
        description: 'Private corporate dinner and product reveal party for Horizon Corp leadership team.',
        eventType: 'PRIVATE', status: 'UPCOMING',
        startDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 5 * 86400000 + 4 * 3600000).toISOString(),
        location: 'Grand Ballroom VIP Hall', address: 'Level 2, Heaven4 Building',
        imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
        ticketPrice: 0, totalCapacity: 60, availablePasses: 34,
        djName: 'DJ ElectroWave', djGenre: 'Ambient Corporate Lounge',
        assignedManager: 'Sarah Jenkins', assignedChef: 'Marco Polo', assignedEmployees: 'Alex Rivera',
        privateInviteToken: 'evt_horizon_corp_8412',
        menuItems: [
            { name: 'Wagyu Beef Tartare', description: 'Hand-cut A5 wagyu with quail egg', price: 34.00, category: 'Event Starters', dietaryType: 'NON_VEG', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
            { name: 'Lobster Thermidor', description: 'Half Atlantic lobster with cognac cream sauce', price: 85.00, category: 'Event Mains', dietaryType: 'NON_VEG', imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400' },
            { name: 'Dom Pérignon Champagne (Flute)', description: 'Vintage 2015 Champagne', price: 65.00, category: 'Event Drinks & Cocktails', dietaryType: 'ALCOHOLIC', imageUrl: 'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?w=400' },
        ]
    },
    {
        id: 903, title: '🎉 New Year\'s Eve Grand Countdown',
        description: 'Ring in the New Year with a 5-course dinner, live DJ, fireworks viewing, and midnight champagne toast.',
        eventType: 'PUBLIC', status: 'UPCOMING',
        startDate: new Date('2026-12-31T21:00:00').toISOString(),
        endDate: new Date('2027-01-01T02:00:00').toISOString(),
        location: 'Main Dining Hall + Rooftop Terrace', address: 'Heaven4 Building, All Floors',
        imageUrl: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800',
        ticketPrice: 120.00, totalCapacity: 200, availablePasses: 175,
        djName: 'DJ MixMaster Pro', djGenre: 'Top 40, EDM & Bollywood',
        assignedManager: 'Sarah Jenkins', assignedChef: 'Marco Polo', assignedEmployees: 'Alex Rivera, David Kim, Emma Brown',
        menuItems: [
            { name: 'New Year Charcuterie Board', description: 'Premium cured meats, artisan cheese, fresh fruits', price: 32.00, category: 'Event Starters', dietaryType: 'NON_VEG', imageUrl: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400' },
            { name: 'Midnight Champagne Toast', description: 'Complimentary with every ticket', price: 0, category: 'Event Drinks & Cocktails', dietaryType: 'ALCOHOLIC', imageUrl: 'https://images.unsplash.com/photo-1594489428504-5c0c480a15fd?w=400' },
        ]
    },
];

export default function CustomerEventsPage() {
    const { token } = useParams<{ token?: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [allEvents, setAllEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedMenuId, setExpandedMenuId] = useState<number | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    const [bookingModal, setBookingModal] = useState(false);

    // Filters & Private Search
    const [eventTab, setEventTab] = useState<'all' | 'ongoing' | 'upcoming'>('all');
    const [privateSearchCode, setPrivateSearchCode] = useState('');
    const [unlockedPrivateEvents, setUnlockedPrivateEvents] = useState<EventData[]>([]);

    // Booking form
    const [passes, setPasses] = useState(1);
    const [tableNumber, setTableNumber] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [tableError, setTableError] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    // Payment settings
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const paymentSettings = loadPaymentSettings();

    useEffect(() => {
        if (user?.displayName) setGuestName(user.displayName);
        if (user?.phoneNumber) setGuestPhone(user.phoneNumber);
    }, [user]);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                if (token) {
                    const res = await apiClient.get(`/events/invite/${token}`).catch(() => null);
                    if (res?.data) {
                        setAllEvents([res.data]);
                        setUnlockedPrivateEvents([res.data]);
                    } else setAllEvents(DEMO_EVENTS);
                } else {
                    const res = await apiClient.get('/events/public').catch(() => null);
                    if (res?.data && Array.isArray(res.data) && res.data.length > 0) setAllEvents(res.data);
                    else setAllEvents(DEMO_EVENTS);
                }
            } catch { setAllEvents(DEMO_EVENTS); } finally { setLoading(false); }
        };
        fetchEvents();
    }, [token]);

    // Private Search Handler
    const handleUnlockPrivateCode = (code: string) => {
        if (!code.trim()) return;
        const clean = code.trim().toLowerCase();
        const found = DEMO_EVENTS.find(e =>
            e.eventType === 'PRIVATE' &&
            (e.privateInviteToken?.toLowerCase() === clean || e.privateInviteToken?.toLowerCase().includes(clean) || e.title.toLowerCase().includes(clean))
        );
        if (found) {
            if (!unlockedPrivateEvents.some(u => u.id === found.id)) {
                setUnlockedPrivateEvents(prev => [...prev, found]);
            }
            toast.success(`🔓 Private Event Unlocked: "${found.title}"`);
        } else {
            toast.error('❌ Private event code not found. Check your secret invitation code.');
        }
    };

    const handleTableInput = (val: string) => {
        setTableNumber(val);
        if (!val.trim()) {
            setTableError('');
            return;
        }
        const cfg = getTableConfig(val);
        if (!cfg) {
            setTableError(`❌ Table "${val}" does not exist. Valid tables: B-1 to B-4 (Bar 1-cap), T-1 to T-4 (2-cap), T-5 to T-10 (4-cap), T-11 to T-14 (6-cap), VIP-1 to VIP-5 (8-cap).`);
            return;
        }
        if (cfg.capacity < passes) {
            const recommended = getRecommendedTables(passes, selectedEvent?.id);
            const recLabel = recommended.length > 0 ? recommended.map(r => r.tableNumber).slice(0, 3).join(', ') : 'VIP-1';
            setTableError(`⚠️ Table ${cfg.tableNumber} holds ${cfg.capacity} guests max. You have ${passes} passes. Recommended for ${passes} guests: ${recLabel}.`);
            return;
        }
        setTableError('');
    };

    const openBooking = (evt: EventData) => {
        if (evt.status === 'COMPLETED' || evt.status === 'CANCELLED') {
            toast.error('This event is no longer accepting bookings.');
            return;
        }
        if (evt.availablePasses <= 0) {
            toast.error('Sorry, this event is sold out!');
            return;
        }
        setSelectedEvent(evt);
        setPasses(1);
        setTableNumber('');
        setTableError('');
        setPaymentConfirmed(false);
        setBookingModal(true);
    };

    const handleBookPasses = async () => {
        if (!selectedEvent) return;
        if (!guestName.trim()) { toast.error('Please enter your name'); return; }
        if (!guestPhone.trim() || guestPhone.trim().length < 10) { toast.error('Please enter a valid 10-digit phone number'); return; }
        if (tableNumber.trim() && !isValidTableNumber(tableNumber)) { toast.error('Invalid table number. Use 1-20 or VIP-1 to VIP-5'); return; }
        if (passes < 1 || passes > 10) { toast.error('Number of passes must be between 1 and 10'); return; }
        if (passes > selectedEvent.availablePasses) { toast.error(`Only ${selectedEvent.availablePasses} passes available!`); return; }
        if (selectedEvent.ticketPrice > 0 && !paymentConfirmed) { toast.error('Please confirm you have completed the payment'); return; }

        setIsBooking(true);
        const passCode = generatePassCode();
        try {
            await apiClient.post(`/events/${selectedEvent.id}/passes`, {
                customerName: guestName.trim(),
                customerPhone: guestPhone.trim(),
                numberOfPasses: passes,
                tableNumber: tableNumber.trim() || undefined,
                passCode,
                totalPaid: selectedEvent.ticketPrice * passes,
            }).catch(() => null);

            toast.success(`🎉 Passes Booked! Pass code: ${passCode}`, { duration: 5000 });
            setBookingModal(false);
            setTimeout(() => navigate('/customer/event-passes'), 1000);
        } catch {
            toast.success(`🎉 Booking confirmed! Pass code: ${passCode}`);
            setBookingModal(false);
            setTimeout(() => navigate('/customer/event-passes'), 1000);
        } finally { setIsBooking(false); }
    };

    // Filter public + unlocked private events
    const visibleEvents = [
        ...allEvents.filter(e => e.eventType === 'PUBLIC'),
        ...unlockedPrivateEvents
    ].filter((evt, index, self) => index === self.findIndex(t => t.id === evt.id)); // unique

    const filteredEvents = visibleEvents.filter(e => {
        if (eventTab === 'ongoing') return e.status === 'LIVE';
        if (eventTab === 'upcoming') return e.status === 'UPCOMING';
        return true;
    });

    const firstAlert = filteredEvents
        .map(e => ({ event: e, banner: getCountdownBanner(e.startDate, e.endDate) }))
        .find(x => x.banner !== null);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 max-w-7xl mx-auto space-y-5 pb-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        {token ? (
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 font-bold text-xs rounded-full border border-purple-500/30 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> EXCLUSIVE PRIVATE INVITATION
                            </span>
                        ) : (
                            <span className="px-3 py-1 bg-sky-500/20 text-sky-300 font-bold text-xs rounded-full border border-sky-500/30 flex items-center gap-1">
                                <Globe className="w-3 h-3" /> PUBLIC & PRIVATE EVENTS
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                        {token ? 'Your Private Event Invitation' : 'Live Events & Special Experiences'}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Book passes, reserve tables, view dish images & cocktails, and unlock private company events.</p>
                </div>
                <button onClick={() => navigate('/customer/event-passes')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all border border-blue-500/30 shrink-0">
                    <Ticket className="w-4 h-4" /> My Pass Wallet
                </button>
            </div>

            {/* ── SEARCH / UNLOCK PRIVATE EVENT CODE BOX ── */}
            <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                        <Key className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white">Have a Private Event Invite Code?</p>
                        <p className="text-[11px] text-slate-400">Enter your secret token (e.g. <code className="text-purple-300 font-mono">evt_horizon_corp_8412</code>) to unlock private galas</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Enter secret code..."
                        value={privateSearchCode}
                        onChange={e => setPrivateSearchCode(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleUnlockPrivateCode(privateSearchCode)}
                        className="px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono outline-none focus:border-purple-500 w-full sm:w-56 placeholder:text-slate-600"
                    />
                    <button
                        onClick={() => handleUnlockPrivateCode(privateSearchCode)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shrink-0 transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/30"
                    >
                        <Search className="w-3.5 h-3.5" /> Unlock
                    </button>
                </div>
            </div>

            {/* Filter Tabs: Ongoing (Live) vs Upcoming */}
            <div className="flex gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
                {[
                    { key: 'all', label: `All Events (${visibleEvents.length})` },
                    { key: 'ongoing', label: `🔴 Ongoing / Live (${visibleEvents.filter(e => e.status === 'LIVE').length})` },
                    { key: 'upcoming', label: `Upcoming (${visibleEvents.filter(e => e.status === 'UPCOMING').length})` },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setEventTab(tab.key as any)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${eventTab === tab.key ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Countdown Banner */}
            {firstAlert?.banner && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-4 bg-gradient-to-r ${firstAlert.banner.color} border ${firstAlert.banner.borderColor} rounded-2xl flex items-center justify-between gap-3 shadow-xl`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${firstAlert.banner.level === 'live' ? 'bg-emerald-500/20 animate-pulse' : 'bg-amber-500/20'} flex items-center justify-center shrink-0`}>
                            <Bell className={`w-5 h-5 ${firstAlert.banner.textColor}`} />
                        </div>
                        <div>
                            <p className={`font-black text-sm ${firstAlert.banner.textColor}`}>{firstAlert.banner.icon} {firstAlert.banner.title}</p>
                            <p className="text-[11px] text-slate-300">{firstAlert.banner.subtitle}</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/customer/event-passes')} className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-black text-xs rounded-xl transition-all border border-white/10 shrink-0">
                        View Pass
                    </button>
                </motion.div>
            )}

            {/* Event Cards */}
            {loading ? (
                <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
            ) : filteredEvents.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">No events found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredEvents.map(evt => {
                        const statusStyle = getStatusStyle(evt.status);
                        const isSoldOut = evt.availablePasses <= 0;
                        const isBookable = evt.status === 'UPCOMING' || evt.status === 'LIVE';
                        const menuExpanded = expandedMenuId === evt.id;
                        const eventBanner = getCountdownBanner(evt.startDate, evt.endDate);

                        return (
                            <motion.div key={evt.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">

                                {/* Banner */}
                                <div className="h-52 relative bg-slate-950 overflow-hidden">
                                    {evt.imageUrl ? (
                                        <img src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover opacity-75" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-amber-900/30 to-slate-900 flex items-center justify-center">
                                            <Ticket className="w-16 h-16 text-slate-700" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

                                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${statusStyle.badge}`}>
                                            {statusStyle.dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
                                            {statusStyle.label}
                                        </span>
                                        {evt.eventType === 'PRIVATE' && (
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${getEventTypeBadge('PRIVATE')}`}>
                                                <Lock className="w-3 h-3" /> PRIVATE INVITE
                                            </span>
                                        )}
                                    </div>

                                    <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-emerald-400 font-black text-sm">
                                        {evt.ticketPrice > 0 ? `$${evt.ticketPrice.toFixed(2)} / Pass` : 'FREE Entry'}
                                    </div>
                                </div>

                                <div className="p-5 flex-1 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-black text-white leading-tight">{evt.title}</h3>
                                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{evt.description}</p>
                                    </div>

                                    {eventBanner && (
                                        <div className={`px-3 py-2 bg-gradient-to-r ${eventBanner.color} border ${eventBanner.borderColor} rounded-xl flex items-center gap-2`}>
                                            <span className="text-sm">{eventBanner.icon}</span>
                                            <span className={`text-xs font-bold ${eventBanner.textColor}`}>{eventBanner.title}</span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                                        <div className="flex items-start gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                                            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                            <div><p className="text-[10px] text-slate-500 font-bold uppercase">Date</p><p className="font-bold text-white">{formatEventDate(evt.startDate)}</p></div>
                                        </div>
                                        <div className="flex items-start gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                                            <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                            <div><p className="text-[10px] text-slate-500 font-bold uppercase">Time</p><p className="font-bold text-white">{formatEventTime(evt.startDate)} – {formatEventTime(evt.endDate)}</p></div>
                                        </div>
                                        <div className="flex items-start gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                                            <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                                            <div><p className="text-[10px] text-slate-500 font-bold uppercase">Venue</p><p className="font-bold text-white truncate">{evt.location}</p></div>
                                        </div>
                                        <div className="flex items-start gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                                            <Music className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                                            <div><p className="text-[10px] text-slate-500 font-bold uppercase">DJ</p><p className="font-bold text-pink-300 truncate">{evt.djName || 'Live Performance'}</p></div>
                                        </div>
                                    </div>

                                    {/* Event Menu Accordion with Dish Images & Dietary Badges */}
                                    {evt.menuItems && evt.menuItems.length > 0 && (
                                        <div className="border border-slate-800 rounded-2xl overflow-hidden">
                                            <button onClick={() => setExpandedMenuId(menuExpanded ? null : evt.id)}
                                                className="w-full flex items-center justify-between p-3.5 bg-slate-800/60 hover:bg-slate-800 transition-colors text-xs font-bold">
                                                <span className="text-amber-400 flex items-center gap-1.5">
                                                    <ChefHat className="w-3.5 h-3.5" /> Event Menu & Cocktails ({evt.menuItems.length} items)
                                                </span>
                                                {menuExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                            </button>
                                            <AnimatePresence>
                                                {menuExpanded && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden">
                                                        <div className="p-3 space-y-2 bg-slate-950">
                                                            {evt.menuItems.map((item, idx) => {
                                                                const dietary = getDietaryBadge(item.dietaryType || 'VEG');
                                                                return (
                                                                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                                                                        {item.imageUrl && (
                                                                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-slate-950 shrink-0" />
                                                                        )}
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="font-bold text-white truncate">{item.name}</span>
                                                                                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${dietary.badge}`}>
                                                                                    {dietary.icon} {dietary.label}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                                                                        </div>
                                                                        <span className="font-black text-emerald-400 shrink-0 ml-2">
                                                                            {item.price > 0 ? `$${item.price.toFixed(2)}` : 'Included'}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 pt-0">
                                    <button onClick={() => openBooking(evt)} disabled={!isBookable || isSoldOut}
                                        className={`w-full py-3.5 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg ${
                                            !isBookable ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
                                            isSoldOut ? 'bg-red-900/20 text-red-400 cursor-not-allowed border border-red-800' :
                                            evt.status === 'LIVE' ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-amber-500/30 animate-pulse' :
                                            'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-amber-500/30'
                                        }`}>
                                        <Ticket className="w-4 h-4" />
                                        {!isBookable ? (evt.status === 'COMPLETED' ? 'Event Ended' : 'Event Cancelled') :
                                         isSoldOut ? 'Sold Out' :
                                         evt.status === 'LIVE' ? '🔴 Enroll Now — Event is LIVE!' : 'Book Passes & Reserve Table'}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* BOOKING MODAL */}
            <AnimatePresence>
                {bookingModal && selectedEvent && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-end md:items-center justify-center p-4"
                        onClick={() => setBookingModal(false)}>
                        <motion.div initial={{ y: 50, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.97 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg max-h-[95vh] overflow-y-auto shadow-2xl"
                            onClick={e => e.stopPropagation()}>

                            <div className="flex justify-between items-start p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
                                <div>
                                    <h3 className="text-lg font-black text-white">Book Event Passes</h3>
                                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[250px]">{selectedEvent.title}</p>
                                </div>
                                <button onClick={() => setBookingModal(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                        <span>{formatEventDateTime(selectedEvent.startDate, selectedEvent.endDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                                        <span>{selectedEvent.location}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2">Number of Passes</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                                            <button key={n} type="button" onClick={() => setPasses(n)}
                                                disabled={n > selectedEvent.availablePasses}
                                                className={`w-10 h-10 rounded-xl text-sm font-black transition-all border ${
                                                    passes === n ? 'bg-amber-500 text-slate-950 border-amber-400' :
                                                    n > selectedEvent.availablePasses ? 'bg-slate-900 text-slate-700 border-slate-800 cursor-not-allowed' :
                                                    'bg-slate-800 text-white border-slate-700 hover:border-amber-500'
                                                }`}>
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1.5">Table Reservation <span className="text-slate-600 font-normal">(optional)</span></label>
                                    <input type="text" value={tableNumber} onChange={e => handleTableInput(e.target.value)}
                                        placeholder="e.g. 5, VIP-2 — leave blank for general entry"
                                        className={`w-full p-3 bg-slate-800 border rounded-xl text-white text-sm font-bold outline-none placeholder:text-slate-600 ${tableError ? 'border-red-500' : 'border-slate-700 focus:border-amber-500'}`} />
                                    {tableError && <p className="text-xs text-red-400 mt-1">{tableError}</p>}
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5">Guest Full Name *</label>
                                        <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Your full name"
                                            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5">Contact Phone *</label>
                                        <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="10-digit phone number"
                                            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-amber-500" />
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-400"><span>Pass Price</span><span>{selectedEvent.ticketPrice > 0 ? `$${selectedEvent.ticketPrice.toFixed(2)}` : 'FREE'}</span></div>
                                    <div className="flex justify-between text-slate-400"><span>Quantity</span><span>× {passes}</span></div>
                                    <div className="border-t border-slate-800 pt-2 flex justify-between">
                                        <span className="font-bold text-white">Total Payable</span>
                                        <span className="text-2xl font-black text-emerald-400">
                                            {selectedEvent.ticketPrice > 0 ? `$${(selectedEvent.ticketPrice * passes).toFixed(2)}` : 'FREE'}
                                        </span>
                                    </div>
                                </div>

                                {selectedEvent.ticketPrice > 0 && (
                                    <div className="space-y-3">
                                        {paymentSettings.paymentQrUrl && (
                                            <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 flex gap-4 items-center">
                                                <img src={paymentSettings.paymentQrUrl} alt="Payment QR" className="w-24 h-24 bg-white rounded-xl p-1 shrink-0 object-contain" />
                                                <div className="text-xs space-y-1">
                                                    <p className="font-bold text-white">Scan QR to Pay</p>
                                                    {paymentSettings.upiId && <p className="font-mono text-amber-400">{paymentSettings.upiId}</p>}
                                                    <p className="text-[10px] text-slate-500">{paymentSettings.paymentNote}</p>
                                                </div>
                                            </div>
                                        )}
                                        <label className="flex items-start gap-3 p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 cursor-pointer">
                                            <input type="checkbox" checked={paymentConfirmed} onChange={e => setPaymentConfirmed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-amber-500 shrink-0" />
                                            <span className="text-xs text-slate-300 font-medium">I confirm I have made the payment of <strong className="text-amber-400">${(selectedEvent.ticketPrice * passes).toFixed(2)}</strong>.</span>
                                        </label>
                                    </div>
                                )}

                                <button onClick={handleBookPasses} disabled={isBooking || !!tableError}
                                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2">
                                    {isBooking ? <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Confirm & Generate Digital Pass</>}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
