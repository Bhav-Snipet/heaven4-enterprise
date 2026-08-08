// src/shared/utils/eventGuestHelpers.ts
// Live Event Guest Roster Synchronization Engine for Heaven4

export interface EventGuestRecord {
    id: string;
    eventId: number;
    eventTitle: string;
    guestName: string;
    guestPhone: string;
    passCode: string;
    passesCount: number;
    tableNumber: string;
    bookedAt: string;
    status: 'CONFIRMED' | 'ATTENDED ✓' | 'CANCELLED';
    membershipTier?: string;
}

export const DEFAULT_GUEST_ROSTER: EventGuestRecord[] = [
    {
        id: 'GST-901-1',
        eventId: 901,
        eventTitle: '🎷 Sunset Rooftop Jazz & Wine Night',
        guestName: 'Sarah Cooper',
        guestPhone: '7020875435',
        passCode: 'PASS-SARAH-901',
        passesCount: 2,
        tableNumber: 'RT-VIP-1',
        bookedAt: new Date(Date.now() - 3600000).toLocaleString(),
        status: 'CONFIRMED',
        membershipTier: 'DIAMOND VIP'
    },
    {
        id: 'GST-901-2',
        eventId: 901,
        eventTitle: '🎷 Sunset Rooftop Jazz & Wine Night',
        guestName: 'Marcus Vance',
        guestPhone: '9820123456',
        passCode: 'PASS-MARCUS-901',
        passesCount: 4,
        tableNumber: 'RT-1',
        bookedAt: new Date(Date.now() - 7200000).toLocaleString(),
        status: 'CONFIRMED',
        membershipTier: 'GOLD VIP'
    },
    {
        id: 'GST-902-1',
        eventId: 902,
        eventTitle: '💼 Horizon Corp Private Gala',
        guestName: 'David Kim',
        guestPhone: '9876543210',
        passCode: 'PASS-DAVID-902',
        passesCount: 6,
        tableNumber: 'BR-1',
        bookedAt: new Date(Date.now() - 14400000).toLocaleString(),
        status: 'CONFIRMED',
        membershipTier: 'PLATINUM VIP'
    }
];

const GUESTS_STORAGE_KEY = 'heaven4_event_guests_v3';

export function loadEventGuests(): EventGuestRecord[] {
    try {
        const raw = localStorage.getItem(GUESTS_STORAGE_KEY);
        if (!raw) return DEFAULT_GUEST_ROSTER;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_GUEST_ROSTER;
    } catch {
        return DEFAULT_GUEST_ROSTER;
    }
}

export function saveEventGuest(guest: Omit<EventGuestRecord, 'id' | 'bookedAt' | 'status'> & { id?: string; bookedAt?: string; status?: EventGuestRecord['status'] }): EventGuestRecord {
    const current = loadEventGuests();
    const newRecord: EventGuestRecord = {
        id: guest.id || `GST-${guest.eventId}-${Date.now().toString().slice(-4)}`,
        eventId: guest.eventId,
        eventTitle: guest.eventTitle,
        guestName: guest.guestName || 'VIP Guest',
        guestPhone: guest.guestPhone || '7020875435',
        passCode: guest.passCode,
        passesCount: guest.passesCount || 1,
        tableNumber: guest.tableNumber || 'General Entry',
        bookedAt: guest.bookedAt || new Date().toLocaleString(),
        status: guest.status || 'CONFIRMED',
        membershipTier: guest.membershipTier || 'GOLD VIP'
    };

    const updated = [newRecord, ...current];
    localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('heaven4-guests-updated', { detail: updated }));
    return newRecord;
}

export function updateGuestStatus(passCode: string, newStatus: EventGuestRecord['status']): void {
    const current = loadEventGuests();
    const updated = current.map(g => g.passCode === passCode ? { ...g, status: newStatus } : g);
    localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('heaven4-guests-updated', { detail: updated }));
}

export function getGuestsForEvent(eventId: number): EventGuestRecord[] {
    const all = loadEventGuests();
    return all.filter(g => g.eventId === eventId);
}
