import React from 'react';
import { 
  ChevronLeft, ChevronRight, Info, CalendarDays, 
  CheckCircle2, CalendarX2, Users, BarChart3 
} from 'lucide-react';
import { getSafeDateKey } from '../utils/rosterUtils';
import { WEEKDAYS } from '../utils/rosterConstants';

export default function RosterReports({
  schedule, employees, shifts, leaves, currentDate, navigateMonth
}) {

  if (!schedule) {
    return (
      <div className="text-center py-24 bg-white rounded-2xl border-2 border-slate-200 border-dashed">
        <BarChart3 className="mx-auto text-slate-300 mb-5" size={56} />
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Data Available</h3>
        <p className="text-slate-500 font-medium">Generate a roster first to view compliance and utilization reports.</p>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const slotsNeededPerWeek = shifts.reduce((sum, shift) => sum + (shift.reqWeekday * 5) + (shift.reqWeekend * 2), 0);
  const capacityPerWeek = employees.length * 5;
  const excessCapacity = capacityPerWeek - slotsNeededPerWeek;

  const reportData = employees.map(emp => {
    let daysWorked = 0, totalLeaves = 0, totalOffs = 0;
    const weeklyOffTracker = {}; 
    const dailyStatus = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateKey = getSafeDateKey(d);
      const daySchedule = schedule[dateKey];
      
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const weekKey = getSafeDateKey(weekStart);
      if (weeklyOffTracker[weekKey] === undefined) weeklyOffTracker[weekKey] = 0;

      let status = 'standby'; 
      const isOnLeave = leaves.some(l => l.empId === emp.id && l.date === dateKey);
      
      if (isOnLeave) {
          status = 'leave'; totalLeaves++;
      } else if (daySchedule) {
          const workedToday = Object.values(daySchedule).some(shiftList => shiftList.includes(emp.id));
          if (workedToday) {
              status = 'worked'; daysWorked++;
          } else {
              if (weeklyOffTracker[weekKey] < 2) {
                  status = 'off'; weeklyOffTracker[weekKey]++; totalOffs++;
              } else {
                  status = 'standby';
              }
          }
      }
      dailyStatus.push({ day, dayName: WEEKDAYS[d.getDay()], status });
    }
    
    const targetMet = totalOffs >= 8 || (totalOffs + totalLeaves) >= 8; 
    
    const weeks = [];
    let currentWeek = [];
    dailyStatus.forEach(ds => {
        currentWeek.push(ds);
        if (ds.dayName === 'Sat' || ds.day === daysInMonth) {
            weeks.push([...currentWeek]);
            currentWeek = [];
        }
    });
    return { ...emp, daysWorked, totalOffs, totalLeaves, targetMet, weeks };
  }).sort((a, b) => a.totalOffs - b.totalOffs);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Monthly Compliance Report</h2>
          <p className="text-slate-500 font-medium mt-1">Tracking working distribution and mandatory off days</p>
        </div>
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-sm">
          <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronLeft size={18} /></button>
          <span className="w-56 text-center font-bold text-slate-700">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronRight size={18} /></button>
        </div>
      </div>

      {excessCapacity > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-4 text-blue-800 shadow-sm">
              <Info className="shrink-0 mt-0.5 text-blue-600" size={24} />
              <div className="text-sm leading-relaxed font-medium">
                  <strong>Capacity Notice:</strong> Your workforce provides <strong>{capacityPerWeek}</strong> shifts/week, but your roster only requires <strong>{slotsNeededPerWeek}</strong>. 
                  Because of this surplus, some employees will inevitably have more than 2 unassigned days. 
                  The first 2 unassigned days are marked as <span className="text-rose-600 font-bold border-b-2 border-rose-300 mx-1">Weekoff (Red)</span>. Any remaining unassigned days are marked as <span className="text-slate-600 font-bold border-b-2 border-slate-300 mx-1">Standby (Gray)</span>.
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-emerald-200 transition-colors">
           <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner"><CalendarDays size={24} /></div>
           <div><p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Worked</p><p className="text-xs text-slate-400 mt-0.5 font-medium">Scheduled (Grey on Weekends)</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-rose-200 transition-colors">
           <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-inner"><CheckCircle2 size={24} /></div>
           <div><p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Weekoff</p><p className="text-xs text-slate-400 mt-0.5 font-medium">Strictly 2 per week</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-amber-200 transition-colors">
           <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner"><CalendarX2 size={24} /></div>
           <div><p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Leave</p><p className="text-xs text-slate-400 mt-0.5 font-medium">Planned absence</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-slate-300 transition-colors">
           <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-inner"><Users size={24} /></div>
           <div><p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Standby</p><p className="text-xs text-slate-400 mt-0.5 font-medium">Surplus staff capacity</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-5 font-bold uppercase tracking-wider sticky left-0 bg-slate-50 z-10 w-60 shadow-[1px_0_0_0_#e2e8f0]">Employee</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider">Monthly Timeline Overview</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-center">Worked</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-center">Off</th>
                <th className="px-6 py-5 font-bold uppercase tracking-wider text-center">Leave</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-4 sticky left-0 bg-white z-10 w-60 shadow-[1px_0_0_0_#f1f5f9]">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-black shrink-0 border border-blue-100 shadow-sm">
                          {row.name.charAt(0)}
                      </div>
                      <span className="truncate text-base">{row.name}</span>
                  </td>
                  <td className="px-6 py-3">
                      <div className="flex gap-4 overflow-x-auto custom-scrollbar items-center pb-2 pt-1">
                          {row.weeks.map((week, wIdx) => (
                              <div key={wIdx} className={`flex gap-1.5 p-2 rounded-xl border ${wIdx % 2 === 0 ? 'bg-slate-50 border-slate-200' : 'bg-transparent border-transparent'}`}>
                                  {week.map(status => {
                                      let gradient = '';
                                      const isWeekend = status.dayName === 'Sat' || status.dayName === 'Sun';
                                      
                                      if (isWeekend) {
                                          const baseBg = 'bg-gradient-to-br from-slate-200 to-slate-300 shadow-sm';
                                          if (status.status === 'worked') gradient = `${baseBg} text-emerald-700 ring-2 ring-inset ring-emerald-400`;
                                          else if (status.status === 'off') gradient = `${baseBg} text-rose-700 ring-2 ring-inset ring-rose-400`;
                                          else if (status.status === 'leave') gradient = `${baseBg} text-amber-700 ring-2 ring-inset ring-amber-400`;
                                          else gradient = `bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 opacity-70`;
                                      } else {
                                          if (status.status === 'worked') gradient = 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm';
                                          else if (status.status === 'off') gradient = 'bg-gradient-to-br from-rose-400 to-rose-500 text-white shadow-sm ring-1 ring-rose-200 ring-offset-1';
                                          else if (status.status === 'leave') gradient = 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm';
                                          else if (status.status === 'standby') gradient = 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600';
                                      }
                                      
                                      return (
                                          <div key={status.day} title={`Day ${status.day} (${status.dayName}): ${status.status.toUpperCase()}`} className={`shrink-0 flex flex-col items-center justify-center w-10 h-12 rounded-lg transition-all hover:scale-110 hover:z-10 cursor-default ${gradient}`}>
                                              <span className="text-sm font-bold leading-none">{status.day}</span>
                                              <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${status.status === 'standby' ? 'opacity-70' : 'opacity-90'}`}>{status.dayName}</span>
                                          </div>
                                      )
                                  })}
                              </div>
                          ))}
                      </div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-700 text-base">{row.daysWorked}</td>
                  <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-bold shadow-sm border ${row.totalOffs >= 8 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>{row.totalOffs}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                      {row.totalLeaves > 0 ? <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-bold bg-amber-50 text-amber-700 border border-amber-100 shadow-sm">{row.totalLeaves}</span> : <span className="text-slate-300 font-bold">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}