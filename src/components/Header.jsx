import React from 'react';
import { Clock, User, Users, Settings, Upload, CheckCircle2 } from 'lucide-react';

const Header = ({ complianceStatus, timeRemaining, shiftDetails, onOpenSettings, onOpenImport }) => {
  return (
    <header className="sticky top-[68px] z-40 bg-slate-50/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left: Elegant Shift Context */}
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            
            {/* Shift Name Badge */}
            <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm shrink-0">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                <span className="font-bold text-slate-800 text-sm tracking-tight">{shiftDetails.name}</span>
                <span className="text-slate-300 text-xs px-1">•</span>
                <span className="font-mono text-xs font-medium text-slate-500">{shiftDetails.start} - {shiftDetails.end}</span>
            </div>
            
            {/* Shift Lead */}
            <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm shrink-0">
                <User size={14} className="text-slate-400"/>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Lead:</span>
                <span className="font-bold text-slate-700 text-sm">{shiftDetails.lead}</span>
            </div>

            {/* Team Snapshot */}
            <div className="hidden lg:flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm shrink-0 max-w-[350px]">
                <Users size={14} className="text-slate-400 shrink-0"/>
                <span className="text-xs font-medium text-slate-600 truncate">
                    {shiftDetails.resources && shiftDetails.resources.length > 0 
                        ? shiftDetails.resources.join(', ') 
                        : 'No resources assigned'}
                </span>
            </div>

        </div>

        {/* Right: Actions & Timer */}
        <div className="flex items-center gap-3 justify-end shrink-0 w-full md:w-auto">
          
          {/* Subtle Timer */}
          <div className="hidden sm:flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
             <Clock size={14} className="text-teal-500" />
             <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ends In</span>
                <span className="font-mono font-bold text-teal-600 text-sm">{shiftDetails.end}</span>
             </div>
          </div>

          <button
            onClick={onOpenImport}
            className="h-9 px-5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm flex items-center gap-2"
          >
            <Upload size={16} /> Data Ingestion
          </button>
          
          <button 
            onClick={onOpenSettings}
            className="h-9 w-9 rounded-full bg-white border border-slate-200 shadow-sm hover:border-teal-300 hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-all flex items-center justify-center group"
          >
            <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500 ease-out" />
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;