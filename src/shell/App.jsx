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
  initializeFirebase, SettingsModal,
  getCurrentTenantId, authenticateUser, LoginForm, DefaultAdminLoginPage
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
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);
  const [appConfig, setAppConfig] = useState(defaultAppConfig);
  const [tenantId, setTenantId] = useState(null);
  const [isDefaultAdminMode, setIsDefaultAdminMode] = useState(false);

  // 1. App Initialization & URL Parameter Detection
  useEffect(() => {
    const initApp = async () => { 
      try { 
        await initializeFirebase();
        
        // Check URL for default admin mode
        const urlParams = new URLSearchParams(window.location.search);
        const loginMode = urlParams.get('login');
        if (loginMode === 'defaultadmin') {
          setIsDefaultAdminMode(true);
        }
        
        setIsInitializing(false);
      } catch (e) { 
        console.error(e);
        setIsInitializing(false);
      } 
    };
    initApp();
  }, []);

  // Set tenant ID on user initialization
  useEffect(() => {
    if (!isInitializing && user) {
      const currentTenantId = getCurrentTenantId();
      setTenantId(currentTenantId);
    }
  }, [isInitializing, user]);

  const handleLogin = async (email, password) => {
    setIsLoggingIn(true);
    try {
      const authenticatedUser = await authenticateUser(email, password);
      setUser(authenticatedUser);
    } catch (error) {
      setIsLoggingIn(false);
      throw error;
    }
  };

  const handleDefaultAdminLogin = async (adminUser) => {
    setIsLoggingIn(true);
    try {
      setUser(adminUser);
      setActiveModule('admin');
    } catch (error) {
      setIsLoggingIn(false);
      throw error;
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveModule('ops_monitor');
    setIsDefaultAdminMode(false);
  };

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-light">Loading environment...</div>;
  }

  // Show default admin login page if URL parameter is set and no user is authenticated
  if (!user && isDefaultAdminMode) {
    return (
      <DefaultAdminLoginPage 
        onLogin={handleDefaultAdminLogin} 
        isLoading={isLoggingIn}
        appName={appConfig.appName || 'Knowvana'}
      />
    );
  }

  // Show regular login form if no user is authenticated
  if (!user) {
    return (
      <LoginForm 
        onLogin={handleLogin} 
        isLoading={isLoggingIn}
        appName={appConfig.appName || 'Knowvana'}
      />
    );
  }

  // 2. The Module Router
  const renderActiveModule = () => {
    // Default admin can only access admin module
    if (user?.isDefaultAdmin) {
      return <AdminApp user={user} isDefaultAdminMode={true} />;
    }
    
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

  // For default admin mode, show minimal UI with only logout option
  if (user?.isDefaultAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
        {/* Minimal Nav for Default Admin */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500"></div>
        <header className="bg-white/90 backdrop-blur-2xl border-b border-slate-200/80 sticky top-0 z-[60] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="w-full max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-xl shadow-md">
                <span className="text-white text-lg font-bold">⚙️</span>
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-slate-800">Initial Setup</h1>
                <p className="text-xs text-slate-400">Database Initialization</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              Exit Setup
            </button>
          </div>
        </header>

        {/* PLUGGABLE MODULE AREA */}
        <div className="flex-1 flex flex-col relative">
          {renderActiveModule()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* GLOBAL SHELL NAV */}
      <GlobalNavigation 
        activeModule={activeModule} 
        onSwitchModule={setActiveModule}
        onOpenGlobalSettings={() => setIsGlobalSettingsOpen(true)}
        onLogout={handleLogout}
        user={user}
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