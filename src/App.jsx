import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Activity, BarChart2 } from 'lucide-react';
import Header from './components/Header';
import ShiftDashboard from './components/ShiftDashboard';
import TimelineView from './components/TimelineView';
import ReportView from './components/ReportView';
import TaskModal from './components/TaskModal';
import ShiftManager from './components/ShiftManager';
import { formatTime, isTimeInShift, calculateStats } from './utils/utils';
import { generateDemoTasks } from './data/demoData';
import { 
  initializeFirebase, 
  signInUser, 
  onUserStateChanged,
  subscribeToTasks,
  updateTask,
  generateFullSchedule,
  resetAllTasks
} from './services/firebaseService';
import { appId } from './config/firebaseConfig';

export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState(() => {
    // Load demo data immediately as fallback
    return generateDemoTasks();
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('timeline');
  const [isManageShiftsOpen, setIsManageShiftsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timelineRef = useRef(null);
  const [isUsingDemoData, setIsUsingDemoData] = useState(true);

  console.log('App render - isLoading:', isLoading, 'tasks:', tasks.length, 'user:', !!user, 'isUsingDemoData:', isUsingDemoData);

  // Default Shifts Configuration
  const [shifts, setShifts] = useState([
    { 
      id: 'shift-a', 
      name: 'Shift A', 
      start: '06:00', 
      end: '14:00', 
      lead: 'Alex Mercer', 
      resources: ['Sarah Jenkins', 'Mike Ross', 'David Kim'] 
    },
    { 
      id: 'shift-b', 
      name: 'Shift B', 
      start: '14:00', 
      end: '22:00', 
      lead: 'Priya Patel', 
      resources: ['Emily Blunt', 'John Krasinski', 'Cillian Murphy'] 
    },
    { 
      id: 'shift-c', 
      name: 'Shift C', 
      start: '22:00', 
      end: '06:00', 
      lead: 'James Holden', 
      resources: ['Amos Burton', 'Naomi Nagata'] 
    }
  ]);

  // Determine Current Active Shift
  const currentShift = useMemo(() => {
    const timeStr = formatTime(currentTime);
    const active = shifts.find(s => isTimeInShift(timeStr, s.start, s.end));
    return active || shifts[0];
  }, [shifts, currentTime]);

  // Initialize Firebase
  useEffect(() => {
    const initApp = async () => {
      try {
        await initializeFirebase();
        await signInUser();
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };
    initApp();
  }, []);

  // Setup Auth State Listener
  useEffect(() => {
    const unsubscribe = onUserStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  // Time ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Safety timeout - force loading to complete
  useEffect(() => {
    if (!isLoading) {
      console.log('Dashboard loaded successfully, tasks:', tasks.length, 'using demo:', isUsingDemoData);
      return;
    }

    // Show dashboard immediately - don't wait for Firebase
    const timeout = setTimeout(() => {
      console.log('Showing dashboard (with demo data fallback)');
      setIsLoading(false);
    }, 500); // Show after 500ms

    return () => clearTimeout(timeout);
  }, [isLoading, tasks.length, isUsingDemoData]);

  // Subscribe to Tasks
  useEffect(() => {
    if (!user) {
      console.log('User not authenticated yet');
      return;
    }

    console.log('Setting up Firestore task subscription...');
    let isSubscribed = true;

    const unsubscribe = subscribeToTasks((fetchedTasks) => {
      if (!isSubscribed) return;

      console.log('Firestore tasks fetched:', fetchedTasks.length);

      if (fetchedTasks && fetchedTasks.length > 0) {
        // Switch from demo data to real Firestore data
        console.log('Switching from demo data to Firestore data');
        setTasks(fetchedTasks);
        setIsUsingDemoData(false);
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [user]);

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateTask(taskId, updates);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleResetData = async () => {
    if (!user) return;
    try {
      console.log('Resetting all tasks in Firestore...');
      await resetAllTasks();
      console.log('Generating full demo schedule...');
      await generateFullSchedule();
      setIsManageShiftsOpen(false);
      console.log('Data reset and regeneration complete!');
    } catch (error) {
      console.error("Error resetting data:", error);
    }
  };

  // Calculate stats
  const dayData = useMemo(() => calculateStats(tasks, currentTime), [tasks, currentTime]);
  const shiftData = useMemo(() => {
    const shiftTasks = tasks.filter(t => isTimeInShift(t.plannedStart, currentShift.start, currentShift.end));
    return calculateStats(shiftTasks, currentTime);
  }, [tasks, currentShift, currentTime]);
  
  const complianceStatus = shiftData.compliant ? 'compliant' : 'non_compliant';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Activity className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Loading Dashboard...</h2>
          <p className="text-slate-500 mt-2">Initializing Zen-Ops Monitor</p>
          <p className="text-xs text-slate-400 mt-4">Using demo data • Check console for details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      
      <Header 
        complianceStatus={complianceStatus} 
        timeRemaining={`${19 - currentTime.getHours()}h ${60 - currentTime.getMinutes()}m`}
        shiftDetails={currentShift}
        onOpenSettings={() => setIsManageShiftsOpen(true)}
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <ShiftDashboard 
          dayData={dayData}
          shiftData={shiftData}
          shiftDetails={currentShift} 
        />

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            {viewMode === 'timeline' ? 'Shift Timeline' : 'Shift Report'}
            <span className="text-xs font-normal text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
              {currentTime.toLocaleDateString()}
            </span>
          </h2>
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
            <button 
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2
                ${viewMode === 'timeline' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Activity size={14} /> Timeline
            </button>
            <button 
              onClick={() => setViewMode('report')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2
                ${viewMode === 'report' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <BarChart2 size={14} /> Analytics
            </button>
          </div>
        </div>

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <TimelineView 
            tasks={tasks}
            shifts={shifts}
            currentTime={currentTime}
            onSelectTask={setSelectedTask}
          />
        )}

        {/* Report View */}
        {viewMode === 'report' && (
          <ReportView tasks={tasks} />
        )}

      </main>

      {/* Modals */}
      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={handleUpdateTask}
          shiftLead={currentShift.lead}
        />
      )}

      {isManageShiftsOpen && (
        <ShiftManager 
          shifts={shifts}
          onSave={setShifts}
          onClose={() => setIsManageShiftsOpen(false)}
          onResetData={handleResetData}
        />
      )}
    </div>
  );
}
