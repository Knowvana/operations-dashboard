// src/shell/App.jsx
import React, { useState, useEffect } from 'react';

// Shell Components
import GlobalNavigation from './GlobalNavigation';

// Module Entry Points
import OpsMonitorApp from '../modules/ops_monitor/OpsMonitorApp';
import ShiftRosterApp from '../modules/roster/ShiftRosterApp';
import AdminApp from '../modules/admin/AdminApp';

// Shared Services
import { 
  initializeFirebase, signInUser, onUserStateChanged, SettingsModal,
  getCurrentTenantId
} from '@shared';
import defaultAppConfig from '@shared/data/appConfig.json';
import { Settings, Building2, Info, Database } from 'lucide-react';
import AppConfigTab from './components/AppConfigTab';
import AboutTab from './components/AboutTab';
import DatabaseSetupTab from './components/DatabaseSetupTab';

export default function App() {
  const [activeModule, setActiveModule] = useState('ops_monitor'); 
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);
  const [appConfig, setAppConfig] = useState(defaultAppConfig);
  const [tenantId, setTenantId] = useState(null);

  // 1. App Initialization & Auth
  useEffect(() => {
    const initApp = async () => { 
      try { 
        await initializeFirebase(); 
        await signInUser(); 
      } catch (e) { 
        console.error(e); 
      } 
    };
    initApp();
  }, []);

  useEffect(() => { 
    const unsubscribe = onUserStateChanged((u) => {
      setUser(u);
      setIsInitializing(false);
    }); 
    return () => unsubscribe(); 
  }, []);

  // Set tenant ID on user initialization
  useEffect(() => {
    if (!isInitializing && user) {
      const currentTenantId = getCurrentTenantId();
      setTenantId(currentTenantId);
    }
  }, [isInitializing, user]);

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-light">Loading environment...</div>;
  }

  // 2. The Module Router
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'ops_monitor':
        return <OpsMonitorApp user={user} />;
      case 'roster_planner':
        return <ShiftRosterApp user={user} />;
      case 'admin':
        return <AdminApp user={user} />;
      default:
        return <OpsMonitorApp user={user} />;
    }
  };

  const handleSaveConfig = (newConfig) => {
    setAppConfig(newConfig);
    console.log('Configuration updated');
  };

  const GLOBAL_SETTINGS_TABS = [
    { id: 'database', label: 'Database Setup', icon: Database },
    { id: 'config', label: 'App Configuration', icon: Building2 },
    { id: 'about', label: 'About', icon: Info }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* GLOBAL SHELL NAV */}
      <GlobalNavigation 
        activeModule={activeModule} 
        onSwitchModule={setActiveModule}
        onOpenGlobalSettings={() => setIsGlobalSettingsOpen(true)}
        appName={appConfig.appName}
        isAdmin={true}
      />

      {/* PLUGGABLE MODULE AREA */}
      <div className="flex-1 flex flex-col relative">
        {renderActiveModule()}
      </div>

      {/* GLOBAL SETTINGS MODAL */}
      <SettingsModal
        isOpen={isGlobalSettingsOpen}
        onClose={() => setIsGlobalSettingsOpen(false)}
        title="Global Settings"
        icon={Settings}
        tabs={GLOBAL_SETTINGS_TABS}
        initialTab="config"
      >
        {(activeTab) => (
          <>
            {activeTab === 'database' && (
              <DatabaseSetupTab />
            )}
            {activeTab === 'config' && (
              <AppConfigTab 
                appConfig={appConfig}
                onSave={handleSaveConfig}
                onClose={() => setIsGlobalSettingsOpen(false)}
              />
            )}
            {activeTab === 'about' && (
              <AboutTab appConfig={appConfig} />
            )}
          </>
        )}
      </SettingsModal>

    </div>
  );
}