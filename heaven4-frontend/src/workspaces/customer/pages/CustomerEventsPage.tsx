import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Music, Ticket, Lock, Globe, X, Clock, Calendar,
    Sparkles, Key, Building2, UserCheck, Shield, Send, CheckCircle2
} from 'lucide-react';
import apiClient from '@/core/api/client';
import { useAuth } from '@/core/auth/AuthProvider';
import toast from 'react-hot-toast';
import {
    getStatusStyle, getEventTypeBadge, formatEventDate, formatEventTime,
    generatePassCode, loadPaymentSettings, EventMenuItem
} from '@/shared/utils/eventHelpers';
import { isValidTableNumber } from '@/shared/utils/tableHelpers';
import { saveEventGuest } from '@/shared/utils/eventGuestHelpers';
import {
    HostType, MENU_PACKAGES, ENTERTAINMENT_OPTIONS, calculateEventEstimation, savePrivateEventRequest
} from '@/shared/utils/privateEventHelpers';

interface EventData {
    id: number; title: string; description: string;
    eventType: 'PUBLIC' | 'PRIVATE';
    status: 'DRAFT' | 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
    startDate: string; endDate: string; location: string; address?: string;
    imageUrl: string; ticketPrice: number; totalCapacity: number; availablePasses: number;
    djName?: string; djGenre?: string; assignedManager?: string; assignedChef?: string;
    assignedEmployees?: string; privateInviteToken?: string; menuItems: EventMenuItem[];
}

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
        description: 'Private corporate dinner for Horizon Corp leadership. Secret menu items & VIP rooftop access included.',
        eventType: 'PRIVATE', status: 'UPCOMING', privateInviteToken: 'evt_horizon_corp_8412',
        startDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 5 * 86400000 + 4 * 3600000).toISOString(),
        location: 'Grand Ballroom VIP Hall', address: '2nd Floor, Heaven4 Building',
        imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
        ticketPrice: 0, totalCapacity: 60, availablePasses: 34,
        djName: 'DJ ElectroWave', djGenre: 'Ambient Chillout & Lounge',
        assignedManager: 'Sarah Jenkins', assignedChef: 'Marco Polo', assignedEmployees: 'Alex Rivera',
        menuItems: [
            { name: 'Horizon Corp Signature Lobster Tail', description: 'Butter poached Atlantic lobster tail', price: 45.00, category: 'VIP Gala Dishes', dietaryType: 'NON_VEG', imageUrl: 'https://images.unsplash.com/photo-1559742811-822863646df1?w=400' },
            { name: '24k Gold Flake Champagne Cocktail', description: 'Moët & Chandon with edible 24k gold flakes', price: 35.00, category: 'VIP Gala Drinks', dietaryType: 'ALCOHOLIC', imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400' }
        ]
    }
];

