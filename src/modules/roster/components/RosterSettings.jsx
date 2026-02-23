import React from 'react';
import { Database, Trash2, Settings } from 'lucide-react';

export default function RosterSettings({ onLoadDemo, onDeleteDemo }) {
  return (
    <div className="h-full flex flex-col p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar">
        
        {/* Page Header */}
        <div className="mb-10 border-b border-slate-200 pb-8">
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl shadow-inner border border-blue-100/50">
                    <Settings size={28} />
                </div>
                System Settings
            </h3>
            <p className="text-slate-500 mt-3 font-medium text-lg ml-1">Manage your Roster environment data and states.</p>
        </div>
        
        {/* Action Cards */}
        <div className="grid gap-6 max-w-4xl">
            
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-blue-200 hover:shadow-md transition-all group">
                <div>
                    <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2.5 group-hover:text-blue-700 transition-colors">
                        <Database size={22} className="text-blue-500"/> Load Demo Data
                    </h4>
                    <p className="text-sm text-slate-500 mt-2 max-w-lg leading-relaxed font-medium">
                        Populate the roster with 25 sample employees and standard shift configurations to explore features immediately.
                    </p>
                </div>
                <button 
                    onClick={onLoadDemo} 
                    className="w-full md:w-auto px-8 py-3.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                >
                    Execute Load
                </button>
            </div>
            
            <div className="bg-rose-50/40 p-6 md:p-8 rounded-3xl border border-rose-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-rose-300 hover:shadow-md transition-all group">
                <div>
                    <h4 className="text-xl font-bold text-rose-800 flex items-center gap-2.5">
                        <Trash2 size={22} className="text-rose-500"/> Wipe Environment Data
                    </h4>
                    <p className="text-sm text-rose-600/80 mt-2 max-w-lg leading-relaxed font-medium">
                        Permanently delete all employees, planned leaves, and clear the currently generated schedule. <strong>This action cannot be undone.</strong>
                    </p>
                </div>
                <button 
                    onClick={onDeleteDemo} 
                    className="w-full md:w-auto px-8 py-3.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-transform active:scale-95"
                >
                    Wipe Data
                </button>
            </div>

        </div>
    </div>
  );
}