import React, { useState } from 'react';
import { X, Save, Type, Tag, Sparkles } from 'lucide-react';
import CronBuilder from './CronBuilder';

const EditTaskModal = ({ task, onClose, onUpdate }) => {
  const [details, setDetails] = useState({ title: task.title || '', type: task.type || '' });
  const [schedule, setSchedule] = useState({
    cronExpression: task.cronExpression || '0 9 * * *',
    frequency: task.frequency || 'Daily',
    plannedStart: task.plannedStart || '09:00'
  });

  const handleDetailChange = (e) => setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleScheduleChange = (newSchedule) => setSchedule(prev => ({ ...prev, ...newSchedule }));
  
  const handleSave = () => {
    onUpdate(task.id, {
      ...details, ...schedule, updatedAt: new Date().toISOString(), updatedBy: 'System Admin'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      {/* Reverted to bg-white for a clean, professional look */}
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-slate-200">
        
        {/* --- Header --- */}
        <div className="px-8 py-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-5">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-indigo-50">
              <Sparkles size={22} strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Edit Task</h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs font-medium text-slate-500">
                <span className="bg-slate-50 px-2 py-0.5 rounded text-slate-500 border border-slate-100">ID</span>
                <span className="font-mono text-indigo-600">{task.id?.slice(0,8)}...</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all duration-200 active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- Scrollable Body --- */}
        <div className="overflow-y-auto p-8 space-y-10 bg-white scroll-smooth">
          
          {/* Section 1: Task Identity */}
          <section className="space-y-5">
            <div className="flex items-center gap-3">
               <div className="h-px bg-slate-100 flex-1"></div>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">General Info</span>
               <div className="h-px bg-slate-100 flex-1"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name Input */}
              <div className="group relative">
                <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Task Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                    <Type size={18} />
                  </div>
                  <input 
                    name="title" value={details.title} onChange={handleDetailChange} placeholder="e.g. Database Backup"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Category Input */}
              <div className="group relative">
                <label className="block text-xs font-bold text-slate-500 mb-2 ml-1">Category</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                    <Tag size={18} />
                  </div>
                  <input 
                    name="type" value={details.type} onChange={handleDetailChange} placeholder="e.g. Maintenance"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-semibold placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Scheduler */}
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-full">
                   <div className="h-px bg-slate-100 flex-1"></div>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Schedule Engine</span>
                   <div className="h-px bg-slate-100 flex-1"></div>
                </div>
             </div>
             
             {/* The Schedule Builder */}
             <CronBuilder value={schedule.cronExpression} onChange={handleScheduleChange} />
          </section>

        </div>

        {/* --- Footer --- */}
        <div className="bg-white/80 backdrop-blur-xl px-8 py-6 border-t border-slate-100 flex justify-end items-center gap-4 sticky bottom-0 z-20 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.03)]">
          <button 
            onClick={onClose} 
            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={handleSave} 
            className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditTaskModal;