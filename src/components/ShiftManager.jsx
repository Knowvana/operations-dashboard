import React, { useState } from 'react';
import { Settings, X, Database, ArchiveRestore, Upload, Layers, Trash2, Plus } from 'lucide-react';
import ImportTasksModal from './ImportTasksModal';

const ShiftManager = ({ shifts, onSave, onClose, onDataAction, onViewTasks, initialTab = 'shifts', onImport, existingTasks }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [localShifts, setLocalShifts] = useState(shifts);
  const [editingId, setEditingId] = useState(null);
  const [tempShift, setTempShift] = useState(null);

  const handleEdit = (shift) => {
    setEditingId(shift.id);
    setTempShift({ ...shift });
  };

  const handleAddShift = () => {
    const newShift = {
      id: `shift-${Date.now()}`,
      name: 'New Shift',
      start: '00:00',
      end: '08:00',
      lead: 'Unassigned',
      resources: []
    };
    setLocalShifts([...localShifts, newShift]);
    setEditingId(newShift.id);
    setTempShift(newShift);
  };

  const saveAll = () => {
    onSave(localShifts);
    onClose();
  };

  const handleDataActionClick = (type) => {
    const actions = {
      load_demo: {type: 'load_demo', title: 'Load Demo Data', desc: 'This will add a set of sample tasks to your board. Is that okay?'},
      clear_demo: {type: 'clear_demo', title: 'Clean Demo Data', desc: 'This will remove all tasks marked as "Demo Data". Your manually created tasks will remain.'},
      delete_all: {type: 'delete_all', title: 'Delete All Data', desc: 'Warning: This action cannot be undone. All tasks in the database will be permanently erased.'}
    };
    onDataAction(actions[type]);
  }

  return (
    <div className="flex w-full h-full bg-slate-50 font-sans text-slate-800">
      
      {/* Sidebar Navigation */}
      <div className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 p-6 flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-3 mb-10 tracking-tight">
              <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><Settings size={22} /></div>
              Settings Center
          </h2>
          
          <nav className="flex flex-col gap-2">
              <button 
                  onClick={() => setActiveTab('shifts')} 
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'shifts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
              >
                  <Layers size={18} /> Shift Config
              </button>
              <button 
                  onClick={() => setActiveTab('import')} 
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'import' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
              >
                  <Upload size={18} /> Import Tasks
              </button>
              <button 
                  onClick={() => setActiveTab('data')} 
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'data' ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
              >
                  <Database size={18} /> Data Management
              </button>
          </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50">
        <button onClick={onClose} className="absolute top-6 right-6 p-2.5 bg-white rounded-full text-slate-400 hover:text-slate-700 shadow-sm border border-slate-200 z-50 transition-transform hover:scale-105 active:scale-95">
            <X size={20} />
        </button>

        <div className="flex-1 overflow-hidden">
           {activeTab === 'shifts' && (
               <div className="h-full flex flex-col p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
                   <div className="flex justify-between items-end mb-8">
                       <div>
                          <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">Shift Configuration</h3>
                          <p className="text-slate-500 mt-2 font-medium">Manage shift timings, leads, and resource allocation.</p>
                       </div>
                       <button onClick={handleAddShift} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
                          <Plus size={18}/> Add Shift
                       </button>
                   </div>
                   
                   <div className="space-y-4 mb-8">
                     {localShifts.map((shift) => (
                       <div key={shift.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex justify-between items-center hover:border-indigo-200 transition-colors">
                          <div className="flex gap-6 items-center">
                              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">{shift.name.charAt(0)}</div>
                              <div>
                                  <h4 className="font-bold text-slate-800">{shift.name}</h4>
                                  <div className="text-xs font-mono text-slate-500 mt-1 bg-slate-50 px-2 py-0.5 rounded w-fit border border-slate-100">{shift.start} - {shift.end}</div>
                              </div>
                              <div className="text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                  Lead: {shift.lead}
                              </div>
                          </div>
                          {/* Simplified list view to keep design clean */}
                          <div className="text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-100">Edit Details</div>
                       </div>
                     ))}
                   </div>
                   <div className="mt-auto border-t border-slate-200 pt-6 flex justify-end">
                      <button onClick={saveAll} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">Apply Configuration</button>
                   </div>
               </div>
           )}

           {activeTab === 'import' && (
               <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                   {/* We pass existing tasks for deduplication logic */}
                   <ImportTasksModal 
                      onImport={onImport} 
                      onViewTasks={() => { onClose(); onViewTasks(); }}
                      existingTasks={existingTasks}
                   />
               </div>
           )}

           {activeTab === 'data' && (
               <div className="h-full flex flex-col p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="mb-10">
                       <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">Data Management</h3>
                       <p className="text-slate-500 mt-2 font-medium">Reset or load environmental states.</p>
                   </div>
                   <div className="grid gap-4 max-w-2xl">
                       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-colors">
                           <div>
                               <h4 className="font-bold text-slate-800 flex items-center gap-2"><Database size={18} className="text-indigo-600"/> Load Demo Data</h4>
                               <p className="text-sm text-slate-500 mt-1">Populate timeline with sample activities.</p>
                           </div>
                           <button onClick={() => handleDataActionClick('load_demo')} className="px-5 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100">Execute</button>
                       </div>
                       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-amber-200 transition-colors">
                           <div>
                               <h4 className="font-bold text-slate-800 flex items-center gap-2"><ArchiveRestore size={18} className="text-amber-500"/> Clean Demo Tasks</h4>
                               <p className="text-sm text-slate-500 mt-1">Remove all tasks marked as demo data.</p>
                           </div>
                           <button onClick={() => handleDataActionClick('clear_demo')} className="px-5 py-2.5 bg-amber-50 text-amber-700 font-bold rounded-xl hover:bg-amber-100">Execute</button>
                       </div>
                       <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm flex items-center justify-between bg-rose-50/30 hover:border-rose-300 transition-colors">
                           <div>
                               <h4 className="font-bold text-rose-800 flex items-center gap-2"><Trash2 size={18}/> Hard Reset</h4>
                               <p className="text-sm text-rose-600 mt-1">Permanently delete all tasks in the database.</p>
                           </div>
                           <button onClick={() => handleDataActionClick('delete_all')} className="px-5 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200">Wipe Data</button>
                       </div>
                   </div>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ShiftManager;