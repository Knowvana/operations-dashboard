import React, { useState, useEffect, useMemo } from 'react';
import { Activity, BarChart2, List, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'; 
import Header from './components/Header';
import ShiftDashboard from './components/ShiftDashboard';
import TimelineView from './components/TimelineView';
import ReportView from './components/ReportView';
import TasksListView from './components/TasksListView'; 
import TaskModal from './components/TaskModal';
import ShiftManager from './components/ShiftManager';
import ImportTasksModal from './components/ImportTasksModal';
import EmptyState from './components/EmptyState';
import { formatTime, isTimeInShift, calculateStats } from './utils/utils';
import { 
  initializeFirebase, 
  signInUser, 
  onUserStateChanged,
  subscribeToTasks,
  updateTask,
  generateFullSchedule,
  deleteAllTasks,
  deleteDemoTasks
} from './services/firebaseService';

export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]); 
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('timeline');
  const [isManageShiftsOpen, setIsManageShiftsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [importModalOpen, setImportModalOpen] = useState(false);
  
  // New states for Demo Loading UX
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [showDemoSuccess, setShowDemoSuccess] = useState(false);

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
  
  const handleDataAction = async (actionType) => {
    if (!user) return;
    try { 
        if (actionType === 'load_demo') {
            setIsDemoLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1500));
            await generateFullSchedule();
            setIsDemoLoading(false);
            setShowDemoSuccess(true);
        } else if (actionType === 'clear_demo') {
            await deleteDemoTasks();
        } else if (actionType === 'delete_all') {
            await deleteAllTasks();
        }
    } catch (e) { 
        console.error(e); 
        setIsDemoLoading(false);
    }
  };

  const handleImportTasks = (importedTasks, sourceLabel = 'Import') => {
    const enrichedTasks = importedTasks.map(t => {
        const rawCron = t.cronExpression || t['Cron Expression'] || t['CronExpression'];
        const rawManualDate = t.manualDate || t['Date'];
        
        return {
            ...t,
            createdAt: t.createdAt || new Date().toISOString(),
            cronExpression: rawCron || '',
            manualDate: rawManualDate || '',
            addedBy: sourceLabel,
            user: 'Static User' // Placeholder as requested
        };
    });

    setTasks(prev => [...prev, ...enrichedTasks]);
  };

  const dayData = useMemo(() => calculateStats(tasks, currentTime), [tasks, currentTime]);
  const shiftData = useMemo(() => {
    const shiftTasks = tasks.filter(t => isTimeInShift(t.plannedStart, currentShift.start, currentShift.end));
    return calculateStats(shiftTasks, currentTime);
  }, [tasks, currentShift, currentTime]);
  
  const complianceStatus = shiftData.compliant ? 'compliant' : 'non_compliant';

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-light">Loading environment...</div>;

  if (isDemoLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
         <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="text-indigo-600 animate-pulse" size={24}/>
            </div>
         </div>
         <h2 className="text-xl font-bold text-slate-800">Setting up Demo Environment</h2>
         <p className="text-slate-500 mt-2">Generating sample tasks and schedules...</p>
      </div>
    );
  }

  if (showDemoSuccess) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
             <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-8 text-center border border-slate-100 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
                    <CheckCircle2 size={40} strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Demo Data Loaded!</h2>
                <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                    We've successfully populated your timeline with sample tasks. You can now explore the dashboard features.
                </p>
                <button 
                    onClick={() => {
                      setViewMode('tasks'); 
                      setShowDemoSuccess(false);
                    }}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                >
                    View All Tasks <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                </button>
             </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 font-sans text-slate-800">
      
      <Header 
        complianceStatus={complianceStatus} 
        timeRemaining={`${19 - currentTime.getHours()}h ${60 - currentTime.getMinutes()}m`}
        shiftDetails={currentShift}
        onOpenSettings={() => setIsManageShiftsOpen(true)}
        onOpenImport={() => setImportModalOpen(true)}
      />
      
      <ImportTasksModal 
        open={importModalOpen} 
        onClose={() => setImportModalOpen(false)} 
        onImport={handleImportTasks} 
        onViewTasks={() => setViewMode('tasks')} 
      />
      
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {tasks.length === 0 ? (
          <EmptyState 
            onImport={() => setImportModalOpen(true)} 
            onLoadDemo={() => handleDataAction('load_demo')} 
          />
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
                <button 
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'timeline' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Activity size={14} /> Timeline
                </button>
                <button 
                  onClick={() => setViewMode('report')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'report' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <BarChart2 size={14} /> Analytics
                </button>
                <button 
                  onClick={() => setViewMode('tasks')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'tasks' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <List size={14} /> All Tasks
                </button>
              </div>
            </div>

            {viewMode === 'timeline' && <TimelineView tasks={tasks} shifts={shifts} currentTime={currentTime} onSelectTask={setSelectedTask} />}
            {viewMode === 'report' && <ReportView tasks={tasks} />}
            {viewMode === 'tasks' && <TasksListView tasks={tasks} onSelectTask={setSelectedTask} />}
          </>
        )}

      </main>

      {selectedTask && <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={handleUpdateTask} shiftLead={currentShift.lead} />}
      
      {isManageShiftsOpen && (
        <ShiftManager 
          shifts={shifts} 
          onSave={setShifts} 
          onClose={() => setIsManageShiftsOpen(false)} 
          onDataAction={handleDataAction} 
        />
      )}
    </div>
  );
}