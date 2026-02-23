import React from 'react';
import { 
  ChevronLeft, ChevronRight, Info, CalendarDays, 
  CheckCircle2, CalendarX2, Users, BarChart3, List, Grid 
} from 'lucide-react';
import { getSafeDateKey } from '../utils/rosterUtils';
import { WEEKDAYS } from '../utils/rosterConstants';

export default function RosterReports({
  schedule, employees, shifts, leaves, currentDate, 
  viewMode, setViewMode, navigateDate, getDisplayDateRange
}) {

  if (!schedule) {
    return (
      <div className="text-center py-24 bg-white rounded-2xl border-2 border-slate-200 border-dashed h-full flex flex-col items-center justify-center">
        <BarChart3 className="mx-auto text-slate-300 mb-5" size={56} />
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Data Available</h3>
        <p className="text-slate-500 font-medium">Generate a roster first to view compliance and utilization reports.</p>
      </div>
    );
  }

  // Determine which dates to render based on ViewMode
  let datesToRender = [];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  if (viewMode === 'day') {
      datesToRender.push(new Date(currentDate));
  } else if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          datesToRender.push(d);
      }
  } else {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
          datesToRender.push(new Date(year, month, i));
      }
  }

  const capacityPerWeek = employees.length * 5;
  const slotsNeededPerWeek = shifts.reduce((sum, shift) => sum + (shift.reqWeekday * 5) + (shift.reqWeekend * 2), 0);
  const excessCapacity = capacityPerWeek - slotsNeededPerWeek;

  // Process data for the active date range
  const reportData = employees.map(emp => {
    let daysWorked = 0, totalLeaves = 0, totalOffs = 0;
    const weeklyOffTracker = {}; 
    const dailyStatus = [];
    
    // Dynamically track how many times they worked each shift
    const shiftCounts = {};
    shifts.forEach(s => shiftCounts[s.id] = 0);

    datesToRender.forEach(d => {
      const dateKey = getSafeDateKey(d);
      const daySchedule = schedule[dateKey];
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const weekKey = getSafeDateKey(weekStart);
      
      if (weeklyOffTracker[weekKey] === undefined) weeklyOffTracker[weekKey] = 0;

      let status = 'standby'; 
      let workedShiftObj = null;
      const isOnLeave = leaves.some(l => l.empId === emp.id && l.date === dateKey);
      
      if (isOnLeave) {
          status = 'leave'; totalLeaves++;
      } else if (daySchedule) {
          // Check which specific shift they were assigned to
          for (const shift of shifts) {
              if (daySchedule[shift.id]?.includes(emp.id)) {
                  workedShiftObj = shift;
                  break;
              }
          }

          if (workedShiftObj) {
              status = 'worked'; 
              daysWorked++;
              shiftCounts[workedShiftObj.id]++; // Increment specific shift count
          } else {
              if (weeklyOffTracker[weekKey] < 2) {
                  status = 'off'; weeklyOffTracker[weekKey]++; totalOffs++;
              } else {
                  status = 'standby';
              }
          }
      }
      dailyStatus.push({ day: d.getDate(), dayName: WEEKDAYS[d.getDay()], status, fullDate: dateKey });
    });
    
    // Group into weeks for layout visualization
    const weeks = [];
    let currentWeek = [];
    dailyStatus.forEach(ds => {
        currentWeek.push(ds);
        if (ds.dayName === 'Sat' || ds === dailyStatus[dailyStatus.length - 1]) {
            weeks.push([...currentWeek]);
            currentWeek = [];
        }
    });

    return { ...emp, daysWorked, totalOffs, totalLeaves, shiftCounts, weeks };
  });

  return (
    <div className="flex flex-col h-full space-y-5 animate-in fade-in duration-300 min-h-0">
      
      {/* View Mode Controls (Shrink-0 prevents squashing) */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full xl:w-auto">
            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 shadow-inner">
              <button onClick={() => setViewMode('day')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'day' ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}><List size={16} /> Daily</button>
              <button onClick={() => setViewMode('week')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}><CalendarDays size={16} /> Weekly</button>
              <button onClick={() => setViewMode('month')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}><Grid size={16} /> Monthly</button>
            </div>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-sm">
              <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronLeft size={18} /></button>
              <span className="w-64 text-center font-bold text-slate-700 text-sm">{getDisplayDateRange()}</span>
              <button onClick={() => navigateDate(1)} className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronRight size={18} /></button>
            </div>
        </div>
        
        {viewMode === 'month' && excessCapacity > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 flex items-center gap-3 text-blue-800">
             <Info className="shrink-0 text-blue-600" size={18} />
             <div className="text-xs font-medium">Surplus Capacity: <strong>{excessCapacity} unassigned shifts/week</strong> will be marked as Standby (Gray).</div>
          </div>
        )}
      </div>

      {/* Main Grid Data Table Container (Takes up exactly all remaining space) */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Scrollable area bounds */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
            
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 shadow-[0_1px_0_0_#e2e8f0]">
              <tr>
                {/* Top-Left fixed corner */}
                <th className="px-6 py-4 font-bold uppercase tracking-wider sticky left-0 top-0 bg-slate-50 z-30 w-56 border-b border-r border-slate-200 shadow-[1px_1px_0_0_#e2e8f0]">
                  Employee Record
                </th>
                
                <th className="px-6 py-4 font-bold uppercase tracking-wider sticky top-0 bg-slate-50 z-20 border-b border-slate-200 min-w-[300px]">
                  Timeline Overview
                </th>
                
                <th className="px-4 py-4 font-bold uppercase tracking-wider text-center sticky top-0 bg-slate-50 z-20 border-b border-slate-200 bg-emerald-50/50 text-emerald-700">
                  Total Worked
                </th>

                {/* Dynamic Shift Breakdown Columns */}
                {shifts.map(shift => (
                   <th key={shift.id} className="px-4 py-4 font-bold uppercase tracking-wider text-center sticky top-0 bg-slate-50 z-20 border-b border-slate-200">
                      <div className="flex items-center justify-center gap-1.5">
                         <div className={`w-2 h-2 rounded-full shadow-sm ${shift.color.split(' ')[0]}`}></div>
                         {shift.label}
                      </div>
                   </th>
                ))}
                
                <th className="px-4 py-4 font-bold uppercase tracking-wider text-center sticky top-0 bg-slate-50 z-20 border-b border-slate-200 text-rose-600 bg-rose-50/50">
                  Total Offs
                </th>
                
                <th className="px-4 py-4 font-bold uppercase tracking-wider text-center sticky top-0 bg-slate-50 z-20 border-b border-slate-200 text-amber-600 bg-amber-50/50">
                  Leaves
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {reportData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Sticky Row Identity */}
                  <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-4 sticky left-0 bg-white z-10 w-56 border-r border-slate-100 shadow-[1px_0_0_0_#f1f5f9] group-hover:bg-slate-50/80">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-black shrink-0 border border-blue-100 shadow-sm">
                          {row.name.charAt(0)}
                      </div>
                      <span className="truncate text-sm">{row.name}</span>
                  </td>
                  
                  {/* Timeline Visuals */}
                  <td className="px-6 py-2.5">
                      <div className="flex gap-4 items-center">
                          {row.weeks.map((week, wIdx) => (
                              <div key={wIdx} className={`flex gap-1.5 p-1.5 rounded-xl border ${wIdx % 2 === 0 ? 'bg-slate-50 border-slate-200' : 'bg-transparent border-transparent'}`}>
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
                                          <div key={status.day} title={`Date: ${status.fullDate} - ${status.status.toUpperCase()}`} className={`shrink-0 flex flex-col items-center justify-center w-8 h-10 rounded-lg transition-transform hover:scale-110 cursor-default ${gradient}`}>
                                              <span className="text-[11px] font-bold leading-none">{status.day}</span>
                                              <span className={`text-[8px] font-bold uppercase tracking-wider mt-1 ${status.status === 'standby' ? 'opacity-70' : 'opacity-90'}`}>{status.dayName}</span>
                                          </div>
                                      )
                                  })}
                              </div>
                          ))}
                      </div>
                  </td>

                  {/* Days Worked Total */}
                  <td className="px-4 py-4 text-center font-black text-emerald-700 bg-emerald-50/20 text-base border-x border-slate-100">
                     {row.daysWorked}
                  </td>
                  
                  {/* Dynamic Individual Shift Totals */}
                  {shifts.map(shift => (
                    <td key={shift.id} className="px-4 py-4 text-center font-bold text-slate-600 text-sm">
                       {row.shiftCounts[shift.id] > 0 ? (
                           <span className={`px-3 py-1 rounded-md ${shift.color} bg-opacity-20 shadow-sm border`}>
                               {row.shiftCounts[shift.id]}
                           </span>
                       ) : (
                           <span className="text-slate-300 font-medium">-</span>
                       )}
                    </td>
                  ))}

                  {/* Offs Total */}
                  <td className="px-4 py-4 text-center border-l border-slate-100">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-bold shadow-sm border ${row.totalOffs >= (viewMode === 'month' ? 8 : viewMode === 'week' ? 2 : 0) ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                         {row.totalOffs}
                      </span>
                  </td>
                  
                  {/* Leaves Total */}
                  <td className="px-4 py-4 text-center border-l border-slate-100">
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