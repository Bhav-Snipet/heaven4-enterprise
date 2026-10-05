import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit2, Trash2, Copy, Lock, Globe, Ticket, X, Sparkles, ChefHat,
    Music, MapPin, Clock, Users, Calendar, Image, Link2, Upload,
    CheckCircle2, Eye
} from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';
import {
    getStatusStyle, getEventTypeBadge, formatEventDate, formatEventTime,
    generateInviteToken, getInviteLink, computeEventRevenue, DietaryType, getDietaryBadge, EventMenuItem
} from '@/shared/utils/eventHelpers';

interface EventData {
    id: number;
    title: string;
    description: string;
    eventType: 'PUBLIC' | 'PRIVATE';
    status: 'DRAFT' | 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
    startDate: string;
    endDate: string;
    location: string;
    address?: string;
    imageUrl: string;
    ticketPrice: number;
    totalCapacity: number;
    availablePasses: number;
    djName?: string;
    djGenre?: string;
    assignedManager: string;
    assignedChef: string;
    assignedEmployees: string;
    privateInviteToken?: string;
    menuItems: EventMenuItem[];
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

// ─── Seed Demo Data with Dish Images & Dietary Types ─────────────────────────
const DEMO_EVENTS: EventData[] = [
    {
        id: 901, title: '🎷 Sunset Rooftop Jazz & Wine Night', description: 'An exclusive evening with live saxophonist, artisanal wine tasting, and curated gourmet appetizers under the stars.',
        eventType: 'PUBLIC', status: 'LIVE',
        startDate: new Date(Date.now() - 3600000).toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 7200000).toISOString().slice(0, 16),
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
        id: 902, title: '💼 Horizon Corp Private Executive Gala', description: 'Private corporate dinner and product reveal party for Horizon Corp leadership team.',
        eventType: 'PRIVATE', status: 'UPCOMING',
        startDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 5 * 86400000 + 4 * 3600000).toISOString().slice(0, 16),
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
        id: 903, title: '🎉 New Year\'s Eve Grand Countdown', description: 'Ring in the New Year with a 5-course dinner, live DJ, fireworks viewing, and midnight champagne toast.',
        eventType: 'PUBLIC', status: 'UPCOMING',
        startDate: new Date('2026-12-31T21:00:00').toISOString().slice(0, 16),
        endDate: new Date('2027-01-01T02:00:00').toISOString().slice(0, 16),
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

const BLANK_FORM: Omit<EventData, 'id'> = {
    title: '', description: '', eventType: 'PUBLIC', status: 'UPCOMING',
    startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 86400000 + 4 * 3600000).toISOString().slice(0, 16),
    location: '', address: '', imageUrl: '',
    ticketPrice: 0, totalCapacity: 100, availablePasses: 100,
    djName: '', djGenre: '', assignedManager: '', assignedChef: '', assignedEmployees: '',
    menuItems: [],
};

