import React, { useState } from 'react';
import { X, Save, Type, Tag, Sparkles } from 'lucide-react';
import CronBuilder from './CronBuilder';

const EditTaskModal = ({ task, onClose, onUpdate }) => {
  // Only bind to fields present in the schema
  const [details, setDetails] = useState({ 
    taskName: task.taskName || task.title || '', 
    category: task.category || task.type || '' 
  });
  
  const [schedule, setSchedule] = useState({
    cron_schedule: task.cron_schedule || task.cronExpression || '0 9 * * *'
  });

  const handleDetailChange = (e) => setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  // Update internal state when CronBuilder changes
  // CronBuilder emits { cron, frequency, plannedStart } but we only care about 'cron' for the DB
  const handleScheduleChange = (newSchedule) => {
    setSchedule(prev => ({ ...prev, cron_schedule: newSchedule.cron }));
  };
  
  const handleSave = () => {
    // Only send the allowed schema fields
    onUpdate(task.id, {
      taskId: task.taskId, // keep ID
      taskName: details.taskName,
      category: details.category,
      cron_schedule: schedule.cron_schedule,
      // Metadata
      AddedByUser: 'System_Admin', // Or pass user from props if available
      // createdAt is immutable
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col ring-1 ring-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-white z-20 shrink-0 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Sparkles size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Edit Configuration</h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs font-medium text-slate-500">
                <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-wider text-[10px]">Task ID</span>
                <span className="font-mono text-teal-600">{task.taskId || task.id?.slice(0,8)}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-rose-500 transition-all duration-200 active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body (Compacted to avoid scrollbars) */}
        <div className="p-6 bg-gradient-to-b from-slate-50/50 to-white flex flex-col gap-6">
          
          <section>
            <div className="flex items-center gap-3 mb-4">
               <div className="h-px bg-slate-100 flex-1"></div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">General Info</span>
               <div className="h-px bg-slate-100 flex-1"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group relative">
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wide">Task Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                    <Type size={16} />
                  </div>
                  <input 
                    name="taskName" value={details.taskName} onChange={handleDetailChange} placeholder="e.g. Database Backup"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold placeholder:text-slate-300 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="group relative">
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 ml-1 uppercase tracking-wide">Category</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                    <Tag size={16} />
                  </div>
                  <input 
                    name="category" value={details.category} onChange={handleDetailChange} placeholder="e.g. Maintenance"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold placeholder:text-slate-300 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
             <div className="flex items-center gap-3 mb-4">
               <div className="h-px bg-slate-100 flex-1"></div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule Engine</span>
               <div className="h-px bg-slate-100 flex-1"></div>
             </div>
             
             {/* Wrapped CronBuilder to give it structure and boundary */}
             <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm ring-1 ring-slate-50/50">
               <CronBuilder value={schedule.cron_schedule} onChange={handleScheduleChange} />
             </div>
          </section>

        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-5 border-t border-slate-100 flex justify-end items-center gap-3 shrink-0">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-300 flex items-center gap-2"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditTaskModal;