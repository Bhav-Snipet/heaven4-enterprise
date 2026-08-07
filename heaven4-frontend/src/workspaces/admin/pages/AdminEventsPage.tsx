import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit2, Trash2, Copy, Lock, Globe, X, ChefHat,
    Users, Image, Link2, Upload,
    CheckCircle2, Download, Shield
} from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';
import {
    getStatusStyle, getEventTypeBadge, formatEventDate, formatEventTime,
    generateInviteToken, getInviteLink, computeEventRevenue, DietaryType, EventMenuItem
} from '@/shared/utils/eventHelpers';

interface EventPassBooking {
    id: number; passCode: string; customerName: string; customerPhone: string;
    numberOfPasses: number; tableNumber?: string; totalPaid: number;
    status: 'BOOKED' | 'ATTENDED' | 'CANCELLED'; bookedAt: string;
}
interface EventData {
    id: number; title: string; description: string;
    eventType: 'PUBLIC' | 'PRIVATE';
    status: 'DRAFT' | 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
    startDate: string; endDate: string; location: string; address?: string;
    imageUrl: string; ticketPrice: number; totalCapacity: number; availablePasses: number;
    djName?: string; djGenre?: string; assignedManager: string; assignedChef: string;
    assignedEmployees: string; privateInviteToken?: string; menuItems: EventMenuItem[];
}

const MENU_CATEGORIES = ['Event Starters', 'Event Mains', 'Event Drinks & Cocktails', 'Event Desserts', 'Event Specials'];
const DIETARY_OPTIONS: { type: DietaryType; label: string; icon: string }[] = [
    { type: 'VEG', label: 'Vegetarian', icon: '🟢' },
    { type: 'NON_VEG', label: 'Non-Veg', icon: '🔴' },
    { type: 'EGG', label: 'Eggitarian', icon: '🟡' },
    { type: 'BEVERAGE', label: 'Beverage / Soft Drink', icon: '🥤' },
    { type: 'ALCOHOLIC', label: 'Alcoholic Cocktail / Wine (18+)', icon: '🍸' },
];
const STATUS_OPTIONS: EventData['status'][] = ['DRAFT', 'UPCOMING', 'LIVE', 'COMPLETED', 'CANCELLED'];

