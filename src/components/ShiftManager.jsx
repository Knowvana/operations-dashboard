import React, { useState } from 'react';
import { Settings, Edit2, Trash2, Plus, Save, X, Database, ArchiveRestore } from 'lucide-react';

const ShiftManager = ({ shifts, onSave, onClose, onDataAction, onViewTasks }) => {
  const [localShifts, setLocalShifts] = useState(shifts);
  const [editingId, setEditingId] = useState(null);
  const [tempShift, setTempShift] = useState(null);

  const handleEdit = (shift) => {
    setEditingId(shift.id);
    setTempShift({ ...shift });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTempShift(null);
  };

  const handleSaveEdit = () => {
    setLocalShifts(localShifts.map(s => s.id === tempShift.id ? tempShift : s));
    setEditingId(null);
    setTempShift(null);
  };

  const handleDelete = (id) => {
    setLocalShifts(localShifts.filter(s => s.id !== id));
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

  const handleResourceAdd = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      setTempShift({
        ...tempShift,
        resources: [...tempShift.resources, e.target.value]
      });
      e.target.value = '';
    }
  };

  const removeResource = (idx) => {
    const newRes = [...tempShift.resources];
    newRes.splice(idx, 1);
    setTempShift({ ...tempShift, resources: newRes });
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
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-100 flex overflow-hidden max-h-[90vh]">
      
      <div className="w-64 bg-slate-50 border-r border-slate-100 p-6 hidden md:flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-8">
              <Settings className="w-5 h-5 text-indigo-600" />
              Settings
          </h2>
          <div className="space-y-2">
              <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-sm font-semibold text-slate-700">
                  Shift Configuration
              </div>
              <div className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 cursor-not-allowed opacity-50">
                  Notifications
              </div>
              <div className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 cursor-not-allowed opacity-50">
                  Integrations
              </div>
          </div>
          
          <div className="mt-auto pt-6 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Data Actions</p>
              <div className="space-y-2">
                  <button onClick={() => handleDataActionClick('load_demo')} className="w-full text-left px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-2 transition-colors">
                      <Database size={14}/> Load Demo Data
                  </button>
                  <button onClick={() => handleDataActionClick('clear_demo')} className="w-full text-left px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg flex items-center gap-2 transition-colors">
                      <ArchiveRestore size={14}/> Clean Demo Tasks
                  </button>
                  <button onClick={() => handleDataActionClick('delete_all')} className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors">
                      <Trash2 size={14}/> Delete All Data
                  </button>
              </div>
          </div>
      </div>

      <div className="flex-1 flex flex-col h-full bg-white relative">
        
        <div className="flex md:hidden justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" /> Settings
          </h2>
          <button onClick={onClose}><X size={20} className="text-slate-400"/></button>
        </div>

        <div className="hidden md:flex justify-end p-4">
           <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 md:pt-0 relative">
           <div className="flex justify-between items-end mb-6">
               <div>
                  <h3 className="text-xl font-bold text-slate-800">Shift Configuration</h3>
                  <p className="text-sm text-slate-500 mt-1">Manage shift timings, leads, and resource allocation.</p>
               </div>
               <button 
                  onClick={handleAddShift}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors"
               >
                  <Plus size={16}/> Add Shift
               </button>
           </div>

           <div className="space-y-4">
             {localShifts.map((shift) => (
               <div key={shift.id} className={`p-5 rounded-xl border transition-all duration-300 ${editingId === shift.id ? 'bg-white border-indigo-200 ring-4 ring-indigo-50/50 shadow-lg' : 'bg-slate-50/50 border-slate-200 hover:border-indigo-200 hover:bg-white'}`}>
                  {editingId === shift.id ? (
                      <div className="space-y-5 animate-in fade-in">
                         {/* Edit form */}
                      </div>
                  ) : (
                      <div className="flex justify-between items-start">
                         {/* Display view */}
                      </div>
                  )}
               </div>
             ))}
           </div>
           
           <div className="mt-8 pt-6 border-t border-slate-100 md:hidden">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Data Actions</p>
              <div className="grid grid-cols-1 gap-3">
                   <button onClick={() => handleDataActionClick('load_demo')} className="w-full text-center px-4 py-3 bg-indigo-50 text-indigo-600 font-medium rounded-xl text-sm">Load Demo Data</button>
                   <button onClick={() => handleDataActionClick('clear_demo')} className="w-full text-center px-4 py-3 bg-amber-50 text-amber-600 font-medium rounded-xl text-sm">Clean Demo Data</button>
                   <button onClick={() => handleDataActionClick('delete_all')} className="w-full text-center px-4 py-3 bg-rose-50 text-rose-600 font-medium rounded-xl text-sm">Delete All Data</button>
              </div>
           </div>

        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button onClick={onClose} className="px-6 py-2.5 text-slate-500 font-medium hover:text-slate-700 transition-colors">Discard</button>
          <button onClick={saveAll} className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all">Apply Configuration</button>
        </div>
      </div>
    </div>
  );
};

export default ShiftManager;