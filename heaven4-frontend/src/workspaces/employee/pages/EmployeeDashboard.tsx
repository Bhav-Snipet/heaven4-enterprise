import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle2, User, Utensils, Crown, Printer, ChefHat, Check, Zap } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthProvider';
import { useAudioAlerts } from '@/core/contexts/AudioProvider';
import toast from 'react-hot-toast';
import {
    loadMasterTables, TableConfig, getRecommendedTables, CATEGORY_DETAILS,
    getGroupedMasterTables, saveMasterTables
} from '@/shared/utils/tableHelpers';
import { clockInStaff, clockOutStaff } from '@/shared/utils/attendanceHelpers';

import { INITIAL_CATEGORIES, INITIAL_ITEMS_MAP } from '@/shared/utils/catalogData';

interface MenuItem { id: number; name: string; basePrice: number; categoryId: number; isAvailable: boolean; isBeverage?: boolean; }

interface ActiveOrder {
    id: number;
    tableNumber: string;
    items: { name: string; quantity: number; price: number }[];
    subtotal: number;
    tax: number;
    tip: number;
    total: number;
    placedAt: string;
    orderStatus?: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED';
}

type ModalType = 'close' | 'walkin' | null;
type AreaView = 'NORMAL' | 'EVENT_ROOFTOP' | 'EVENT_BALLROOM';

const ALL_FULL_MENU_ITEMS: MenuItem[] = [
    ...Object.values(INITIAL_ITEMS_MAP).flat().map(i => ({
        id: i.id,
        name: i.name,
        basePrice: i.basePrice,
        categoryId: i.categoryId,
        isAvailable: i.isAvailable,
        isBeverage: [5, 6, 7].includes(i.categoryId)
    })),
    { id: 9001, categoryId: 9, name: '🎷 Truffle Mushroom Bruschetta (Event Special)', basePrice: 16.00, isAvailable: true },
    { id: 9002, categoryId: 9, name: '🍷 Reserve Cabernet Sauvignon (Event Wine)', basePrice: 18.00, isAvailable: true, isBeverage: true },
    { id: 9003, categoryId: 9, name: '🍸 Event Signature Elderflower Cocktail', basePrice: 14.00, isAvailable: true, isBeverage: true },
];

export default function EmployeeDashboard() {
    const { user } = useAuth();
    const { playSound } = useAudioAlerts();
    const [masterTables, setMasterTables] = useState<TableConfig[]>([]);
    const [areaView, setAreaView] = useState<AreaView>('NORMAL');
    const [modal, setModal] = useState<ModalType>(null);
    const [selectedTableConfig, setSelectedTableConfig] = useState<TableConfig | null>(null);
    const [activeTableOrder, setActiveTableOrder] = useState<ActiveOrder | null>(null);
    const [selectedItems, setSelectedItems] = useState<{ item: MenuItem; qty: number }[]>([]);
    const [walkInSearch, setWalkInSearch] = useState('');
    const [walkInCategory, setWalkInCategory] = useState<number | null>(null);
    const [walkInTable, setWalkInTable] = useState('');
    const [walkInCustomerName, setWalkInCustomerName] = useState('');
    const [walkInMembershipTier, setWalkInMembershipTier] = useState('GOLD VIP');
    const [dineInGuests, setDineInGuests] = useState<number>(2);
    const [isProcessing, setIsProcessing] = useState(false);
    const [attentionPulseEnabled, setAttentionPulseEnabled] = useState(true);

    const [isClockedIn, setIsClockedIn] = useState(true);
    const [clockInTime, setClockInTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const staffEmail = user?.email || `${(user?.displayName || 'staff').toLowerCase().replace(/\s+/g, '.')}@heaven4.com`;

    const [staffDetails] = useState({
        id: `#EMP-${user?.id || '501'}`,
        name: user?.displayName || 'Alex Rivera',
        role: 'Floor Captain / POS Waiter',
        phone: user?.phoneNumber || '7020875435',
        email: staffEmail,
        shiftHours: '09:00 AM - 05:00 PM',
        department: 'Dining Floor Operations',
        tablesGoal: 20,
        currentScore: 98
    });

    const toggleClockIn = () => {
        const wasIn = isClockedIn;
        setIsClockedIn(!wasIn);
        const staffName = staffDetails.name;
        if (!wasIn) {
            clockInStaff(staffName, staffDetails.role || 'Floor Captain / Waiter', 'MORNING');
            setClockInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            toast.success('Clocked IN for shift! Attendance record updated.');
        } else {
            clockOutStaff(staffName);
            toast.success('Clocked OUT from shift. Attendance record updated.');
        }
    };

    const occupiedCount = masterTables.filter(t => t.status === 'OCCUPIED').length;
    // Low pressure threshold is < 6 active tables. Auto-disable pulsing when >= 6 to avoid visual fatigue under rush pressure.
    const isUnderRushPressure = occupiedCount >= 6;
    const isAttentionPulseActive = attentionPulseEnabled && !isUnderRushPressure;

    const syncTablesWithPlacedOrders = useCallback((playAudio = false) => {
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
                                tbl.orderId = ord.id;
                            }
                        }
                    });
                }
            }
        } catch { /* proceed */ }
        setMasterTables(tables);
        if (playAudio) {
            playSound('new_order');
            toast('🔔 New live customer order received!', { icon: '🍽️' });
        }
    }, [playSound]);

    useEffect(() => {
        syncTablesWithPlacedOrders(false);

        const handleOrderPlaced = () => syncTablesWithPlacedOrders(true);
        const handleTablesUpdated = () => syncTablesWithPlacedOrders(false);
        window.addEventListener('heaven4-order-placed', handleOrderPlaced);
        window.addEventListener('heaven4-tables-updated', handleTablesUpdated);
        window.addEventListener('storage', handleOrderPlaced);

        const interval = setInterval(() => syncTablesWithPlacedOrders(false), 3000);

        return () => {
            window.removeEventListener('heaven4-order-placed', handleOrderPlaced);
            window.removeEventListener('heaven4-tables-updated', handleTablesUpdated);
            window.removeEventListener('storage', handleOrderPlaced);
            clearInterval(interval);
        };
    }, [syncTablesWithPlacedOrders]);

    const openTableDetailsModal = (table: TableConfig) => {
        setSelectedTableConfig(table);
        
        // Find order matching table
        try {
            const rawOrders = localStorage.getItem('heaven4_active_orders_v2');
            if (rawOrders) {
                const orders = JSON.parse(rawOrders);
                if (Array.isArray(orders)) {
                    const matched = orders.find((o: any) => o.tableNumber?.toUpperCase() === table.tableNumber.toUpperCase() || o.tableNumber?.toUpperCase() === table.id.toUpperCase());
                    if (matched) {
                        setActiveTableOrder({
                            ...matched,
                            orderStatus: matched.orderStatus || 'PREPARING'
                        });
                    } else {
                        setActiveTableOrder(null);
                    }
                }
            }
        } catch {
            setActiveTableOrder(null);
        }

        setModal('close');
    };

    const handleMarkOrderServed = () => {
        if (!activeTableOrder) return;
        if (activeTableOrder.orderStatus === 'PENDING') {
            if (!confirm('⚠️ Kitchen has not started cooking this order yet (Status: PENDING). Are you sure food is cooked and ready to mark SERVED?')) {
                return;
            }
        }
        const updatedOrder: ActiveOrder = { ...activeTableOrder, orderStatus: 'SERVED' };
        setActiveTableOrder(updatedOrder);

        // Update in localStorage
        try {
            const rawOrders = localStorage.getItem('heaven4_active_orders_v2');
            if (rawOrders) {
                const orders = JSON.parse(rawOrders);
                const updated = orders.map((o: any) => o.id === activeTableOrder.id ? { ...o, orderStatus: 'SERVED', status: 'SERVED' } : o);
                localStorage.setItem('heaven4_active_orders_v2', JSON.stringify(updated));
            }
        } catch { /* proceed */ }

        toast.success(`✅ Order #${activeTableOrder.id} marked SERVED! Bill ready for settlement.`);
    };

    const printReceipt = () => {
        if (!selectedTableConfig) return;
        toast.success(`🖨️ Itemized receipt printed for Table ${selectedTableConfig.tableNumber}`);
    };

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
            const walkInOrderId = Math.floor(100000 + Math.random() * 900000);
            const walkInItems = selectedItems.map(si => ({ name: si.item.name, quantity: si.qty, price: si.item.basePrice }));
            const subtotal = selectedItems.reduce((s, i) => s + (i.item.basePrice * i.qty), 0);
            const tax = subtotal * 0.05;
            const total = subtotal + tax;

            const walkInOrder: ActiveOrder = {
                id: walkInOrderId,
                tableNumber: walkInTable,
                items: walkInItems.length > 0 ? walkInItems : [{ name: 'Gourmet Dine-in Covers', quantity: dineInGuests, price: 15.00 }],
                subtotal: subtotal || (dineInGuests * 15.00),
                tax: tax || ((dineInGuests * 15.00) * 0.08),
                tip: 0,
                total: total || ((dineInGuests * 15.00) * 1.08),
                placedAt: new Date().toLocaleString(),
                orderStatus: 'SERVED'
            };

            const rawOrders = localStorage.getItem('heaven4_active_orders_v2');
            const currentOrders = rawOrders ? JSON.parse(rawOrders) : [];
            localStorage.setItem('heaven4_active_orders_v2', JSON.stringify([walkInOrder, ...currentOrders]));

            const updatedTables = masterTables.map(t => t.tableNumber === walkInTable ? {
                ...t,
                status: 'OCCUPIED' as const,
                currentGuests: dineInGuests,
                customerName: walkInCustomerName.trim() || 'VIP Walk-in Guest',
                membershipTier: walkInMembershipTier,
                orderId: walkInOrderId
            } : t);

            saveMasterTables(updatedTables);
            setMasterTables(updatedTables);
            toast.success(`🎉 Walk-in order #${walkInOrderId} created for Table ${walkInTable}!`);
            setSelectedItems([]);
            setWalkInCustomerName('');
            setModal(null);
        } catch { toast.error('Failed to create order'); } finally { setIsProcessing(false); }
    };

    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI_QR' | 'CARD' | 'POINTS'>('UPI_QR');
    const [paymentPhoto, setPaymentPhoto] = useState<string | null>(null);

    const handleSettleBill = async (tableNo: string) => {
        setIsProcessing(true);
        try {
            // Save settled order details with payment method & attached photo proof in localStorage
            const settledRecord = {
                orderId: activeTableOrder?.id || Date.now(),
                tableNumber: tableNo,
                totalAmount: activeTableOrder?.total || 0,
                paymentMethod: paymentMethod,
                paymentPhoto: paymentPhoto,
                settledAt: new Date().toISOString(),
                settledBy: staffDetails.name
            };
            const existingSettled = JSON.parse(localStorage.getItem('heaven4_settled_orders') || '[]');
            localStorage.setItem('heaven4_settled_orders', JSON.stringify([settledRecord, ...existingSettled]));

            // Remove order from active orders
            const rawOrders = localStorage.getItem('heaven4_active_orders_v2');
            if (rawOrders) {
                const currentOrders = JSON.parse(rawOrders);
                const updatedOrders = currentOrders.filter((o: any) => o.tableNumber?.toUpperCase() !== tableNo.toUpperCase());
                localStorage.setItem('heaven4_active_orders_v2', JSON.stringify(updatedOrders));
            }

            const updatedTables = masterTables.map(t => t.tableNumber === tableNo ? {
                ...t,
                status: 'FREE' as const,
                currentGuests: undefined,
                customerName: undefined,
                membershipTier: undefined,
                orderId: undefined
            } : t);

            saveMasterTables(updatedTables);
            setMasterTables(updatedTables);
            toast.success(`💳 Bill Settled (${paymentMethod}) for Table ${tableNo}! Table is now FREE.`);
            setActiveTableOrder(null);
            setPaymentPhoto(null);
            setModal(null);
        } catch { toast.error('Failed to settle bill'); } finally { setIsProcessing(false); }
    };

    const [activeAssistanceCalls, setActiveAssistanceCalls] = useState([
        { id: 1, tableNumber: 'B-2', text: '🚰 Table B-2 — Water Refill Call', color: 'amber' },
        { id: 2, tableNumber: 'T-4', text: '💳 Table T-4 — Bill Settlement Call', color: 'blue' },
    ]);

    const handleMarkCallAttended = (id: number, label: string) => {
        setActiveAssistanceCalls(prev => prev.filter(c => c.id !== id));
        playSound('waiter_call');
        toast.success(`Attended ${label}! Request marked done.`, { icon: '✅' });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6 space-y-6 pb-20">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                        Floor POS & Staff Operations
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Real-time seating capacity, live itemized billing, kitchen status gates, & VIP walk-in overrides.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button onClick={toggleClockIn}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all ${
                            isClockedIn ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
                        {isClockedIn ? `Clocked In (${clockInTime})` : 'Clocked Out'}
                    </button>

                    <button onClick={() => window.location.href = '/employee/settings'}
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

            {/* 🔔 LIVE WAITER ASSISTANCE & CALLS BANNER */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        🔔 Active Waiter Assistance Calls (Water & Bill Calls)
                    </span>
                    <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-black text-[10px] rounded-full border border-amber-500/40">
                        {activeAssistanceCalls.length} Pending Call{activeAssistanceCalls.length !== 1 ? 's' : ''}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                    {activeAssistanceCalls.map(call => (
                        <div key={call.id} className={`p-2 bg-slate-900 border ${call.color === 'amber' ? 'border-amber-500/40' : 'border-blue-500/40'} rounded-xl flex items-center justify-between gap-3 font-bold`}>
                            <span className="text-white">{call.text}</span>
                            <button onClick={() => handleMarkCallAttended(call.id, call.text)}
                                className={`px-2.5 py-1 ${call.color === 'amber' ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'} font-black rounded-lg text-[10px] hover:opacity-90 transition-opacity`}>
                                Mark Attended ✓
                            </button>
                        </div>
                    ))}
                    {activeAssistanceCalls.length === 0 && (
                        <p className="text-xs text-emerald-400 font-bold py-1">🎉 All waiter assistance calls resolved & attended!</p>
                    )}
                </div>
            </div>

            {/* AREA / EVENT SEATING SWITCHER & PRESSURE PULSE INDICATOR */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-xl">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-amber-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Venue Seating Layout:</span>
                    </div>

                    {/* Attention Pulse Control & Pressure State */}
                    <button onClick={() => setAttentionPulseEnabled(!attentionPulseEnabled)}
                        title="Toggles breathing highlight pulse on occupied tables during low pressure hours"
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-2 border transition-all ${
                            isAttentionPulseActive
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-lg shadow-indigo-500/20'
                                : isUnderRushPressure
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                        <Zap className={`w-3.5 h-3.5 ${isAttentionPulseActive ? 'text-indigo-400 animate-bounce' : 'text-slate-500'}`} />
                        <span>
                            {isUnderRushPressure
                                ? '🔥 High Rush Pressure (Pulsing Auto-Disabled)'
                                : isAttentionPulseActive
                                ? '✨ Low Pressure Mode: Dynamic Table Pulse Active'
                                : '⏸️ Table Attention Pulse: Paused'}
                        </span>
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    {[
                        { key: 'NORMAL' as AreaView, label: '🍽️ Main Dining Hall', count: masterTables.filter(t => !t.eventId).length },
                        { key: 'EVENT_ROOFTOP' as AreaView, label: '🎷 Event: Sunset Jazz (Rooftop)', count: masterTables.filter(t => t.eventId === 901 || t.category === 'EVENT_ROOFTOP').length },
                        { key: 'EVENT_BALLROOM' as AreaView, label: '💼 Event: Horizon Gala (Ballroom)', count: masterTables.filter(t => t.eventId === 902 || t.category === 'EVENT_BALLROOM').length },
                    ].map(view => (
                        <button key={view.key} onClick={() => setAreaView(view.key)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
                                areaView === view.key
                                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}>
                            {view.label} ({view.count} tables)
                        </button>
                    ))}
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
                                <span className="text-xs text-slate-400">({section.tables.length} tables in sequence)</span>
                            </div>
                            <span className="text-xs font-bold text-amber-400">
                                Section Capacity: {section.tables.reduce((s, t) => s + t.capacity, 0)} Seats
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {section.tables.map(table => {
                                const isOccupied = table.status === 'OCCUPIED';
                                const shouldPulseThisTable = isOccupied && isAttentionPulseActive;

                                return (
                                    <motion.div key={table.id}
                                        whileHover={{ y: -4 }}
                                        animate={shouldPulseThisTable ? {
                                            scale: [1, 1.04, 1],
                                            borderColor: ['rgba(59, 130, 246, 0.6)', 'rgba(245, 158, 11, 0.9)', 'rgba(59, 130, 246, 0.6)'],
                                            boxShadow: [
                                                '0 0 10px rgba(59, 130, 246, 0.2)',
                                                '0 0 25px rgba(245, 158, 11, 0.5)',
                                                '0 0 10px rgba(59, 130, 246, 0.2)'
                                            ]
                                        } : { scale: 1 }}
                                        transition={shouldPulseThisTable ? { repeat: Infinity, duration: 2.2, ease: "easeInOut" } : undefined}
                                        onClick={() => openTableDetailsModal(table)}
                                        className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                                            isOccupied ? 'bg-slate-900 border-blue-500 shadow-xl shadow-blue-500/10' :
                                            table.status === 'RESERVED' ? 'bg-slate-900 border-amber-500/50 shadow-xl shadow-amber-500/10' :
                                            'bg-slate-950 border-slate-800 hover:border-blue-500/50'
                                        }`}>
                                        {shouldPulseThisTable && (
                                            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                            </span>
                                        )}
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
                                        <span className="text-blue-400 font-bold">View Order & Bill</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                        </div>
                    </div>
                ))}
            </div>

            {/* WALK-IN ORDER MODAL */}
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Walk-in Guest Name</label>
                                        <input type="text" value={walkInCustomerName} onChange={e => setWalkInCustomerName(e.target.value)}
                                            placeholder="e.g. Marcus Vance"
                                            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                                            <Crown className="w-3.5 h-3.5 text-amber-400" /> Staff VIP Membership Override
                                        </label>
                                        <select value={walkInMembershipTier} onChange={e => setWalkInMembershipTier(e.target.value)}
                                            className="w-full p-3 bg-slate-950 border border-amber-500/50 text-amber-400 rounded-xl font-black outline-none">
                                            <option value="DIAMOND VIP" className="bg-slate-900">👑 DIAMOND VIP</option>
                                            <option value="PLATINUM VIP" className="bg-slate-900">🥇 PLATINUM VIP</option>
                                            <option value="GOLD VIP" className="bg-slate-900">🥈 GOLD VIP</option>
                                            <option value="SILVER VIP" className="bg-slate-900">🥉 SILVER VIP</option>
                                            <option value="STANDARD" className="bg-slate-900">👤 STANDARD</option>
                                        </select>
                                    </div>
                                </div>

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

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="block font-bold text-slate-400 uppercase tracking-wider text-xs">Add Order Items (Full Menu)</label>
                                        <span className="text-[10px] text-emerald-400 font-bold">Showing {
                                            ALL_FULL_MENU_ITEMS.filter(i => {
                                                const matchCat = walkInCategory === null || i.categoryId === walkInCategory;
                                                const matchSearch = !walkInSearch || i.name.toLowerCase().includes(walkInSearch.toLowerCase());
                                                return matchCat && matchSearch;
                                            }).length
                                        } items</span>
                                    </div>

                                    {/* Search & Category filter */}
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Search any menu item (e.g. Wagyu, Truffle, Mojito)..."
                                            value={walkInSearch}
                                            onChange={e => setWalkInSearch(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                                        />
                                        <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full text-[10px]">
                                            <button
                                                type="button"
                                                onClick={() => setWalkInCategory(null)}
                                                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                                                    walkInCategory === null ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                                                }`}
                                            >
                                                All ({ALL_FULL_MENU_ITEMS.length})
                                            </button>
                                            {INITIAL_CATEGORIES.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setWalkInCategory(cat.id)}
                                                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                                                        walkInCategory === cat.id ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                                                    }`}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                                        {ALL_FULL_MENU_ITEMS
                                            .filter(i => {
                                                const matchCat = walkInCategory === null || i.categoryId === walkInCategory;
                                                const matchSearch = !walkInSearch || i.name.toLowerCase().includes(walkInSearch.toLowerCase());
                                                return matchCat && matchSearch;
                                            })
                                            .map(item => {
                                                const existing = selectedItems.find(s => s.item.id === item.id);
                                                return (
                                                    <div key={item.id} className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                                                        <div className="min-w-0 pr-2">
                                                            <p className="font-bold text-white truncate">{item.name}</p>
                                                            <p className="text-emerald-400 font-black">${item.basePrice.toFixed(2)}</p>
                                                        </div>
                                                        {existing ? (
                                                            <div className="flex items-center gap-1.5 shrink-0 bg-slate-900 border border-slate-700 rounded-lg p-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedItems(prev => prev.map(s => s.item.id === item.id ? { ...s, qty: s.qty - 1 } : s).filter(s => s.qty > 0))}
                                                                    className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold flex items-center justify-center text-xs"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="font-black text-amber-400 w-4 text-center">{existing.qty}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addItemToOrder(item)}
                                                                    className="w-5 h-5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold flex items-center justify-center text-xs"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => addItemToOrder(item)}
                                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shrink-0"
                                                            >
                                                                + Add
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>

                                {selectedItems.length > 0 && (
                                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-slate-400 uppercase">Selected Items ({selectedItems.length})</p>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedItems([])}
                                                className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                        {selectedItems.map((si, idx) => (
                                            <div key={idx} className="flex justify-between items-center">
                                                <span className="truncate pr-2">{si.item.name} × {si.qty}</span>
                                                <span className="font-black text-emerald-400 shrink-0">${(si.item.basePrice * si.qty).toFixed(2)}</span>
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

            {/* 🧾 REFACTORED LIVE ORDER & ITEMIZED BILL SETTLEMENT MODAL */}
            <AnimatePresence>
                {modal === 'close' && selectedTableConfig && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setModal(null)}>
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl text-white"
                            onClick={e => e.stopPropagation()}>
                            
                            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                                <div>
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Table Operations & Live Billing</span>
                                    <h3 className="text-2xl font-black text-white">Table {selectedTableConfig.tableNumber}</h3>
                                    <p className="text-xs text-slate-400">{selectedTableConfig.categoryLabel} · Capacity: {selectedTableConfig.capacity} Seats</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setWalkInTable(selectedTableConfig.tableNumber);
                                            setWalkInCustomerName(selectedTableConfig.customerName || 'Dine-in Customer');
                                            setModal('walkin');
                                        }}
                                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                                    >
                                        <Plus className="w-4 h-4" /> Take Direct Order
                                    </button>
                                    <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                                </div>
                            </div>

                            {/* Customer & VIP Info */}
                            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Dine-in Customer</p>
                                    <p className="font-bold text-white mt-0.5">{selectedTableConfig.customerName || 'Guest'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Membership Tier</p>
                                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black rounded border border-amber-500/30 inline-flex items-center gap-1 mt-0.5">
                                        <Crown className="w-3 h-3" /> {selectedTableConfig.membershipTier || 'GOLD VIP'}
                                    </span>
                                </div>
                            </div>

                            {/* 🧾 Live Itemized Bill */}
                            {activeTableOrder ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-amber-400 uppercase tracking-wider">Live Order Ticket #{activeTableOrder.id}</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                                            activeTableOrder.orderStatus === 'SERVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                            activeTableOrder.orderStatus === 'READY' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                            'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                                        }`}>
                                            {activeTableOrder.orderStatus === 'SERVED' ? '✅ SERVED & DELIVERED' :
                                             activeTableOrder.orderStatus === 'READY' ? '🔔 READY FOR PICKUP' :
                                             '👨‍🍳 PREPARING IN KITCHEN'}
                                        </span>
                                    </div>

                                    {/* Itemized List */}
                                    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2 text-xs max-h-48 overflow-y-auto">
                                        {activeTableOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                                                <span>{item.name} <strong className="text-amber-400">×{item.quantity}</strong></span>
                                                <span className="font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}

                                        <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-400 text-[11px]">
                                            <div className="flex justify-between"><span>Subtotal</span><span>${activeTableOrder.subtotal.toFixed(2)}</span></div>
                                            <div className="flex justify-between"><span>Tax (8%)</span><span>${activeTableOrder.tax.toFixed(2)}</span></div>
                                            {activeTableOrder.tip > 0 && <div className="flex justify-between text-emerald-400"><span>Staff Tip</span><span>+${activeTableOrder.tip.toFixed(2)}</span></div>}
                                            <div className="flex justify-between text-white font-black text-sm pt-1 border-t border-slate-800">
                                                <span>Total Bill Amount</span>
                                                <span className="text-emerald-400">${activeTableOrder.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Kitchen Preparation Warning vs Ready Notification */}
                                    {activeTableOrder.orderStatus === 'PENDING' || activeTableOrder.orderStatus === 'PREPARING' ? (
                                        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-bold flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <ChefHat className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
                                                <span>⏳ Order being prepared in Kitchen. Serving locked until Kitchen marks order READY.</span>
                                            </div>
                                            <span className="px-2.5 py-1 bg-slate-800 text-slate-500 font-bold text-[10px] rounded-lg border border-slate-700 shrink-0 cursor-not-allowed">
                                                🔒 Kitchen Cooking
                                            </span>
                                        </div>
                                    ) : activeTableOrder.orderStatus === 'READY' ? (
                                        <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-blue-300 text-xs font-bold flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <ChefHat className="w-4 h-4 shrink-0 text-blue-400" />
                                                <span>🔔 Order READY for pickup from Kitchen counter!</span>
                                            </div>
                                            <button onClick={handleMarkOrderServed} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] rounded-xl shrink-0 shadow-md">
                                                ✅ Pick Up & Mark SERVED
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                                                <span>Order served to table! Ready for bill settlement.</span>
                                            </div>
                                            <button onClick={printReceipt} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-[10px] rounded-lg border border-slate-700 flex items-center gap-1 shrink-0">
                                                <Printer className="w-3 h-3" /> Receipt
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs text-slate-400 space-y-1">
                                    <p className="font-bold text-white">No Active Order Ticket Linked</p>
                                    <p className="text-[11px]">Table is reserved or assigned without custom food order ticket.</p>
                                </div>
                            )}

                            {/* Payment Method & Evidence Attachment */}
                            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider text-[10px]">Select Payment Settlement Method</label>
                                    <div className="grid grid-cols-4 gap-1">
                                        {[
                                            { key: 'UPI_QR', label: '📲 UPI / QR' },
                                            { key: 'CASH', label: '💵 Cash' },
                                            { key: 'CARD', label: '💳 Card' },
                                            { key: 'POINTS', label: '⭐ Points' }
                                        ].map(pm => (
                                            <button key={pm.key} type="button" onClick={() => setPaymentMethod(pm.key as any)}
                                                className={`py-1.5 px-1 rounded-xl text-[10px] font-black border transition-all ${
                                                    paymentMethod === pm.key
                                                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                                                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                                }`}>
                                                {pm.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {(paymentMethod === 'UPI_QR' || paymentMethod === 'CASH') && (
                                    <div className="pt-2 border-t border-slate-900">
                                        <label className="block font-bold text-amber-400 mb-1 text-[10px] uppercase tracking-wider">
                                            📸 Attach Payment Proof / QR Photo Evidence
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setPaymentPhoto(reader.result as string);
                                                            toast.success('📸 Payment proof photo attached!');
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                                            />
                                            {paymentPhoto && (
                                                <span className="text-[10px] text-emerald-400 font-bold">✓ Attached</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="space-y-2 pt-2 border-t border-slate-800">
                                <button
                                    onClick={() => handleSettleBill(selectedTableConfig.tableNumber)}
                                    disabled={isProcessing || !!(activeTableOrder && activeTableOrder.orderStatus !== 'SERVED' && activeTableOrder.orderStatus !== 'READY')}
                                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
                                >
                                    <CheckCircle2 className="w-5 h-5" /> Settle Bill ({paymentMethod}) & Mark Table FREE
                                </button>
                                
                                {activeTableOrder && activeTableOrder.orderStatus !== 'SERVED' && activeTableOrder.orderStatus !== 'READY' && (
                                    <p className="text-[10px] text-amber-400 text-center font-bold">
                                        ⚠️ Settlement blocked until order status is marked SERVED or READY above.
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
