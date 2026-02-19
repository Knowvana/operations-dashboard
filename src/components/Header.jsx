import React from 'react';
import { Activity, Clock, User, Users, Settings, Upload } from 'lucide-react';

const Header = ({ complianceStatus, timeRemaining, shiftDetails, onOpenSettings, onOpenImport }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Left: Identity */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">Zen-Ops</h1>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Monitor</span>
                </div>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>

            {/* Active Shift Details */}
            <div className="hidden md:flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Current Shift</span>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">{shiftDetails.name}</span>
                        <span className="font-mono text-xs text-slate-500 bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200/50">{shiftDetails.start} - {shiftDetails.end}</span>
                    </div>
                </div>
                
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Shift Lead</span>
                    <div className="flex items-center gap-1.5">
                        <div className="p-0.5 bg-indigo-50 rounded-full"><User size={10} className="text-indigo-600"/></div>
                        <span className="font-semibold text-slate-700 text-sm">{shiftDetails.lead}</span>
                    </div>
                </div>

                <div className="hidden lg:flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Team</span>
                    <div className="flex items-center gap-1.5 max-w-[300px] overflow-hidden">
                        <div className="p-0.5 bg-teal-50 rounded-full"><Users size={10} className="text-teal-600"/></div>
                        <span className="text-xs text-slate-600 truncate">
                            {shiftDetails.resources && shiftDetails.resources.length > 0 
                                ? shiftDetails.resources.join(', ') 
                                : 'No resources'}
                        </span>
                    </div>
                </div>
            </div>
          </div>

          {/* Right: Timer & Settings */}
          <div className="flex items-center gap-5 justify-end">
            <div className="text-right hidden sm:block bg-gradient-to-r from-slate-50 to-white px-4 py-1.5 rounded-lg border border-slate-100 shadow-sm">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Shift Ends</p>
              <div className="flex items-center justify-end gap-2">
                 <Clock size={14} className="text-indigo-500 animate-pulse" />
                 <p className="text-xl font-mono font-bold text-indigo-600 tabular-nums tracking-tight leading-none">{shiftDetails.end}</p>
              </div>
            </div>
            <button
              onClick={onOpenImport}
              className="h-10 px-5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:from-teal-600 hover:to-emerald-600 transition-all text-sm flex items-center gap-2 mr-2"
            >
              <Upload size={16} /> Import Tasks
            </button>
            <button 
              onClick={onOpenSettings}
              className="h-10 w-10 rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 transition-all flex items-center justify-center group"
            >
              <Settings size={18} className="group-hover:rotate-45 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;