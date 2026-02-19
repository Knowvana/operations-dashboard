import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Settings, Sun, Moon, Sunrise, Clock, Download, RefreshCw, AlertCircle, Plus, X, Grid, List, CalendarDays, ChevronLeft, ChevronRight, Trash2, User, BarChart3, CheckCircle2, CalendarX2, Info, ArrowLeft, Activity
} from 'lucide-react';

// --- Utility & Logic Functions ---
const INITIAL_SHIFTS = [
  { id: 'morning', label: 'Morning', time: '06:00 - 14:00', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', reqWeekday: 2, reqWeekend: 2 },
  { id: 'afternoon', label: 'Afternoon', time: '14:00 - 22:00', color: 'bg-blue-100 text-blue-800 border-blue-200', reqWeekday: 12, reqWeekend: 12 },
  { id: 'evening', label: 'Evening', time: '22:00 - 06:00', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', reqWeekday: 2, reqWeekend: 2 }
];

const COLORS = [
  { label: 'Yellow', value: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { label: 'Blue', value: 'bg-blue-100 text-blue-800 border-blue-200' },
  { label: 'Indigo', value: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { label: 'Green', value: 'bg-green-100 text-green-800 border-green-200' },
  { label: 'Red', value: 'bg-red-100 text-red-800 border-red-200' },
  { label: 'Purple', value: 'bg-purple-100 text-purple-800 border-purple-200' },
  { label: 'Pink', value: 'bg-pink-100 text-pink-800 border-pink-200' },
  { label: 'Gray', value: 'bg-gray-100 text-gray-800 border-gray-200' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const generateDummyEmployees = (count) => {
  const names = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi", "Ivan", "Judy", "Kevin", "Liam", "Mia", "Noah", "Olivia", "Peter", "Quinn", "Rachel", "Steve", "Tina", "Uma", "Victor", "Wendy", "Xavier", "Yara"];
  return Array.from({ length: count }, (_, i) => ({
    id: `emp-${i + 1}`,
    name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i/names.length) + 1}` : ''),
    role: 'Operator'
  }));
};

const getSafeDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const generateRoster = (employees, shifts, baseYear, baseMonth, leaves = []) => {
  const roster = {}; 
  const employeeStats = {}; 
  
  employees.forEach(emp => {
    employeeStats[emp.id] = { totalDaysWorked: 0, weekendDaysWorked: 0, weeklyDetails: {} };
  });

  const startDate = new Date(baseYear, baseMonth - 1, 1);
  const endDate = new Date(baseYear, baseMonth + 2, 0); 
  const shuffle = (array) => array.sort(() => Math.random() - 0.5);

  let currentLoopDate = new Date(startDate);

  while (currentLoopDate <= endDate) {
    const dateKey = getSafeDateKey(currentLoopDate);
    const dayOfWeek = currentLoopDate.getDay(); 
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const weekStart = new Date(currentLoopDate);
    weekStart.setDate(currentLoopDate.getDate() - dayOfWeek);
    const weekKey = getSafeDateKey(weekStart);

    roster[dateKey] = {};
    shifts.forEach(s => roster[dateKey][s.id] = []);

    for (const shift of shifts) {
      let needed = isWeekend ? shift.reqWeekend : shift.reqWeekday;
      
      let candidates = employees.filter(emp => {
        const isOnLeave = leaves.some(l => l.empId === emp.id && l.date === dateKey);
        if (isOnLeave) return false;

        const workedToday = roster[dateKey] && Object.values(roster[dateKey]).some(list => list.includes(emp.id));
        if (workedToday) return false;

        const daysWorkedThisWeek = employeeStats[emp.id].weeklyDetails[weekKey] || 0;
        if (daysWorkedThisWeek >= 5) return false;

        return true;
      });

      candidates = shuffle(candidates);
      candidates.sort((a, b) => {
        const statsA = employeeStats[a.id];
        const statsB = employeeStats[b.id];
        if (isWeekend) {
          if (statsA.weekendDaysWorked !== statsB.weekendDaysWorked) return statsA.weekendDaysWorked - statsB.weekendDaysWorked;
        }
        return statsA.totalDaysWorked - statsB.totalDaysWorked;
      });
      
      const chosen = candidates.slice(0, needed);

      chosen.forEach(worker => {
        roster[dateKey][shift.id].push(worker.id);
        employeeStats[worker.id].totalDaysWorked += 1;
        if (isWeekend) employeeStats[worker.id].weekendDaysWorked += 1;
        if (!employeeStats[worker.id].weeklyDetails[weekKey]) employeeStats[worker.id].weeklyDetails[weekKey] = 0;
        employeeStats[worker.id].weeklyDetails[weekKey] += 1;
      });
    }
    currentLoopDate.setDate(currentLoopDate.getDate() + 1);
  }
  return { roster, employeeStats };
};

const ShiftBadge = ({ shift, count, className = "" }) => {
  if (!shift) return null;
  const Icon = shift.id.includes('morning') ? Sunrise : (shift.id.includes('afternoon') ? Sun : (shift.id.includes('evening') || shift.id.includes('night') ? Moon : Clock));
  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-md border text-xs font-medium ${shift.color} ${className}`}>
      <Icon size={12} className="shrink-0" />
      <span className="truncate">{shift.label}</span>
      {count !== undefined && <span className="ml-auto bg-white/50 px-1.5 rounded-full text-[10px]">{count}</span>}
    </div>
  );
};

export default function ShiftRosterApp({ onSwitchModule }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [employees, setEmployees] = useState(generateDummyEmployees(25));
  const [shifts, setShifts] = useState(INITIAL_SHIFTS);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shifts.map(shift => {
          const workers = daySchedule[shift.id] || [];
          const required = isWeekend ? shift.reqWeekend : shift.reqWeekday;
          
          return (
            <div key={shift.id} className={`bg-white rounded-xl border ${shift.color.replace('bg-', 'border-').split(' ')[2]} shadow-sm overflow-hidden flex flex-col`}>
              <div className={`p-4 border-b flex justify-between items-center ${shift.color} bg-opacity-20`}>
                 <div>
                    <h3 className="font-bold text-lg">{shift.label}</h3>
                    <p className="text-xs opacity-70 font-mono">{shift.time}</p>
                 </div>
                 <div className="text-right">
                    <span className="text-2xl font-bold">{workers.length}</span>
                    <span className="text-sm opacity-70"> / {required}</span>
                 </div>
              </div>
              <div className="p-4 flex-1">
                {workers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {workers.map(empId => {
                      const emp = employees.find(e => e.id === empId);
                      return (
                        <div key={empId} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${shift.color.split(' ')[0].replace('100', '500')}`}>
                              {emp?.name.charAt(0)}
                           </div>
                           <span className="font-medium text-sm text-gray-800 truncate">{emp?.name || 'Unknown'}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-gray-400 italic text-sm">No assignments for this shift</div>
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
      <div className="space-y-4">
        {weekDays.map(dateObj => {
          const dateKey = getSafeDateKey(dateObj);
          const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
          const daySchedule = schedule?.[dateKey] || {};

          return (
            <div key={dateKey} className={`bg-white rounded-xl border ${isWeekend ? 'border-orange-200 bg-orange-50/20' : 'border-gray-200'} shadow-sm overflow-hidden`}>
              <div className={`px-4 py-3 border-b flex justify-between items-center ${isWeekend ? 'bg-orange-50/50' : 'bg-gray-50'}`}>
                <div className="flex items-baseline gap-2">
                    <span className={`text-lg font-bold ${isWeekend ? 'text-orange-800' : 'text-gray-800'}`}>{WEEKDAYS[dateObj.getDay()]}</span>
                    <span className="text-sm text-gray-500">{dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                {isWeekend && <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Weekend</span>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {shifts.map(shift => {
                  const workers = daySchedule[shift.id] || [];
                  return (
                    <div key={shift.id} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${shift.color.split(' ')[0]}`}></div>
                                {shift.label}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400">{workers.length} staff</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {workers.length > 0 ? workers.map(empId => {
                                const emp = employees.find(e => e.id === empId);
                                return <span key={empId} className={`text-[11px] px-2 py-1 rounded border ${shift.color} bg-opacity-30 whitespace-nowrap`}>{emp?.name}</span>
                            }) : <span className="text-[10px] text-gray-400 italic">Unstaffed</span>}
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
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {WEEKDAYS.map(d => <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr">
          {emptySlots.map((_, i) => <div key={`empty-${i}`} className="bg-gray-50/50 border-b border-r border-gray-100 min-h-[160px]"></div>)}
          {days.map(day => {
            const dateObj = new Date(year, month, day);
            const dateKey = getSafeDateKey(dateObj);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
            const daySchedule = schedule?.[dateKey] || {};
            
            return (
              <div key={day} className={`min-h-[160px] p-1.5 border-b border-r border-gray-100 flex flex-col ${isWeekend ? 'bg-orange-50/20' : ''}`}>
                <div className="flex justify-between items-start mb-1 px-1">
                   <span className={`text-sm font-semibold ${isWeekend ? 'text-orange-600' : 'text-gray-700'}`}>{day}</span>
                   {isWeekend && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1"></span>}
                </div>
                <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                  {shifts.map(shift => {
                    const workers = daySchedule[shift.id] || [];
                    if (workers.length === 0) return null;
                    return (
                      <div key={shift.id} className={`rounded border ${shift.color} bg-opacity-20 p-1`}>
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[9px] font-bold uppercase opacity-80 truncate">{shift.label}</span>
                            <span className="text-[8px] bg-white/60 px-1 rounded font-bold">{workers.length}</span>
                        </div>
                        <div className="text-[9px] leading-[1.1] text-gray-700 font-medium line-clamp-4 hover:line-clamp-none transition-all">
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
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
          <BarChart3 className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900">No Data Available</h3>
          <p className="text-gray-500">Generate a roster first to view compliance reports.</p>
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
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Monthly Compliance Report</h2>
            <p className="text-sm text-gray-500">Tracking working distribution and mandatory off days</p>
          </div>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-white rounded-md transition-colors"><ChevronLeft size={16} /></button>
            <span className="w-48 text-center font-semibold text-sm">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-white rounded-md transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>

        {excessCapacity > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-800">
                <Info className="shrink-0 mt-0.5 text-blue-600" size={18} />
                <div className="text-sm">
                    <strong>Capacity Notice:</strong> Your workforce provides <strong>{capacityPerWeek}</strong> shifts/week, but your roster only requires <strong>{slotsNeededPerWeek}</strong>. 
                    Because of this surplus, some employees will inevitably have more than 2 unassigned days. 
                    The first 2 unassigned days are marked as <span className="text-rose-600 font-bold border-b border-rose-300">Weekoff (Red)</span>. Any remaining unassigned days are marked as <span className="text-slate-600 font-bold border-b border-slate-300">Standby (Gray)</span>.
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CalendarDays size={20} /></div>
             <div><p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Worked</p><p className="text-[10px] text-gray-400">Scheduled (Grey on Weekends)</p></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600"><CheckCircle2 size={20} /></div>
             <div><p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Weekoff</p><p className="text-[10px] text-gray-400">Strictly 2 per week</p></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><CalendarX2 size={20} /></div>
             <div><p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Leave</p><p className="text-[10px] text-gray-400">Planned absence</p></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Users size={20} /></div>
             <div><p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Standby</p><p className="text-[10px] text-gray-400">Surplus staff capacity</p></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium sticky left-0 bg-gray-50 z-10 w-48 shadow-[1px_0_0_0_#e5e7eb]">Employee</th>
                  <th className="px-6 py-4 font-medium">Monthly Timeline Overview</th>
                  <th className="px-4 py-4 font-medium text-center">Worked</th>
                  <th className="px-4 py-4 font-medium text-center">Off</th>
                  <th className="px-4 py-4 font-medium text-center">Leave</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reportData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3 sticky left-0 bg-white z-10 w-48 shadow-[1px_0_0_0_#f3f4f6]">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 border border-blue-100">
                            {row.name.charAt(0)}
                        </div>
                        <span className="truncate">{row.name}</span>
                    </td>
                    <td className="px-6 py-3">
                        <div className="flex gap-4 overflow-x-auto custom-scrollbar items-center pb-1">
                            {row.weeks.map((week, wIdx) => (
                                <div key={wIdx} className={`flex gap-1.5 p-1.5 rounded-lg border ${wIdx % 2 === 0 ? 'bg-slate-50 border-slate-100' : 'bg-transparent border-transparent'}`}>
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
                                            <div key={status.day} title={`Day ${status.day} (${status.dayName}): ${status.status.toUpperCase()}`} className={`shrink-0 flex flex-col items-center justify-center w-8 h-10 rounded-md transition-all hover:scale-110 hover:z-10 cursor-default ${gradient}`}>
                                                <span className="text-[12px] font-bold leading-none">{status.day}</span>
                                                <span className={`text-[8px] uppercase tracking-wider mt-0.5 ${status.status === 'standby' ? 'opacity-70' : 'opacity-90'}`}>{status.dayName}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-gray-700">{row.daysWorked}</td>
                    <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold ${row.totalOffs >= 8 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{row.totalOffs}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                        {row.totalLeaves > 0 ? <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700">{row.totalLeaves}</span> : <span className="text-gray-300">-</span>}
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
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200">
            <Calendar size={20} />
          </div>
          <div>
             <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">OpsRoster</h1>
             <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-1">Planner Module</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
           <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Roster Planner
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Reports
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'config' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Configuration & Staff
          </button>
        </div>

        {/* Integration hook back to main app */}
        <div className="hidden md:block">
            <button 
                onClick={onSwitchModule}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
            >
                <Activity size={16}/> Back to Monitor
            </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        
        {generationError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <div>
              <h3 className="font-semibold">Generation Paused</h3>
              <p className="text-sm opacity-90">{generationError}</p>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full xl:w-auto">
                 <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setViewMode('day')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${viewMode === 'day' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}><List size={16} /> Daily</button>
                    <button onClick={() => setViewMode('week')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}><CalendarDays size={16} /> Weekly</button>
                    <button onClick={() => setViewMode('month')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}><Grid size={16} /> Monthly</button>
                 </div>
                 <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                    <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-white rounded-md transition-colors"><ChevronLeft size={16} /></button>
                    <span className="w-56 text-center font-semibold text-sm">{getDisplayDateRange()}</span>
                    <button onClick={() => navigateDate(1)} className="p-2 hover:bg-white rounded-md transition-colors"><ChevronRight size={16} /></button>
                 </div>
              </div>
              <div className="flex gap-3 w-full xl:w-auto">
                <button onClick={handleGenerate} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"><RefreshCw size={16} /> Regenerate</button>
                <button onClick={downloadCSV} disabled={!schedule} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"><Download size={16} /> Export CSV</button>
              </div>
            </div>

            {!schedule ? (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                <Users className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900">No Active Schedule</h3>
                <p className="text-gray-500">Check your configuration and click Regenerate to build the roster.</p>
              </div>
            ) : (
                <div className="animate-in fade-in duration-300">
                    {viewMode === 'day' && renderDailyView()}
                    {viewMode === 'week' && renderWeeklyView()}
                    {viewMode === 'month' && renderMonthlyGrid()}
                </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && renderReportingView()}

        {activeTab === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <Settings className="text-blue-600" size={20} />
                    <div><h2 className="text-lg font-semibold">Shift Parameters</h2><p className="text-xs text-gray-500">Define capacity requirements per shift</p></div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-12 gap-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <div className="col-span-5">Shift Details</div><div className="col-span-3 text-center">Weekday Req</div><div className="col-span-3 text-center">Weekend Req</div><div className="col-span-1"></div>
                    </div>
                    {shifts.map(shift => (
                      <div key={shift.id} className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white transition-colors">
                         <div className="col-span-5">
                           <ShiftBadge shift={shift} className="w-fit mb-1" />
                           <span className="text-[10px] text-gray-500 font-mono ml-1">{shift.time}</span>
                         </div>
                         <div className="col-span-3"><input type="number" min="0" value={shift.reqWeekday} onChange={(e) => updateShiftReq(shift.id, 'reqWeekday', e.target.value)} className="w-full text-center text-sm px-2 py-1.5 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                         <div className="col-span-3"><input type="number" min="0" value={shift.reqWeekend} onChange={(e) => updateShiftReq(shift.id, 'reqWeekend', e.target.value)} className="w-full text-center text-sm px-2 py-1.5 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                         <div className="col-span-1 flex justify-end"><button onClick={() => removeShift(shift.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={16} /></button></div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Add Custom Shift</h3>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                          <input type="text" placeholder="Shift Name" className="text-sm px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" value={newShift.label} onChange={e => setNewShift({...newShift, label: e.target.value})} />
                          <input type="text" placeholder="Time (e.g. 10:00-18:00)" className="text-sm px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" value={newShift.time} onChange={e => setNewShift({...newShift, time: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="relative"><label className="text-[10px] text-gray-500 absolute -top-2 left-2 bg-white px-1">Weekday Req</label><input type="number" min="0" placeholder="0" className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300" value={newShift.reqWeekday || ''} onChange={e => setNewShift({...newShift, reqWeekday: e.target.value})} /></div>
                          <div className="relative"><label className="text-[10px] text-gray-500 absolute -top-2 left-2 bg-white px-1">Weekend Req</label><input type="number" min="0" placeholder="0" className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300" value={newShift.reqWeekend || ''} onChange={e => setNewShift({...newShift, reqWeekend: e.target.value})} /></div>
                      </div>
                      <div className="flex gap-2 items-center mb-4">
                          <span className="text-xs text-gray-500 mr-2">Color:</span>
                          {COLORS.map(c => <button key={c.label} onClick={() => setNewShift({...newShift, color: c.value})} className={`w-6 h-6 rounded-full border-2 ${c.value.split(' ')[0]} ${newShift.color === c.value ? 'border-gray-900 scale-110' : 'border-transparent'}`} title={c.label} />)}
                      </div>
                      <button onClick={addShift} disabled={!newShift.label || !newShift.time} className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-50 transition-colors">Add to Roster Template</button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarX2 className="text-amber-500" size={20} />
                        <div><h2 className="text-lg font-semibold">Planned Leaves</h2><p className="text-xs text-gray-500">Exempt employees from scheduling</p></div>
                    </div>
                    <div className="flex gap-2 mb-4">
                        <select className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-300 bg-white" value={newLeave.empId} onChange={e => setNewLeave({...newLeave, empId: e.target.value})}>
                            <option value="">Select Employee...</option>
                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                        </select>
                        <input type="date" className="w-40 text-sm px-3 py-2 rounded-lg border border-gray-300" value={newLeave.date} onChange={e => setNewLeave({...newLeave, date: e.target.value})} />
                        <button onClick={addLeave} disabled={!newLeave.empId || !newLeave.date} className="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50">Add</button>
                    </div>
                    {leaves.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {leaves.map(leave => {
                                const empName = employees.find(e => e.id === leave.empId)?.name || 'Unknown';
                                return (
                                    <div key={leave.id} className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-100">
                                        <div className="text-sm font-medium text-amber-900">{empName}</div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs bg-white px-2 py-1 rounded text-amber-700 shadow-sm">{leave.date}</span>
                                            <button onClick={() => removeLeave(leave.id)} className="text-amber-400 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg text-gray-400 text-sm italic">No upcoming leaves registered.</div>}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
              <div className="p-6 border-b border-gray-200">
                 <div className="flex items-center gap-2 mb-1"><Users className="text-blue-600" size={20} /><h2 className="text-lg font-semibold">Resource Pool</h2></div>
                 <p className="text-xs text-gray-500">Currently managing {employees.length} active resources</p>
              </div>
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex gap-2">
                  <input type="text" value={newEmployeeName} onChange={(e) => setNewEmployeeName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addEmployee()} placeholder="Enter new employee name..." className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={addEmployee} disabled={!newEmployeeName.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"><Plus size={18} /> Add</button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-2">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 sticky top-0">
                    <tr><th className="px-4 py-3 font-medium rounded-l-lg">Name</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium text-right rounded-r-lg">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-gray-50 group">
                        <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">{emp.name.charAt(0)}</div>{emp.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{emp.role}</td>
                        <td className="px-4 py-3 text-right"><button onClick={() => removeEmployee(emp.id)} className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button></td>
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