import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Printer, Users, Edit2, Shield, CheckCircle2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
    TableConfig, TableCategory, CATEGORY_DETAILS, loadMasterTables, saveMasterTables,
    getNextSequentialTableNumber, getGroupedMasterTables
} from '@/shared/utils/tableHelpers';

export default function AdminTablesPage() {
    const [tables, setTables] = useState<TableConfig[]>([]);
    const [activeFilter, setActiveFilter] = useState<'ALL' | TableCategory>('ALL');
    const [editingTableId, setEditingTableId] = useState<string | null>(null);

    // New Table Form
    const [newCategory, setNewCategory] = useState<TableCategory>('BAR_COUNTER');
    const [newTableNumber, setNewTableNumber] = useState<string>('');
    const [newCapacity, setNewCapacity] = useState<number>(1);

    useEffect(() => {
        const loaded = loadMasterTables();
        setTables(loaded);
        setNewTableNumber(getNextSequentialTableNumber('BAR_COUNTER'));
        setNewCapacity(CATEGORY_DETAILS['BAR_COUNTER'].defaultCap);
    }, []);

    const persistTables = (updated: TableConfig[]) => {
        setTables(updated);
        saveMasterTables(updated);
    };

    const handleCategoryChange = (cat: TableCategory) => {
        setNewCategory(cat);
        setNewCapacity(CATEGORY_DETAILS[cat].defaultCap);
        setNewTableNumber(getNextSequentialTableNumber(cat));
    };

    const handleAddTable = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTableNumber.trim()) { toast.error('Enter a table identifier'); return; }
        const cleanNo = newTableNumber.trim().toUpperCase();
        if (tables.some(t => t.tableNumber.toUpperCase() === cleanNo)) {
            toast.error(`Table "${cleanNo}" already exists!`);
            return;
        }

        const catInfo = CATEGORY_DETAILS[newCategory];
        const newTable: TableConfig = {
            id: cleanNo,
            tableNumber: cleanNo,
            category: newCategory,
            categoryLabel: catInfo.label,
            capacity: Math.max(1, newCapacity),
            status: 'FREE',
        };

        const updated = [...tables, newTable];
        persistTables(updated);
        
        // Auto-fill next sequential ID for the section
        const nextId = getNextSequentialTableNumber(newCategory);
        setNewTableNumber(nextId);
        toast.success(`🎉 Registered Table ${cleanNo} (${newCapacity} seats) under ${catInfo.label}!`);
    };

    const handleDeleteTable = (id: string) => {
        const updated = tables.filter(t => t.id !== id);
        persistTables(updated);
        toast.success('Table deleted from master roster');
    };

    const handleUpdateCapacity = (id: string, cap: number) => {
        const updated = tables.map(t => t.id === id ? { ...t, capacity: Math.max(1, cap) } : t);
        persistTables(updated);
        setEditingTableId(null);
        toast.success('Seating capacity updated!');
    };

    const handleStatusChange = (id: string, newStatus: TableConfig['status']) => {
        const updated = tables.map(t => t.id === id ? { ...t, status: newStatus } : t);
        persistTables(updated);
        toast.success(`Table status → ${newStatus}`);
    };

    const printQR = (tableNumber: string) => {
        const svgElement = document.getElementById(`qr-${tableNumber}`);
        if (!svgElement) return;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`
                <html>
                <head>
                    <title>Table ${tableNumber} QR Code</title>
                    <style>
                        body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background: #0f172a; color: white; }
                        h1 { font-size: 3rem; margin-bottom: 0.5rem; color: #f59e0b; }
                        p { font-size: 1.2rem; color: #94a3b8; margin-bottom: 2rem; }
                        .qr-card { background: white; padding: 2rem; border-radius: 1.5rem; }
                    </style>
                </head>
                <body>
                    <h1>Heaven4 Dining</h1>
                    <p>Table ${tableNumber} · Scan to View Menu & Order</p>
                    <div class="qr-card">${svgData}</div>
                    <script>window.print(); window.close();</script>
                </body>
                </html>
            `);
            win.document.close();
        }
    };

    const totalSeats = tables.reduce((s, t) => s + t.capacity, 0);
    const groupedSections = getGroupedMasterTables(tables).filter(g => activeFilter === 'ALL' || g.category === activeFilter);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-16">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-5 h-5 text-blue-400" />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Admin & Manager · Seating & Table Control</span>
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent flex items-center gap-2">
                        <QrCode className="w-8 h-8 text-amber-400" /> Table & Seating Capacity Manager
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Configure sequential seating identifiers, auto-fill next IDs, group by section, and print customer QR codes.</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0">
                    <div className="text-center">
                        <p className="text-2xl font-black text-amber-400">{tables.length}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Total Tables</p>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div className="text-center">
                        <p className="text-2xl font-black text-emerald-400">{totalSeats}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Total Seat Capacity</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 overflow-x-auto">
                <button onClick={() => setActiveFilter('ALL')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shrink-0 ${activeFilter === 'ALL' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    All Table Sections ({tables.length})
                </button>
                {(Object.keys(CATEGORY_DETAILS) as TableCategory[]).map(cat => {
                    const info = CATEGORY_DETAILS[cat];
                    const count = tables.filter(t => t.category === cat).length;
                    return (
                        <button key={cat} onClick={() => setActiveFilter(cat)}
                            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all shrink-0 flex items-center gap-1.5 ${activeFilter === cat ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                            <span>{info.icon}</span> {info.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Form Column */}
                <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <Plus className="w-5 h-5 text-amber-400" /> Register Table & Capacity
                    </h3>
                    
                    <form onSubmit={handleAddTable} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">1. Select Table Section / Category</label>
                            <select value={newCategory} onChange={e => handleCategoryChange(e.target.value as TableCategory)}
                                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-amber-500">
                                {(Object.keys(CATEGORY_DETAILS) as TableCategory[]).map(cat => (
                                    <option key={cat} value={cat} className="bg-slate-900">{CATEGORY_DETAILS[cat].icon} {CATEGORY_DETAILS[cat].label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">2. Table Identifier *</label>
                                <span className="text-[10px] text-amber-400 font-bold">Auto-suggested Next ID</span>
                            </div>
                            <input type="text" value={newTableNumber} onChange={e => setNewTableNumber(e.target.value)}
                                placeholder="e.g. B-5 or VIP-6"
                                className="w-full p-3 bg-slate-950 border border-amber-500/50 rounded-xl text-amber-400 font-black text-base outline-none focus:border-amber-400 placeholder:text-slate-700" />
                            <p className="text-[10px] text-slate-500 mt-1">Field is pre-filled sequentially (e.g. B-5) but editable (e.g. B-99 will be sorted in numerical sequence).</p>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">3. Seating Capacity (Guests)</label>
                            <input type="number" min={1} max={30} value={newCapacity} onChange={e => setNewCapacity(parseInt(e.target.value) || 1)}
                                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-black text-base outline-none focus:border-amber-500" />
                            <p className="text-[10px] text-slate-500 mt-1">
                                {newCapacity === 1 ? '🍸 Counter Bar seat (Single guest)' : newCapacity <= 2 ? '👩‍❤️‍👨 Couple Table (2 guests)' : newCapacity <= 4 ? '🍽️ Standard Family (4 guests)' : '👑 Large VIP Booth/Lounge'}
                            </p>
                        </div>

                        <button type="submit" disabled={!newTableNumber.trim()}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all">
                            <Plus className="w-4 h-4" /> Save Table into Section
                        </button>
                    </form>
                </div>

                {/* Section-Grouped Table Grid */}
                <div className="lg:col-span-8 space-y-8">
                    {groupedSections.map(section => (
                        <div key={section.category} className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-900 border border-slate-800 rounded-2xl">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{section.details.icon}</span>
                                    <h3 className="text-sm font-black text-white">{section.details.label} Section</h3>
                                    <span className="text-xs text-slate-400">({section.tables.length} tables in sequence)</span>
                                </div>
                                <span className="text-xs font-bold text-amber-400">
                                    Total Section Capacity: {section.tables.reduce((s, t) => s + t.capacity, 0)} Seats
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {section.tables.map(table => {
                                    const isEditing = editingTableId === table.id;

                                    return (
                                        <motion.div key={table.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between relative group hover:border-amber-500/40 transition-all">
                                            
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${section.details.badge} flex items-center gap-1 w-fit mb-1`}>
                                                        <span>{section.details.icon}</span> {table.tableNumber}
                                                    </span>
                                                    <h4 className="text-2xl font-black text-white">Table {table.tableNumber}</h4>
                                                </div>

                                                <button onClick={() => handleDeleteTable(table.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Capacity Config */}
                                            <div className="my-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-bold flex items-center gap-1">
                                                        <Users className="w-3.5 h-3.5 text-amber-400" /> Seat Capacity
                                                    </span>
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-1">
                                                            <input type="number" min={1} max={30} defaultValue={table.capacity}
                                                                onKeyDown={e => { if (e.key === 'Enter') handleUpdateCapacity(table.id, parseInt((e.target as HTMLInputElement).value) || 1); }}
                                                                className="w-14 p-1 bg-slate-900 border border-amber-500 rounded text-center text-xs text-amber-400 font-black outline-none" />
                                                            <button onClick={e => { const input = (e.currentTarget.previousElementSibling as HTMLInputElement); handleUpdateCapacity(table.id, parseInt(input.value) || 1); }} className="text-emerald-400 hover:text-emerald-300 font-bold"><CheckCircle2 className="w-4 h-4" /></button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setEditingTableId(table.id)} className="font-black text-amber-400 hover:underline flex items-center gap-1">
                                                            {table.capacity} Seats <Edit2 className="w-3 h-3 text-slate-500" />
                                                        </button>
                                                    )}
                                                </div>
                                                {table.eventId && (
                                                    <p className="text-[10px] text-purple-300 truncate">Event: {table.eventTitle}</p>
                                                )}
                                            </div>

                                            {/* QR Code Box */}
                                            <div className="bg-white p-3 rounded-2xl border border-slate-700 flex flex-col items-center my-2">
                                                <QRCodeSVG
                                                    id={`qr-${table.tableNumber}`}
                                                    value={`${window.location.origin}/customer/menu?table=${table.tableNumber}`}
                                                    size={95}
                                                    level="H"
                                                    includeMargin={false}
                                                />
                                                <p className="font-mono font-black text-slate-900 text-[10px] mt-1.5">TABLE {table.tableNumber}</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                                                <select value={table.status} onChange={e => handleStatusChange(table.id, e.target.value as TableConfig['status'])}
                                                    className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-white font-bold outline-none">
                                                    <option value="FREE" className="bg-slate-900">🟢 FREE</option>
                                                    <option value="OCCUPIED" className="bg-slate-900">🔴 OCCUPIED</option>
                                                    <option value="RESERVED" className="bg-slate-900">🟡 RESERVED</option>
                                                    <option value="OUT_OF_SERVICE" className="bg-slate-900">⚪ OUT OF SERVICE</option>
                                                </select>
                                                <button onClick={() => printQR(table.tableNumber)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold text-[11px] rounded-xl flex items-center gap-1 border border-slate-700">
                                                    <Printer className="w-3.5 h-3.5" /> Print QR
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
