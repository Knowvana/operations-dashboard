import React from 'react';
import { 
  LayoutGrid, Activity, Calendar, User, Bell, Search, 
  Info, HelpCircle, Phone 
} from 'lucide-react';

// Reusable Navigation Item Component for a clean, formal menu
const NavItem = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`relative h-full px-4 flex items-center gap-2 text-sm font-semibold transition-all duration-300 ${
      isActive 
        ? 'text-slate-800 bg-slate-50/50' 
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/30'
    }`}
  >
    {Icon && (
      <Icon 
        size={16} 
        className={`transition-colors duration-300 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} 
      />
    )}
    {label}
    
    {/* Elegant Active Indicator (Bottom Border) */}
    {isActive && (
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 rounded-t-md shadow-[0_-2px_10px_rgba(20,184,166,0.3)]" />
    )}
  </button>
);

export default function GlobalNavigation({ activeModule, onSwitchModule }) {
  return (
    <>
      {/* Ultra-subtle elegant gradient top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-400 via-blue-400 to-indigo-400"></div>
      
      <header className="bg-white/90 backdrop-blur-2xl border-b border-slate-200/80 sticky top-0 z-[60] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all">
        <div className="w-full max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center h-full gap-8">
            {/* 1. Global Identity / Logo */}
            <div className="flex items-center gap-3 pr-4 border-r border-slate-200/60 h-8">
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-2 rounded-xl shadow-md shadow-slate-900/10 ring-1 ring-slate-900/5">
                <LayoutGrid className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none">Zen-Ops</h1>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Enterprise</span>
              </div>
            </div>

            {/* 2. Formal Primary Navigation Menu */}
            <nav className="hidden md:flex items-center h-16 gap-1">
              <NavItem 
                label="Ops Monitor" 
                icon={Activity} 
                isActive={activeModule === 'ops_monitor'} 
                onClick={() => onSwitchModule('ops_monitor')} 
              />
              <NavItem 
                label="Shift Roster" 
                icon={Calendar} 
                isActive={activeModule === 'roster_planner'} 
                onClick={() => onSwitchModule('roster_planner')} 
              />
              
              {/* Scalable Future Menu Items (Currently just placeholders for visual completion) */}
              <div className="w-px h-6 bg-slate-200/80 mx-2"></div>
              
              <NavItem 
                label="About" 
                icon={Info} 
                isActive={activeModule === 'about'} 
                onClick={() => console.log('Navigate to About')} 
              />
              <NavItem 
                label="Help Center" 
                icon={HelpCircle} 
                isActive={activeModule === 'help'} 
                onClick={() => console.log('Navigate to Help')} 
              />
              <NavItem 
                label="Contact" 
                icon={Phone} 
                isActive={activeModule === 'contact'} 
                onClick={() => console.log('Navigate to Contact')} 
              />
            </nav>
          </div>

          {/* 3. Right: Search & Profile */}
          <div className="flex items-center justify-end gap-3 h-full">
             <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
                <Search size={18} />
             </button>
             <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all relative">
                <Bell size={18} />
                {/* Notification indicator */}
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
             </button>
             
             <div className="h-6 w-px bg-slate-200 mx-2"></div>
             
             {/* Formal Profile Dropdown Trigger */}
             <button className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full border border-transparent hover:border-slate-200 transition-all">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white flex items-center justify-center shadow-sm text-xs font-bold ring-2 ring-white">
                   AU
                </div>
                <div className="text-left hidden lg:block">
                   <p className="text-xs font-bold text-slate-700 leading-none">Admin User</p>
                   <p className="text-[10px] font-medium text-slate-400 mt-1">System Ops</p>
                </div>
             </button>
          </div>

        </div>
      </header>
    </>
  );
}