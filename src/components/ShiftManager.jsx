import React, { useState } from 'react';
import { Settings, Edit2, Trash2, Plus, Save, X, Database, AlertTriangle, RefreshCw, ArchiveRestore } from 'lucide-react';

const ShiftManager = ({ shifts, onSave, onClose, onDataAction }) => {
  const [localShifts, setLocalShifts] = useState(shifts);
  const [editingId, setEditingId] = useState(null);
  const [tempShift, setTempShift] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'clear_demo' | 'delete_all', title: '', desc: '' }

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

  const executeConfirmAction = () => {
    if (confirmAction) {
        onDataAction(confirmAction.type);
        setConfirmAction(null);
        // UPDATED: Close the manager window for ALL confirmed actions
        // so the user can immediately see the result on the dashboard.
        onClose(); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-100 flex overflow-hidden max-h-[90vh]">
        
        {/* Sidebar Navigation (Visual) */}
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
                    <button onClick={() => { onDataAction('load_demo'); onClose(); }} className="w-full text-left px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-2 transition-colors">
                        <Database size={14}/> Load Demo Data
                    </button>
                    <button onClick={() => setConfirmAction({type: 'clear_demo', title: 'Clean Demo Data', desc: 'This will remove all tasks marked as "Demo Data". Your manually created tasks will remain.'})} className="w-full text-left px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg flex items-center gap-2 transition-colors">
                        <ArchiveRestore size={14}/> Clean Demo Tasks
                    </button>
                    <button onClick={() => setConfirmAction({type: 'delete_all', title: 'Delete All Data', desc: 'Warning: This action cannot be undone. All tasks in the database will be permanently erased.'})} className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors">
                        <Trash2 size={14}/> Delete All Data
                    </button>
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          
          {/* Mobile Header */}
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

          <div className="flex-1 overflow-y-auto px-6 pb-6 md:pt-0">
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
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Shift Name</label>
                                    <input 
                                        type="text" 
                                        value={tempShift.name} 
                                        onChange={e => setTempShift({...tempShift, name: e.target.value})}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Lead</label>
                                    <input 
                                        type="text" 
                                        value={tempShift.lead} 
                                        onChange={e => setTempShift({...tempShift, lead: e.target.value})}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none text-sm"
                                    />
                                </div>
                           </div>
                           <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Start Time</label>
                                    <input type="time" value={tempShift.start} onChange={e => setTempShift({...tempShift, start: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-sm"/>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">End Time</label>
                                    <input type="time" value={tempShift.end} onChange={e => setTempShift({...tempShift, end: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-sm"/>
                                </div>
                           </div>
                           <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Resources</label>
                                <div className="flex flex-wrap gap-2">
                                    {tempShift.resources.map((res, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
                                            {res} <button onClick={() => removeResource(idx)} className="hover:text-indigo-900"><X size={12}/></button>
                                        </span>
                                    ))}
                                    <input 
                                      type="text" 
                                      placeholder="+ Add resource" 
                                      onKeyDown={handleResourceAdd}
                                      className="px-2.5 py-1 bg-transparent border-b border-dashed border-slate-300 text-xs focus:border-indigo-500 outline-none min-w-[100px]"
                                    />
                                </div>
                           </div>
                           <div className="flex justify-end gap-3 pt-2">
                                <button onClick={handleCancelEdit} className="text-sm text-slate-500 font-medium hover:text-slate-800 px-3 py-1.5">Cancel</button>
                                <button onClick={handleSaveEdit} className="bg-slate-900 text-white text-sm font-medium px-4 py-1.5 rounded-lg shadow hover:bg-slate-800 transition-colors flex items-center gap-2">
                                    <Save size={14}/> Save Changes
                                </button>
                           </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                    {shift.name}
                                    <span className="text-xs font-mono font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{shift.start} - {shift.end}</span>
                                </h3>
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                    <span className="font-semibold text-slate-600">Lead:</span> {shift.lead}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {shift.resources.map((r, i) => (
                                        <span key={i} className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-500 shadow-sm">{r}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleEdit(shift)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(shift.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    )}
                 </div>
               ))}
             </div>
             
             {/* Mobile Data Actions */}
             <div className="mt-8 pt-6 border-t border-slate-100 md:hidden">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Data Actions</p>
                <div className="grid grid-cols-1 gap-3">
                     <button onClick={() => { onDataAction('load_demo'); onClose(); }} className="w-full text-center px-4 py-3 bg-indigo-50 text-indigo-600 font-medium rounded-xl text-sm">Load Demo Data</button>
                     <button onClick={() => setConfirmAction({type: 'clear_demo', title: 'Clean Demo Data', desc: 'Remove all demo tasks?'})} className="w-full text-center px-4 py-3 bg-amber-50 text-amber-600 font-medium rounded-xl text-sm">Clean Demo Data</button>
                     <button onClick={() => setConfirmAction({type: 'delete_all', title: 'Delete All Data', desc: 'Permanently delete all tasks?'})} className="w-full text-center px-4 py-3 bg-rose-50 text-rose-600 font-medium rounded-xl text-sm">Delete All Data</button>
                </div>
             </div>
          </div>

          <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
            <button onClick={onClose} className="px-6 py-2.5 text-slate-500 font-medium hover:text-slate-700 transition-colors">Discard</button>
            <button onClick={saveAll} className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all">Apply Configuration</button>
          </div>
          
          {/* Confirmation Modal Overlay */}
          {confirmAction && (
              <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                  <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 max-w-sm w-full text-center ring-1 ring-slate-100">
                      <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmAction.type === 'delete_all' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                          <AlertTriangle size={24}/>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">{confirmAction.title}</h3>
                      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{confirmAction.desc}</p>
                      <div className="flex gap-3">
                          <button onClick={() => setConfirmAction(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
                          <button onClick={executeConfirmAction} className={`flex-1 px-4 py-2 rounded-lg text-white font-medium shadow-md ${confirmAction.type === 'delete_all' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-500 hover:bg-amber-600'}`}>Confirm</button>
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