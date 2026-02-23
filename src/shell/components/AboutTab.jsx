// src/shell/components/AboutTab.jsx
import React from 'react';
import { Settings } from 'lucide-react';

export default function AboutTab({ appConfig }) {
  return (
    <div className="h-full flex flex-col p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto custom-scrollbar">
      <div className="mb-10">
        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">About</h3>
        <p className="text-slate-500 mt-2 font-medium">Application information and details</p>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* App Header */}
        <div className="text-center mb-8 p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Settings size={40} className="text-white" />
          </div>
          <h3 className="text-3xl font-extrabold text-slate-800 mb-2">{appConfig.appName}</h3>
          <p className="text-slate-600 font-medium">{appConfig.description}</p>
        </div>

        {/* Version Info */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Version Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Version</p>
              <p className="text-lg font-bold text-slate-800">{appConfig.appVersion}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Build Date</p>
              <p className="text-lg font-bold text-slate-800">{appConfig.buildDate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Company</p>
              <p className="text-lg font-bold text-slate-800">{appConfig.company}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">License</p>
              <p className="text-lg font-bold text-slate-800">{appConfig.license}</p>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Installed Modules</h4>
          <div className="space-y-3">
            {appConfig.modules.map(module => (
              <div key={module.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{module.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{module.description}</p>
                  <p className="text-xs text-slate-400 mt-1">v{module.version}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Key Features</h4>
          <div className="grid grid-cols-2 gap-2">
            {appConfig.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Support & Resources</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Email Support</span>
              <a href={`mailto:${appConfig.support.email}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                {appConfig.support.email}
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Documentation</span>
              <a href={appConfig.support.documentation} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                View Docs →
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Website</span>
              <a href={appConfig.support.website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                Visit Website →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
