// src/shared/utils/eventHelpers.ts
// Heaven4 Events — Shared utility functions used across all workspaces

export type DietaryType = 'VEG' | 'NON_VEG' | 'EGG' | 'BEVERAGE' | 'ALCOHOLIC';

export interface EventMenuItem {
  id?: number;
  eventId?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  dietaryType: DietaryType;
  imageUrl?: string;
}

export interface CountdownBanner {
  level: 'info' | 'warning' | 'urgent' | 'live' | 'ended';
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  borderColor: string;
  textColor: string;
}

export interface StatusStyle {
  label: string;
  badge: string;
  dot?: boolean;
}

// ─── Dietary Type Info ────────────────────────────────────────────────────────
export function getDietaryBadge(type: DietaryType): { label: string; badge: string; icon: string } {
  switch (type) {
    case 'VEG':
      return { label: 'VEG', badge: 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60', icon: '🟢' };
    case 'NON_VEG':
      return { label: 'NON-VEG', badge: 'bg-red-950/80 text-red-400 border border-red-700/60', icon: '🔴' };
    case 'EGG':
      return { label: 'EGG', badge: 'bg-amber-950/80 text-amber-300 border border-amber-700/60', icon: '🟡' };
    case 'BEVERAGE':
      return { label: 'DRINK', badge: 'bg-sky-950/80 text-sky-300 border border-sky-700/60', icon: '🥤' };
    case 'ALCOHOLIC':
      return { label: 'ALCOHOL (18+)', badge: 'bg-purple-950/80 text-purple-300 border border-purple-700/60', icon: '🍸' };
    default:
      return { label: 'FOOD', badge: 'bg-slate-800 text-slate-300 border border-slate-700', icon: '🍽️' };
  }
}

// ─── Event Status Styling ────────────────────────────────────────────────────
export function getStatusStyle(status: string): StatusStyle {
  switch (status) {
    case 'LIVE':
      return {
        label: 'LIVE NOW',
        badge: 'bg-red-500/20 text-red-300 border border-red-500/30',
        dot: true,
      };
    case 'UPCOMING':
      return {
        label: 'UPCOMING',
        badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      };
    case 'COMPLETED':
      return {
        label: 'COMPLETED',
        badge: 'bg-slate-700/60 text-slate-400 border border-slate-600/30',
      };
    case 'CANCELLED':
      return {
        label: 'CANCELLED',
        badge: 'bg-red-900/20 text-red-400 border border-red-700/30',
      };
    case 'DRAFT':
      return {
        label: 'DRAFT',
        badge: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
      };
    default:
      return {
        label: status,
        badge: 'bg-slate-800 text-slate-400 border border-slate-700',
      };
  }
}

// ─── Event Date/Time Formatting ───────────────────────────────────────────────
export function formatEventDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatEventTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
}

