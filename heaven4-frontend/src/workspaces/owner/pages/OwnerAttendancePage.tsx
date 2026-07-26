import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';
import { ActivityCalendar } from 'react-activity-calendar';

export default function OwnerAttendancePage() {
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAttendance = async () => {
        try {
            const res = await apiClient.get('/owner/attendance');
            
            // Map the attendance records into the GitHub Activity Calendar format
            // Activity Calendar expects: { date: string, count: number, level: 0 | 1 | 2 | 3 | 4 }
            
            const grouped = res.data.reduce((acc: any, curr: any) => {
                const d = curr.date as string;
                if (!d) return acc;
                if (!acc[d]) acc[d] = 0;
                acc[d] += curr.hoursWorked || 8; // Sum hours worked per day
                return acc;
            }, {});

            // Generate full year to show heatmap even with sparse data
            const today = new Date();
            const yearAgo = new Date(today);
            yearAgo.setFullYear(today.getFullYear() - 1);
            
            const calendarData = [];
            for (let d = new Date(yearAgo); d <= today; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0] as string;
                const count = grouped[dateStr] || 0;
                
                let level = 0;
                if (count > 0 && count <= 8) level = 1;
                else if (count > 8 && count <= 24) level = 2;
                else if (count > 24 && count <= 48) level = 3;
                else if (count > 48) level = 4;

                calendarData.push({
                    date: dateStr,
                    count: count,
                    level: level as 0 | 1 | 2 | 3 | 4
                });
            }
            
            setAttendanceData(calendarData);
        } catch (e) {
            toast.error('Failed to load attendance');
            // Provide empty data for UI fallback
            setAttendanceData([{ date: new Date().toISOString().split('T')[0], count: 0, level: 0 }]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAttendance(); }, []);

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gold-400">Attendance Heatmap</h1>
                    <p className="text-slate-400 mt-1">Visualize staff working hours and shifts.</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 overflow-x-auto w-full">
                <div className="min-w-[800px] flex justify-center">
                    {loading ? (
                        <div className="py-20 text-slate-500">Loading Heatmap...</div>
                    ) : (
                        <ActivityCalendar 
                            data={attendanceData} 
                            theme={{
                                light: ['#1e293b', '#064e3b', '#047857', '#10b981', '#34d399'],
                                dark: ['#1e293b', '#064e3b', '#047857', '#10b981', '#34d399'],
                            }}
                            labels={{
                                totalCount: '{{count}} hours logged in the last year',
                            }}
                            colorScheme="dark"
                            blockSize={16}
                            blockMargin={4}
                            fontSize={14}
                        />
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                 <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <h3 className="font-bold flex items-center gap-2 mb-4 text-emerald-400">
                        <Clock className="w-5 h-5" /> Today's Shifts
                    </h3>
                    <div className="text-sm text-slate-400 space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                            <span className="text-white font-medium">Morning Shift (8AM - 4PM)</span>
                            <span className="text-emerald-400 font-bold">5 Staff</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl">
                            <span className="text-white font-medium">Evening Shift (4PM - 12AM)</span>
                            <span className="text-emerald-400 font-bold">7 Staff</span>
                        </div>
                    </div>
                </div>
                
                 <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <h3 className="font-bold flex items-center gap-2 mb-4 text-blue-400">
                        <CalendarIcon className="w-5 h-5" /> Time Off Requests
                    </h3>
                    <div className="text-sm text-slate-500 text-center py-6">
                        No pending time off requests.
                    </div>
                </div>
            </div>
        </div>
    );
}