export default function CustomerEventsPage() {
    const { token } = useParams<{ token?: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [allEvents, setAllEvents] = useState<EventData[]>(DEMO_EVENTS);
    const [unlockedPrivateEvents, setUnlockedPrivateEvents] = useState<EventData[]>([]);
    const [secretToken, setSecretToken] = useState('');

    const [eventTab, setEventTab] = useState<'all' | 'ongoing' | 'upcoming'>('all');
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

    // Booking Modal State
    const [bookingModal, setBookingModal] = useState(false);
    const [passes, setPasses] = useState(1);
    const [tableNumber, setTableNumber] = useState('');
    const [guestName, setGuestName] = useState(user?.displayName || 'VIP Guest');
    const [guestPhone, setGuestPhone] = useState(user?.phoneNumber || '7020875435');
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    // 🏛️ Host Private Event Modal State (For Companies / Individuals)
    const [hostModalOpen, setHostModalOpen] = useState(false);
    const [hostType, setHostType] = useState<HostType>('CORPORATE_FIRM');
    const [companyName, setCompanyName] = useState('');
    const [taxId, setTaxId] = useState('');
    const [contactName, setContactName] = useState(user?.displayName || '');
    const [contactPhone, setContactPhone] = useState(user?.phoneNumber || '7020875435');
    const [contactEmail, setContactEmail] = useState(user?.email || '');
    const [eventTitleInput, setEventTitleInput] = useState('');
    const [eventPurposeInput, setEventPurposeInput] = useState('');
    const [preferredDateInput, setPreferredDateInput] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    const [startTimeInput] = useState('07:00 PM');
    const [durationHoursInput, setDurationHoursInput] = useState(4);
    const [headcountInput, setHeadcountInput] = useState(40);
    const [menuPackageInput, setMenuPackageInput] = useState<keyof typeof MENU_PACKAGES>('GOURMET_TASTING');
    const [entertainmentInput, setEntertainmentInput] = useState<keyof typeof ENTERTAINMENT_OPTIONS>('DJ_SOUND_RIG');
    const [isSubmittingHostRequest, setIsSubmittingHostRequest] = useState(false);

    const paymentSettings = loadPaymentSettings();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await apiClient.get('/events').catch(() => null);
                if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                    setAllEvents(res.data);
                }
            } catch { /* use demo events */ }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        if (token) {
            const matched = allEvents.find(e => e.privateInviteToken?.toLowerCase() === token.toLowerCase() || e.id.toString() === token);
            if (matched) {
                setUnlockedPrivateEvents(prev => [...prev.filter(p => p.id !== matched.id), matched]);
                setSelectedEvent(matched);
                toast.success(`🔓 Unlocked private invite for "${matched.title}"!`);
            } else {
                toast.error('Invalid private event invitation token');
            }
        }
    }, [token, allEvents]);

    const handleUnlockToken = (code: string) => {
        if (!code.trim()) { toast.error('Please enter an access code'); return; }
        const clean = code.trim().toLowerCase();
        const matched = allEvents.find(e => e.privateInviteToken?.toLowerCase() === clean);
        if (matched) {
            setUnlockedPrivateEvents(prev => [...prev.filter(p => p.id !== matched.id), matched]);
            setSelectedEvent(matched);
            setSecretToken('');
            toast.success(`🎉 Unlocked Secret Event: "${matched.title}"!`);
        } else {
            toast.error('Token not recognized or expired.');
        }
    };

    const handleOpenBooking = (evt: EventData) => {
        setSelectedEvent(evt);
        setPasses(1);
        setTableNumber('');
        setPaymentConfirmed(false);
        setBookingModal(true);
    };

    const handleConfirmBooking = async () => {
        if (!selectedEvent) return;
        if (!guestName.trim() || !guestPhone.trim()) { toast.error('Please enter guest name and phone number'); return; }
        if (tableNumber.trim() && !isValidTableNumber(tableNumber.trim(), selectedEvent.id)) {
            toast.error(`Table "${tableNumber}" is invalid for this event!`);
            return;
        }
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

            saveEventGuest({
                eventId: selectedEvent.id,
                eventTitle: selectedEvent.title,
                guestName: guestName.trim() || 'VIP Guest',
                guestPhone: guestPhone.trim() || '7020875435',
                passCode,
                passesCount: passes,
                tableNumber: tableNumber.trim() || 'General Entry',
                membershipTier: 'GOLD VIP'
            });

            toast.success(`🎉 Passes Booked! Pass code: ${passCode}`, { duration: 5000 });
            setBookingModal(false);
            setTimeout(() => navigate('/customer/event-passes'), 1000);
        } catch {
            saveEventGuest({
                eventId: selectedEvent.id,
                eventTitle: selectedEvent.title,
                guestName: guestName.trim() || 'VIP Guest',
                guestPhone: guestPhone.trim() || '7020875435',
                passCode,
                passesCount: passes,
                tableNumber: tableNumber.trim() || 'General Entry',
                membershipTier: 'GOLD VIP'
            });
            toast.success(`🎉 Booking confirmed! Pass code: ${passCode}`);
            setBookingModal(false);
            setTimeout(() => navigate('/customer/event-passes'), 1000);
        } finally { setIsBooking(false); }
    };

    // Calculate dynamic host request estimation
    const estimation = calculateEventEstimation(headcountInput, durationHoursInput, menuPackageInput, entertainmentInput);

    const handleSubmitHostRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactName.trim() || !contactPhone.trim()) { toast.error('Enter contact name & phone number'); return; }
        if (hostType === 'CORPORATE_FIRM' && !companyName.trim()) { toast.error('Enter Company / Firm Name'); return; }

        setIsSubmittingHostRequest(true);
        try {
            savePrivateEventRequest({
                hostType,
                companyName: companyName.trim() || '',
                taxId: taxId.trim() || '',
                contactName: contactName.trim(),
                contactPhone: contactPhone.trim(),
                contactEmail: contactEmail.trim() || 'contact@heaven4.com',
                eventTitle: eventTitleInput.trim() || (hostType === 'CORPORATE_FIRM' ? `${companyName} Corporate Gala` : `${contactName} Private Party`),
                eventPurpose: eventPurposeInput.trim() || 'Corporate / Private Social Gathering',
                preferredDate: preferredDateInput,
                startTime: startTimeInput,
                durationHours: durationHoursInput,
                headcount: headcountInput,
                menuPackageId: menuPackageInput,
                menuPackageLabel: MENU_PACKAGES[menuPackageInput].label,
                entertainmentOption: entertainmentInput,
                entertainmentLabel: ENTERTAINMENT_OPTIONS[entertainmentInput].label,
                estimatedPrice: estimation.totalEstimate,
                allocatedStaff: estimation.allocatedStaff
            });

            toast.success(`🎉 Private Event Request Submitted! Estimated Total: $${estimation.totalEstimate.toLocaleString()}`);
            setHostModalOpen(false);
        } catch {
            toast.error('Failed to submit request');
        } finally {
            setIsSubmittingHostRequest(false);
        }
    };

    // Filter public + unlocked private events
    const visibleEvents = [
        ...allEvents.filter(e => e.eventType === 'PUBLIC'),
        ...unlockedPrivateEvents
    ].filter((evt, index, self) => index === self.findIndex(t => t.id === evt.id));

    const filteredEvents = visibleEvents.filter(e => {
        if (eventTab === 'ongoing') return e.status === 'LIVE';
        if (eventTab === 'upcoming') return e.status === 'UPCOMING';
        return true;
    });

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
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button onClick={() => navigate('/customer/menu')}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all border border-slate-700">
                        ← Back to Main Menu
                    </button>
                    <button onClick={() => navigate('/customer/event-passes')}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all border border-blue-500/30">
                        <Ticket className="w-4 h-4" /> My Pass Wallet
                    </button>
                </div>
            </div>

            {/* ── ACCESS CODE / EVENT TOKEN UNLOCK BOX ── */}
            <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                        <Key className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white">Access Code / Event Token</h4>
                        <p className="text-[11px] text-slate-400">Enter your private event token to unlock custom event menus & table reservations.</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Enter token..."
                        value={secretToken}
                        onChange={e => setSecretToken(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleUnlockToken(secretToken)}
                        className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-purple-300 font-mono outline-none focus:border-purple-500 flex-1 sm:w-48 placeholder:text-slate-600"
                    />
                    <button
                        onClick={() => handleUnlockToken(secretToken)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
                    >
                        Unlock
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex justify-between items-center gap-4">
                <div className="flex gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
                    {(['all', 'ongoing', 'upcoming'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setEventTab(tab)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all capitalize ${
                                eventTab === tab
                                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            {tab === 'all' ? `All (${visibleEvents.length})` : tab === 'ongoing' ? `Live Now` : `Upcoming`}
                        </button>
                    ))}
                </div>

                {/* Subtle Corporate / Private Event Host Inquiries Link */}
                <button
                    onClick={() => setHostModalOpen(true)}
                    className="text-xs text-slate-400 hover:text-amber-400 font-bold underline decoration-dotted flex items-center gap-1 transition-colors"
                >
                    <Building2 className="w-3.5 h-3.5" /> Corporate & Private Host Inquiries →
                </button>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(evt => {
                    const statusStyle = getStatusStyle(evt.status);
                    const typeBadgeClass = getEventTypeBadge(evt.eventType);

                    return (
                        <motion.div
                            key={evt.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between group transition-all"
                        >
                            <div>
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={evt.imageUrl}
                                        alt={evt.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

                                    <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${typeBadgeClass}`}>
                                            {evt.eventType}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${statusStyle.badge} flex items-center gap-1`}>
                                            {statusStyle.dot && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />}
                                            {statusStyle.label}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-3 left-3 right-3 text-xs flex justify-between items-end">
                                        <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800 text-slate-300">
                                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                            <span className="truncate">{evt.location}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-amber-400">
                                                {evt.ticketPrice > 0 ? `$${evt.ticketPrice.toFixed(2)}` : 'FREE PASS'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 space-y-3">
                                    <h3 className="font-black text-lg text-white group-hover:text-amber-400 transition-colors">
                                        {evt.title}
                                    </h3>
                                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                                        {evt.description}
                                    </p>

                                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                            <span>{formatEventDate(evt.startDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                            <span>{formatEventTime(evt.startDate)} - {formatEventTime(evt.endDate)}</span>
                                        </div>
                                        {evt.djName && (
                                            <div className="flex items-center gap-2 text-amber-300 font-bold">
                                                <Music className="w-3.5 h-3.5 shrink-0" />
                                                <span>{evt.djName} ({evt.djGenre})</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Menu Items Preview */}
                                    {evt.menuItems && evt.menuItems.length > 0 && (
                                        <div className="space-y-1.5 pt-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Dishes & Cocktails ({evt.menuItems.length})</p>
                                            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                                                {evt.menuItems.slice(0, 3).map((item, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-bold shrink-0 truncate max-w-[120px]">
                                                        {item.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 pt-0">
                                <button
                                    onClick={() => handleOpenBooking(evt)}
                                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                                >
                                    <Ticket className="w-4 h-4" /> Book Passes & Reserve Table
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* 🏛️ DISCREET CORPORATE & PRIVATE HOST ESTIMATOR MODAL */}
            <AnimatePresence>
                {hostModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setHostModalOpen(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl text-white"
                            onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
                                <div>
                                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-amber-400" /> Host a Private Event / Corporate Gala
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Custom event pricing calculator for companies, businesses, & individual hosts.</p>
                                </div>
                                <button onClick={() => setHostModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={handleSubmitHostRequest} className="p-6 space-y-6 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-2">1. Select Host Category</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button" onClick={() => setHostType('CORPORATE_FIRM')}
                                            className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-2 transition-all ${
                                                hostType === 'CORPORATE_FIRM' ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg' : 'bg-slate-950 text-slate-400 border-slate-800'
                                            }`}>
                                            <Building2 className="w-4 h-4" /> Corporate Firm / Business
                                        </button>
                                        <button type="button" onClick={() => setHostType('INDIVIDUAL')}
                                            className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-2 transition-all ${
                                                hostType === 'INDIVIDUAL' ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg' : 'bg-slate-950 text-slate-400 border-slate-800'
                                            }`}>
                                            <UserCheck className="w-4 h-4" /> Individual / Private Host
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {hostType === 'CORPORATE_FIRM' && (
                                        <>
                                            <div>
                                                <label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Company / Firm Name *</label>
                                                <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)}
                                                    placeholder="e.g. Horizon Global Tech Corp"
                                                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500" />
                                            </div>
                                            <div>
                                                <label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Tax ID / GST Number (Optional)</label>
                                                <input type="text" value={taxId} onChange={e => setTaxId(e.target.value)}
                                                    placeholder="e.g. US-9823145-GST"
                                                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono outline-none focus:border-amber-500" />
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Contact Person Name *</label>
                                        <input type="text" required value={contactName} onChange={e => setContactName(e.target.value)}
                                            placeholder="e.g. David Kim"
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Contact Phone *</label>
                                        <input type="text" required value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                                            placeholder="e.g. 7020875435"
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Event Title</label>
                                        <input type="text" value={eventTitleInput} onChange={e => setEventTitleInput(e.target.value)}
                                            placeholder={hostType === 'CORPORATE_FIRM' ? 'e.g. Q3 Leadership Banquet' : 'e.g. Birthday Celebration'}
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Preferred Date</label>
                                        <input type="date" value={preferredDateInput} onChange={e => setPreferredDateInput(e.target.value)}
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500" />
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="font-bold text-slate-300 uppercase tracking-wider">Headcount (Guests)</label>
                                            <span className="text-amber-400 font-black text-sm">{headcountInput} Guests</span>
                                        </div>
                                        <input type="range" min={10} max={200} step={5} value={headcountInput} onChange={e => setHeadcountInput(parseInt(e.target.value))}
                                            className="w-full accent-amber-500 cursor-pointer" />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="font-bold text-slate-300 uppercase tracking-wider">Event Duration (Hours)</label>
                                            <span className="text-amber-400 font-black text-sm">{durationHoursInput} Hours ($150/hr venue)</span>
                                        </div>
                                        <input type="range" min={2} max={8} step={1} value={durationHoursInput} onChange={e => setDurationHoursInput(parseInt(e.target.value))}
                                            className="w-full accent-amber-500 cursor-pointer" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Menu Package Tier</label>
                                        <select value={menuPackageInput} onChange={e => setMenuPackageInput(e.target.value as any)}
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500">
                                            {Object.values(MENU_PACKAGES).map(p => (
                                                <option key={p.id} value={p.id} className="bg-slate-900">{p.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Entertainment Add-on</label>
                                        <select value={entertainmentInput} onChange={e => setEntertainmentInput(e.target.value as any)}
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500">
                                            {Object.values(ENTERTAINMENT_OPTIONS).map(e => (
                                                <option key={e.id} value={e.id} className="bg-slate-900">{e.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 rounded-3xl border border-amber-500/40 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Estimated Price Breakdown</span>
                                        <span className="text-2xl font-black text-amber-400">${estimation.totalEstimate.toLocaleString()}</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                                        <div>
                                            <p className="text-slate-500 text-[9px] uppercase font-bold">Food & Drinks</p>
                                            <p className="font-bold text-white">${estimation.subtotalFood.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-[9px] uppercase font-bold">Venue & Setup</p>
                                            <p className="font-bold text-white">${estimation.durationCost.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-[9px] uppercase font-bold">Entertainment</p>
                                            <p className="font-bold text-white">${estimation.entertainmentCost.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-[10px]">
                                        <span className="text-slate-400 font-bold flex items-center gap-1">
                                            <Shield className="w-3.5 h-3.5 text-blue-400" /> Auto-allocated Venue Staff:
                                        </span>
                                        <span className="font-bold text-amber-300">
                                            {estimation.allocatedStaff.captains} Captains · {estimation.allocatedStaff.bartenders} Bartenders · {estimation.allocatedStaff.securityGuards} Security
                                        </span>
                                    </div>
                                </div>

                                <button type="submit" disabled={isSubmittingHostRequest}
                                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all">
                                    <Send className="w-4 h-4" /> Submit Private Host Request to Admin & Owner
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PASS BOOKING MODAL */}
            <AnimatePresence>
                {bookingModal && selectedEvent && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setBookingModal(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-white"
                            onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Book Event Passes</span>
                                    <h3 className="text-xl font-black text-white">{selectedEvent.title}</h3>
                                </div>
                                <button onClick={() => setBookingModal(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1">Guest Name *</label>
                                        <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)}
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1">Guest Phone *</label>
                                        <input type="text" value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1">Number of Passes</label>
                                        <select value={passes} onChange={e => setPasses(parseInt(e.target.value))}
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-black text-sm outline-none">
                                            {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                                                <option key={n} value={n} className="bg-slate-900">{n} Pass{n > 1 ? 'es' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1">Reserve Table Number (Optional)</label>
                                        <input type="text" value={tableNumber} onChange={e => setTableNumber(e.target.value.toUpperCase())} placeholder="e.g. RT-1 or VIP-1"
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500 placeholder:text-slate-700" />
                                    </div>
                                </div>

                                {selectedEvent.ticketPrice > 0 && (
                                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-slate-400">Total Amount Due</span>
                                            <span className="text-xl font-black text-amber-400">${(selectedEvent.ticketPrice * passes).toFixed(2)}</span>
                                        </div>

                                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
                                            <span className="text-slate-400">UPI ID: <strong className="text-white">{paymentSettings.upiId}</strong></span>
                                            <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-400">
                                                <input type="checkbox" checked={paymentConfirmed} onChange={e => setPaymentConfirmed(e.target.checked)} className="w-4 h-4 accent-emerald-500 rounded" />
                                                Payment Completed
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <button onClick={handleConfirmBooking} disabled={isBooking}
                                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all">
                                    <CheckCircle2 className="w-5 h-5" /> Confirm Pass Booking
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
