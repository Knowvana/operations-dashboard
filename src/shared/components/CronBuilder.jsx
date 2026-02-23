import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Clock, Layers, HelpCircle } from 'lucide-react';

// --- UTILITY: Robust Cron Translator ---
export const getCronDescription = (cronString) => {
  if (!cronString) return 'No schedule set';
  const parts = cronString.trim().split(/\s+/);
  if (parts.length < 5) return 'Invalid Cron Format';
  
  const [min, hour, day, month, weekday] = parts;
  
  const formatTime = (h, m) => {
    if (h === '*' || m === '*' || h.includes('/') || m.includes('/')) return null;
    try {
      const d = new Date();
      d.setHours(parseInt(h), parseInt(m));
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (e) { return null; }
  };

  const timeStr = formatTime(hour, min);
  const timeText = timeStr ? `At ${timeStr}` : 'Runs periodically';
  const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthsMap = [null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  try {
    if (day === '*' && month === '*' && weekday === '*') return timeStr ? `Daily at ${timeStr}` : 'Runs every minute';
    if (day === '*' && month === '*' && weekday !== '*') {
      const dayNames = weekday.split(',').map(d => daysMap[parseInt(d)] || d).join(', ');
      return `${timeText} on ${dayNames}`;
    }
    if (day !== '*' && month === '*' && weekday === '*') return `${timeText} on day ${day} of the month`;

    let desc = timeText;
    if (day !== '*') desc += ` on day ${day}`;
    if (weekday !== '*') {
      const dayNames = weekday.split(',').map(d => daysMap[parseInt(d)] || d).join(', ');
      desc += day !== '*' ? ` and on ${dayNames}` : ` on ${dayNames}`;
    }
    if (month !== '*') {
      const monthName = monthsMap[parseInt(month)] || month;
      desc += ` in ${monthName}`;
    }
    return desc;
  } catch (e) {
    return `Custom: ${cronString}`;
  }
};

// --- HELPER: Validator ---
const validateSegment = (val, max) => {
  if (val === '' || val === '*') return true;
  if (!/^[0-9\*\,\-\/]+$/.test(val)) return false;
  if (/^\d+$/.test(val)) {
    const num = parseInt(val, 10);
    return num >= 0 && num <= max;
  }
  return true;
};

// --- COMPONENT ---
export default function CronBuilder({ value, onChange }) {
  // Single source of truth for the component
  const [cron, setCron] = useState(value || '0 9 * * *');
  const [activeTab, setActiveTab] = useState('daily');
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Initialize from external value ONCE (solves default value issue)
  useEffect(() => {
    if (value && !isInitialized) {
      setCron(value);
      const parts = value.trim().split(/\s+/);
      if (parts.length >= 5) {
        const [min, hour, day, month, week] = parts;
        if (day === '*' && month === '*' && week === '*' && !min.includes('/')) setActiveTab('daily');
        else if (day === '*' && month === '*' && week !== '*') setActiveTab('weekly');
        else if (day !== '*' && month === '*' && week === '*') setActiveTab('monthly');
        else setActiveTab('custom');
      }
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // 2. Parse current cron into discrete pieces
  const parts = cron.trim().split(/\s+/);
  const [min = '0', hour = '9', day = '*', month = '*', week = '*'] = parts.length >= 5 ? parts : ['0','9','*','*','*'];

  // 3. Derived UI States (always synchronized with the cron string)
  const time = useMemo(() => {
    if (!min.includes('*') && !min.includes('/') && !hour.includes('*') && !hour.includes('/')) {
      const h = parseInt(hour);
      const m = parseInt(min);
      if (!isNaN(h) && !isNaN(m)) return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
    }
    return '09:00'; // Fallback for invalid/custom strings
  }, [min, hour]);

  const selectedDays = useMemo(() => {
    if (week !== '*' && !week.includes('-') && !week.includes('/')) {
      return week.split(',').map(Number).filter(n => !isNaN(n));
    }
    return [1]; // Fallback to Monday
  }, [week]);

  const dayOfMonth = useMemo(() => {
    if (day !== '*' && !day.includes('*') && !day.includes('/')) {
      const d = parseInt(day);
      if (!isNaN(d)) return d;
    }
    return 1;
  }, [day]);

  // 4. Expose changes up to parent
  useEffect(() => {
    if (isInitialized) {
      const label = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      onChange({ cron, frequency: label, plannedStart: time });
    }
  }, [cron, activeTab, isInitialized]);

  // 5. Handlers updating the single source of truth (Cron String)
  const updateCron = (newMin, newHour, newDay, newMonth, newWeek) => {
    setCron(`${newMin} ${newHour} ${newDay} ${newMonth} ${newWeek}`);
  };

  const handleTimeChange = (e) => {
    const [h, m] = e.target.value.split(':');
    const hStr = parseInt(h).toString();
    const mStr = parseInt(m).toString();

    // Respect active tab when syncing time
    if (activeTab === 'daily') updateCron(mStr, hStr, '*', '*', '*');
    else if (activeTab === 'weekly') updateCron(mStr, hStr, '*', '*', week !== '*' ? week : '1');
    else if (activeTab === 'monthly') updateCron(mStr, hStr, day !== '*' ? day : '1', '*', '*');
    else updateCron(mStr, hStr, day, month, week);
  };

  const handleDayToggle = (dayIndex) => {
    const newDays = selectedDays.includes(dayIndex) ? selectedDays.filter(d => d !== dayIndex) : [...selectedDays, dayIndex];
    const newWeekStr = newDays.length ? newDays.sort().join(',') : '*';
    updateCron(min, hour, '*', '*', newWeekStr);
  };

  const handleMonthDayChange = (val) => {
    updateCron(min, hour, val.toString(), '*', '*');
  };

  const handleCustomSegmentChange = (field, val, max) => {
    if (!validateSegment(val, max)) return;
    const c = { min, hour, day, month, week, [field]: val };
    updateCron(c.min, c.hour, c.day, c.month, c.week);
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    // Align internal cron logic to the new active tab without destroying the time variable
    if (newTab === 'daily') updateCron(min, hour, '*', '*', '*');
    else if (newTab === 'weekly') updateCron(min, hour, '*', '*', selectedDays.length ? selectedDays.sort().join(',') : '1');
    else if (newTab === 'monthly') updateCron(min, hour, dayOfMonth.toString(), '*', '*');
    // If setting custom, we do absolutely nothing, leaving it exactly as is!
  };

  const TabButton = ({ id, label }) => (
    <button
      onClick={(e) => { e.preventDefault(); handleTabChange(id); }}
      className={`relative z-10 flex-1 py-2.5 text-sm font-bold transition-colors duration-300 ${
        activeTab === id ? 'text-teal-700' : 'text-slate-500 hover:text-teal-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      
      {/* 1. Visually Appealing Toggle */}
      <div className="relative bg-slate-50 p-1.5 rounded-2xl flex shadow-inner border border-slate-200/60">
        <div 
          className="absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-md shadow-teal-500/10 border border-slate-100 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            left: '6px', width: 'calc(25% - 9px)',
            transform: `translateX(${['daily', 'weekly', 'monthly', 'custom'].indexOf(activeTab) * 100}%)`
          }}
        />
        <TabButton id="daily" label="Daily" />
        <TabButton id="weekly" label="Weekly" />
        <TabButton id="monthly" label="Monthly" />
        <TabButton id="custom" label="Custom" />
      </div>

      {/* 2. Content Area */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm transition-all duration-300 flex flex-col justify-center relative overflow-hidden">
        
        {/* TIME PICKER (Common) */}
        {activeTab !== 'custom' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-10">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Time of Execution</label>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-teal-500 group-focus-within:text-teal-600 transition-colors">
                <Clock size={18} />
              </div>
              <input 
                type="time" 
                value={time} 
                onChange={handleTimeChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono font-bold text-slate-700 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 shadow-sm transition-all cursor-pointer"
              />
            </div>
            
            {/* WEEKLY */}
            {activeTab === 'weekly' && (
               <div className="mt-5 pt-4 border-t border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Active Days</label>
                  <div className="flex justify-between gap-1.5">
                    {['S','M','T','W','T','F','S'].map((d, i) => (
                      <button 
                        key={i}
                        onClick={(e) => { e.preventDefault(); handleDayToggle(i); }}
                        className={`h-9 w-9 rounded-lg text-sm font-bold transition-all duration-200 ${
                          selectedDays.includes(i) 
                            ? 'bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-md shadow-emerald-500/20 scale-105' 
                            : 'bg-slate-50 border border-slate-200 text-slate-400 hover:border-teal-300 hover:text-teal-600'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
               </div>
            )}
            
            {/* MONTHLY */}
            {activeTab === 'monthly' && (
               <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Day of Month</label>
                    <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">Day {dayOfMonth}</span>
                  </div>
                  <input 
                     type="range" min="1" max="31" 
                     value={dayOfMonth} 
                     onChange={e => handleMonthDayChange(Number(e.target.value))}
                     className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  {dayOfMonth > 28 && (
                     <p className="text-[10px] text-amber-600 mt-3 font-medium bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 flex items-center gap-2">
                        <AlertCircle size={14} className="shrink-0"/> 
                        Note: Skips months with fewer than {dayOfMonth} days.
                     </p>
                  )}
               </div>
            )}
          </div>
        )}

        {/* CUSTOM */}
        {activeTab === 'custom' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-10">
             <div className="flex items-center gap-2 mb-4">
                <Layers size={14} className="text-teal-500" />
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cron Composition</label>
             </div>
             
             <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'min', label: 'Min', max: 59, val: min },
                  { id: 'hour', label: 'Hour', max: 23, val: hour },
                  { id: 'day', label: 'Day', max: 31, val: day },
                  { id: 'month', label: 'Month', max: 12, val: month },
                  { id: 'week', label: 'Week', max: 6, val: week }
                ].map((field) => (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <input 
                      value={field.val}
                      onChange={e => handleCustomSegmentChange(field.id, e.target.value, field.max)}
                      className="w-full text-center py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-mono font-bold text-slate-700 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm placeholder:font-normal placeholder:text-slate-300"
                      placeholder="*"
                    />
                    <span className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">{field.label}</span>
                  </div>
                ))}
             </div>
             
             <div className="mt-4 flex gap-2 text-[10px] text-slate-500 bg-teal-50/50 p-2.5 rounded-lg border border-teal-100/50 leading-tight">
               <HelpCircle size={14} className="shrink-0 text-teal-500" />
               <p>Allowed chars: Numbers, <code className="font-bold text-teal-700">*</code>, <code className="font-bold text-teal-700">,</code> (list), <code className="font-bold text-teal-700">-</code> (range), <code className="font-bold text-teal-700">/</code> (step)</p>
             </div>
          </div>
        )}
      </div>

      {/* 3. Beautiful Live Preview */}
      <div className={`rounded-xl p-3 flex gap-3 items-center transition-all duration-500 border ${
        getCronDescription(cron) === 'Invalid Cron Format'
          ? 'bg-rose-50 border-rose-100'
          : 'bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-100'
      }`}>
        <div className={`p-1.5 rounded-lg ${getCronDescription(cron) === 'Invalid Cron Format' ? 'bg-rose-100 text-rose-500' : 'bg-white text-teal-600 shadow-sm'}`}>
          {getCronDescription(cron) === 'Invalid Cron Format' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
        </div>
        <div>
           <p className={`text-xs font-bold ${
             getCronDescription(cron) === 'Invalid Cron Format' ? 'text-rose-700' : 'text-slate-800'
           }`}>
             {getCronDescription(cron)}
           </p>
           <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
             Generated: <span className="font-mono text-teal-600">{cron}</span>
           </p>
        </div>
      </div>

    </div>
  );
}