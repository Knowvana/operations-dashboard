import React, { useState, useEffect } from 'react';
import rosterDefaults from '../../data/rosterDefaults.json';
import { getSafeDateKey, generateRoster } from './utils/rosterUtils';
import { WEEKDAYS } from './utils/rosterConstants';

import RosterConfig from './components/RosterConfig';
import RosterDashboard from './components/RosterDashboard';
import RosterReports from './components/RosterReports';

export default function ShiftRosterApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [employees, setEmployees] = useState(rosterDefaults.initialEmployees);
  const [shifts, setShifts] = useState(rosterDefaults.initialShifts);
  const [leaves, setLeaves] = useState([]);

  const [schedule, setSchedule] = useState(null);
  const [stats, setStats] = useState(null);
  const [generationError, setGenerationError] = useState(null);

  useEffect(() => { handleGenerate(); }, [currentDate.getMonth(), currentDate.getFullYear()]); 

  const handleGenerate = () => {
    const slotsNeededPerWeek = shifts.reduce((sum, shift) => sum + (shift.reqWeekday * 5) + (shift.reqWeekend * 2), 0);
    const capacityPerWeek = employees.length * 5;

    if (slotsNeededPerWeek > capacityPerWeek) {
      setGenerationError(`Capacity Issue: Your shift setup requires ${slotsNeededPerWeek} slots/week, but ${employees.length} staff can only cover ${capacityPerWeek} slots.`);
      setSchedule(null);
      setStats(null);
      return;
    }

    setGenerationError(null);
    const { roster, employeeStats } = generateRoster(employees, shifts, currentDate.getFullYear(), currentDate.getMonth(), leaves);
    setSchedule(roster);
    setStats(employeeStats);
  };

  const navigateDate = (delta) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + delta);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + (delta * 7));
    else newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const navigateMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const getDisplayDateRange = () => {
    if (viewMode === 'day') return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    else if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const downloadCSV = () => {
    if (!schedule) return;
    let csvContent = "data:text/csv;charset=utf-8,Date,Day,Shift,Time,Employee\n";
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateKey = getSafeDateKey(d);
      shifts.forEach(shift => {
        const workerIds = schedule[dateKey]?.[shift.id] || [];
        workerIds.forEach(id => {
          const emp = employees.find(e => e.id === id);
          if (emp) csvContent += `${dateKey},${WEEKDAYS[d.getDay()]},${shift.label},${shift.time},${emp.name}\n`;
        });
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Roster_${currentDate.toISOString().slice(0,7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50">
      
      {/* Refined Roster Sub-Header */}
      <nav className="bg-slate-50/90 backdrop-blur-xl border-b border-slate-200/60 sticky top-[68px] z-40 shadow-sm transition-all duration-300">
        <div className="w-full max-w-[1800px] mx-auto px-6 md:px-10 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Context Title */}
            <div className="hidden md:flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
               <h2 className="text-lg font-bold text-slate-800 tracking-tight">Roster Management</h2>
               <span className="text-slate-300 text-xs px-1">|</span>
               <p className="text-xs font-medium text-slate-500">Scheduling & Allocation</p>
            </div>
            
            {/* Elegant View Tabs */}
            <div className="flex p-1 bg-white rounded-full border border-slate-200/80 shadow-sm w-full md:w-auto overflow-x-auto hide-scrollbar">
               <button 
                  onClick={() => setActiveTab('dashboard')} 
                  className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                Planner Grid
              </button>
              <button 
                  onClick={() => setActiveTab('reports')} 
                  className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'reports' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                Compliance Reports
              </button>
              <button 
                  onClick={() => setActiveTab('config')} 
                  className={`flex-1 md:flex-none px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeTab === 'config' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                Workforce Config
              </button>
            </div>
            
            {/* Empty div for flexbox spacing (keeps tabs centered if desired) */}
            <div className="hidden lg:block w-[240px]"></div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="w-full max-w-[1800px] mx-auto p-6 md:p-8 lg:p-10 flex-1">
        {activeTab === 'dashboard' && (
          <RosterDashboard 
            schedule={schedule} employees={employees} shifts={shifts}
            viewMode={viewMode} setViewMode={setViewMode}
            currentDate={currentDate} navigateDate={navigateDate} getDisplayDateRange={getDisplayDateRange}
            handleGenerate={handleGenerate} downloadCSV={downloadCSV} generationError={generationError}
          />
        )}

        {activeTab === 'reports' && (
          <RosterReports 
            schedule={schedule} employees={employees} shifts={shifts}
            leaves={leaves} currentDate={currentDate} navigateMonth={navigateMonth}
          />
        )}

        {activeTab === 'config' && (
          <RosterConfig 
             shifts={shifts} setShifts={setShifts}
             employees={employees} setEmployees={setEmployees}
             leaves={leaves} setLeaves={setLeaves}
          />
        )}
      </main>
    </div>
  );
}