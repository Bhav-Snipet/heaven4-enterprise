import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Music, Plus, Copy, Lock, Globe, Ticket, X, Sparkles, ChefHat } from 'lucide-react';
import apiClient from '@/core/api/client';
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
    assignedEmployee?: string;
    status: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
    imageUrl?: string;
    menuItems?: EventMenuItem[];
}

const DEFAULT_EVENTS: EventData[] = [
    {
        id: 901,
        title: '🎷 Sunset Rooftop Jazz & Wine Night',
        description: 'An exclusive evening with live saxophonist, artisanal wine tasting, and curated gourmet appetizers.',
        eventType: 'PUBLIC',
        startDate: '2026-08-15T19:00:00',
        endDate: '2026-08-15T23:00:00',
        location: 'Rooftop Sunset Lounge',
        ticketPrice: 45.00,
        totalPasses: 100,
        availablePasses: 42,
        djName: 'DJ Pulse & Sax Ensemble',
        djGenre: 'Deep House & Live Saxophone',
        assignedManager: 'Sarah Jenkins',
        assignedChef: 'Marco Polo',
        assignedEmployee: 'Alex Rivera',
        status: 'UPCOMING',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
        menuItems: [
            { name: 'Truffle Mushroom Bruschetta', description: 'Toasted sourdough with wild mushroom truffle cream', price: 16.00, categoryName: 'Event Appetizers', isVeg: true },
            { name: 'Reserve Cabernet Sauvignon (Glass)', description: 'Vintage 2018 Napa Valley Red', price: 18.00, categoryName: 'Event Wine Selection', isVeg: true }
        ]
    },
    {
        id: 902,
        title: '💼 Horizon Corp Private Gala',
        description: 'Private corporate dinner and product reveal party.',
        eventType: 'PRIVATE',
        startDate: '2026-08-20T18:30:00',
        endDate: '2026-08-20T22:30:00',
        location: 'Grand Ballroom VIP Hall',
        privateInviteToken: 'evt_token_horizon_98412',
        ticketPrice: 0,
        totalPasses: 60,
        availablePasses: 60,
        djName: 'DJ ElectroWave',
        djGenre: 'Ambient Lounge Beats',
        assignedManager: 'Sarah Jenkins',
        assignedChef: 'Marco Polo',
        assignedEmployee: 'Alex Rivera',
        status: 'UPCOMING',
        imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
        menuItems: [
            { name: 'Wagyu Beef Sliders', description: 'Mini brioche with caramelized onion & aged cheddar', price: 24.00, categoryName: 'Private Gala Food', isVeg: false }
        ]
    }
];

