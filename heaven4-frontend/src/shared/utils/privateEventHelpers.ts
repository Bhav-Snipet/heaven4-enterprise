// src/shared/utils/privateEventHelpers.ts
// Private Event Request & Estimator Engine for Heaven4 (Corporate Firms & Individual Hosts)

export type HostType = 'CORPORATE_FIRM' | 'BUSINESS' | 'INDIVIDUAL';
export type RequestStatus = 'PENDING_REVIEW' | 'NEGOTIATING' | 'APPROVED_BOOKED' | 'REJECTED';

export interface PrivateEventRequest {
    id: string;
    hostType: HostType;
    companyName?: string;
    taxId?: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    eventTitle: string;
    eventPurpose: string;
    preferredDate: string;
    startTime: string;
    durationHours: number;
    headcount: number;
    menuPackageId: 'STANDARD_BUFFET' | 'GOURMET_TASTING' | 'PREMIUM_BANQUET';
    menuPackageLabel: string;
    entertainmentOption: 'NONE' | 'DJ_SOUND_RIG' | 'LIVE_JAZZ_BAND' | 'ACOUSTIC_SOLO';
    entertainmentLabel: string;
    estimatedPrice: number;
    agreedPrice?: number;
    status: RequestStatus;
    allocatedStaff: {
        captains: number;
        bartenders: number;
        securityGuards: number;
    };
    adminNotes?: string;
    submittedAt: string;
}

export const MENU_PACKAGES = {
    STANDARD_BUFFET: { id: 'STANDARD_BUFFET', label: 'Standard Gourmet Buffet ($35/head)', pricePerHead: 35 },
    GOURMET_TASTING: { id: 'GOURMET_TASTING', label: 'Gourmet Tasting & Live Counters ($55/head)', pricePerHead: 55 },
    PREMIUM_BANQUET: { id: 'PREMIUM_BANQUET', label: 'VIP Executive Banquet & Wine ($85/head)', pricePerHead: 85 },
};

export const ENTERTAINMENT_OPTIONS = {
    NONE: { id: 'NONE', label: 'In-House Background Music (No Fee)', price: 0 },
    DJ_SOUND_RIG: { id: 'DJ_SOUND_RIG', label: 'DJ Pulse & Pro Sound Rig ($450)', price: 450 },
    LIVE_JAZZ_BAND: { id: 'LIVE_JAZZ_BAND', label: 'Live Jazz & Saxophone Quartet ($800)', price: 800 },
    ACOUSTIC_SOLO: { id: 'ACOUSTIC_SOLO', label: 'Acoustic Guitarist Solo ($300)', price: 300 },
};

// Calculate allocated staff based on headcount
export function calculateAllocatedStaff(headcount: number) {
    const captains = Math.max(1, Math.ceil(headcount / 25));
    const bartenders = Math.max(1, Math.ceil(headcount / 30));
    const securityGuards = Math.max(1, Math.ceil(headcount / 40));
    return { captains, bartenders, securityGuards };
}

// Calculate full estimated price for private event
export function calculateEventEstimation(
    headcount: number,
    durationHours: number,
    menuPackageKey: keyof typeof MENU_PACKAGES,
    entertainmentKey: keyof typeof ENTERTAINMENT_OPTIONS
) {
    const pkg = MENU_PACKAGES[menuPackageKey] || MENU_PACKAGES.STANDARD_BUFFET;
    const ent = ENTERTAINMENT_OPTIONS[entertainmentKey] || ENTERTAINMENT_OPTIONS.NONE;

    const subtotalFood = headcount * pkg.pricePerHead;
    const durationCost = durationHours * 150; // $150/hr venue hire
    const entertainmentCost = ent.price;

    const totalEstimate = subtotalFood + durationCost + entertainmentCost;
    const allocatedStaff = calculateAllocatedStaff(headcount);

    return {
        subtotalFood,
        durationCost,
        entertainmentCost,
        totalEstimate,
        allocatedStaff
    };
}

