import React, { useState, useEffect, useMemo } from 'react';
import { Activity, BarChart2, List } from 'lucide-react'; 

// Import Global Shell
import GlobalNavigation from './components/GlobalNavigation';

import Header from './components/Header';
import ShiftDashboard from './components/ShiftDashboard';
import TimelineView from './components/TimelineView';
import ReportView from './components/ReportView';
import TasksListView from './components/TasksListView'; 
import TaskModal from './components/TaskModal';
import EditTaskModal from './components/EditTaskModal';
import ShiftManager from './components/ShiftManager';
import EmptyState from './components/EmptyState';
import ConfirmationModal from './components/ConfirmationModal';
import ShiftRosterApp from './modules/roster/ShiftRosterApp'; 
import { formatTime, isTimeInShift, calculateStats } from './utils/utils';
import { 
  initializeFirebase, signInUser, onUserStateChanged, subscribeToTasks,
  updateTask, generateFullSchedule, deleteAllTasks, deleteDemoTasks, saveTasksBatch
} from './services/firebaseService';

export default function App() {
  // --- Global State ---
  const [activeModule, setActiveModule] = useState('ops_monitor'); 

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]); 
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('timeline');
  const [isLoading, setIsLoading] = useState(true); 
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('shifts');
  
  const [confirmAction, setConfirmAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processSuccess, setProcessSuccess] = useState(false);

  const [shifts, setShifts] = useState([
    { id: 'shift-a', name: 'Shift A', start: '06:00', end: '14:00', lead: 'Alex Mercer', resources: ['Sarah Jenkins', 'Mike Ross', 'David Kim'] },
    { id: 'shift-b', name: 'Shift B', start: '14:00', end: '22:00', lead: 'Priya Patel', resources: ['Emily Blunt', 'John Krasinski', 'Cillian Murphy'] },
    { id: 'shift-c', name: 'Shift C', start: '22:00', end: '06:00', lead: 'James Holden', resources: ['Amos Burton', 'Naomi Nagata'] }
  ]);

  const currentShift = useMemo(() => {
    const timeStr = formatTime(currentTime);
    const active = shifts.find(s => isTimeInShift(timeStr, s.start, s.end));
    return active || shifts[0];
  }, [shifts, currentTime]);

  useEffect(() => {
    const initApp = async () => { try { await initializeFirebase(); await signInUser(); } catch (e) { console.error(e); } };
    initApp();
  }, []);

  useEffect(() => { const u = onUserStateChanged(setUser); return () => u(); }, []);
  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 30000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToTasks((fetchedTasks) => {
      setTasks(fetchedTasks || []);
      setIsLoading(false); 
    });
    return () => unsubscribe();
  }, [user]);

  const handleUpdateTask = async (taskId, updates) => { try { await updateTask(taskId, updates); } catch (e) { console.error(e); } };
  const handleEditTask = (task) => setEditingTask(task);
  const handleEditTaskClose = () => setEditingTask(null);
  const handleEditTaskUpdate = async (taskId, updates) => { try { await updateTask(taskId, updates); setEditingTask(null); } catch (e) { console.error(e); } };
  const handleDataAction = async (actionDetails) => { if (!user) return; setConfirmAction(actionDetails); };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;
    setIsProcessing(true);
    try {
        switch (confirmAction.type) {
            case 'load_demo': await generateFullSchedule(); break;
            case 'clear_demo': await deleteDemoTasks(); break;
            case 'delete_all': await deleteAllTasks(); break;
            default: break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProcessSuccess(true);
    } catch (e) {
        console.error(e); alert("An error occurred.");
    } finally { setIsProcessing(false); }
  };

  const resetConfirmationState = () => { setConfirmAction(null); setIsProcessing(false); setProcessSuccess(false); };

  const handleImportTasks = async (importedTasks, sourceLabel = 'Import') => {
    const processedTasks = importedTasks.map(t => {
        const taskName = t.taskName || t.title || 'Untitled Task';
        const taskId = t.taskId || `task_${taskName.replace(/\s+/g, '_')}_${Math.random().toString(36).substr(2, 9)}`;
        const addedByUserValue = user ? (user.displayName || user.email || 'User') : 'Guest';
        return {
            taskId: taskId, taskName: taskName, AddedByProcess: sourceLabel === 'Manual' ? 'Manual_Entry' : 'System_Import',
            AddedByUser: addedByUserValue, category: t.category || 'General', createdAt: new Date().toISOString(), cron_schedule: t.cron_schedule || '* * * * *'
        };
    });
    try { await saveTasksBatch(processedTasks); } catch (error) { throw error; }
  };

  const openSettings = (tab = 'shifts') => { setSettingsTab(tab); setIsSettingsOpen(true); };

  const dayData = useMemo(() => calculateStats(tasks, currentTime), [tasks, currentTime]);
  const shiftData = useMemo(() => {
    const shiftTasks = tasks.filter(t => isTimeInShift(t.plannedStart, currentShift.start, currentShift.end));
    return calculateStats(shiftTasks, currentTime);
  }, [tasks, currentShift, currentTime]);
  
  const complianceStatus = shiftData.compliant ? 'compliant' : 'non_compliant';

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-light">Loading environment...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      
      {/* 1. THE GLOBAL APP SHELL NAV */}
      <GlobalNavigation activeModule={activeModule} onSwitchModule={setActiveModule} />

      {/* 2. THE ACTIVE MODULE */}
      <div className="flex-1 flex flex-col relative">
        {activeModule === 'roster_planner' ? (
           
           <ShiftRosterApp />

        ) : (
           
           <div className="flex-1 bg-gradient-to-br from-blue-50/50 via-teal-50/50 to-green-50/50">
              <Header 
                complianceStatus={complianceStatus} 
                timeRemaining={`${19 - currentTime.getHours()}h ${60 - currentTime.getMinutes()}m`}
                shiftDetails={currentShift}
                onOpenSettings={() => openSettings('shifts')}
                onOpenImport={() => openSettings('import')}
              />
              
              <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {tasks.length === 0 ? (
                  <EmptyState onImport={() => openSettings('import')} onLoadDemo={() => handleDataAction({type: 'load_demo', title: 'Load Demo Data', desc: 'Add demo tasks?'})} />
                ) : (
                  <>
                    <ShiftDashboard dayData={dayData} shiftData={shiftData} shiftDetails={currentShift} />

                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        {viewMode === 'timeline' && 'Shift Timeline'}
                        {viewMode === 'report' && 'Analytics Report'}
                        {viewMode === 'tasks' && 'All Tasks'}
                        <span className="text-xs font-normal text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                          {currentTime.toLocaleDateString()}
                        </span>
                      </h2>
                      <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                        <button onClick={() => setViewMode('timeline')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'timeline' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Activity size={14} /> Timeline</button>
                        <button onClick={() => setViewMode('report')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'report' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><BarChart2 size={14} /> Analytics</button>
                        <button onClick={() => setViewMode('tasks')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'tasks' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><List size={14} /> All Tasks</button>
                      </div>
                    </div>

                    {viewMode === 'timeline' && <TimelineView tasks={tasks} shifts={shifts} currentTime={currentTime} onSelectTask={setSelectedTask} />}
                    {viewMode === 'report' && <ReportView tasks={tasks} />}
                    {viewMode === 'tasks' && <TasksListView tasks={tasks} onSelectTask={handleEditTask} />}
                  </>
                )}
              </main>

              {/* Modals */}
              {selectedTask && <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={handleUpdateTask} shiftLead={currentShift.lead} />}
              {editingTask && <EditTaskModal task={editingTask} onClose={handleEditTaskClose} onUpdate={handleEditTaskUpdate} />}
              
              {isSettingsOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 transition-all duration-300">
                  <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl border border-slate-100 flex overflow-hidden h-[85vh] relative">
                    <ShiftManager 
                      shifts={shifts} onSave={setShifts} onClose={() => setIsSettingsOpen(false)} 
                      onDataAction={handleDataAction} onViewTasks={() => setViewMode('tasks')}
                      initialTab={settingsTab} onImport={handleImportTasks} existingTasks={tasks}
                    />
                    <ConfirmationModal
                      action={confirmAction} isProcessing={isProcessing} isSuccess={processSuccess}
                      onConfirm={executeConfirmedAction} onCancel={resetConfirmationState}
                      onSuccessClose={() => { resetConfirmationState(); setIsSettingsOpen(false); setViewMode('tasks'); }}
                      onViewTasks={() => { resetConfirmationState(); setIsSettingsOpen(false); setViewMode('tasks'); }}
                    />
                  </div>
                </div>
              )}
           </div>
        )}
      </div>

    </div>
  );
}