import React from 'react';
import { LayoutGrid, Activity, Calendar, User, Bell } from 'lucide-react';

export default function GlobalNavigation({ activeModule, onSwitchModule }) {
  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-[60] shadow-sm transition-all">
      <div className="w-full px-6 h-16 flex items-center justify-between">
        
        {/* Left: Global Identity */}
        <div className="flex items-center gap-3 w-64">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-2 rounded-xl shadow-lg shadow-slate-900/20">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none">Zen-Ops</h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Enterprise</span>
          </div>
        </div>

        {/* Center: Module Switcher (The Licensed Apps) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner">
          <button
            onClick={() => onSwitchModule('ops_monitor')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeModule === 'ops_monitor'
                ? 'bg-white text-teal-700 shadow-md shadow-slate-200/50 border border-slate-100'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <Activity size={16} className={activeModule === 'ops_monitor' ? 'text-teal-500' : ''} />
            Ops Monitor
          </button>
          
          <button
            onClick={() => onSwitchModule('roster_planner')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeModule === 'roster_planner'
                ? 'bg-white text-blue-700 shadow-md shadow-slate-200/50 border border-slate-100'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            <Calendar size={16} className={activeModule === 'roster_planner' ? 'text-blue-500' : ''} />
            Shift Roster
          </button>
        </div>

        {/* Right: User Profile / Global Actions */}
        <div className="flex items-center justify-end gap-4 w-64">
           <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
           </button>
           <div className="h-8 w-px bg-slate-200 mx-1"></div>
           <button className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-xl transition-colors">
              <div className="text-right hidden lg:block">
                 <p className="text-sm font-bold text-slate-700 leading-none">Admin User</p>
                 <p className="text-[10px] font-medium text-slate-500 mt-0.5">System Operations</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 text-white flex items-center justify-center shadow-sm">
                 <User size={18} />
              </div>
           </button>
        </div>

      </div>
    </header>
  );
}