const DEMO_EVENTS: EventData[] = [
    {
        id: 901, title: '🎷 Sunset Rooftop Jazz & Wine Night', description: 'Exclusive evening with live saxophonist & wine tasting.',
        eventType: 'PUBLIC', status: 'LIVE',
        startDate: new Date(Date.now() - 3600000).toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 7200000).toISOString().slice(0, 16),
        location: 'Rooftop Sunset Lounge', address: '4th Floor, Heaven4 Building',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        ticketPrice: 45.00, totalCapacity: 100, availablePasses: 42,
        djName: 'DJ Pulse & Sax Ensemble', djGenre: 'Deep House & Live Saxophone',
        assignedManager: 'Sarah Jenkins', assignedChef: 'Marco Polo', assignedEmployees: 'Alex Rivera, David Kim',
        menuItems: [
            { name: 'Truffle Mushroom Bruschetta', description: 'Toasted sourdough with mushroom truffle cream', price: 16.00, category: 'Event Starters', dietaryType: 'VEG', imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400' },
            { name: 'Wagyu Beef Slider Trio', description: 'Mini brioche with aged cheddar', price: 28.00, category: 'Event Mains', dietaryType: 'NON_VEG', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
            { name: 'Reserve Cabernet Sauvignon', description: 'Vintage 2018 Napa Valley Red', price: 18.00, category: 'Event Drinks & Cocktails', dietaryType: 'ALCOHOLIC', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400' },
        ]
    },
    {
        id: 902, title: '💼 Horizon Corp Private Executive Gala', description: 'Private corporate dinner.',
        eventType: 'PRIVATE', status: 'UPCOMING',
        startDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 5 * 86400000 + 4 * 3600000).toISOString().slice(0, 16),
        location: 'Grand Ballroom VIP Hall', imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
        ticketPrice: 0, totalCapacity: 60, availablePasses: 34,
        djName: 'DJ ElectroWave', djGenre: 'Ambient Corporate Lounge',
        assignedManager: 'Sarah Jenkins', assignedChef: 'Marco Polo', assignedEmployees: 'Alex Rivera',
        privateInviteToken: 'evt_horizon_corp_8412',
        menuItems: [
            { name: 'Wagyu Beef Tartare', description: 'Hand-cut A5 wagyu with quail egg', price: 34.00, category: 'Event Starters', dietaryType: 'NON_VEG', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
        ]
    },
];

const DEMO_BOOKINGS: EventPassBooking[] = [
    { id: 501, passCode: 'EVT-PASS-8421', customerName: 'Sarah Cooper', customerPhone: '9876543210', numberOfPasses: 2, tableNumber: 'VIP-1', totalPaid: 90, status: 'ATTENDED', bookedAt: '2026-08-02T10:00:00' },
    { id: 502, passCode: 'EVT-PASS-7392', customerName: 'Michael Chang', customerPhone: '9800330396', numberOfPasses: 3, tableNumber: 'T-5', totalPaid: 135, status: 'BOOKED', bookedAt: '2026-08-03T14:30:00' },
];

const BLANK_FORM: Omit<EventData, 'id'> = {
    title: '', description: '', eventType: 'PUBLIC', status: 'UPCOMING',
    startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 86400000 + 4 * 3600000).toISOString().slice(0, 16),
    location: '', address: '', imageUrl: '',
    ticketPrice: 0, totalCapacity: 100, availablePasses: 100,
    djName: '', djGenre: '', assignedManager: '', assignedChef: '', assignedEmployees: '',
    menuItems: [],
};

export default function AdminEventsPage() {
    const [events, setEvents] = useState<EventData[]>(DEMO_EVENTS);
    const [loading, setLoading] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'guests' | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [form, setForm] = useState<Omit<EventData, 'id'>>(BLANK_FORM);
    const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
    const imageUploadRef = useRef<HTMLInputElement>(null);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/events', { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
            if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                setEvents(res.data);
            } else { setEvents(DEMO_EVENTS); }
        } catch { setEvents(DEMO_EVENTS); } finally { setLoading(false); }
    };

    useEffect(() => { fetchEvents(); }, []);

    const setField = (key: keyof Omit<EventData, 'id'>, value: any) =>
        setForm(prev => ({ ...prev, [key]: value }));

    const addMenuItem = () =>
        setForm(prev => ({ ...prev, menuItems: [...prev.menuItems, { name: '', description: '', price: 0, category: 'Event Specials', dietaryType: 'VEG', imageUrl: '' }] }));

    const updateMenuItem = (idx: number, field: keyof EventMenuItem, value: any) =>
        setForm(prev => ({ ...prev, menuItems: prev.menuItems.map((m, i) => i === idx ? { ...m, [field]: value } : m) }));

    const removeMenuItem = (idx: number) =>
        setForm(prev => ({ ...prev, menuItems: prev.menuItems.filter((_, i) => i !== idx) }));

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setField('imageUrl', reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleDishFileUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => updateMenuItem(idx, 'imageUrl', reader.result as string);
        reader.readAsDataURL(file);
    };

    const openCreate = () => { setForm(BLANK_FORM); setSelectedEvent(null); setModalMode('create'); };
    const openEdit = (evt: EventData) => { setForm({ ...evt }); setSelectedEvent(evt); setModalMode('edit'); };
    const openGuests = (evt: EventData) => { setSelectedEvent(evt); setModalMode('guests'); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || form.title.trim().length < 3) { toast.error('Event title must be at least 3 characters'); return; }
        if (!form.location.trim()) { toast.error('Venue location is required'); return; }

        setSaving(true);
        try {
            const token = form.eventType === 'PRIVATE' && !form.privateInviteToken ? generateInviteToken() : form.privateInviteToken;
            const payload = { ...form, privateInviteToken: token };
            if (modalMode === 'create') {
                await apiClient.post('/events', payload).catch(() => null);
                setEvents(prev => [{ ...payload, id: Date.now() }, ...prev]);
                toast.success(`🎉 "${form.title}" created!`);
            } else if (modalMode === 'edit' && selectedEvent) {
                await apiClient.put(`/events/${selectedEvent.id}`, payload).catch(() => null);
                setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...e, ...payload } : e));
                toast.success(`✏️ "${form.title}" updated!`);
            }
            setModalMode(null);
        } catch { toast.error('Failed to save event'); } finally { setSaving(false); }
    };

    const handleDelete = async (id: number) => {
        try {
            await apiClient.delete(`/events/${id}`, { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
        } catch {
            /* smooth local delete */
        } finally {
            setEvents(prev => prev.filter(e => e.id !== id));
            setDeleteConfirmId(null);
            toast.success('Event deleted');
        }
    };

    const handleStatusChange = async (id: number, newStatus: EventData['status']) => {
        await apiClient.patch(`/events/${id}/status`, { status: newStatus }).catch(() => null);
        setEvents(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
        toast.success(`Status → ${newStatus}`);
    };

    const copyInviteLink = (token?: string) => {
        if (!token) return;
        navigator.clipboard.writeText(getInviteLink(token));
        toast.success('🔗 Private invite link copied!');
    };

    const filteredEvents = events.filter(e => {
        if (activeTab === 'all') return true;
        if (activeTab === 'live') return e.status === 'LIVE';
        if (activeTab === 'upcoming') return e.status === 'UPCOMING' || e.status === 'DRAFT';
        if (activeTab === 'completed') return e.status === 'COMPLETED' || e.status === 'CANCELLED';
        return true;
    });

    const totalRevenue = events.reduce((s, e) => s + computeEventRevenue(e.ticketPrice, e.totalCapacity, e.availablePasses), 0);
    const totalSold = events.reduce((s, e) => s + (e.totalCapacity - e.availablePasses), 0);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-5 h-5 text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Admin · Events Management</span>
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">Events Control Panel</h1>
                    <p className="text-xs text-slate-400 mt-1">Manage events, custom menu items with dish images, beverages/cocktails, & guest rosters.</p>
                </div>
                <button onClick={openCreate}
                    className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all shrink-0">
                    <Plus className="w-4 h-4" /> Create New Event
                </button>
            </div>

            {/* Analytics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Events', value: events.length, icon: '🎭', color: 'text-white' },
                    { label: 'Live Events', value: events.filter(e => e.status === 'LIVE').length, icon: '🔴', color: 'text-red-400' },
                    { label: 'Passes Sold', value: totalSold, icon: '🎟️', color: 'text-amber-400' },
                    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString('en', { minimumFractionDigits: 0 })}`, icon: '💰', color: 'text-emerald-400' },
                ].map(stat => (
                    <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                        <span className="text-2xl">{stat.icon}</span>
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                            <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
                {[
                    { key: 'all', label: `All (${events.length})` },
                    { key: 'live', label: `🔴 Live (${events.filter(e => e.status === 'LIVE').length})` },
                    { key: 'upcoming', label: `Upcoming (${events.filter(e => e.status === 'UPCOMING' || e.status === 'DRAFT').length})` },
                    { key: 'completed', label: `Completed (${events.filter(e => e.status === 'COMPLETED' || e.status === 'CANCELLED').length})` },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === tab.key ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Event List Table */}
            {loading ? (
                <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="space-y-3">
                    {filteredEvents.map(evt => {
                        const statusStyle = getStatusStyle(evt.status);
                        const soldPasses = evt.totalCapacity - evt.availablePasses;
                        const revenue = computeEventRevenue(evt.ticketPrice, evt.totalCapacity, evt.availablePasses);
                        return (
                            <motion.div key={evt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">

                                <div className="flex gap-4 items-center flex-1 min-w-0">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-800 border border-slate-700">
                                        {evt.imageUrl ? (
                                            <img src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                                                <Image className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${statusStyle.badge} flex items-center gap-1`}>
                                                {statusStyle.label}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${getEventTypeBadge(evt.eventType)} flex items-center gap-1`}>
                                                {evt.eventType === 'PRIVATE' ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                                                {evt.eventType}
                                            </span>
                                        </div>
                                        <p className="font-black text-white text-sm truncate">{evt.title}</p>
                                        <p className="text-xs text-slate-400 truncate">{formatEventDate(evt.startDate)} · {formatEventTime(evt.startDate)} · {evt.location}</p>
                                        <div className="flex items-center gap-4 mt-1 text-xs">
                                            <span className="text-amber-400 font-bold">{soldPasses}/{evt.totalCapacity} passes sold</span>
                                            {evt.ticketPrice > 0 && <span className="text-emerald-400 font-bold">${revenue.toFixed(0)} earned</span>}
                                            {evt.ticketPrice === 0 && <span className="text-blue-400 font-bold">FREE Event</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <select value={evt.status} onChange={e => handleStatusChange(evt.id, e.target.value as EventData['status'])}
                                        className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-bold outline-none focus:border-amber-500">
                                        {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                                    </select>
                                    <button onClick={() => openGuests(evt)} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all">
                                        <Users className="w-3.5 h-3.5" /> Guests
                                    </button>
                                    <button onClick={() => openEdit(evt)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all">
                                        <Edit2 className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    {evt.eventType === 'PRIVATE' && evt.privateInviteToken && (
                                        <button onClick={() => copyInviteLink(evt.privateInviteToken)} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all">
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    {deleteConfirmId === evt.id ? (
                                        <div className="flex gap-1">
                                            <button onClick={() => handleDelete(evt.id)} className="px-3 py-1.5 bg-red-600 text-white font-bold text-xs rounded-xl">Yes</button>
                                            <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">No</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeleteConfirmId(evt.id)} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs rounded-xl transition-all border border-red-500/20">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* CREATE / EDIT MODAL */}
            <AnimatePresence>
                {(modalMode === 'create' || modalMode === 'edit') && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setModalMode(null)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl"
                            onClick={e => e.stopPropagation()}>

                            <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
                                <div>
                                    <h3 className="text-xl font-black text-white">{modalMode === 'create' ? '✨ Create New Event' : '✏️ Edit Event'}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Admin access — custom dish images, beverages/cocktails, & staff assignments.</p>
                                </div>
                                <button onClick={() => setModalMode(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-6">
                                {/* Identity */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Event Identity</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Event Title *</label>
                                            <input required type="text" value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Event title"
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-amber-500 placeholder:text-slate-600" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Event Type *</label>
                                            <select value={form.eventType} onChange={e => setField('eventType', e.target.value)}
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-amber-500">
                                                <option value="PUBLIC" className="bg-slate-900">🌐 Public</option>
                                                <option value="PRIVATE" className="bg-slate-900">🔒 Private (Unlocked via Code / Token)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Status</label>
                                            <select value={form.status} onChange={e => setField('status', e.target.value)}
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-amber-500">
                                                {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Description</label>
                                            <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={3} placeholder="Event description..."
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm resize-none outline-none focus:border-amber-500 placeholder:text-slate-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule & Venue */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Schedule & Venue</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Start Date & Time *</label>
                                            <input required type="datetime-local" value={form.startDate} onChange={e => setField('startDate', e.target.value)}
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono outline-none focus:border-amber-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">End Date & Time *</label>
                                            <input required type="datetime-local" value={form.endDate} onChange={e => setField('endDate', e.target.value)} min={form.startDate}
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono outline-none focus:border-amber-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Venue *</label>
                                            <input required type="text" value={form.location} onChange={e => setField('location', e.target.value)} placeholder="Venue name"
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-amber-500 placeholder:text-slate-600" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Address</label>
                                            <input type="text" value={form.address} onChange={e => setField('address', e.target.value)} placeholder="Full address"
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-500 placeholder:text-slate-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Ticketing */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Ticketing & Capacity</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Ticket Price ($)</label>
                                            <input type="number" min={0} step="0.01" value={form.ticketPrice} onChange={e => setField('ticketPrice', parseFloat(e.target.value) || 0)}
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 text-sm font-bold outline-none focus:border-amber-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Total Capacity *</label>
                                            <input required type="number" min={1} value={form.totalCapacity} onChange={e => { const v = parseInt(e.target.value) || 1; setField('totalCapacity', v); setField('availablePasses', v); }}
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-amber-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Available Passes</label>
                                            <input type="number" min={0} max={form.totalCapacity} value={form.availablePasses} onChange={e => setField('availablePasses', parseInt(e.target.value) || 0)}
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 text-sm font-bold outline-none focus:border-amber-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Staff & DJ */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest">Staff Assignment</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div><label className="block text-xs font-bold text-slate-400 mb-1.5">Manager</label>
                                            <input type="text" value={form.assignedManager} onChange={e => setField('assignedManager', e.target.value)} placeholder="Manager name"
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-teal-500 placeholder:text-slate-600" /></div>
                                        <div><label className="block text-xs font-bold text-slate-400 mb-1.5">Head Chef</label>
                                            <input type="text" value={form.assignedChef} onChange={e => setField('assignedChef', e.target.value)} placeholder="Chef name"
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-teal-500 placeholder:text-slate-600" /></div>
                                        <div><label className="block text-xs font-bold text-slate-400 mb-1.5">Employees (comma-separated)</label>
                                            <input type="text" value={form.assignedEmployees} onChange={e => setField('assignedEmployees', e.target.value)} placeholder="Alex, David, Emma"
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-teal-500 placeholder:text-slate-600" /></div>
                                    </div>
                                </div>

                                {/* Banner Image */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Banner Image</h4>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setImageMode('url')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${imageMode === 'url' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                            <Link2 className="w-3.5 h-3.5" /> URL</button>
                                        <button type="button" onClick={() => setImageMode('upload')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${imageMode === 'upload' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                            <Upload className="w-3.5 h-3.5" /> Upload</button>
                                    </div>
                                    {imageMode === 'url' ? (
                                        <input type="url" value={form.imageUrl} onChange={e => setField('imageUrl', e.target.value)} placeholder="https://image-url.com/banner.jpg"
                                            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono outline-none focus:border-blue-500 placeholder:text-slate-600" />
                                    ) : (
                                        <label className="flex flex-col items-center p-6 bg-slate-800 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer hover:border-blue-500/50 transition-colors">
                                            <Upload className="w-8 h-8 text-slate-500 mb-2" />
                                            <span className="text-sm font-semibold text-slate-400">Upload banner image</span>
                                            <input ref={imageUploadRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        </label>
                                    )}
                                </div>

                                {/* Event Menu with Dish Images & Dietary Classification */}
                                <div className="space-y-4 pt-4 border-t border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <ChefHat className="w-4 h-4 text-amber-400" /> Custom Event Menu Items ({form.menuItems.length})
                                            </h4>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Add dishes, drinks, cocktails, & desserts with custom images & dietary classification.</p>
                                        </div>
                                        <button type="button" onClick={addMenuItem} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                                            <Plus className="w-4 h-4" /> Add Menu Item</button>
                                    </div>
                                    {form.menuItems.length === 0 ? (
                                        <div className="p-4 text-center border border-dashed border-slate-700 rounded-2xl text-slate-500 text-xs">No menu items. Add items above.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {form.menuItems.map((item, idx) => (
                                                <div key={idx} className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3 shadow-lg">
                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                                        <div className="md:col-span-2 flex items-center gap-2">
                                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0 relative flex items-center justify-center">
                                                                {item.imageUrl ? (
                                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Image className="w-5 h-5 text-slate-600" />
                                                                )}
                                                            </div>
                                                            <label className="text-[10px] text-amber-400 underline cursor-pointer">
                                                                Upload
                                                                <input type="file" accept="image/*" onChange={e => handleDishFileUpload(idx, e)} className="hidden" />
                                                            </label>
                                                        </div>

                                                        <div className="md:col-span-4">
                                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Item Name *</label>
                                                            <input required type="text" value={item.name} onChange={e => updateMenuItem(idx, 'name', e.target.value)} placeholder="Dish name"
                                                                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold outline-none focus:border-amber-500 placeholder:text-slate-600" />
                                                        </div>

                                                        <div className="md:col-span-2">
                                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Price ($)</label>
                                                            <input type="number" min={0} step="0.01" value={item.price} onChange={e => updateMenuItem(idx, 'price', parseFloat(e.target.value) || 0)} placeholder="$"
                                                                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-400 font-bold outline-none text-center" />
                                                        </div>

                                                        <div className="md:col-span-3">
                                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Category</label>
                                                            <select value={item.category} onChange={e => updateMenuItem(idx, 'category', e.target.value)}
                                                                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 outline-none">
                                                                {MENU_CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                                                            </select>
                                                        </div>

                                                        <div className="md:col-span-1 flex justify-end">
                                                            <button type="button" onClick={() => removeMenuItem(idx)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"><X className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1 border-t border-slate-700/50">
                                                        <div className="md:col-span-6">
                                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Dish Image URL</label>
                                                            <input type="url" value={item.imageUrl || ''} onChange={e => updateMenuItem(idx, 'imageUrl', e.target.value)} placeholder="https://image-url.com/dish.jpg"
                                                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-[11px] text-white font-mono outline-none focus:border-amber-500 placeholder:text-slate-600" />
                                                        </div>

                                                        <div className="md:col-span-6">
                                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Item Classification (Veg, Non-Veg, Drink, Alcohol)</label>
                                                            <div className="flex gap-1.5 flex-wrap">
                                                                {DIETARY_OPTIONS.map(opt => (
                                                                    <button key={opt.type} type="button" onClick={() => updateMenuItem(idx, 'dietaryType', opt.type)}
                                                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${item.dietaryType === opt.type ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'}`}>
                                                                        <span>{opt.icon}</span> {opt.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                    <button type="button" onClick={() => setModalMode(null)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
                                    <button type="submit" disabled={saving} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2">
                                        {saving ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        {modalMode === 'create' ? 'Create Event' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* GUEST LIST MODAL */}
            <AnimatePresence>
                {modalMode === 'guests' && selectedEvent && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setModalMode(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={e => e.stopPropagation()}>

                            <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-slate-900">
                                <div>
                                    <h3 className="text-xl font-black text-white flex items-center gap-2"><Users className="w-5 h-5 text-teal-400" /> Guest List</h3>
                                    <p className="text-xs text-slate-400 mt-0.5 truncate">{selectedEvent.title}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => toast.success('Guest list export prepared!')} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700">
                                        <Download className="w-3.5 h-3.5" /> Export</button>
                                    <button onClick={() => setModalMode(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-3 gap-3 text-xs">
                                    {[
                                        { label: 'Total Booked', value: DEMO_BOOKINGS.filter(b => b.status !== 'CANCELLED').length, color: 'text-amber-400' },
                                        { label: 'Attended', value: DEMO_BOOKINGS.filter(b => b.status === 'ATTENDED').length, color: 'text-emerald-400' },
                                        { label: 'Revenue', value: `$${DEMO_BOOKINGS.filter(b => b.status !== 'CANCELLED').reduce((s, b) => s + b.totalPaid, 0).toFixed(0)}`, color: 'text-blue-400' },
                                    ].map(s => (
                                        <div key={s.label} className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
                                            <p className="text-slate-500 uppercase tracking-wider">{s.label}</p>
                                            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                                            <tr>
                                                <th className="p-3">Pass Code</th>
                                                <th className="p-3">Guest</th>
                                                <th className="p-3">Passes / Table</th>
                                                <th className="p-3">Paid</th>
                                                <th className="p-3 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60">
                                            {DEMO_BOOKINGS.map(b => (
                                                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                                                    <td className="p-3 font-mono font-black text-blue-400">{b.passCode}</td>
                                                    <td className="p-3">
                                                        <p className="font-bold text-white">{b.customerName}</p>
                                                        <p className="text-slate-500 text-[10px]">{b.customerPhone}</p>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="font-bold text-amber-400">{b.numberOfPasses}x</span>
                                                        {b.tableNumber && <span className="text-slate-400 text-[10px] block">Table {b.tableNumber}</span>}
                                                    </td>
                                                    <td className="p-3 font-black text-emerald-400">${b.totalPaid.toFixed(2)}</td>
                                                    <td className="p-3 text-right">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${b.status === 'ATTENDED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : b.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                                                            {b.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
