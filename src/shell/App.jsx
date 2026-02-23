// src/shell/App.jsx
import React, { useState, useEffect } from 'react';

// Shell Components
import GlobalNavigation from './GlobalNavigation';

// Module Entry Points
import OpsMonitorApp from '../modules/ops_monitor/OpsMonitorApp';
import ShiftRosterApp from '../modules/roster/ShiftRosterApp';

// Shared Services
import { initializeFirebase, signInUser, onUserStateChanged } from '@shared';

export default function App() {
  const [activeModule, setActiveModule] = useState('ops_monitor'); 
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

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
      default:
        return <OpsMonitorApp user={user} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* GLOBAL SHELL NAV */}
      <GlobalNavigation activeModule={activeModule} onSwitchModule={setActiveModule} />

      {/* PLUGGABLE MODULE AREA */}
      <div className="flex-1 flex flex-col relative">
        {renderActiveModule()}
      </div>
    </div>
  );
}