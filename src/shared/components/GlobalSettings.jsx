// src/shared/components/GlobalSettings.jsx
import React, { useState } from 'react';
import { Settings, Info, Building2, Save, X } from 'lucide-react';

const GlobalSettings = ({ isOpen, onClose, appConfig, onSaveConfig }) => {
  const [activeTab, setActiveTab] = useState('config');
  const [config, setConfig] = useState(appConfig);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig(config);
    onClose();
  };

  const tabs = [
    { id: 'config', label: 'App Configuration', icon: Building2 },
    { id: 'about', label: 'About', icon: Info }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Settings size={24} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Global Settings</h2>
              <p className="text-sm text-slate-500 mt-0.5">Configure application settings and view information</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all relative ${
                  activeTab === tab.id
                    ? 'text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'config' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Application Configuration</h3>
                
                {/* App Name */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Application Name
                  </label>
                  <input
                    type="text"
                    value={config.appName}
                    onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    placeholder="Enter application name"
                  />
                </div>

                {/* Company Name */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={config.company}
                    onChange={(e) => setConfig({ ...config, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    placeholder="Enter company name"
                  />
                </div>

                {/* Logo URL */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    value={config.appLogo}
                    onChange={(e) => setConfig({ ...config, appLogo: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    placeholder="Enter logo URL or path"
                  />
                  <p className="text-xs text-slate-500 mt-2">Enter a URL or path to your logo image</p>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                    rows="3"
                    placeholder="Enter application description"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                  <Settings size={40} className="text-white" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-800 mb-2">{config.appName}</h3>
                <p className="text-slate-600 font-medium">{config.description}</p>
              </div>

              {/* Version Info */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Version Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Version</p>
                    <p className="text-lg font-bold text-slate-800">{config.appVersion}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Build Date</p>
                    <p className="text-lg font-bold text-slate-800">{config.buildDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Company</p>
                    <p className="text-lg font-bold text-slate-800">{config.company}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">License</p>
                    <p className="text-lg font-bold text-slate-800">{config.license}</p>
                  </div>
                </div>
              </div>

              {/* Modules */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Installed Modules</h4>
                <div className="space-y-3">
                  {config.modules.map(module => (
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
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Key Features</h4>
                <div className="grid grid-cols-2 gap-2">
                  {config.features.map((feature, index) => (
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
                    <a href={`mailto:${config.support.email}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                      {config.support.email}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Documentation</span>
                    <a href={config.support.documentation} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                      View Docs →
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Website</span>
                    <a href={config.support.website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                      Visit Website →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Only show for config tab */}
        {activeTab === 'config' && (
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSettings;
