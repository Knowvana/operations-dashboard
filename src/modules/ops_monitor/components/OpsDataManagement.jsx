import React from 'react';
import { Database, ArchiveRestore, Trash2 } from 'lucide-react';

export default function OpsDataManagement({ onDataAction }) {
  const handleDataActionClick = (type) => {
    const actions = {
      load_demo: {type: 'load_demo', title: 'Load Demo Data', desc: 'This will add a set of sample tasks to your board. Is that okay?'},
      clear_demo: {type: 'clear_demo', title: 'Clean Demo Data', desc: 'This will remove all tasks marked as "Demo Data". Your manually created tasks will remain.'},
      delete_all: {type: 'delete_all', title: 'Delete All Data', desc: 'Warning: This action cannot be undone. All tasks in the database will be permanently erased.'}
    };
    onDataAction(actions[type]);
  };

  return (
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
  );
}