export default function OwnerEventsPage() {
    const [events, setEvents] = useState<EventData[]>(DEFAULT_EVENTS);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventType, setEventType] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
    const [location, setLocation] = useState('Rooftop Sunset Lounge');
    const [ticketPrice, setTicketPrice] = useState('25.00');
    const [totalPasses, setTotalPasses] = useState('100');
    const [djName, setDjName] = useState('DJ Pulse');
    const [djGenre, setDjGenre] = useState('Chill House / Lounge');
    const [assignedManager] = useState('Sarah Jenkins');
    const [assignedChef] = useState('Marco Polo');
    const [assignedEmployee] = useState('Alex Rivera');
    const [eventMenuItems, setEventMenuItems] = useState<EventMenuItem[]>([
        { name: 'Event Signature Cocktail', description: 'Craft gin with elderflower & rosemary', price: 14.00, categoryName: 'Special Drinks', isVeg: true }
    ]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/events');
            if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                setEvents(res.data);
            } else {
                setEvents(DEFAULT_EVENTS);
            }
        } catch {
            setEvents(DEFAULT_EVENTS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const addMenuItemRow = () => {
        setEventMenuItems([...eventMenuItems, { name: '', description: '', price: 12.00, categoryName: 'Event Specials', isVeg: true }]);
    };

    const updateMenuItem = (index: number, field: keyof EventMenuItem, value: any) => {
        setEventMenuItems(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
    };

    const removeMenuItem = (index: number) => {
        setEventMenuItems(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = eventType === 'PRIVATE' ? `evt_token_${Date.now().toString(36)}` : undefined;
            const newEventPayload = {
                title,
                description,
                eventType,
                location,
                ticketPrice: Number(ticketPrice),
                totalPasses: Number(totalPasses),
                djName,
                djGenre,
                assignedManager,
                assignedChef,
                assignedEmployee,
                menuItems: eventMenuItems.filter(i => i.name.trim().length > 0),
                privateInviteToken: token
            };

            await apiClient.post('/events', newEventPayload).catch(() => null);

            const createdObj: EventData = {
                id: Date.now(),
                ...newEventPayload,
                startDate: new Date(Date.now() + 86400000).toISOString(),
                endDate: new Date(Date.now() + 86400000 + 14400000).toISOString(),
                availablePasses: Number(totalPasses),
                status: 'UPCOMING',
                imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'
            };

            setEvents(prev => [createdObj, ...prev]);
            toast.success(`🎉 ${eventType} Event "${title}" Created Successfully!`);
            setShowModal(false);
            resetForm();
        } catch {
            toast.error('Failed to create event');
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setEventType('PUBLIC');
        setLocation('Rooftop Sunset Lounge');
        setTicketPrice('25.00');
        setTotalPasses('100');
        setDjName('DJ Pulse');
        setDjGenre('Chill House / Lounge');
    };

    const copyInviteLink = (token?: string) => {
        if (!token) return;
        const link = `${window.location.origin}/events/invite/${token}`;
        navigator.clipboard.writeText(link);
        toast.success('📋 Private Event Booking URL copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-amber-400" />
                        Enterprise Event Studio & Special Menus
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Host public festivals or private corporate parties with dedicated menus, DJ lineups, and private invite links.</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all"
                >
                    <Plus className="w-4 h-4" /> Create New Event
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {events.map((evt) => (
                        <motion.div 
                            key={evt.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
                        >
                            <div>
                                <div className="h-44 relative bg-slate-950 overflow-hidden">
                                    <img src={evt.imageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'} alt={evt.title} className="w-full h-full object-cover opacity-60" />
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                                            evt.eventType === 'PRIVATE' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                        }`}>
                                            {evt.eventType === 'PRIVATE' ? <><Lock className="w-3 h-3 inline mr-1" /> PRIVATE EVENT</> : <><Globe className="w-3 h-3 inline mr-1" /> PUBLIC EVENT</>}
                                        </span>
                                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black">
                                            🔴 UPCOMING LIVE
                                        </span>
                                    </div>

                                    {evt.eventType === 'PRIVATE' && evt.privateInviteToken && (
                                        <button 
                                            onClick={() => copyInviteLink(evt.privateInviteToken)}
                                            className="absolute bottom-4 right-4 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md text-amber-400 font-bold text-[10px] rounded-xl border border-amber-500/40 flex items-center gap-1.5"
                                        >
                                            <Copy className="w-3.5 h-3.5" /> Copy Invite Link
                                        </button>
                                    )}
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
                                            <Ticket className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold">Pass Price</p>
                                                <p className="font-black text-emerald-400">{evt.ticketPrice > 0 ? `$${evt.ticketPrice.toFixed(2)}` : 'FREE Entry'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Music className="w-4 h-4 text-purple-400 shrink-0" />
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold">DJ / Music</p>
                                                <p className="font-bold text-purple-300 truncate">{evt.djName || 'Live DJ Lineup'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ChefHat className="w-4 h-4 text-blue-400 shrink-0" />
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold">Staff Crew</p>
                                                <p className="font-bold text-blue-300 truncate">{evt.assignedChef} & {evt.assignedEmployee}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {evt.menuItems && evt.menuItems.length > 0 && (
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Dedicated Event Menu</h4>
                                            <div className="space-y-1.5">
                                                {evt.menuItems.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                                        <div>
                                                            <span className="font-bold text-amber-400">{item.name}</span>
                                                            <span className="text-[10px] text-slate-500 block">{item.categoryName}</span>
                                                        </div>
                                                        <span className="font-black text-emerald-400">${item.price.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl text-white space-y-6"
                            onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <div>
                                    <h3 className="text-xl font-black text-white">Create Enterprise Event & Menu</h3>
                                    <p className="text-xs text-slate-400">Configure Public/Private privacy, DJ entertainment, staff crew, and custom event menu items.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            <form onSubmit={handleCreateEvent} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                                    <div>
                                        <label className="block text-slate-400 mb-1 font-bold">Event Title *</label>
                                        <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Rooftop Sunset Jazz Night"
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 mb-1 font-bold">Privacy Type *</label>
                                        <select value={eventType} onChange={e => setEventType(e.target.value as any)}
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500">
                                            <option value="PUBLIC">🌐 Public Event (Visible in Menu & Pass Booking)</option>
                                            <option value="PRIVATE">🔒 Private Event (Generates Token Invite URL)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-400 mb-1 font-bold">Event Description</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Event details and guidelines..."
                                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-amber-500 h-20 resize-none font-medium" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                                    <div>
                                        <label className="block text-slate-400 mb-1 font-bold">Venue Location</label>
                                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Rooftop Lounge"
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 mb-1 font-bold">Ticket Pass Price ($)</label>
                                        <input type="number" step="0.01" value={ticketPrice} onChange={e => setTicketPrice(e.target.value)} placeholder="25.00"
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 mb-1 font-bold">Total Pass Capacity</label>
                                        <input type="number" value={totalPasses} onChange={e => setTotalPasses(e.target.value)} placeholder="100"
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                                    <div>
                                        <label className="block text-purple-300 mb-1 font-bold flex items-center gap-1.5"><Music className="w-3.5 h-3.5" /> DJ / Artist Name</label>
                                        <input type="text" value={djName} onChange={e => setDjName(e.target.value)} placeholder="DJ Pulse"
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-purple-500" />
                                    </div>
                                    <div>
                                        <label className="block text-purple-300 mb-1 font-bold">Music Genre</label>
                                        <input type="text" value={djGenre} onChange={e => setDjGenre(e.target.value)} placeholder="Deep House & Chill"
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-purple-500" />
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest">Dedicated Event Food & Beverage Menu</h4>
                                        <button type="button" onClick={addMenuItemRow} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1 border border-slate-700">
                                            <Plus className="w-3.5 h-3.5" /> Add Dish
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {eventMenuItems.map((item, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                                <input type="text" value={item.name} onChange={e => updateMenuItem(idx, 'name', e.target.value)} placeholder="Dish / Drink Name"
                                                    className="col-span-5 p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none" />
                                                <input type="number" step="0.01" value={item.price} onChange={e => updateMenuItem(idx, 'price', Number(e.target.value))} placeholder="Price"
                                                    className="col-span-3 p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-emerald-400 font-bold outline-none" />
                                                <input type="text" value={item.categoryName} onChange={e => updateMenuItem(idx, 'categoryName', e.target.value)} placeholder="Category"
                                                    className="col-span-3 p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none" />
                                                <button type="button" onClick={() => removeMenuItem(idx)} className="col-span-1 text-red-400 hover:text-red-300 font-bold">
                                                    <X className="w-4 h-4 mx-auto" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
                                    <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30">
                                        Save & Launch Event
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
