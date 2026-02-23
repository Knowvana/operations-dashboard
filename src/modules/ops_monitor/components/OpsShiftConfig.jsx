import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export default function OpsShiftConfig({ shifts, onSave, onClose }) {
  const [localShifts, setLocalShifts] = useState(shifts);

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
  };

  const saveAll = () => {
    onSave(localShifts);
    onClose();
  };

  return (
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
              <div className="text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-100">Edit Details</div>
            </div>
          ))}
        </div>
        <div className="mt-auto border-t border-slate-200 pt-6 flex justify-end">
          <button onClick={saveAll} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">Apply Configuration</button>
        </div>
    </div>
  );
}