export default function OwnerEventsPage() {
    const [events, setEvents] = useState<EventData[]>(DEMO_EVENTS);
    const [loading, setLoading] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [form, setForm] = useState<Omit<EventData, 'id'>>(BLANK_FORM);
    const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
    const [saving, setSaving] = useState(false);
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

    const setField = (key: keyof Omit<EventData, 'id'>, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const addMenuItem = () => {
        setForm(prev => ({
            ...prev,
            menuItems: [...prev.menuItems, { name: '', description: '', price: 0, category: 'Event Specials', dietaryType: 'VEG', imageUrl: '' }]
        }));
    };

    const updateMenuItem = (idx: number, field: keyof EventMenuItem, value: any) => {
        setForm(prev => ({
            ...prev,
            menuItems: prev.menuItems.map((item, i) => i === idx ? { ...item, [field]: value } : item)
        }));
    };

    const removeMenuItem = (idx: number) => {
        setForm(prev => ({ ...prev, menuItems: prev.menuItems.filter((_, i) => i !== idx) }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
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
    const openView = (evt: EventData) => { setSelectedEvent(evt); setModalMode('view'); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim() || form.title.trim().length < 3) { toast.error('Event title must be at least 3 characters'); return; }
        if (!form.location.trim()) { toast.error('Venue location is required'); return; }
        if (new Date(form.endDate) <= new Date(form.startDate)) { toast.error('End date must be after start date'); return; }

        setSaving(true);
        try {
            const token = form.eventType === 'PRIVATE' && !form.privateInviteToken ? generateInviteToken() : form.privateInviteToken;
            const payload = { ...form, privateInviteToken: token };

            if (modalMode === 'create') {
                await apiClient.post('/events', payload).catch(() => null);
                setEvents(prev => [{ ...payload, id: Date.now() }, ...prev]);
                toast.success(`🎉 "${form.title}" created successfully!`);
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
        toast.success(`Status updated to ${newStatus}`);
    };

    const copyInviteLink = (token?: string) => {
        if (!token) return;
        navigator.clipboard.writeText(getInviteLink(token));
        toast.success('🔗 Private invite link copied!');
    };

    const liveCount = events.filter(e => e.status === 'LIVE').length;
    const totalRevenue = events.reduce((sum, e) => sum + computeEventRevenue(e.ticketPrice, e.totalCapacity, e.availablePasses), 0);
    const totalSold = events.reduce((sum, e) => sum + (e.totalCapacity - e.availablePasses), 0);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-10">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-6 h-6 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Owner · Events Studio</span>
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                        Enterprise Event Studio
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Create public & private events with rich dish images, beverages/cocktails, staff assignments, and guest check-in.</p>
                </div>
                <button onClick={openCreate}
                    className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all shrink-0">
                    <Plus className="w-4 h-4" /> Create New Event
                </button>
            </div>

            {/* Analytics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Events', value: events.length, icon: '🎭', color: 'text-white' },
                    { label: 'Live Right Now', value: liveCount, icon: '🔴', color: 'text-red-400', pulse: liveCount > 0 },
                    { label: 'Passes Sold', value: totalSold, icon: '🎟️', color: 'text-amber-400' },
                    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString('en', { minimumFractionDigits: 2 })}`, icon: '💰', color: 'text-emerald-400' },
                ].map(stat => (
                    <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                        <span className={`text-2xl ${stat.pulse ? 'animate-pulse' : ''}`}>{stat.icon}</span>
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                            <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cards Grid */}
            {loading ? (
                <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {events.map(evt => {
                        const statusStyle = getStatusStyle(evt.status);
                        const revenue = computeEventRevenue(evt.ticketPrice, evt.totalCapacity, evt.availablePasses);
                        const soldPasses = evt.totalCapacity - evt.availablePasses;
                        return (
                            <motion.div key={evt.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                                <div className="h-44 relative bg-slate-950 overflow-hidden">
                                    {evt.imageUrl ? (
                                        <img src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover opacity-70" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                                            <Image className="w-12 h-12 text-slate-600" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${statusStyle.badge}`}>
                                            {statusStyle.dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
                                            {statusStyle.label}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${getEventTypeBadge(evt.eventType)}`}>
                                            {evt.eventType === 'PRIVATE' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                            {evt.eventType}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-3 right-3 flex gap-2">
                                        {evt.ticketPrice > 0 && (
                                            <span className="bg-emerald-950/90 text-emerald-400 font-black text-xs px-2.5 py-1 rounded-xl border border-emerald-800">
                                                ${revenue.toFixed(0)} earned
                                            </span>
                                        )}
                                        <span className="bg-slate-950/90 text-amber-400 font-black text-xs px-2.5 py-1 rounded-xl border border-slate-800">
                                            {soldPasses}/{evt.totalCapacity} sold
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 space-y-3">
                                    <div>
                                        <h3 className="text-lg font-black text-white leading-tight">{evt.title}</h3>
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{evt.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex items-center gap-2 text-slate-300"><Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" /><span className="truncate">{formatEventDate(evt.startDate)}</span></div>
                                        <div className="flex items-center gap-2 text-slate-300"><Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" /><span>{formatEventTime(evt.startDate)} – {formatEventTime(evt.endDate)}</span></div>
                                        <div className="flex items-center gap-2 text-slate-300"><MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" /><span className="truncate">{evt.location}</span></div>
                                        <div className="flex items-center gap-2 text-slate-300"><Music className="w-3.5 h-3.5 text-pink-400 shrink-0" /><span className="truncate">{evt.djName || 'No DJ set'}</span></div>
                                        <div className="flex items-center gap-2 text-slate-300"><ChefHat className="w-3.5 h-3.5 text-orange-400 shrink-0" /><span className="truncate">Chef {evt.assignedChef}</span></div>
                                        <div className="flex items-center gap-2 text-slate-300"><Users className="w-3.5 h-3.5 text-teal-400 shrink-0" /><span className="truncate">Mgr: {evt.assignedManager}</span></div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-emerald-400 font-black">{evt.ticketPrice > 0 ? `$${evt.ticketPrice.toFixed(2)} / Pass` : 'FREE Entry'}</span>
                                        <span className="text-slate-500">{evt.menuItems.length} custom menu items</span>
                                    </div>
                                </div>

                                <div className="px-5 pb-5 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 font-bold">Status:</span>
                                        <select value={evt.status} onChange={e => handleStatusChange(evt.id, e.target.value as EventData['status'])}
                                            className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-bold outline-none focus:border-amber-500">
                                            {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                                        </select>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => openView(evt)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all">
                                            <Eye className="w-3.5 h-3.5" /> View
                                        </button>
                                        <button onClick={() => openEdit(evt)} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20">
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        {evt.eventType === 'PRIVATE' && evt.privateInviteToken && (
                                            <button onClick={() => copyInviteLink(evt.privateInviteToken)} className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/20">
                                                <Copy className="w-3.5 h-3.5" /> Invite
                                            </button>
                                        )}
                                        {deleteConfirmId === evt.id ? (
                                            <div className="flex gap-1">
                                                <button onClick={() => handleDelete(evt.id)} className="px-3 py-2 bg-red-600 text-white font-bold text-xs rounded-xl">Yes</button>
                                                <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-2 bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">No</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setDeleteConfirmId(evt.id)} className="py-2 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs rounded-xl flex items-center justify-center transition-all border border-red-500/20">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    {evt.eventType === 'PRIVATE' && evt.privateInviteToken && (
                                        <div className="text-[10px] text-slate-500 font-mono truncate bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                                            🔗 Token: <span className="text-purple-300 font-bold">{evt.privateInviteToken}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                CREATE / EDIT MODAL (WITH DISH IMAGES & DIETARY TYPE)
            ══════════════════════════════════════════════════════════════════ */}
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
                                    <p className="text-xs text-slate-400 mt-0.5">Configure event details, banner image, and special menu items with images & drink categories.</p>
                                </div>
                                <button onClick={() => setModalMode(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all"><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-6">

                                {/* Identity */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Event Identity</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Event Title *</label>
                                            <input required type="text" value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. 🎷 Sunset Rooftop Jazz & Wine Night"
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-amber-500 placeholder:text-slate-600" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Event Type *</label>
                                            <select value={form.eventType} onChange={e => setField('eventType', e.target.value)}
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-amber-500">
                                                <option value="PUBLIC" className="bg-slate-900">🌐 Public — Visible in catalog, anyone can book</option>
                                                <option value="PRIVATE" className="bg-slate-900">🔒 Private — Hidden from public, unlocked via code or token</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Initial Status</label>
                                            <select value={form.status} onChange={e => setField('status', e.target.value)}
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-amber-500">
                                                {STATUS_OPTIONS.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Description</label>
                                            <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={3} placeholder="Describe the experience..."
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm resize-none outline-none focus:border-amber-500 placeholder:text-slate-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule & Venue */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Schedule & Venue</h4>
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
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Venue Name *</label>
                                            <input required type="text" value={form.location} onChange={e => setField('location', e.target.value)} placeholder="e.g. Rooftop Sunset Lounge"
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-amber-500 placeholder:text-slate-600" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Address (optional)</label>
                                            <input type="text" value={form.address} onChange={e => setField('address', e.target.value)} placeholder="e.g. 4th Floor, Heaven4 Building"
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm outline-none focus:border-amber-500 placeholder:text-slate-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Ticketing */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5" /> Ticketing & Capacity</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Ticket Price ($)</label>
                                            <input type="number" min={0} step="0.01" value={form.ticketPrice} onChange={e => setField('ticketPrice', parseFloat(e.target.value) || 0)} placeholder="0 = Free Entry"
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 text-sm font-bold outline-none focus:border-amber-500 placeholder:text-slate-600" />
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
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Staff & Entertainment</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div><label className="block text-xs font-bold text-slate-400 mb-1.5">Assigned Manager</label>
                                            <input type="text" value={form.assignedManager} onChange={e => setField('assignedManager', e.target.value)} placeholder="Sarah Jenkins"
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-purple-500 placeholder:text-slate-600" /></div>
                                        <div><label className="block text-xs font-bold text-slate-400 mb-1.5">Head Chef</label>
                                            <input type="text" value={form.assignedChef} onChange={e => setField('assignedChef', e.target.value)} placeholder="Marco Polo"
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-purple-500 placeholder:text-slate-600" /></div>
                                        <div><label className="block text-xs font-bold text-slate-400 mb-1.5">DJ / Artist</label>
                                            <input type="text" value={form.djName} onChange={e => setField('djName', e.target.value)} placeholder="DJ Pulse"
                                                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold outline-none focus:border-purple-500 placeholder:text-slate-600" /></div>
                                    </div>
                                </div>

                                {/* Banner Image */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5"><Image className="w-3.5 h-3.5" /> Event Banner Image</h4>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setImageMode('url')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${imageMode === 'url' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                            <Link2 className="w-3.5 h-3.5" /> URL</button>
                                        <button type="button" onClick={() => setImageMode('upload')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${imageMode === 'upload' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                            <Upload className="w-3.5 h-3.5" /> Upload</button>
                                    </div>
                                    {imageMode === 'url' ? (
                                        <input type="url" value={form.imageUrl} onChange={e => setField('imageUrl', e.target.value)} placeholder="https://images.unsplash.com/photo-..."
                                            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono outline-none focus:border-blue-500 placeholder:text-slate-600" />
                                    ) : (
                                        <label className="flex flex-col items-center justify-center p-6 bg-slate-800 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer hover:border-blue-500/50 transition-colors">
                                            <Upload className="w-8 h-8 text-slate-500 mb-2" />
                                            <span className="text-sm font-semibold text-slate-400">Click to upload banner</span>
                                            <input ref={imageUploadRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                        </label>
                                    )}
                                </div>

                                {/* ── ENHANCED EVENT MENU BUILDER (WITH DISH IMAGES & DIETARY TYPES) ── */}
                                <div className="space-y-4 pt-4 border-t border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <ChefHat className="w-4 h-4 text-amber-400" /> Custom Event Menu Items ({form.menuItems.length})
                                            </h4>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Add dishes, drinks, cocktails, & desserts with custom images & dietary classification.</p>
                                        </div>
                                        <button type="button" onClick={addMenuItem}
                                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all">
                                            <Plus className="w-4 h-4" /> Add Menu Item
                                        </button>
                                    </div>

                                    {form.menuItems.length === 0 ? (
                                        <div className="p-6 text-center border border-dashed border-slate-700 rounded-2xl text-slate-500 text-xs">
                                            No special event menu items added. Click "Add Menu Item" above to add custom dishes or drinks.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {form.menuItems.map((item, idx) => (
                                                <div key={idx} className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3 shadow-lg">
                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                                        {/* Dish Image Thumbnail */}
                                                        <div className="md:col-span-2 flex items-center gap-2">
                                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0 relative flex items-center justify-center">
                                                                {item.imageUrl ? (
                                                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Image className="w-5 h-5 text-slate-600" />
                                                                )}
                                                            </div>
                                                            <label className="text-[10px] text-amber-400 underline cursor-pointer hover:text-amber-300">
                                                                Upload
                                                                <input type="file" accept="image/*" onChange={e => handleDishFileUpload(idx, e)} className="hidden" />
                                                            </label>
                                                        </div>

                                                        {/* Dish Name */}
                                                        <div className="md:col-span-4">
                                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Item Name *</label>
                                                            <input required type="text" value={item.name} onChange={e => updateMenuItem(idx, 'name', e.target.value)}
                                                                placeholder="e.g. Passion Fruit Mojito"
                                                                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold outline-none focus:border-amber-500 placeholder:text-slate-600" />
                                                        </div>

                                                        {/* Price */}
                                                        <div className="md:col-span-2">
                                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Price ($)</label>
                                                            <input type="number" min={0} step="0.01" value={item.price} onChange={e => updateMenuItem(idx, 'price', parseFloat(e.target.value) || 0)}
                                                                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-400 font-bold outline-none text-center" />
                                                        </div>

                                                        {/* Category */}
                                                        <div className="md:col-span-3">
                                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Category</label>
                                                            <select value={item.category} onChange={e => updateMenuItem(idx, 'category', e.target.value)}
                                                                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 outline-none">
                                                                {MENU_CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                                                            </select>
                                                        </div>

                                                        {/* Delete button */}
                                                        <div className="md:col-span-1 flex justify-end">
                                                            <button type="button" onClick={() => removeMenuItem(idx)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1 border-t border-slate-700/50">
                                                        {/* Dish Image URL Input */}
                                                        <div className="md:col-span-6">
                                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Dish Image URL (or use Upload button above)</label>
                                                            <input type="url" value={item.imageUrl || ''} onChange={e => updateMenuItem(idx, 'imageUrl', e.target.value)}
                                                                placeholder="https://images.unsplash.com/photo-..."
                                                                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-[11px] text-white font-mono outline-none focus:border-amber-500 placeholder:text-slate-600" />
                                                        </div>

                                                        {/* Dietary / Item Type Selector */}
                                                        <div className="md:col-span-6">
                                                            <label className="block text-[10px] font-bold text-slate-400 mb-1">Item Classification (Veg, Non-Veg, Drink, Alcohol)</label>
                                                            <div className="flex gap-1.5 flex-wrap">
                                                                {DIETARY_OPTIONS.map(opt => (
                                                                    <button
                                                                        key={opt.type}
                                                                        type="button"
                                                                        onClick={() => updateMenuItem(idx, 'dietaryType', opt.type)}
                                                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                                                                            item.dietaryType === opt.type
                                                                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                                                                                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                                                                        }`}
                                                                    >
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

                                {/* Form Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                    <button type="button" onClick={() => setModalMode(null)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
                                    <button type="submit" disabled={saving} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2">
                                        {saving ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        {modalMode === 'create' ? 'Launch Event' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* View Modal */}
            <AnimatePresence>
                {modalMode === 'view' && selectedEvent && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setModalMode(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                            onClick={e => e.stopPropagation()}>

                            {selectedEvent.imageUrl && (
                                <div className="h-52 relative overflow-hidden rounded-t-3xl">
                                    <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                                </div>
                            )}

                            <div className="p-6 space-y-5">
                                <h2 className="text-2xl font-black text-white">{selectedEvent.title}</h2>
                                <p className="text-sm text-slate-400">{selectedEvent.description}</p>

                                {selectedEvent.menuItems.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Event Menu ({selectedEvent.menuItems.length} items)</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {selectedEvent.menuItems.map((item, idx) => {
                                                const badge = getDietaryBadge(item.dietaryType);
                                                return (
                                                    <div key={idx} className="flex gap-3 items-center p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs">
                                                        {item.imageUrl && (
                                                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-slate-950 shrink-0" />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-white truncate">{item.name}</span>
                                                                <span className={`px-1.5 py-0.5 text-[9px] rounded-md font-bold ${badge.badge}`}>{badge.icon} {badge.label}</span>
                                                            </div>
                                                            <p className="text-slate-500 text-[10px] truncate">{item.category}</p>
                                                            <p className="font-black text-emerald-400 mt-0.5">${item.price.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