export const DEMO_REQUESTS: PrivateEventRequest[] = [
    {
        id: 'REQ-CORP-901',
        hostType: 'CORPORATE_FIRM',
        companyName: 'Horizon Global Tech Corp',
        taxId: 'US-9823145-GST',
        contactName: 'David Kim (Events Director)',
        contactPhone: '9876543210',
        contactEmail: 'd.kim@horizon.com',
        eventTitle: 'Horizon Corp Q3 Executive Gala & Product Reveal',
        eventPurpose: 'Corporate Gala & Leadership Celebration',
        preferredDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        startTime: '07:00 PM',
        durationHours: 4,
        headcount: 65,
        menuPackageId: 'PREMIUM_BANQUET',
        menuPackageLabel: 'VIP Executive Banquet & Wine ($85/head)',
        entertainmentOption: 'LIVE_JAZZ_BAND',
        entertainmentLabel: 'Live Jazz & Saxophone Quartet ($800)',
        estimatedPrice: 6925,
        status: 'PENDING_REVIEW',
        allocatedStaff: { captains: 3, bartenders: 3, securityGuards: 2 },
        submittedAt: new Date(Date.now() - 7200000).toLocaleString()
    },
    {
        id: 'REQ-IND-902',
        hostType: 'INDIVIDUAL',
        companyName: '',
        taxId: '',
        contactName: 'Sarah Cooper',
        contactPhone: '7020875435',
        contactEmail: 'sarah.cooper@gmail.com',
        eventTitle: 'Sarah & Marcus Anniversary Celebration',
        eventPurpose: 'Private Anniversary Celebration',
        preferredDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        startTime: '08:00 PM',
        durationHours: 3,
        headcount: 30,
        menuPackageId: 'GOURMET_TASTING',
        menuPackageLabel: 'Gourmet Tasting & Live Counters ($55/head)',
        entertainmentOption: 'DJ_SOUND_RIG',
        entertainmentLabel: 'DJ Pulse & Pro Sound Rig ($450)',
        estimatedPrice: 2550,
        status: 'APPROVED_BOOKED',
        agreedPrice: 2500,
        allocatedStaff: { captains: 2, bartenders: 1, securityGuards: 1 },
        adminNotes: 'Approved with 2 VIP lounge tables reserved.',
        submittedAt: new Date(Date.now() - 14400000).toLocaleString()
    }
];

const REQUESTS_STORAGE_KEY = 'heaven4_private_event_requests_v2';

export function loadPrivateEventRequests(): PrivateEventRequest[] {
    try {
        const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
        if (!raw) return DEMO_REQUESTS;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEMO_REQUESTS;
    } catch {
        return DEMO_REQUESTS;
    }
}

export function savePrivateEventRequest(request: Omit<PrivateEventRequest, 'id' | 'submittedAt' | 'status'>): PrivateEventRequest {
    const current = loadPrivateEventRequests();
    const newRecord: PrivateEventRequest = {
        ...request,
        companyName: request.companyName || '',
        taxId: request.taxId || '',
        id: `REQ-${request.hostType === 'CORPORATE_FIRM' ? 'CORP' : 'IND'}-${Date.now().toString().slice(-4)}`,
        status: 'PENDING_REVIEW',
        submittedAt: new Date().toLocaleString()
    };

    const updated = [newRecord, ...current];
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('heaven4-private-event-requests-updated', { detail: updated }));
    return newRecord;
}

export function updatePrivateEventRequestStatus(id: string, newStatus: RequestStatus, agreedPrice?: number, adminNotes?: string): void {
    const current = loadPrivateEventRequests();
    const updated = current.map(r => r.id === id ? {
        ...r,
        status: newStatus,
        agreedPrice: agreedPrice !== undefined ? agreedPrice : r.agreedPrice,
        adminNotes: adminNotes !== undefined ? adminNotes : r.adminNotes
    } : r);

    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('heaven4-private-event-requests-updated', { detail: updated }));
}
