import React, { useState } from 'react';
import { Settings, Edit2, Trash2, Plus, Save, X, RefreshCcw } from 'lucide-react';

const ShiftManager = ({ shifts, onSave, onClose, onResetData }) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl border border-white p-6 h-[85vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Shift Management
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {localShifts.map((shift) => (
            <div key={shift.id} className={`p-4 rounded-xl border transition-all ${editingId === shift.id ? 'bg-indigo-50 border-indigo-200 shadow-md' : 'bg-slate-50 border-slate-200'}`}>
              
              {editingId === shift.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Shift Name</label>
                      <input 
                        type="text" 
                        value={tempShift.name} 
                        onChange={e => setTempShift({...tempShift, name: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Shift Lead</label>
                      <input 
                        type="text" 
                        value={tempShift.lead} 
                        onChange={e => setTempShift({...tempShift, lead: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Start Time</label>
                      <input 
                        type="time" 
                        value={tempShift.start} 
                        onChange={e => setTempShift({...tempShift, start: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">End Time</label>
                      <input 
                        type="time" 
                        value={tempShift.end} 
                        onChange={e => setTempShift({...tempShift, end: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Resources</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tempShift.resources.map((res, idx) => (
                        <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-white text-indigo-700 rounded border border-indigo-100 text-xs">
                          {res}
                          <button onClick={() => removeResource(idx)} className="text-indigo-400 hover:text-indigo-900"><X size={12}/></button>
                        </span>
                      ))}
                    </div>
                    <input 
                      type="text" 
                      placeholder="Type name & press Enter to add..." 
                      onKeyDown={handleResourceAdd}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                     <button onClick={handleCancelEdit} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-200 rounded-lg">Cancel</button>
                     <button onClick={handleSaveEdit} className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg flex items-center gap-1">
                       <Save size={12} /> Save
                     </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-700">{shift.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-1">{shift.start} - {shift.end}</p>
                    <p className="text-xs text-slate-500 mt-1">Lead: {shift.lead}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {shift.resources.map((r, i) => (
                        <span key={i} className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">{r}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(shift)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(shift.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button 
            onClick={handleAddShift}
            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add New Shift
          </button>

          <div className="pt-6 mt-6 border-t border-slate-200">
             <button onClick={onResetData} className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors">
                <RefreshCcw size={16} /> Reset & Regenerate Demo Data
             </button>
             <p className="text-center text-[10px] text-slate-400 mt-2">Caution: This will delete all current tasks.</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium">Discard Changes</button>
          <button onClick={saveAll} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-md">Apply Configuration</button>
        </div>
      </div>
    </div>
  );
};

export default ShiftManager;
