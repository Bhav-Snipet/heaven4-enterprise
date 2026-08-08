// src/shared/utils/tableHelpers.ts
// Central Table & Seating Capacity Management for Heaven4

export type TableCategory = 'BAR_COUNTER' | 'COUPLE' | 'STANDARD' | 'BOOTH' | 'VIP_LOUNGE' | 'EVENT_ROOFTOP' | 'EVENT_BALLROOM';

export interface TableConfig {
    id: string;
    tableNumber: string;
    category: TableCategory;
    categoryLabel: string;
    capacity: number;
    status: 'FREE' | 'OCCUPIED' | 'RESERVED' | 'OUT_OF_SERVICE';
    eventId?: number;
    eventTitle?: string;
    currentGuests?: number;
    customerName?: string;
    customerPhone?: string;
    membershipTier?: string;
    orderId?: number;
}

export const CATEGORY_DETAILS: Record<TableCategory, { label: string; defaultCap: number; icon: string; badge: string; prefix: string }> = {
    BAR_COUNTER: { label: 'Counter Bar Seat', defaultCap: 1, icon: '🍸', badge: 'bg-purple-950/80 text-purple-300 border-purple-700/60', prefix: 'B-' },
    COUPLE: { label: 'Couple Dining Table', defaultCap: 2, icon: '👩‍❤️‍👨', badge: 'bg-pink-950/80 text-pink-300 border-pink-700/60', prefix: 'T-' },
    STANDARD: { label: 'Standard Family Table', defaultCap: 4, icon: '🍽️', badge: 'bg-blue-950/80 text-blue-300 border-blue-700/60', prefix: 'T-' },
    BOOTH: { label: 'Large Family Booth', defaultCap: 6, icon: '🛋️', badge: 'bg-teal-950/80 text-teal-300 border-teal-700/60', prefix: 'T-' },
    VIP_LOUNGE: { label: 'VIP Executive Lounge', defaultCap: 8, icon: '👑', badge: 'bg-amber-950/80 text-amber-300 border-amber-700/60', prefix: 'VIP-' },
    EVENT_ROOFTOP: { label: 'Rooftop Event Terrace', defaultCap: 4, icon: '🎷', badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60', prefix: 'RT-' },
    EVENT_BALLROOM: { label: 'Ballroom Private Gala', defaultCap: 8, icon: '💼', badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60', prefix: 'BR-' },
};

export const DEFAULT_MASTER_TABLES: TableConfig[] = [
    // Counter Bar Seats (Capacity: 1)
    { id: 'B-1', tableNumber: 'B-1', category: 'BAR_COUNTER', categoryLabel: 'Counter Bar Seat', capacity: 1, status: 'FREE' },
    { id: 'B-2', tableNumber: 'B-2', category: 'BAR_COUNTER', categoryLabel: 'Counter Bar Seat', capacity: 1, status: 'FREE' },
    { id: 'B-3', tableNumber: 'B-3', category: 'BAR_COUNTER', categoryLabel: 'Counter Bar Seat', capacity: 1, status: 'FREE' },
    { id: 'B-4', tableNumber: 'B-4', category: 'BAR_COUNTER', categoryLabel: 'Counter Bar Seat', capacity: 1, status: 'FREE' },

    // Couple Tables (Capacity: 2)
    { id: 'T-1', tableNumber: 'T-1', category: 'COUPLE', categoryLabel: 'Couple Dining Table', capacity: 2, status: 'FREE' },
    { id: 'T-2', tableNumber: 'T-2', category: 'COUPLE', categoryLabel: 'Couple Dining Table', capacity: 2, status: 'FREE' },
    { id: 'T-3', tableNumber: 'T-3', category: 'COUPLE', categoryLabel: 'Couple Dining Table', capacity: 2, status: 'FREE' },
    { id: 'T-4', tableNumber: 'T-4', category: 'COUPLE', categoryLabel: 'Couple Dining Table', capacity: 2, status: 'FREE' },

    // Standard Family Tables (Capacity: 4)
    { id: 'T-5', tableNumber: 'T-5', category: 'STANDARD', categoryLabel: 'Standard Family Table', capacity: 4, status: 'FREE' },
    { id: 'T-6', tableNumber: 'T-6', category: 'STANDARD', categoryLabel: 'Standard Family Table', capacity: 4, status: 'FREE' },
    { id: 'T-7', tableNumber: 'T-7', category: 'STANDARD', categoryLabel: 'Standard Family Table', capacity: 4, status: 'FREE' },
    { id: 'T-8', tableNumber: 'T-8', category: 'STANDARD', categoryLabel: 'Standard Family Table', capacity: 4, status: 'FREE' },
    { id: 'T-9', tableNumber: 'T-9', category: 'STANDARD', categoryLabel: 'Standard Family Table', capacity: 4, status: 'FREE' },
    { id: 'T-10', tableNumber: 'T-10', category: 'STANDARD', categoryLabel: 'Standard Family Table', capacity: 4, status: 'FREE' },

    // Large Family Booths (Capacity: 6)
    { id: 'T-11', tableNumber: 'T-11', category: 'BOOTH', categoryLabel: 'Large Family Booth', capacity: 6, status: 'FREE' },
    { id: 'T-12', tableNumber: 'T-12', category: 'BOOTH', categoryLabel: 'Large Family Booth', capacity: 6, status: 'FREE' },
    { id: 'T-13', tableNumber: 'T-13', category: 'BOOTH', categoryLabel: 'Large Family Booth', capacity: 6, status: 'FREE' },
    { id: 'T-14', tableNumber: 'T-14', category: 'BOOTH', categoryLabel: 'Large Family Booth', capacity: 6, status: 'FREE' },

    // VIP Lounges (Capacity: 8)
    { id: 'VIP-1', tableNumber: 'VIP-1', category: 'VIP_LOUNGE', categoryLabel: 'VIP Executive Lounge', capacity: 8, status: 'OCCUPIED', currentGuests: 2, customerName: 'Sarah Cooper (Event Guest)', membershipTier: 'DIAMOND VIP' },
    { id: 'VIP-2', tableNumber: 'VIP-2', category: 'VIP_LOUNGE', categoryLabel: 'VIP Executive Lounge', capacity: 8, status: 'FREE' },
    { id: 'VIP-3', tableNumber: 'VIP-3', category: 'VIP_LOUNGE', categoryLabel: 'VIP Executive Lounge', capacity: 8, status: 'FREE' },
    { id: 'VIP-4', tableNumber: 'VIP-4', category: 'VIP_LOUNGE', categoryLabel: 'VIP Executive Lounge', capacity: 8, status: 'FREE' },
    { id: 'VIP-5', tableNumber: 'VIP-5', category: 'VIP_LOUNGE', categoryLabel: 'VIP Executive Lounge', capacity: 8, status: 'FREE' },

    // Event 901: Sunset Rooftop Jazz & Wine Night Seating
    { id: 'RT-1', tableNumber: 'RT-1', category: 'EVENT_ROOFTOP', categoryLabel: 'Rooftop Terrace Table', capacity: 4, status: 'FREE', eventId: 901, eventTitle: '🎷 Sunset Rooftop Jazz & Wine Night' },
    { id: 'RT-2', tableNumber: 'RT-2', category: 'EVENT_ROOFTOP', categoryLabel: 'Rooftop Terrace Table', capacity: 4, status: 'FREE', eventId: 901, eventTitle: '🎷 Sunset Rooftop Jazz & Wine Night' },
    { id: 'RT-3', tableNumber: 'RT-3', category: 'EVENT_ROOFTOP', categoryLabel: 'Rooftop Terrace Table', capacity: 4, status: 'FREE', eventId: 901, eventTitle: '🎷 Sunset Rooftop Jazz & Wine Night' },
    { id: 'RT-VIP-1', tableNumber: 'RT-VIP-1', category: 'EVENT_ROOFTOP', categoryLabel: 'Rooftop VIP Lounge', capacity: 8, status: 'OCCUPIED', eventId: 901, eventTitle: '🎷 Sunset Rooftop Jazz & Wine Night', currentGuests: 2, customerName: 'Sarah Cooper', membershipTier: 'PLATINUM VIP' },
    { id: 'RT-VIP-2', tableNumber: 'RT-VIP-2', category: 'EVENT_ROOFTOP', categoryLabel: 'Rooftop VIP Lounge', capacity: 8, status: 'FREE', eventId: 901, eventTitle: '🎷 Sunset Rooftop Jazz & Wine Night' },

    // Event 902: Horizon Corp Private Gala Seating
    { id: 'BR-1', tableNumber: 'BR-1', category: 'EVENT_BALLROOM', categoryLabel: 'Ballroom Executive Table', capacity: 6, status: 'FREE', eventId: 902, eventTitle: '💼 Horizon Corp Private Gala' },
    { id: 'BR-2', tableNumber: 'BR-2', category: 'EVENT_BALLROOM', categoryLabel: 'Ballroom Executive Table', capacity: 6, status: 'FREE', eventId: 902, eventTitle: '💼 Horizon Corp Private Gala' },
    { id: 'BR-VIP-1', tableNumber: 'BR-VIP-1', category: 'EVENT_BALLROOM', categoryLabel: 'Ballroom President Suite', capacity: 12, status: 'FREE', eventId: 902, eventTitle: '💼 Horizon Corp Private Gala' },
];

const STORAGE_KEY = 'heaven4_master_tables_v3';

export function loadMasterTables(): TableConfig[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_MASTER_TABLES;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MASTER_TABLES;
    } catch {
        return DEFAULT_MASTER_TABLES;
    }
}

export function saveMasterTables(tables: TableConfig[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
    // Broadcast change across windows
    window.dispatchEvent(new CustomEvent('heaven4-tables-updated', { detail: tables }));
}

// Extract numeric suffix from table identifier for sequence sorting
export function extractTableNumber(tableNo: string): number {
    const match = tableNo.match(/\d+/);
    return match ? parseInt(match[0], 10) : 999;
}

// Compute auto-filled next sequential table number for a section (e.g. B-4 -> B-5)
export function getNextSequentialTableNumber(category: TableCategory): string {
    const tables = loadMasterTables();
    const catDetails = CATEGORY_DETAILS[category];
    const categoryTables = tables.filter(t => t.category === category);
    
    if (categoryTables.length === 0) return `${catDetails.prefix}1`;

    let maxNum = 0;
    categoryTables.forEach(t => {
        const num = extractTableNumber(t.tableNumber);
        if (num < 900 && num > maxNum) maxNum = num;
    });

    return `${catDetails.prefix}${maxNum + 1}`;
}

// Sort tables in numerical sequence within category
export function sortTablesSequentially(tables: TableConfig[]): TableConfig[] {
    return [...tables].sort((a, b) => extractTableNumber(a.tableNumber) - extractTableNumber(b.tableNumber));
}

// Return master tables grouped by category section, with each section sorted numerically
export function getGroupedMasterTables(tablesToGroup?: TableConfig[]): { category: TableCategory; details: typeof CATEGORY_DETAILS[TableCategory]; tables: TableConfig[] }[] {
    const tables = tablesToGroup || loadMasterTables();
    const categories: TableCategory[] = ['BAR_COUNTER', 'COUPLE', 'STANDARD', 'BOOTH', 'VIP_LOUNGE', 'EVENT_ROOFTOP', 'EVENT_BALLROOM'];

    return categories.map(cat => {
        const catTables = tables.filter(t => t.category === cat);
        return {
            category: cat,
            details: CATEGORY_DETAILS[cat],
            tables: sortTablesSequentially(catTables)
        };
    }).filter(group => group.tables.length > 0);
}

export function isValidTableNumber(tableNo: string, eventId?: number): boolean {
    if (!tableNo.trim()) return true;
    const tables = loadMasterTables();
    const clean = tableNo.trim().toUpperCase();
    return tables.some(t => {
        const matchNo = t.tableNumber.toUpperCase() === clean || t.id.toUpperCase() === clean;
        if (eventId && t.eventId) return matchNo && t.eventId === eventId;
        return matchNo;
    });
}

export function getTableConfig(tableNo: string): TableConfig | undefined {
    if (!tableNo.trim()) return undefined;
    const tables = loadMasterTables();
    const clean = tableNo.trim().toUpperCase();
    return tables.find(t => t.tableNumber.toUpperCase() === clean || t.id.toUpperCase() === clean);
}

export function getRecommendedTables(guestCount: number, eventId?: number): TableConfig[] {
    const tables = loadMasterTables();
    
    const available = tables.filter(t => {
        if (t.status !== 'FREE') return false;
        if (eventId) return t.eventId === eventId;
        return !t.eventId;
    });

    return available
        .filter(t => t.capacity >= guestCount)
        .sort((a, b) => a.capacity - b.capacity);
}
