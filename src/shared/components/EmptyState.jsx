import React from 'react';
import { Upload, Database, LayoutTemplate, Calendar, Activity, Users, ShieldCheck, Play } from 'lucide-react';

// Module-specific content configurations
const MODULE_CONFIGS = {
  admin: {
    icon: ShieldCheck,
    iconColor: 'text-purple-600',
    iconBgGlow: 'bg-purple-100',
    title: 'Initialize Admin?',
    description: 'Your administration database is currently empty. Initialize the database schema and create your first super admin account to get started.',
    primaryButton: {
      label: 'Initialize Database',
      icon: Database,
      show: true
    },
    secondaryButton: {
      label: 'Documentation',
      icon: LayoutTemplate,
      show: false
    },
    footer: 'Zen-Ops Admin v1.0'
  },
  ops_monitor: {
    icon: Activity,
    iconColor: 'text-indigo-600',
    iconBgGlow: 'bg-indigo-100',
    title: 'Ready to Organize?',
    description: 'Your operations timeline is currently empty. Start by importing your schedule or load our demo environment to explore the features.',
    primaryButton: {
      label: 'Import Tasks',
      icon: Upload,
      show: true
    },
    secondaryButton: {
      label: 'Load Demo Data',
      icon: Database,
      show: true
    },
    footer: 'Zen-Ops Monitor v1.0'
  },
  roster_planner: {
    icon: Calendar,
    iconColor: 'text-blue-600',
    iconBgGlow: 'bg-blue-100',
    title: 'Ready to Schedule?',
    description: 'Your roster is currently empty. Configure your workforce and shifts, then generate your schedule or load demo data to get started.',
    primaryButton: {
      label: 'Configure Workforce',
      icon: Users,
      show: true
    },
    secondaryButton: {
      label: 'Load Demo Data',
      icon: Database,
      show: true
    },
    footer: 'Zen-Ops Roster v1.0'
  },
  default: {
    icon: LayoutTemplate,
    iconColor: 'text-slate-600',
    iconBgGlow: 'bg-slate-100',
    title: 'Ready to Begin?',
    description: 'Get started by importing data or loading demo content to explore the features.',
    primaryButton: {
      label: 'Get Started',
      icon: Upload,
      show: true
    },
    secondaryButton: {
      label: 'Load Demo',
      icon: Database,
      show: true
    },
    footer: 'Zen-Ops Enterprise v1.0'
  }
};

const EmptyState = ({ 
  module = 'default',
  onPrimaryAction,
  onSecondaryAction,
  customConfig = null
}) => {
  // Use custom config if provided, otherwise use module-specific config
  const config = customConfig || MODULE_CONFIGS[module] || MODULE_CONFIGS.default;
  const IconComponent = config.icon;
  const PrimaryIcon = config.primaryButton.icon;
  const SecondaryIcon = config.secondaryButton.icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in duration-700">
      
      {/* Icon Graphic */}
      <div className="relative mb-8 group">
        <div className={`absolute inset-0 ${config.iconBgGlow} rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500`}></div>
        <div className="relative bg-white p-6 rounded-3xl shadow-sm border border-slate-100 ring-1 ring-slate-50">
          <IconComponent size={48} className={config.iconColor} strokeWidth={1.5} />
        </div>
      </div>

      <h2 className="text-3xl font-light text-slate-800 tracking-tight mb-3">
        {config.title}
      </h2>
      <p className="text-slate-500 max-w-md mb-10 leading-relaxed font-light">
        {config.description}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        
        {/* Primary Action Button */}
        {config.primaryButton.show && onPrimaryAction && (
          <button 
            onClick={onPrimaryAction}
            className="flex-1 group relative overflow-hidden rounded-xl bg-slate-900 p-px shadow-lg shadow-slate-900/10 transition-transform active:scale-[0.98] hover:shadow-xl"
          >
            <div className="relative flex items-center justify-center gap-2 bg-slate-900 px-6 py-4 rounded-xl text-white transition-colors group-hover:bg-slate-800">
               <PrimaryIcon size={18} />
               <span className="font-medium">{config.primaryButton.label}</span>
            </div>
          </button>
        )}

        {/* Secondary Action Button */}
        {config.secondaryButton.show && onSecondaryAction && (
          <button 
            onClick={onSecondaryAction}
            className="flex-1 group relative overflow-hidden rounded-xl bg-white border border-slate-200 p-px shadow-sm transition-transform active:scale-[0.98] hover:border-indigo-200 hover:shadow-md"
          >
            <div className="relative flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-slate-600 transition-colors group-hover:text-indigo-600">
               <SecondaryIcon size={18} />
               <span className="font-medium">{config.secondaryButton.label}</span>
            </div>
          </button>
        )}
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 font-medium tracking-wide uppercase">
        <div className="h-px w-8 bg-slate-200"></div>
        <span>{config.footer}</span>
        <div className="h-px w-8 bg-slate-200"></div>
      </div>
    </div>
  );
};

export default EmptyState;