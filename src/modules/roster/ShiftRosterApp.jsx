import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Settings, Sun, Moon, Sunrise, Clock, Download, RefreshCw, AlertCircle, Plus, X, Grid, List, CalendarDays, ChevronLeft, ChevronRight, Trash2, User, BarChart3, CheckCircle2, CalendarX2, Info, ArrowLeft, Activity
} from 'lucide-react';

// Imported Modular Logic & Data
import rosterDefaults from '../../data/rosterDefaults.json';
import { COLORS, WEEKDAYS } from './utils/rosterConstants';
import { getSafeDateKey, generateRoster } from './utils/rosterUtils';

// Sub-Component
const ShiftBadge = ({ shift, count, className = "" }) => {
  if (!shift) return null;
  const Icon = shift.id.includes('morning') ? Sunrise : (shift.id.includes('afternoon') ? Sun : (shift.id.includes('evening') || shift.id.includes('night') ? Moon : Clock));
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${shift.color} ${className}`}>
      <Icon size={14} className="shrink-0" />
      <span className="truncate">{shift.label}</span>
      {count !== undefined && <span className="ml-auto bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold">{count}</span>}
    </div>
  );
};

export default function ShiftRosterApp({ onSwitchModule }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Initialize from our JSON defaults
  const [employees, setEmployees] = useState(rosterDefaults.initialEmployees);
  const [shifts, setShifts] = useState(rosterDefaults.initialShifts);
  
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newShift, setNewShift] = useState({ label: '', time: '', color: COLORS[0].value, reqWeekday: 0, reqWeekend: 0 });
  const [leaves, setLeaves] = useState([]);
  const [newLeave, setNewLeave] = useState({ empId: '', date: '' });

  const [schedule, setSchedule] = useState(null);
  const [stats, setStats] = useState(null);
  const [generationError, setGenerationError] = useState(null);

  useEffect(() => { handleGenerate(); }, [currentDate.getMonth(), currentDate.getFullYear()]); 

  const handleGenerate = () => {
    const slotsNeededPerWeek = shifts.reduce((sum, shift) => sum + (shift.reqWeekday * 5) + (shift.reqWeekend * 2), 0);
    const capacityPerWeek = employees.length * 5;

    if (slotsNeededPerWeek > capacityPerWeek) {
      setGenerationError(`Capacity Issue: Your shift setup requires ${slotsNeededPerWeek} slots/week, but ${employees.length} staff can only cover ${capacityPerWeek} slots. Please add more staff or reduce shift requirements.`);
      setSchedule(null);
      setStats(null);
      return;
    }

    setGenerationError(null);
    const { roster, employeeStats } = generateRoster(employees, shifts, currentDate.getFullYear(), currentDate.getMonth(), leaves);
    setSchedule(roster);
    setStats(employeeStats);
  };

  const navigateDate = (delta) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + delta);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + (delta * 7));
    else newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const getDisplayDateRange = () => {
    if (viewMode === 'day') return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    else if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const addEmployee = () => {
    if (!newEmployeeName.trim()) return;
    const newEmp = { id: `emp-${Date.now()}`, name: newEmployeeName, role: 'Operator' };
    setEmployees([...employees, newEmp]);
    setNewEmployeeName('');
  };

  const removeEmployee = (id) => setEmployees(employees.filter(e => e.id !== id));

  const addShift = () => {
    if (!newShift.label || !newShift.time) return;
    const id = newShift.label.toLowerCase().replace(/\s+/g, '-');
    setShifts([...shifts, { ...newShift, id, reqWeekday: Number(newShift.reqWeekday), reqWeekend: Number(newShift.reqWeekend) }]);
    setNewShift({ label: '', time: '', color: COLORS[0].value, reqWeekday: 0, reqWeekend: 0 });
  };

  const removeShift = (id) => { if (shifts.length > 1) setShifts(shifts.filter(s => s.id !== id)); };

  const addLeave = () => {
    if (!newLeave.empId || !newLeave.date) return;
    setLeaves([...leaves, { ...newLeave, id: Date.now().toString() }]);
    setNewLeave({ empId: '', date: '' });
  };

  const removeLeave = (id) => setLeaves(leaves.filter(l => l.id !== id));
  const updateShiftReq = (id, field, value) => setShifts(shifts.map(s => s.id === id ? { ...s, [field]: Number(value) } : s));

  const downloadCSV = () => {
    if (!schedule) return;
    let csvContent = "data:text/csv;charset=utf-8,Date,Day,Shift,Time,Employee\n";
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateKey = getSafeDateKey(d);
      shifts.forEach(shift => {
        const workerIds = schedule[dateKey]?.[shift.id] || [];
        workerIds.forEach(id => {
          const emp = employees.find(e => e.id === id);
          if (emp) csvContent += `${dateKey},${WEEKDAYS[d.getDay()]},${shift.label},${shift.time},${emp.name}\n`;
        });
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Roster_${currentDate.toISOString().slice(0,7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navigateMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const renderDailyView = () => {
    const dateKey = getSafeDateKey(currentDate);
    const daySchedule = schedule?.[dateKey] || {};
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {shifts.map(shift => {
          const workers = daySchedule[shift.id] || [];
          const required = isWeekend ? shift.reqWeekend : shift.reqWeekday;
          
          return (
            <div key={shift.id} className={`bg-white rounded-2xl border ${shift.color.replace('bg-', 'border-').split(' ')[2]} shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md`}>
              <div className={`p-5 border-b flex justify-between items-center ${shift.color} bg-opacity-20`}>
                 <div>
                    <h3 className="font-extrabold text-xl tracking-tight">{shift.label}</h3>
                    <p className="text-sm opacity-80 font-mono mt-0.5">{shift.time}</p>
                 </div>
                 <div className="text-right flex flex-col items-end">
                    <span className="text-3xl font-black tracking-tighter leading-none">{workers.length}</span>
                    <span className="text-sm font-medium opacity-80 mt-1">/ {required} Required</span>
                 </div>
              </div>
              <div className="p-5 flex-1 bg-slate-50/30">
                {workers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {workers.map(empId => {
                      const emp = employees.find(e => e.id === empId);
                      return (
                        <div key={empId} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner ${shift.color.split(' ')[0].replace('100', '500')}`}>
                              {emp?.name.charAt(0)}
                           </div>
                           <span className="font-semibold text-slate-800 truncate">{emp?.name || 'Unknown'}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-slate-400 italic font-medium bg-white rounded-xl border border-dashed border-slate-200">No assignments for this shift</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    );
  };

  const renderWeeklyView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push(d);
    }

    return (
      <div className="space-y-6">
        {weekDays.map(dateObj => {
          const dateKey = getSafeDateKey(dateObj);
          const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
          const daySchedule = schedule?.[dateKey] || {};

          return (
            <div key={dateKey} className={`bg-white rounded-2xl border ${isWeekend ? 'border-orange-200 bg-orange-50/10' : 'border-slate-200'} shadow-sm overflow-hidden transition-all hover:shadow-md`}>
              <div className={`px-6 py-4 border-b flex justify-between items-center ${isWeekend ? 'bg-orange-50/40' : 'bg-slate-50/50'}`}>
                <div className="flex items-baseline gap-3">
                    <span className={`text-xl font-extrabold tracking-tight ${isWeekend ? 'text-orange-800' : 'text-slate-800'}`}>{WEEKDAYS[dateObj.getDay()]}</span>
                    <span className="text-sm font-medium text-slate-500">{dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                {isWeekend && <span className="text-xs uppercase font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-full tracking-wider border border-orange-200">Weekend</span>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {shifts.map(shift => {
                  const workers = daySchedule[shift.id] || [];
                  return (
                    <div key={shift.id} className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full shadow-sm ${shift.color.split(' ')[0].replace('100', '400')}`}></div>
                                {shift.label}
                            </span>
                            <span className="text-xs font-mono font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{workers.length} staff</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {workers.length > 0 ? workers.map(empId => {
                                const emp = employees.find(e => e.id === empId);
                                return <span key={empId} className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${shift.color} bg-opacity-30 whitespace-nowrap shadow-sm`}>{emp?.name}</span>
                            }) : <span className="text-xs text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-dashed border-slate-200">Unstaffed</span>}
                        </div>
                    </div>
                  )
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthlyGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    
    const emptySlots = Array.from({ length: firstDayOfMonth });
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
          {WEEKDAYS.map(d => <div key={d} className="py-4 text-center text-sm font-bold text-slate-500 uppercase tracking-widest">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr">
          {emptySlots.map((_, i) => <div key={`empty-${i}`} className="bg-slate-50/30 border-b border-r border-slate-100 min-h-[180px]"></div>)}
          {days.map(day => {
            const dateObj = new Date(year, month, day);
            const dateKey = getSafeDateKey(dateObj);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
            const daySchedule = schedule?.[dateKey] || {};
            
            return (
              <div key={day} className={`min-h-[180px] p-2.5 border-b border-r border-slate-100 flex flex-col transition-colors hover:bg-slate-50/50 ${isWeekend ? 'bg-orange-50/10' : ''}`}>
                <div className="flex justify-between items-start mb-2 px-1">
                   <span className={`text-base font-bold ${isWeekend ? 'text-orange-600' : 'text-slate-700'}`}>{day}</span>
                   {isWeekend && <span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shadow-sm"></span>}
                </div>
                <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                  {shifts.map(shift => {
                    const workers = daySchedule[shift.id] || [];
                    if (workers.length === 0) return null;
                    return (
                      <div key={shift.id} className={`rounded-lg border ${shift.color} bg-opacity-20 p-2 shadow-sm`}>
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-extrabold uppercase opacity-80 tracking-wider truncate">{shift.label}</span>
                            <span className="text-[10px] bg-white/80 px-1.5 rounded-md font-bold shadow-sm">{workers.length}</span>
                        </div>
                        <div className="text-xs leading-tight text-slate-700 font-medium line-clamp-3 hover:line-clamp-none transition-all">
                            {workers.map(eid => employees.find(e => e.id === eid)?.name).join(', ')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderReportingView = () => {
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
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Full Width Nav inside a wrapper */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="w-full max-w-[1800px] mx-auto px-6 md:px-10 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <Calendar size={22} />
              </div>
              <div>
                 <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 leading-none">OpsRoster</h1>
                 <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Planner Module</p>
              </div>
            </div>
            
            <div className="flex bg-slate-100 p-1.5 rounded-xl w-full md:w-auto shadow-inner border border-slate-200/60">
               <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Roster Planner
              </button>
              <button 
                onClick={() => setActiveTab('reports')}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Reports
              </button>
              <button 
                onClick={() => setActiveTab('config')}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'config' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Configuration & Staff
              </button>
            </div>

            {/* Integration hook back to main app */}
            <div className="hidden md:block">
                <button 
                    onClick={onSwitchModule}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 active:scale-95 shadow-lg shadow-slate-800/20 transition-all"
                >
                    <Activity size={18}/> Back to Monitor
                </button>
            </div>
        </div>
      </nav>

      {/* Full Width Main Wrapper */}
      <main className="w-full max-w-[1800px] mx-auto p-6 md:p-8 lg:p-10 flex-1">
        
        {generationError && (
          <div className="mb-8 p-5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-4 text-rose-700 shadow-sm animate-in fade-in">
            <AlertCircle className="shrink-0 mt-0.5" size={24} />
            <div>
              <h3 className="font-bold text-lg mb-1">Generation Paused</h3>
              <p className="text-sm font-medium">{generationError}</p>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full xl:w-auto">
                 <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 shadow-inner">
                    <button onClick={() => setViewMode('day')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'day' ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}><List size={18} /> Daily</button>
                    <button onClick={() => setViewMode('week')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}><CalendarDays size={18} /> Weekly</button>
                    <button onClick={() => setViewMode('month')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-blue-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}><Grid size={18} /> Monthly</button>
                 </div>
                 <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-sm">
                    <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronLeft size={18} /></button>
                    <span className="w-64 text-center font-bold text-slate-700 text-sm">{getDisplayDateRange()}</span>
                    <button onClick={() => navigateDate(1)} className="p-2 hover:bg-white rounded-lg transition-colors"><ChevronRight size={18} /></button>
                 </div>
              </div>
              <div className="flex gap-4 w-full xl:w-auto">
                <button onClick={handleGenerate} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all"><RefreshCw size={18} /> Regenerate</button>
                <button onClick={downloadCSV} disabled={!schedule} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all disabled:opacity-50"><Download size={18} /> Export CSV</button>
              </div>
            </div>

            {!schedule ? (
              <div className="text-center py-32 bg-white rounded-3xl border-2 border-slate-200 border-dashed animate-in fade-in">
                <Users className="mx-auto text-slate-300 mb-6" size={64} />
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">No Active Schedule</h3>
                <p className="text-slate-500 font-medium">Check your configuration and click Regenerate to build the roster.</p>
              </div>
            ) : (
                <div className="animate-in fade-in duration-500">
                    {viewMode === 'day' && renderDailyView()}
                    {viewMode === 'week' && renderWeeklyView()}
                    {viewMode === 'month' && renderMonthlyGrid()}
                </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && renderReportingView()}

        {activeTab === 'config' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 animate-in fade-in duration-300">
            <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Settings size={24} /></div>
                    <div><h2 className="text-xl font-extrabold text-slate-800">Shift Parameters</h2><p className="text-sm text-slate-500 font-medium">Define capacity requirements per shift</p></div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-12 gap-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <div className="col-span-5">Shift Details</div><div className="col-span-3 text-center">Weekday Req</div><div className="col-span-3 text-center">Weekend Req</div><div className="col-span-1"></div>
                    </div>
                    {shifts.map(shift => (
                      <div key={shift.id} className="grid grid-cols-12 gap-4 items-center p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                         <div className="col-span-5">
                           <ShiftBadge shift={shift} className="w-fit mb-1.5" />
                           <span className="text-[11px] font-bold text-slate-400 font-mono ml-1">{shift.time}</span>
                         </div>
                         <div className="col-span-3"><input type="number" min="0" value={shift.reqWeekday} onChange={(e) => updateShiftReq(shift.id, 'reqWeekday', e.target.value)} className="w-full text-center text-sm font-bold px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                         <div className="col-span-3"><input type="number" min="0" value={shift.reqWeekend} onChange={(e) => updateShiftReq(shift.id, 'reqWeekend', e.target.value)} className="w-full text-center text-sm font-bold px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                         <div className="col-span-1 flex justify-end"><button onClick={() => removeShift(shift.id)} className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button></div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100">
                      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus size={16} className="text-blue-600"/> Add Custom Shift</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                          <input type="text" placeholder="Shift Name" className="text-sm font-medium px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" value={newShift.label} onChange={e => setNewShift({...newShift, label: e.target.value})} />
                          <input type="text" placeholder="Time (e.g. 10:00-18:00)" className="text-sm font-mono px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" value={newShift.time} onChange={e => setNewShift({...newShift, time: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="relative"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute -top-2 left-3 bg-white px-2">Weekday Req</label><input type="number" min="0" placeholder="0" className="w-full font-bold text-sm px-4 py-3 rounded-xl border border-slate-200" value={newShift.reqWeekday || ''} onChange={e => setNewShift({...newShift, reqWeekday: e.target.value})} /></div>
                          <div className="relative"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute -top-2 left-3 bg-white px-2">Weekend Req</label><input type="number" min="0" placeholder="0" className="w-full font-bold text-sm px-4 py-3 rounded-xl border border-slate-200" value={newShift.reqWeekend || ''} onChange={e => setNewShift({...newShift, reqWeekend: e.target.value})} /></div>
                      </div>
                      <div className="flex gap-3 items-center mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wider">Color:</span>
                          {COLORS.map(c => <button key={c.label} onClick={() => setNewShift({...newShift, color: c.value})} className={`w-8 h-8 rounded-full border-2 shadow-sm ${c.value.split(' ')[0]} ${newShift.color === c.value ? 'border-slate-800 scale-110 ring-4 ring-slate-200' : 'border-transparent'}`} title={c.label} />)}
                      </div>
                      <button onClick={addShift} disabled={!newShift.label || !newShift.time} className="w-full py-3.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 disabled:opacity-50 transition-colors shadow-lg shadow-slate-800/20">Add to Roster Template</button>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><CalendarX2 size={24} /></div>
                        <div><h2 className="text-xl font-extrabold text-slate-800">Planned Leaves</h2><p className="text-sm font-medium text-slate-500">Exempt employees from scheduling</p></div>
                    </div>
                    <div className="flex gap-3 mb-6">
                        <select className="flex-1 text-sm font-medium px-4 py-3 rounded-xl border border-slate-200 bg-white" value={newLeave.empId} onChange={e => setNewLeave({...newLeave, empId: e.target.value})}>
                            <option value="">Select Employee...</option>
                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                        </select>
                        <input type="date" className="w-48 text-sm font-medium px-4 py-3 rounded-xl border border-slate-200" value={newLeave.date} onChange={e => setNewLeave({...newLeave, date: e.target.value})} />
                        <button onClick={addLeave} disabled={!newLeave.empId || !newLeave.date} className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 disabled:opacity-50 shadow-lg shadow-amber-500/20 transition-all">Add</button>
                    </div>
                    {leaves.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {leaves.map(leave => {
                                const empName = employees.find(e => e.id === leave.empId)?.name || 'Unknown';
                                return (
                                    <div key={leave.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100 hover:shadow-sm transition-shadow">
                                        <div className="text-sm font-bold text-amber-900">{empName}</div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-mono font-bold bg-white px-3 py-1.5 rounded-lg text-amber-700 shadow-sm border border-amber-100">{leave.date}</span>
                                            <button onClick={() => removeLeave(leave.id)} className="text-amber-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-medium">No upcoming leaves registered.</div>}
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full max-h-[1000px]">
              <div className="p-8 border-b border-slate-200">
                 <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-800">Resource Pool</h2>
                        <p className="text-sm font-medium text-slate-500">Currently managing <span className="font-bold text-slate-800">{employees.length}</span> active resources</p>
                    </div>
                 </div>
              </div>
              <div className="p-6 bg-slate-50/50 border-b border-slate-200 shrink-0">
                <div className="flex gap-3">
                  <input type="text" value={newEmployeeName} onChange={(e) => setNewEmployeeName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addEmployee()} placeholder="Enter new employee name..." className="flex-1 px-5 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm" />
                  <button onClick={addEmployee} disabled={!newEmployeeName.trim()} className="bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"><Plus size={18} /> Add User</button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10">
                    <tr><th className="px-6 py-4 font-bold uppercase tracking-wider rounded-l-xl">Name</th><th className="px-6 py-4 font-bold uppercase tracking-wider">Role</th><th className="px-6 py-4 font-bold uppercase tracking-wider text-right rounded-r-xl">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50/80 group transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center text-sm font-black shadow-inner border border-blue-200/50">{emp.name.charAt(0)}</div>{emp.name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{emp.role}</td>
                        <td className="px-6 py-4 text-right"><button onClick={() => removeEmployee(emp.id)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}