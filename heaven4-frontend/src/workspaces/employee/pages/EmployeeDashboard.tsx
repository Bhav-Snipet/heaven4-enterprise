import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle2, User, Clock, Sparkles, MapPin, Utensils, Crown, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthProvider';
import toast from 'react-hot-toast';
import {
    loadMasterTables, TableConfig, getRecommendedTables, CATEGORY_DETAILS,
    getGroupedMasterTables, saveMasterTables
} from '@/shared/utils/tableHelpers';

interface MenuItem { id: number; name: string; basePrice: number; categoryId: number; isAvailable: boolean; isBeverage?: boolean; }

type ModalType = 'add' | 'close' | 'walkin' | 'complaint' | 'profile' | null;
type AreaView = 'NORMAL' | 'EVENT_ROOFTOP' | 'EVENT_BALLROOM';

const DEFAULT_ITEMS: MenuItem[] = [
    { id: 9001, categoryId: 4, name: '🎷 Truffle Mushroom Bruschetta (Event Special)', basePrice: 16.00, isAvailable: true },
    { id: 9002, categoryId: 4, name: '🍷 Reserve Cabernet Sauvignon (Event Wine)', basePrice: 18.00, isAvailable: true, isBeverage: true },
    { id: 9003, categoryId: 4, name: '🍸 Event Signature Elderflower Cocktail', basePrice: 14.00, isAvailable: true, isBeverage: true },
    { id: 8001, categoryId: 3, name: 'Hoppy Citrus Craft IPA Beer (Pint)', basePrice: 8.50, isAvailable: true, isBeverage: true },
    { id: 8002, categoryId: 3, name: 'Single Malt Aged Reserve Whiskey (60ml)', basePrice: 14.00, isAvailable: true, isBeverage: true },
    { id: 8003, categoryId: 3, name: 'Botanical Tonic & Gin (90ml)', basePrice: 11.50, isAvailable: true, isBeverage: true },
    { id: 8004, categoryId: 2, name: 'Fresh Sparkling Lemon Mint Mojito (Mocktail)', basePrice: 5.50, isAvailable: true, isBeverage: true },
    { id: 8005, categoryId: 2, name: 'Artisanal Peach Iced Tea', basePrice: 4.99, isAvailable: true, isBeverage: true },
    { id: 8006, categoryId: 1, name: 'Truffle Mushroom Gourmet Pizza', basePrice: 19.99, isAvailable: true },
    { id: 8007, categoryId: 1, name: 'Pepperoni Supreme Pizza', basePrice: 22.49, isAvailable: true }
];

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const [masterTables, setMasterTables] = useState<TableConfig[]>([]);
    const [areaView, setAreaView] = useState<AreaView>('NORMAL');
    const [modal, setModal] = useState<ModalType>(null);
    const [selectedTableConfig, setSelectedTableConfig] = useState<TableConfig | null>(null);
    const [selectedItems, setSelectedItems] = useState<{ item: MenuItem; qty: number }[]>([]);
    const [walkInTable, setWalkInTable] = useState('');
    const [walkInCustomerName, setWalkInCustomerName] = useState('');
    const [walkInMembershipTier, setWalkInMembershipTier] = useState('GOLD VIP');
    const [dineInGuests, setDineInGuests] = useState<number>(2);
    const [isProcessing, setIsProcessing] = useState(false);

    const [isClockedIn, setIsClockedIn] = useState(true);
    const [clockInTime] = useState('09:00 AM');

    const [staffDetails] = useState({
        id: '#EMP-501',
        name: user?.displayName || 'Alex Rivera',
        role: 'Floor Captain / POS Waiter',
        phone: user?.phoneNumber || '7020875435',
        email: 'alex.rivera@heaven4.com',
        shiftHours: '09:00 AM - 05:00 PM',
        department: 'Dining Floor Operations',
        tablesGoal: 20,
        currentScore: 98
    });

    const toggleClockIn = () => {
        setIsClockedIn(!isClockedIn);
        toast.success(!isClockedIn ? 'Clocked IN for shift!' : 'Clocked OUT from shift.');
    };

    const syncTablesWithPlacedOrders = useCallback(() => {
        const tables = loadMasterTables();
        try {
            const rawOrders = localStorage.getItem('heaven4_active_orders_v2');
            if (rawOrders) {
                const orders = JSON.parse(rawOrders);
                if (Array.isArray(orders)) {
                    orders.forEach((ord: any) => {
                        if (ord.tableNumber) {
                            const tbl = tables.find(t => t.tableNumber.toUpperCase() === ord.tableNumber.toUpperCase() || t.id.toUpperCase() === ord.tableNumber.toUpperCase());
                            if (tbl) {
                                tbl.status = 'OCCUPIED';
                                tbl.customerName = tbl.customerName || `Order #${ord.id}`;
                                tbl.membershipTier = tbl.membershipTier || 'GOLD VIP';
                            }
                        }
                    });
                }
            }
        } catch { /* proceed */ }
        setMasterTables(tables);
    }, []);

    useEffect(() => {
        syncTablesWithPlacedOrders();

        const handleOrderPlaced = () => syncTablesWithPlacedOrders();
        const handleTablesUpdated = () => syncTablesWithPlacedOrders();
        window.addEventListener('heaven4-order-placed', handleOrderPlaced);
        window.addEventListener('heaven4-tables-updated', handleTablesUpdated);
        window.addEventListener('storage', handleOrderPlaced);

        const interval = setInterval(syncTablesWithPlacedOrders, 3000);

        return () => {
            window.removeEventListener('heaven4-order-placed', handleOrderPlaced);
            window.removeEventListener('heaven4-tables-updated', handleTablesUpdated);
            window.removeEventListener('storage', handleOrderPlaced);
            clearInterval(interval);
        };
    }, [syncTablesWithPlacedOrders]);

    // Switch seating layout tables based on selected area/event
    const currentDisplayTables = masterTables.filter(t => {
        if (areaView === 'NORMAL') return !t.eventId;
        if (areaView === 'EVENT_ROOFTOP') return t.eventId === 901 || t.category === 'EVENT_ROOFTOP';
        if (areaView === 'EVENT_BALLROOM') return t.eventId === 902 || t.category === 'EVENT_BALLROOM';
        return true;
    });

    const groupedSections = getGroupedMasterTables(currentDisplayTables);

    const recommendedTables = getRecommendedTables(dineInGuests, areaView === 'EVENT_ROOFTOP' ? 901 : areaView === 'EVENT_BALLROOM' ? 902 : undefined);

    const addItemToOrder = (item: MenuItem) => {
        setSelectedItems(prev => {
            const existing = prev.find(i => i.item.id === item.id);
            if (existing) return prev.map(i => i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { item, qty: 1 }];
        });
    };

    const handleCreateWalkInOrder = async () => {
        if (!walkInTable) { toast.error('Please select a dining or event table'); return; }

        setIsProcessing(true);
        try {
            const updated = masterTables.map(t => t.tableNumber === walkInTable ? {
                ...t,
                status: 'OCCUPIED' as const,
                currentGuests: dineInGuests,
                customerName: walkInCustomerName.trim() || 'VIP Walk-in Guest',
                membershipTier: walkInMembershipTier
            } : t);

            saveMasterTables(updated);
            setMasterTables(updated);
            toast.success(`🎉 Order placed for Table ${walkInTable} (${dineInGuests} guests · ${walkInMembershipTier})!`);
            setSelectedItems([]);
            setWalkInCustomerName('');
            setModal(null);
        } catch { toast.error('Failed to create order'); } finally { setIsProcessing(false); }
    };

    const handleSettleBill = async (tableNo: string) => {
        setIsProcessing(true);
        try {
            const updated = masterTables.map(t => t.tableNumber === tableNo ? { ...t, status: 'FREE' as const, currentGuests: undefined, customerName: undefined, membershipTier: undefined } : t);
            saveMasterTables(updated);
            setMasterTables(updated);
            toast.success(`💳 Bill settled for Table ${tableNo}! Table is now FREE.`);
            setModal(null);
        } catch { toast.error('Failed to settle bill'); } finally { setIsProcessing(false); }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 space-y-6 pb-20">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                        Floor POS & Staff Operations
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Real-time seating capacity, section-grouped sequencing, VIP walk-in overrides, & instant order sync.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={toggleClockIn}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all ${
                            isClockedIn ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
                        {isClockedIn ? `Clocked In (${clockInTime})` : 'Clocked Out'}
                    </button>

                    <button onClick={() => setModal('profile')}
                        className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl px-4 py-2 flex items-center gap-2.5 text-left shadow-sm">
                        <User className="w-4 h-4 text-blue-400" />
                        <div>
                            <p className="font-bold text-xs text-amber-400">{staffDetails.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{staffDetails.id} · Edit Details</p>
                        </div>
                    </button>

                    <button onClick={() => { setSelectedItems([]); setWalkInTable(''); setModal('walkin'); }}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all text-xs border border-blue-400/30">
                        <Plus className="w-4 h-4" /> New Walk-in Order
                    </button>
                </div>
            </header>

            {/* AREA / EVENT SEATING SWITCHER */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Switch Seating Layout & Venue:</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                    {[
                        { key: 'NORMAL' as AreaView, label: '🍽️ Main Dining Hall', count: masterTables.filter(t => !t.eventId).length },
                        { key: 'EVENT_ROOFTOP' as AreaView, label: '🎷 Event: Sunset Jazz (Rooftop)', count: masterTables.filter(t => t.eventId === 901 || t.category === 'EVENT_ROOFTOP').length },
                        { key: 'EVENT_BALLROOM' as AreaView, label: '💼 Event: Horizon Gala (Ballroom)', count: masterTables.filter(t => t.eventId === 902 || t.category === 'EVENT_BALLROOM').length },
                    ].map(view => (
                        <button key={view.key} onClick={() => setAreaView(view.key)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border shrink-0 ${
                                areaView === view.key
                                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}>
                            {view.label} ({view.count} tables)
                        </button>
                    ))}
                </div>
            </div>

            {/* 🎭 Event Duty Shift */}
            <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">My Active Event Duty Shift</h3>
                    </div>
                    <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-[10px] font-black rounded-full border border-purple-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> SHIFT ASSIGNED
                    </span>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Live Event Duty</p>
                        <p className="font-black text-white text-sm mt-0.5">🎷 Sunset Rooftop Jazz & Wine Night</p>
                        <p className="text-purple-300 text-[11px] mt-0.5">Role: Event Service & VIP Host</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Venue & Schedule</p>
                        <p className="font-bold text-slate-300 flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Rooftop Sunset Lounge</p>
                        <p className="text-slate-400 flex items-center gap-1 mt-0.5"><Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" /> 7:00 PM – 11:00 PM (Active Now)</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">In-Charge Leads</p>
                        <p className="text-slate-300 font-bold mt-0.5">Manager: <span className="text-amber-400">Sarah Jenkins</span></p>
                        <p className="text-slate-300 font-bold mt-0.5">Chef: <span className="text-orange-400">Marco Polo</span></p>
                    </div>
                </div>
            </div>

            {/* SECTION-GROUPED TABLE GRID IN NUMERICAL SEQUENCE */}
            <div className="space-y-8">
                {groupedSections.map(section => (
                    <div key={section.category} className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-900 border border-slate-800 rounded-2xl">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{section.details.icon}</span>
                                <h3 className="text-xs font-black text-white uppercase tracking-wider">{section.details.label} Section</h3>
                                <span className="text-xs text-slate-400">({section.tables.length} tables in numerical sequence)</span>
                            </div>
                            <span className="text-xs font-bold text-amber-400">
                                Section Capacity: {section.tables.reduce((s, t) => s + t.capacity, 0)} Seats
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {section.tables.map(table => (
                                <motion.div key={table.id} whileHover={{ y: -4 }}
                                    onClick={() => { setSelectedTableConfig(table); setModal('close'); }}
                                    className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                        table.status === 'OCCUPIED' ? 'bg-slate-900 border-blue-500 shadow-xl shadow-blue-500/10' :
                                        table.status === 'RESERVED' ? 'bg-slate-900 border-amber-500/50 shadow-xl shadow-amber-500/10' :
                                        'bg-slate-950 border-slate-800 hover:border-blue-500/50'
                                    }`}>
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-2xl font-black text-white">Table {table.tableNumber}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                table.status === 'OCCUPIED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                                table.status === 'RESERVED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                                'bg-slate-800 text-slate-400 border border-slate-700'
                                            }`}>
                                                {table.status}
                                            </span>
                                        </div>

                                        {/* Capacity Badge */}
                                        <div className="mb-2 flex items-center justify-between gap-1 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${section.details.badge} inline-flex items-center gap-1`}>
                                                <span>{section.details.icon}</span> {table.category === 'BAR_COUNTER' ? 'Bar Seat (Cap: 1)' : `Cap: ${table.capacity} Seats`}
                                            </span>
                                            {table.membershipTier && (
                                                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] font-black rounded border border-amber-500/30 flex items-center gap-1">
                                                    <Crown className="w-2.5 h-2.5" /> {table.membershipTier}
                                                </span>
                                            )}
                                        </div>

                                        {table.customerName && (
                                            <p className="text-[11px] font-bold text-amber-400 truncate mt-1">{table.customerName}</p>
                                        )}
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
                                        <span>{section.details.label}</span>
                                        <span className="text-blue-400 font-bold">Tap to manage</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* WALK-IN ORDER & VIP MEMBERSHIP OVERRIDE MODAL */}
            <AnimatePresence>
                {modal === 'walkin' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setModal(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl"
                            onClick={e => e.stopPropagation()}>

                            <div className="flex justify-between items-center p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
                                <div>
                                    <h3 className="text-xl font-black text-white flex items-center gap-2"><Plus className="w-5 h-5 text-blue-400" /> New Walk-in Order & Smart Seating</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Select guest count, assign VIP membership priority, & recommend matching tables.</p>
                                </div>
                                <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="p-6 space-y-5 text-xs">
                                {/* Guest Name & Phone-less VIP Membership Tier Override */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Walk-in Guest Name</label>
                                        <input type="text" value={walkInCustomerName} onChange={e => setWalkInCustomerName(e.target.value)}
                                            placeholder="e.g. Marcus Vance (Phone-less Walk-in)"
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                                            <Crown className="w-3.5 h-3.5 text-amber-400" /> Staff VIP Membership Override
                                        </label>
                                        <select value={walkInMembershipTier} onChange={e => setWalkInMembershipTier(e.target.value)}
                                            className="w-full p-3 bg-slate-950 border border-amber-500/50 text-amber-400 rounded-xl font-black outline-none">
                                            <option value="DIAMOND VIP" className="bg-slate-900">👑 DIAMOND VIP (Priority Service)</option>
                                            <option value="PLATINUM VIP" className="bg-slate-900">🥇 PLATINUM VIP</option>
                                            <option value="GOLD VIP" className="bg-slate-900">🥈 GOLD VIP</option>
                                            <option value="SILVER VIP" className="bg-slate-900">🥉 SILVER VIP</option>
                                            <option value="STANDARD" className="bg-slate-900">👤 STANDARD</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Guest Count Selector */}
                                <div>
                                    <label className="block font-bold text-slate-400 mb-2 uppercase tracking-wider">Dine-in Guests Count</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {[1, 2, 4, 6, 8, 10, 12].map(n => (
                                            <button key={n} type="button" onClick={() => setDineInGuests(n)}
                                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                                                    dineInGuests === n ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' : 'bg-slate-800 text-slate-300 border-slate-700'
                                                }`}>
                                                {n === 1 ? '🍸 1 Person (Bar Seat)' : n === 2 ? '👩‍❤️‍👨 2 Guests' : `${n} Guests`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Table Selection with Smart Recommendations */}
                                <div>
                                    <label className="block font-bold text-slate-400 mb-2 uppercase tracking-wider">Select Recommended Table (Capacity ≥ {dineInGuests})</label>
                                    {recommendedTables.length === 0 ? (
                                        <div className="p-4 text-center border border-dashed border-red-500/40 bg-red-500/10 rounded-2xl text-red-400 text-xs font-bold">
                                            No available tables with capacity for {dineInGuests} guests right now.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {recommendedTables.map(tbl => {
                                                const catInfo = CATEGORY_DETAILS[tbl.category] || CATEGORY_DETAILS.STANDARD;
                                                const isMatch = walkInTable === tbl.tableNumber;
                                                return (
                                                    <button key={tbl.id} type="button" onClick={() => setWalkInTable(tbl.tableNumber)}
                                                        className={`p-3 rounded-2xl border text-left transition-all ${
                                                            isMatch ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg' : 'bg-slate-950 text-white border-slate-800 hover:border-amber-500/50'
                                                        }`}>
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-black text-sm">{tbl.tableNumber}</span>
                                                            <span className="text-xs">{catInfo.icon}</span>
                                                        </div>
                                                        <p className={`text-[10px] ${isMatch ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>Cap: {tbl.capacity} seats</p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Menu Items */}
                                <div className="space-y-3">
                                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Add Order Items</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                                        {DEFAULT_ITEMS.map(item => (
                                            <div key={item.id} className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                                                <div>
                                                    <p className="font-bold text-white">{item.name}</p>
                                                    <p className="text-emerald-400 font-black">${item.basePrice.toFixed(2)}</p>
                                                </div>
                                                <button type="button" onClick={() => addItemToOrder(item)}
                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg">
                                                    + Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                {selectedItems.length > 0 && (
                                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                                        <p className="font-bold text-slate-400 uppercase">Selected Items ({selectedItems.length})</p>
                                        {selectedItems.map((si, idx) => (
                                            <div key={idx} className="flex justify-between items-center">
                                                <span>{si.item.name} × {si.qty}</span>
                                                <span className="font-black text-emerald-400">${(si.item.basePrice * si.qty).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button onClick={handleCreateWalkInOrder} disabled={isProcessing || !walkInTable}
                                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" /> Confirm Walk-in Order for Table {walkInTable || '...'} ({walkInMembershipTier})
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Settle Bill Modal */}
            <AnimatePresence>
                {modal === 'close' && selectedTableConfig && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setModal(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl"
                            onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-black text-white">Table {selectedTableConfig.tableNumber}</h3>
                                    <p className="text-xs text-slate-400">{selectedTableConfig.categoryLabel} · Capacity: {selectedTableConfig.capacity} Seats</p>
                                </div>
                                <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                                <div className="flex justify-between text-slate-400"><span>Status</span><span className="font-bold text-amber-400">{selectedTableConfig.status}</span></div>
                                {selectedTableConfig.customerName && (
                                    <div className="flex justify-between text-slate-400"><span>Customer</span><span className="font-bold text-white">{selectedTableConfig.customerName}</span></div>
                                )}
                                {selectedTableConfig.membershipTier && (
                                    <div className="flex justify-between text-slate-400"><span>VIP Tier</span><span className="font-bold text-amber-300">{selectedTableConfig.membershipTier}</span></div>
                                )}
                            </div>

                            <button onClick={() => handleSettleBill(selectedTableConfig.tableNumber)} disabled={isProcessing}
                                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-5 h-5" /> Mark Table FREE & Settle Bill
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
