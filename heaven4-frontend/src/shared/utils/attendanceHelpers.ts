// src/shared/utils/attendanceHelpers.ts
// Live Attendance & Shift Roster Synchronization Engine for Heaven4

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // e.g. 08:00 AM
  clockOutTime?: string; // e.g. 04:00 PM or "On Duty"
  hoursWorked: number;
  status: 'ON_DUTY' | 'COMPLETED' | 'LATE' | 'ABSENT';
  shiftType: 'MORNING' | 'EVENING' | 'NIGHT';
}

const ATTENDANCE_STORAGE_KEY = 'heaven4_attendance_records_v1';

// Seed realistic historical data for the past 365 days
function generateSeedRecords(): AttendanceRecord[] {
  const staffList = [
    { name: 'Chef Marco Polo', role: 'Executive Chef', shift: 'MORNING' as const },
    { name: 'Alex Rivera', role: 'Floor Captain', shift: 'MORNING' as const },
    { name: 'Sanjay Kumar', role: 'Sous Chef', shift: 'MORNING' as const },
    { name: 'Elena Rostova', role: 'Mixologist', shift: 'EVENING' as const },
    { name: 'David Kim', role: 'Floor Waiter', shift: 'MORNING' as const },
    { name: 'Sarah Jenkins', role: 'Event Manager', shift: 'EVENING' as const },
    { name: 'Michael Thorne', role: 'Rooftop Supervisor', shift: 'NIGHT' as const },
    { name: 'Priya Sharma', role: 'Front Desk Host', shift: 'MORNING' as const },
  ];

  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  // Past 90 days of daily staff shift data
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0] || '';
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    const activeStaffCount = isWeekend ? 7 : (i % 3 === 0 ? 5 : 6);

    staffList.slice(0, activeStaffCount).forEach((staff, idx) => {
      const isToday = i === 0;
      const isCurrentShift = isToday && idx < 4;

      records.push({
        id: `ATT-${dateStr}-${idx}`,
        staffId: `EMP-10${idx + 1}`,
        staffName: staff.name,
        role: staff.role,
        date: dateStr,
        clockInTime: staff.shift === 'MORNING' ? '08:00 AM' : staff.shift === 'EVENING' ? '04:00 PM' : '08:00 PM',
        clockOutTime: isCurrentShift ? undefined : (staff.shift === 'MORNING' ? '04:00 PM' : staff.shift === 'EVENING' ? '12:00 AM' : '04:00 AM'),
        hoursWorked: isCurrentShift ? 7.5 : 8.0,
        status: isCurrentShift ? 'ON_DUTY' : 'COMPLETED',
        shiftType: staff.shift
      });
    });
  }

  return records;
}

export function loadAttendanceRecords(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (!raw) {
      const initial = generateSeedRecords();
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : generateSeedRecords();
  } catch {
    return generateSeedRecords();
  }
}

export function clockInStaff(staffName: string, role: string, shiftType: 'MORNING' | 'EVENING' | 'NIGHT' = 'MORNING'): AttendanceRecord {
  const records = loadAttendanceRecords();
  const todayStr = new Date().toISOString().split('T')[0] || '';
  const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  // Check if already clocked in today
  const existing = records.find(r => r.staffName.toLowerCase() === staffName.toLowerCase() && r.date === todayStr && r.status === 'ON_DUTY');
  if (existing) return existing;

  const newRecord: AttendanceRecord = {
    id: `ATT-${todayStr}-${Date.now().toString().slice(-4)}`,
    staffId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    staffName,
    role,
    date: todayStr,
    clockInTime: nowTime,
    clockOutTime: undefined,
    hoursWorked: 0.1,
    status: 'ON_DUTY',
    shiftType
  };

  const updated = [newRecord, ...records];
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('heaven4-attendance-updated', { detail: updated }));
  return newRecord;
}

export function clockOutStaff(staffName: string): boolean {
  const records = loadAttendanceRecords();
  const todayStr = new Date().toISOString().split('T')[0] || '';
  const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  let updatedCount = 0;
  const updated = records.map(r => {
    if (r.staffName.toLowerCase() === staffName.toLowerCase() && r.date === todayStr && r.status === 'ON_DUTY') {
      updatedCount++;
      return {
        ...r,
        clockOutTime: nowTime,
        hoursWorked: 8.0,
        status: 'COMPLETED' as const
      };
    }
    return r;
  });

  if (updatedCount > 0) {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('heaven4-attendance-updated', { detail: updated }));
    return true;
  }
  return false;
}

export function generateRealHeatmapData(): { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] {
  const records = loadAttendanceRecords();
  
  // Aggregate total hours worked per calendar date
  const groupedHours: Record<string, number> = {};
  records.forEach(r => {
    if (!r.date) return;
    groupedHours[r.date] = (groupedHours[r.date] || 0) + (r.hoursWorked || 8);
  });

  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setFullYear(today.getFullYear() - 1);

  const heatmap: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = [];

  for (let d = new Date(yearAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0] || '';
    const totalHours = Math.round(groupedHours[dateStr] || 0);

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (totalHours > 0 && totalHours <= 16) level = 1;
    else if (totalHours > 16 && totalHours <= 32) level = 2;
    else if (totalHours > 32 && totalHours <= 56) level = 3;
    else if (totalHours > 56) level = 4;

    heatmap.push({
      date: dateStr,
      count: totalHours,
      level
    });
  }

  return heatmap;
}
