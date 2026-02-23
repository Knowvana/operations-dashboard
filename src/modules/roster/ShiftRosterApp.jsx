// src/modules/roster/ShiftRosterApp.jsx
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileBarChart, Users, Database } from 'lucide-react';
import { rosterDefaults, ModuleLayout, SettingsModal } from '@shared';
import { getSafeDateKey, generateRoster } from './utils/rosterUtils';

import RosterConfig from './components/RosterConfig';
import RosterDashboard from './components/RosterDashboard';
import RosterReports from './components/RosterReports';
import RosterSettings from './components/RosterSettings';

export default function ShiftRosterApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // <-- Modal State
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [employees, setEmployees] = useState(rosterDefaults.initialEmployees);
  const [shifts, setShifts] = useState(rosterDefaults.initialShifts);
  const [leaves, setLeaves] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [generationError, setGenerationError] = useState(null);

  useEffect(() => { handleGenerate(); }, [currentDate.getMonth(), currentDate.getFullYear()]); 

  const handleGenerate = () => {
    const slotsNeededPerWeek = shifts.reduce((sum, shift) => sum + (shift.reqWeekday * 5) + (shift.reqWeekend * 2), 0);
    const capacityPerWeek = employees.length * 5;

    if (slotsNeededPerWeek > capacityPerWeek) {
      setGenerationError(`Capacity Issue: Your shift setup requires ${slotsNeededPerWeek} slots/week, but ${employees.length} staff can only cover ${capacityPerWeek} slots.`);
      setSchedule(null);
      return;
    }
    setGenerationError(null);
    const { roster } = generateRoster(employees, shifts, currentDate.getFullYear(), currentDate.getMonth(), leaves);
    setSchedule(roster);
  };

  const handleUpdateSchedule = (dateKey, shiftId, newWorkerIds) => {
    setSchedule(prev => {
      if (!prev) return prev;
      return { ...prev, [dateKey]: { ...prev[dateKey], [shiftId]: newWorkerIds } };
    });
  };

  const handleLoadDemoData = () => {
    setEmployees(rosterDefaults.initialEmployees);
    setShifts(rosterDefaults.initialShifts);
    setLeaves([]);
    setSchedule(null);
    setGenerationError(null);
    setIsSettingsOpen(false); // Close modal on action
  };

  const handleDeleteDemoData = () => {
    if (window.confirm("Are you sure you want to permanently delete all roster data?")) {
        setEmployees([]);
        setShifts([{ id: 'default', label: 'Default Shift', time: '09:00 - 17:00', color: 'bg-slate-100 text-slate-800 border-slate-200', reqWeekday: 1, reqWeekend: 0 }]);
        setLeaves([]);
        setSchedule(null);
        setGenerationError(null);
        setIsSettingsOpen(false); // Close modal on action
    }
  };

  const navigateDate = (delta) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + delta);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + (delta * 7));
    else newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const getDisplayDateRange = () => {
    if (viewMode === 'day') return currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Intercept the settings tab click
  const handleTabChange = (tabId) => {
    if (tabId === 'settings') {
      setIsSettingsOpen(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const ROSTER_NAV_ITEMS = [
    { id: 'dashboard', label: 'Planner Grid', icon: LayoutDashboard },
    { id: 'reports', label: 'Compliance Reports', icon: FileBarChart },
    { id: 'config', label: 'Workforce Config', icon: Users },
  ];

  // Config for the reusable Settings Modal
  const SETTINGS_TABS = [
    { id: 'data', label: 'Data Management', icon: Database }
  ];

  return (
    <ModuleLayout
      title="Roster Management"
      subtitle="Scheduling & Allocation"
      navItems={ROSTER_NAV_ITEMS}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {activeTab === 'dashboard' && (
        <RosterDashboard 
            schedule={schedule} employees={employees} shifts={shifts}
            viewMode={viewMode} setViewMode={setViewMode}
            currentDate={currentDate} navigateDate={navigateDate} 
            getDisplayDateRange={getDisplayDateRange} 
            handleGenerate={handleGenerate} downloadCSV={() => {}} generationError={generationError}
            onUpdateSchedule={handleUpdateSchedule} 
        />
      )}

      {activeTab === 'reports' && (
        <RosterReports 
            schedule={schedule} employees={employees} shifts={shifts} leaves={leaves} 
            viewMode={viewMode} setViewMode={setViewMode}
            currentDate={currentDate} navigateDate={navigateDate}
            getDisplayDateRange={getDisplayDateRange}
        />
      )}

      {activeTab === 'config' && (
        <RosterConfig 
            shifts={shifts} setShifts={setShifts}
            employees={employees} setEmployees={setEmployees}
            leaves={leaves} setLeaves={setLeaves}
        />
      )}

      {/* The Reusable Modal Popup */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Roster Settings"
        tabs={SETTINGS_TABS}
      >
        {/* Render Prop Pattern: Show specific component based on active tab */}
        {(activeModalTab) => (
          <>
            {activeModalTab === 'data' && (
              <RosterSettings onLoadDemo={handleLoadDemoData} onDeleteDemo={handleDeleteDemoData} />
            )}
          </>
        )}
      </SettingsModal>

    </ModuleLayout>
  );
}