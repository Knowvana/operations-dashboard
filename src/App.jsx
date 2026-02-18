import React, { useState, useEffect, useMemo } from 'react';
import { Activity, BarChart2, List } from 'lucide-react'; 
import Header from './components/Header';
import ShiftDashboard from './components/ShiftDashboard';
import TimelineView from './components/TimelineView';
import ReportView from './components/ReportView';
import TasksListView from './components/TasksListView'; 
import TaskModal from './components/TaskModal';
import EditTaskModal from './components/EditTaskModal';
import ShiftManager from './components/ShiftManager';
import ImportTasksModal from './components/ImportTasksModal';
import EmptyState from './components/EmptyState';
import ConfirmationModal from './components/ConfirmationModal';
import { formatTime, isTimeInShift, calculateStats } from './utils/utils';
import { 
  initializeFirebase, 
  signInUser, 
  onUserStateChanged,
  subscribeToTasks,
  updateTask,
  generateFullSchedule,
  deleteAllTasks,
  deleteDemoTasks,
  saveTasksBatch
} from './services/firebaseService';

export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]); 
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('timeline');
  const [isManageShiftsOpen, setIsManageShiftsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [importModalOpen, setImportModalOpen] = useState(false);
  
  // States for the generic confirmation modal
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
  
  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  const handleEditTaskClose = () => {
    setEditingTask(null);
  };

  const handleEditTaskUpdate = async (taskId, updates) => {
    try {
      await updateTask(taskId, updates);
      setEditingTask(null);
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleDataAction = async (actionDetails) => {
    if (!user) return;
    setConfirmAction(actionDetails);
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;

    setIsProcessing(true);
    try {
        switch (confirmAction.type) {
            case 'load_demo':
                await generateFullSchedule();
                break;
            case 'clear_demo':
                await deleteDemoTasks();
                break;
            case 'delete_all':
                await deleteAllTasks();
                break;
            default:
                console.warn(`Unknown action type: ${confirmAction.type}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // UX delay
        setProcessSuccess(true);
    } catch (e) {
        console.error("Data action failed:", e);
        // Reset state on failure
        setIsProcessing(false);
        setConfirmAction(null);
        alert("An error occurred. Please try again.");
    } finally {
        setIsProcessing(false);
    }
  };

  const resetConfirmationState = () => {
    setConfirmAction(null);
    setIsProcessing(false);
    setProcessSuccess(false);
  };

  const handleImportTasks = async (importedTasks, sourceLabel = 'Import') => {
    const enrichedTasks = importedTasks.map(t => {
        const title = t.title || t['Task Name'] || 'Untitled Task';
        const plannedStart = t.plannedStart || t['Schedule'] || '00:00';
        const type = t.type || t['Category'] || 'General';
        // ... (rest of mapping)
        
        return {
            ...t,
            id: t.id || `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title, plannedStart, type,
            status: 'pending',
            createdAt: t.createdAt || new Date().toISOString(),
            // ... (rest of enrichment)
            addedBy: sourceLabel,
        };
    });

    try {
        await saveTasksBatch(enrichedTasks);
    } catch (error) {
        console.error("Failed to save imported tasks", error);
        alert("Failed to save tasks to database.");
    }
  };

  const dayData = useMemo(() => calculateStats(tasks, currentTime), [tasks, currentTime]);
  const shiftData = useMemo(() => {
    const shiftTasks = tasks.filter(t => isTimeInShift(t.plannedStart, currentShift.start, currentShift.end));
    return calculateStats(shiftTasks, currentTime);
  }, [tasks, currentShift, currentTime]);
  
  const complianceStatus = shiftData.compliant ? 'compliant' : 'non_compliant';

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-light">Loading environment...</div>;

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
            onLoadDemo={() => handleDataAction({type: 'load_demo', title: 'Load Demo Data', desc: 'This will add a set of sample tasks to your board. Is that okay?'})} 
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
            {viewMode === 'tasks' && <TasksListView tasks={tasks} onSelectTask={handleEditTask} />}
          </>
        )}

      </main>

      {selectedTask && <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={handleUpdateTask} shiftLead={currentShift.lead} />}
      
      {editingTask && <EditTaskModal task={editingTask} onClose={handleEditTaskClose} onUpdate={handleEditTaskUpdate} />}
      
      {isManageShiftsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-100 flex overflow-hidden max-h-[90vh] relative">
            <ShiftManager 
              shifts={shifts} 
              onSave={setShifts} 
              onClose={() => setIsManageShiftsOpen(false)} 
              onDataAction={handleDataAction}
              onViewTasks={() => setViewMode('tasks')}
            />
            
            {/* Confirmation Modal positioned within the settings modal */}
            <ConfirmationModal
              action={confirmAction}
              isProcessing={isProcessing}
              isSuccess={processSuccess}
              onConfirm={executeConfirmedAction}
              onCancel={resetConfirmationState}
              onSuccessClose={() => {
                  resetConfirmationState();
                  setIsManageShiftsOpen(false); // Close shift manager if it was open
                  setViewMode('tasks'); // Go to tasks view
              }}
              onViewTasks={() => {
                  resetConfirmationState();
                  setIsManageShiftsOpen(false); // Close shift manager
                  setViewMode('tasks'); // Go to tasks view
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}