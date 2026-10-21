import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, UserPlus, CheckCircle2, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { ActivityCalendar } from 'react-activity-calendar';
import {
    loadAttendanceRecords, generateRealHeatmapData, clockInStaff, clockOutStaff, AttendanceRecord
} from '@/shared/utils/attendanceHelpers';

export default function OwnerAttendancePage() {
    const [heatmapData, setHeatmapData] = useState<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[]>([]);
    const [todayRoster, setTodayRoster] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Quick Manual Clock In State for Owner/Manager Override
    const [manualStaffName, setManualStaffName] = useState('');
    const [manualRole, setManualRole] = useState('Floor Waiter');
    const [manualShift, setManualShift] = useState<'MORNING' | 'EVENING' | 'NIGHT'>('MORNING');
    const [showManualModal, setShowManualModal] = useState(false);

    const refreshAttendance = () => {
        setLoading(true);
        try {
            const data = generateRealHeatmapData();
            setHeatmapData(data);

            const allRecords = loadAttendanceRecords();
            const todayStr = new Date().toISOString().split('T')[0];
            const todaysRecords = allRecords.filter(r => r.date === todayStr);
            setTodayRoster(todaysRecords.length > 0 ? todaysRecords : allRecords.slice(0, 6));
        } catch {
            setHeatmapData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshAttendance();
        const handleAttendanceUpdated = () => refreshAttendance();
        window.addEventListener('heaven4-attendance-updated', handleAttendanceUpdated);
        return () => window.removeEventListener('heaven4-attendance-updated', handleAttendanceUpdated);
    }, []);

    const handleOwnerClockIn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualStaffName.trim()) { toast.error('Enter employee name'); return; }
        clockInStaff(manualStaffName.trim(), manualRole, manualShift);
        toast.success(`✅ Clocked IN ${manualStaffName} for ${manualShift} shift!`);
        setManualStaffName('');
        setShowManualModal(false);
        refreshAttendance();
    };

    const handleOwnerClockOut = (staffName: string) => {
        clockOutStaff(staffName);
        toast.success(`✅ Clocked OUT ${staffName}!`);
        refreshAttendance();
    };

    // Calculate dynamic stats for today
    const morningCount = todayRoster.filter(r => r.shiftType === 'MORNING').length;
    const eveningCount = todayRoster.filter(r => r.shiftType === 'EVENING').length;
    const nightCount = todayRoster.filter(r => r.shiftType === 'NIGHT').length;
    const activeCount = todayRoster.filter(r => r.status === 'ON_DUTY').length;
    const totalHoursLogged = todayRoster.reduce((sum, r) => sum + (r.hoursWorked || 8), 0);

    return (
        <div className="p-4 md:p-8 space-y-6 text-white bg-slate-950 min-h-screen pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                        Live Staff Attendance Heatmap & Roster
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Real-time attendance engine computed from active employee clock-in logs and shift hours.</p>
                </div>

                <button
                    onClick={() => setShowManualModal(true)}
                    className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all shrink-0"
                >
                    <UserPlus className="w-4 h-4" /> Clock In / Register Staff
                </button>
            </div>

            {/* Attendance Analytics Heatmap */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-lg font-black text-white flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-emerald-400" /> 365-Day Attendance Working Hours Heatmap
                        </h2>
                        <p className="text-xs text-slate-400">Total hours logged per calendar date across all departments.</p>
                    </div>
                    <div className="flex gap-4 text-xs font-bold">
                        <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                            <span className="text-slate-400">Today Active: </span>
                            <span className="text-emerald-400 font-black">{activeCount} Staff On Duty</span>
                        </div>
                        <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                            <span className="text-slate-400">Total Shift Hours Today: </span>
                            <span className="text-amber-400 font-black">{totalHoursLogged.toFixed(1)} hrs</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto w-full pt-2">
                    <div className="min-w-[800px] flex justify-center">
                        {loading ? (
                            <div className="py-20 text-slate-500">Calculating Real Attendance Logs...</div>
                        ) : (
                            <ActivityCalendar 
                                data={heatmapData} 
                                theme={{
                                    light: ['#1e293b', '#064e3b', '#047857', '#10b981', '#34d399'],
                                    dark: ['#1e293b', '#064e3b', '#047857', '#10b981', '#34d399'],
                                }}
                                labels={{
                                    totalCount: '{{count}} real working hours recorded in the last year',
                                }}
                                colorScheme="dark"
                                blockSize={15}
                                blockMargin={4}
                                fontSize={12}
                            />
                        )}
                    </div>
                </div>
            </div>
            
            {/* Shifts & Roster Detail Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Active Shift Breakdown */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                    <h3 className="font-black text-lg text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-emerald-400" /> Active Shift Roster Breakdown (Today)
                    </h3>
                    
                    <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center p-4 bg-slate-950 rounded-2xl border border-slate-800">
                            <div>
                                <p className="text-white font-black text-sm">Morning Shift (8AM – 4PM)</p>
                                <p className="text-slate-400 text-[11px]">Executive Chef, Kitchen Prep & Morning Waiters</p>
                            </div>
                            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 font-black rounded-xl border border-emerald-500/30">
                                {morningCount} Staff
                            </span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-slate-950 rounded-2xl border border-slate-800">
                            <div>
                                <p className="text-white font-black text-sm">Evening Shift (4PM – 12AM)</p>
                                <p className="text-slate-400 text-[11px]">Floor Captains, Mixologists & Rooftop Hosts</p>
                            </div>
                            <span className="px-3 py-1.5 bg-amber-500/20 text-amber-300 font-black rounded-xl border border-amber-500/30">
                                {eveningCount} Staff
                            </span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-slate-950 rounded-2xl border border-slate-800">
                            <div>
                                <p className="text-white font-black text-sm">Night Shift (12AM – 4AM)</p>
                                <p className="text-slate-400 text-[11px]">Rooftop Security, Night Bar & Closing Crew</p>
                            </div>
                            <span className="px-3 py-1.5 bg-purple-500/20 text-purple-300 font-black rounded-xl border border-purple-500/30">
                                {nightCount} Staff
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Live Attendance Roster Log Table */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-lg text-white flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-blue-400" /> Today's Live Attendance Log ({todayRoster.length})
                        </h3>
                    </div>

                    <div className="space-y-2 text-xs max-h-[380px] overflow-y-auto pr-1">
                        {todayRoster.map((record, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-white text-sm">{record.staffName}</p>
                                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-bold">{record.role}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Clocked In: <strong className="text-slate-200">{record.clockInTime}</strong> · Out: <strong className="text-slate-200">{record.clockOutTime || 'Active On Duty'}</strong>
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <span className="font-black text-emerald-400 text-sm">{record.hoursWorked ? `${record.hoursWorked}h` : '8.0h'}</span>
                                        <p className="text-[10px] font-bold text-amber-300 uppercase">{record.shiftType}</p>
                                    </div>

                                    {record.status === 'ON_DUTY' ? (
                                        <button
                                            onClick={() => handleOwnerClockOut(record.staffName)}
                                            className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold text-[10px] rounded-xl border border-red-800/40 transition-all shrink-0"
                                        >
                                            Clock Out
                                        </button>
                                    ) : (
                                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold text-[10px] rounded-full border border-emerald-500/30 flex items-center gap-1 shrink-0">
                                            <CheckCircle2 className="w-3 h-3" /> COMPLETED
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Manual Clock In Modal */}
            {showManualModal && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleOwnerClockIn} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 text-white shadow-2xl">
                        <h3 className="text-xl font-black text-amber-400 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-amber-400" /> Manual Staff Clock In / Attendance Log
                        </h3>
                        <p className="text-xs text-slate-400">Record an employee shift clock-in directly into the live attendance database.</p>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-slate-400 mb-1">Employee Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Alex Rivera or Chef Marco"
                                    value={manualStaffName}
                                    onChange={e => setManualStaffName(e.target.value)}
                                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-400 mb-1">Role / Department</label>
                                <select
                                    value={manualRole}
                                    onChange={e => setManualRole(e.target.value)}
                                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold outline-none focus:border-amber-500"
                                >
                                    <option value="Floor Waiter">Floor Waiter</option>
                                    <option value="Floor Captain">Floor Captain</option>
                                    <option value="Executive Chef">Executive Chef</option>
                                    <option value="Sous Chef">Sous Chef</option>
                                    <option value="Mixologist">Mixologist</option>
                                    <option value="Rooftop Host">Rooftop Host</option>
                                    <option value="Security Manager">Security Manager</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-400 mb-1">Shift Type</label>
                                <select
                                    value={manualShift}
                                    onChange={e => setManualShift(e.target.value as any)}
                                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-bold outline-none focus:border-amber-500"
                                >
                                    <option value="MORNING">MORNING (8AM – 4PM)</option>
                                    <option value="EVENING">EVENING (4PM – 12AM)</option>
                                    <option value="NIGHT">NIGHT (12AM – 4AM)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowManualModal(false)}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20"
                            >
                                Clock In Staff
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
