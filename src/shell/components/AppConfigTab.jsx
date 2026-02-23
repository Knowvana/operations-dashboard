// src/shell/components/AppConfigTab.jsx
import React, { useState } from 'react';
import { Save } from 'lucide-react';

export default function AppConfigTab({ appConfig, onSave, onClose }) {
  const [config, setConfig] = useState(appConfig);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div className="h-full flex flex-col p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">Application Configuration</h3>
        <p className="text-slate-500 mt-2 font-medium">Customize your application settings and branding</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        <div className="space-y-6 max-w-2xl">
          {/* App Name */}
          <div>
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
            <p className="text-xs text-slate-500 mt-2">This will appear in the navigation header</p>
          </div>

          {/* Company Name */}
          <div>
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
          <div>
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
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
              rows="4"
              placeholder="Enter application description"
            />
          </div>
        </div>
      </div>

      {/* Footer with Save Button */}
      <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end gap-3">
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
    </div>
  );
}