export function formatEventDateTime(startStr: string, endStr: string): string {
  try {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const dateLabel = start.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const startTime = start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const endTime = end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${dateLabel} · ${startTime} – ${endTime}`;
  } catch {
    return `${startStr} – ${endStr}`;
  }
}

export function formatDuration(startStr: string, endStr: string): string {
  try {
    const diffMs = new Date(endStr).getTime() - new Date(startStr).getTime();
    const hours = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  } catch {
    return '';
  }
}

// ─── Countdown Banner Computation ─────────────────────────────────────────────
export function getCountdownBanner(startDateStr: string, endDateStr?: string): CountdownBanner | null {
  try {
    const now = Date.now();
    const startMs = new Date(startDateStr).getTime();
    const endMs = endDateStr ? new Date(endDateStr).getTime() : startMs + 4 * 3600000;
    const msLeft = startMs - now;
    const msAfterEnd = now - endMs;

    // Event already ended
    if (msAfterEnd > 1800000) return null;

    // Event started but not ended yet — LIVE
    if (msLeft <= 0 && msAfterEnd <= 0) {
      return {
        level: 'live',
        icon: '🎉',
        title: 'EVENT IS LIVE RIGHT NOW!',
        subtitle: 'Show your digital pass or coupon code at the entrance.',
        color: 'from-emerald-900/80 via-green-900/60 to-teal-900/80',
        borderColor: 'border-emerald-500/50',
        textColor: 'text-emerald-300',
      };
    }

    if (msLeft <= 0) return null;

    // Under 1 hour — URGENT
    if (msLeft <= 3600000) {
      const mins = Math.floor(msLeft / 60000);
      return {
        level: 'urgent',
        icon: '🚨',
        title: `Event starts in ${mins} minute${mins !== 1 ? 's' : ''}!`,
        subtitle: 'Are you heading out? Show your pass or coupon at the door.',
        color: 'from-red-900/80 via-orange-900/60 to-amber-900/80',
        borderColor: 'border-red-500/50',
        textColor: 'text-red-300',
      };
    }

    // 1–2 hours away
    if (msLeft <= 7200000) {
      const hrs = Math.floor(msLeft / 3600000);
      const mins = Math.floor((msLeft % 3600000) / 60000);
      return {
        level: 'warning',
        icon: '⏰',
        title: `${hrs}h ${mins}m until your event!`,
        subtitle: 'Get ready — check your pass, coupon code, and table number.',
        color: 'from-orange-900/80 via-amber-900/60 to-yellow-900/80',
        borderColor: 'border-orange-500/50',
        textColor: 'text-orange-300',
      };
    }

    // 2–24 hours away
    if (msLeft <= 86400000) {
      const hrs = Math.floor(msLeft / 3600000);
      return {
        level: 'info',
        icon: '🔔',
        title: hrs < 24 ? `Your event is in ${hrs} hours!` : 'Event is tomorrow!',
        subtitle: "Don't forget to bring your digital pass or coupon code.",
        color: 'from-blue-900/80 via-indigo-900/60 to-purple-900/80',
        borderColor: 'border-blue-500/50',
        textColor: 'text-blue-300',
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ─── Pass Code & Coupon Generation ────────────────────────────────────────────
export function generatePassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'EVT-PASS-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateInviteToken(): string {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getInviteLink(token: string): string {
  return `${window.location.origin}/customer/events/invite/${token}`;
}

export function getEventTypeBadge(eventType: string): string {
  return eventType === 'PRIVATE'
    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
    : 'bg-sky-500/20 text-sky-300 border border-sky-500/30';
}

// ─── Table Validation ─────────────────────────────────────────────────────────
const VALID_TABLES = [
  ...Array.from({ length: 20 }, (_, i) => String(i + 1)),
  ...Array.from({ length: 5 }, (_, i) => `VIP-${i + 1}`),
];

export function isValidTableNumber(tableNo: string): boolean {
  if (!tableNo.trim()) return true;
  return VALID_TABLES.includes(tableNo.trim().toUpperCase());
}

export function computeEventRevenue(ticketPrice: number, totalCapacity: number, availablePasses: number): number {
  const soldPasses = totalCapacity - availablePasses;
  return ticketPrice * soldPasses;
}

export function getPassStatusStyle(status: string): { badge: string; label: string } {
  switch (status) {
    case 'ATTENDED':
      return { badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30', label: 'ATTENDED ✓' };
    case 'CANCELLED':
      return { badge: 'bg-red-500/20 text-red-400 border border-red-500/30', label: 'CANCELLED' };
    default:
      return { badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30', label: 'CONFIRMED' };
  }
}

// ─── Payment Settings ────────────────────────────────────────────────────────
export interface PaymentSettings {
  upiId: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  paymentQrUrl: string;
  paymentNote: string;
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  upiId: '',
  bankName: '',
  accountName: '',
  accountNumber: '',
  ifscCode: '',
  paymentQrUrl: '',
  paymentNote: 'Complete payment via UPI or scan the QR code. Keep your transaction ID for reference.',
};

export function loadPaymentSettings(): PaymentSettings {
  try {
    const raw = localStorage.getItem('heaven4_payment_config');
    if (!raw) return DEFAULT_PAYMENT_SETTINGS;
    return { ...DEFAULT_PAYMENT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PAYMENT_SETTINGS;
  }
}

export function savePaymentSettings(settings: PaymentSettings): void {
  localStorage.setItem('heaven4_payment_config', JSON.stringify(settings));
}
