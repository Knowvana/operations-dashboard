import React from 'react';
import { Upload, Database, LayoutTemplate, ArrowRight } from 'lucide-react';

const EmptyState = ({ onImport, onLoadDemo }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in duration-700">
      
      {/* Icon Graphic */}
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
        <div className="relative bg-white p-6 rounded-3xl shadow-sm border border-slate-100 ring-1 ring-slate-50">
          <LayoutTemplate size={48} className="text-indigo-600" strokeWidth={1.5} />
        </div>
      </div>

      <h2 className="text-3xl font-light text-slate-800 tracking-tight mb-3">
        Ready to Organize?
      </h2>
      <p className="text-slate-500 max-w-md mb-10 leading-relaxed font-light">
        Your operations timeline is currently empty. Start by importing your schedule or load our demo environment to explore the features.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        
        {/* Import Button */}
        <button 
          onClick={onImport}
          className="flex-1 group relative overflow-hidden rounded-xl bg-slate-900 p-px shadow-lg shadow-slate-900/10 transition-transform active:scale-[0.98] hover:shadow-xl"
        >
          <div className="relative flex items-center justify-center gap-2 bg-slate-900 px-6 py-4 rounded-xl text-white transition-colors group-hover:bg-slate-800">
             <Upload size={18} />
             <span className="font-medium">Import Tasks</span>
          </div>
        </button>

        {/* Load Demo Button */}
        <button 
          onClick={onLoadDemo}
          className="flex-1 group relative overflow-hidden rounded-xl bg-white border border-slate-200 p-px shadow-sm transition-transform active:scale-[0.98] hover:border-indigo-200 hover:shadow-md"
        >
          <div className="relative flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-slate-600 transition-colors group-hover:text-indigo-600">
             <Database size={18} />
             <span className="font-medium">Load Demo Data</span>
          </div>
        </button>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 font-medium tracking-wide uppercase">
        <div className="h-px w-8 bg-slate-200"></div>
        <span>Zen-Ops Monitor v1.0</span>
        <div className="h-px w-8 bg-slate-200"></div>
      </div>
    </div>
  );
};

export default EmptyState;