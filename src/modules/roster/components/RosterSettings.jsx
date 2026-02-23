// src/modules/roster/components/RosterSettings.jsx
import React from 'react';
import { Database, Trash2 } from 'lucide-react';

export default function RosterSettings({ onDataAction }) {
  const handleDataActionClick = (type) => {
    const actions = {
      load_demo: {type: 'load_demo', title: 'Load Demo Data', desc: 'This will add sample employees and shifts to your roster. Is that okay?'},
      delete_all: {type: 'delete_all', title: 'Delete All Data', desc: 'Warning: This action cannot be undone. All roster data will be permanently erased.'}
    };
    onDataAction(actions[type]);
  };

  return (
    <div className="h-full flex flex-col p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto">
        <div className="mb-10">
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">Data Management</h3>
            <p className="text-slate-500 mt-2 font-medium">Reset or load environmental states.</p>
        </div>
        
        <div className="grid gap-4 max-w-2xl">
            {/* Load Demo Data */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-colors">
                <div>
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                        <Database size={18} className="text-indigo-600"/> Load Demo Data
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">Populate roster with sample workforce.</p>
                </div>
                <button onClick={() => handleDataActionClick('load_demo')} className="px-5 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100">Execute</button>
            </div>

            {/* Wipe Data */}
            <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm flex items-center justify-between bg-rose-50/30 hover:border-rose-300 transition-colors">
                <div>
                    <h4 className="font-bold text-rose-800 flex items-center gap-2">
                        <Trash2 size={18}/> Hard Reset
                    </h4>
                    <p className="text-sm text-rose-600 mt-1">Permanently delete all roster data.</p>
                </div>
                <button onClick={() => handleDataActionClick('delete_all')} className="px-5 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200">Wipe Data</button>
            </div>
        </div>
    </div>
  );
}