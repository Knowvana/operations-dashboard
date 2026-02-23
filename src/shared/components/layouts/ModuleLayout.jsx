import React from 'react';
import { Settings } from 'lucide-react';

export default function ModuleLayout({ 
  title, 
  subtitle, 
  icon: TitleIcon,
  navItems, 
  activeTab, 
  onTabChange, 
  children 
}) {
  return (
    <div className="flex flex-row bg-slate-50/50 h-[calc(100vh-68px)] overflow-hidden w-full relative">
      
      {/* UNIVERSAL LEFT MENU SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200/80 flex flex-col shrink-0 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        {/* Dynamic Context Title Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-3 mb-1">
               {TitleIcon ? (
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
                    <TitleIcon size={16} />
                  </div>
               ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
               )}
               <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">{title}</h2>
            </div>
            <p className="text-xs font-semibold text-slate-500 pl-5 uppercase tracking-widest">{subtitle}</p>
        </div>
        
        {/* Dynamic Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
           {navItems.map((item, index) => (
             item.type === 'separator' ? (
               <div key={`separator-${index}`} className="py-2">
                 <div className="h-px bg-slate-200/80 w-full"></div>
               </div>
             ) : item.type === 'group' ? (
               <div key={item.id} className="pt-2">
                 <div className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                   <item.icon size={16} className="text-slate-400" />
                   {item.label}
                 </div>
                 <div className="space-y-1 mt-1">
                   {item.children.map((child) => (
                     <button
                       key={child.id}
                       onClick={() => onTabChange(child.id)}
                       className={`w-full flex items-center gap-3 pl-8 pr-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                         activeTab === child.id
                           ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50'
                           : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                       }`}
                     >
                       <child.icon size={16} className={activeTab === child.id ? 'text-blue-600' : 'text-slate-400'} />
                       {child.label}
                     </button>
                   ))}
                 </div>
               </div>
             ) : (
               <button 
                  key={item.id}
                  onClick={() => onTabChange(item.id)} 
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <item.icon size={18} className={activeTab === item.id ? 'text-blue-600' : 'text-slate-400'} />
                  {item.label}
               </button>
             )
           ))}

          {/* Divider before settings */}
          <div className="pt-4 pb-2">
             <div className="h-px bg-slate-200/80 w-full"></div>
          </div>

          <button 
              onClick={() => onTabChange('settings')} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === 'settings' 
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Settings size={18} className={activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'} />
              Settings
          </button>
        </nav>
      </aside>

      {/* UNIVERSAL MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-slate-50/50">
        <div className="w-full h-full flex flex-col min-h-0 p-6 lg:p-8">
            {children}
        </div>
      </main>
      
    </div>
  );
}