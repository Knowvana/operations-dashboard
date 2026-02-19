import React from 'react';
import { 
  List, CalendarDays, Grid, ChevronLeft, ChevronRight, 
  RefreshCw, Download, Users, AlertCircle, Sun, Moon, Sunrise, Clock 
} from 'lucide-react';
import { getSafeDateKey } from '../utils/rosterUtils';
import { WEEKDAYS } from '../utils/rosterConstants';

// Shared Badge Component
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

export default function RosterDashboard({
  schedule, employees, shifts, viewMode, setViewMode,
  currentDate, navigateDate, getDisplayDateRange,
  handleGenerate, downloadCSV, generationError
}) {

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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {generationError && (
        <div className="mb-8 p-5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-4 text-rose-700 shadow-sm animate-in fade-in">
          <AlertCircle className="shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-lg mb-1">Generation Paused</h3>
            <p className="text-sm font-medium">{generationError}</p>
          </div>
        </div>
      )}

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
  );
}