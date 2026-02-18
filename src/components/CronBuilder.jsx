import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Calendar, Clock, Hash, Layers, HelpCircle } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('daily');
  const [time, setTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState([1, 3, 5]);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [customSegments, setCustomSegments] = useState({ min: '0', hour: '9', day: '*', month: '*', week: '*' });

  useEffect(() => {
    if (!value) return;
    const parts = value.trim().split(/\s+/);
    if (parts.length < 5) return;
    const [min, hour, day, month, week] = parts;
    
    if (!min.includes('*') && !min.includes('/') && !hour.includes('*') && !hour.includes('/')) {
       setTime(`${hour.padStart(2,'0')}:${min.padStart(2,'0')}`);
    }
    setCustomSegments({ min, hour, day, month, week });

    if (day === '*' && month === '*' && week === '*' && !min.includes('/')) setActiveTab('daily');
    else if (day === '*' && month === '*' && week !== '*') {
      setActiveTab('weekly');
      if (!week.includes('-') && !week.includes('/')) {
         const days = week.split(',').map(Number).filter(n => !isNaN(n));
         if (days.length > 0) setSelectedDays(days);
      }
    }
    else if (day !== '*' && month === '*' && week === '*') {
      setActiveTab('monthly');
      setDayOfMonth(parseInt(day) || 1);
    }
    else setActiveTab('custom');
  }, []);

  const liveCronString = useMemo(() => {
    const [h, m] = time.split(':');
    switch (activeTab) {
      case 'daily': return `${parseInt(m)} ${parseInt(h)} * * *`;
      case 'weekly': return `${parseInt(m)} ${parseInt(h)} * * ${selectedDays.length ? selectedDays.sort().join(',') : '*'}`;
      case 'monthly': return `${parseInt(m)} ${parseInt(h)} ${dayOfMonth} * *`;
      case 'custom': return `${customSegments.min} ${customSegments.hour} ${customSegments.day} ${customSegments.month} ${customSegments.week}`;
      default: return '* * * * *';
    }
  }, [activeTab, time, selectedDays, dayOfMonth, customSegments]);

  useEffect(() => {
    if (liveCronString !== value) {
      const label = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      onChange({ cron: liveCronString, frequency: label, plannedStart: time });
    }
  }, [liveCronString]);

  const handleSegmentChange = (field, val, max) => {
    if (validateSegment(val, max)) setCustomSegments(prev => ({ ...prev, [field]: val }));
  };

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative z-10 flex-1 py-2.5 text-sm font-bold transition-colors duration-300 ${
        activeTab === id ? 'text-indigo-700' : 'text-slate-500 hover:text-indigo-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      
      {/* 1. Visually Appealing Toggle */}
      <div className="relative bg-slate-100 p-1.5 rounded-2xl flex shadow-inner border border-slate-200/60">
        <div 
          className="absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-md shadow-indigo-500/10 border border-slate-100 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
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
      <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-3xl border border-slate-200/60 p-6 shadow-sm transition-all duration-300 min-h-[160px] flex flex-col justify-center relative overflow-hidden">
        {/* Decorative ambient glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        {/* TIME PICKER (Common) */}
        {activeTab !== 'custom' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-10">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time of Execution</label>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-indigo-400 group-focus-within:text-indigo-600 transition-colors">
                <Clock size={20} />
              </div>
              <input 
                type="time" 
                value={time} 
                onChange={e => setTime(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-xl font-mono text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all cursor-pointer"
              />
            </div>
            
            {/* WEEKLY */}
            {activeTab === 'weekly' && (
               <div className="mt-8 pt-6 border-t border-slate-200/60">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Active Days</label>
                  <div className="flex justify-between gap-2">
                    {['S','M','T','W','T','F','S'].map((d, i) => (
                      <button 
                        key={i}
                        onClick={() => setSelectedDays(prev => prev.includes(i) ? prev.filter(day => day !== i) : [...prev, i])}
                        className={`h-10 w-10 rounded-xl text-sm font-bold transition-all duration-200 ${
                          selectedDays.includes(i) 
                            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                            : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600'
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
               <div className="mt-8 pt-6 border-t border-slate-200/60">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Day of Month</label>
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">Day {dayOfMonth}</span>
                  </div>
                  <input 
                     type="range" min="1" max="31" 
                     value={dayOfMonth} 
                     onChange={e => setDayOfMonth(Number(e.target.value))}
                     className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  {dayOfMonth > 28 && (
                     <p className="text-[10px] text-amber-600 mt-3 font-medium bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 flex items-center gap-2">
                        <AlertCircle size={14}/> 
                        Note: Task will skip months with fewer than {dayOfMonth} days.
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
                <Layers size={16} className="text-indigo-500" />
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cron Composition</label>
             </div>
             
             <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {[
                  { id: 'min', label: 'Min', max: 59 },
                  { id: 'hour', label: 'Hour', max: 23 },
                  { id: 'day', label: 'Day', max: 31 },
                  { id: 'month', label: 'Month', max: 12 },
                  { id: 'week', label: 'Week', max: 6 }
                ].map((field) => (
                  <div key={field.id} className="flex flex-col gap-2">
                    <input 
                      value={customSegments[field.id]}
                      onChange={e => handleSegmentChange(field.id, e.target.value, field.max)}
                      className="w-full text-center py-3 rounded-xl border border-slate-200 bg-white text-sm font-mono font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm placeholder:font-normal placeholder:text-slate-300"
                      placeholder="*"
                    />
                    <span className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wide">{field.label}</span>
                  </div>
                ))}
             </div>
             
             <div className="mt-5 flex gap-2 text-[11px] text-slate-500 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
               <HelpCircle size={16} className="shrink-0 text-indigo-400" />
               <p>Allowed chars: Numbers, <code className="font-bold text-indigo-700">*</code>, <code className="font-bold text-indigo-700">,</code> (list), <code className="font-bold text-indigo-700">-</code> (range), <code className="font-bold text-indigo-700">/</code> (step)</p>
             </div>
          </div>
        )}
      </div>

      {/* 3. Beautiful Live Preview */}
      <div className={`rounded-2xl p-4 flex gap-3 items-center transition-all duration-500 border ${
        getCronDescription(liveCronString) === 'Invalid Cron Format'
          ? 'bg-rose-50 border-rose-100'
          : 'bg-gradient-to-r from-violet-50 to-indigo-50 border-indigo-100'
      }`}>
        <div className={`p-2 rounded-full ${getCronDescription(liveCronString) === 'Invalid Cron Format' ? 'bg-rose-100 text-rose-500' : 'bg-white text-indigo-600 shadow-sm'}`}>
          {getCronDescription(liveCronString) === 'Invalid Cron Format' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
        </div>
        <div>
           <p className={`text-sm font-bold ${
             getCronDescription(liveCronString) === 'Invalid Cron Format' ? 'text-rose-700' : 'text-slate-800'
           }`}>
             {getCronDescription(liveCronString)}
           </p>
           <p className="text-xs text-slate-500 mt-0.5 font-medium">
             Generated: <span className="font-mono text-indigo-600">{liveCronString}</span>
           </p>
        </div>
      </div>

    </div>
  );
}