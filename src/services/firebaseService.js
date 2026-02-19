import { 
  initializeApp,
  getApps
} from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  collection, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query,
  where,
  serverTimestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { firebaseConfig } from '../config/firebaseConfig';
import demoTasksData from '../data/demoData.json'; 

let app, auth, db;

const TASKS_PATH = 'tasks';

// Helper: Extract HH:mm from Cron (Simple)
const extractTimeFromCron = (cron) => {
  if (!cron) return '';
  try {
    const parts = cron.trim().split(/\s+/);
    if (parts.length >= 2) {
      const min = parts[0];
      const hour = parts[1];
      if (!isNaN(min) && !isNaN(hour)) {
        return `${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
      }
    }
    return ''; 
  } catch (e) {
    return '';
  }
};

export const initializeFirebase = async () => {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app, auth, db };
};

export const signInUser = async (customToken = null) => {
  try {
    if (customToken) {
      await signInWithCustomToken(auth, customToken);
    } else {
      await signInAnonymously(auth);
    }
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const onUserStateChanged = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const subscribeToTasks = (callback) => {
  try {
    const tasksRef = collection(db, TASKS_PATH);
    const q = query(tasksRef);
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // --- MAP DB FIELDS TO UI FIELDS ---
        return { 
          id: doc.id,
          // DB Fields
          taskId: data.taskId,
          taskName: data.taskName,
          AddedByProcess: data.AddedByProcess,
          AddedByUser: data.AddedByUser,
          category: data.category,
          createdAt: data.createdAt,
          cron_schedule: data.cron_schedule,

          // UI Derived Fields (Mocking execution data until TaskExecution table exists)
          title: data.taskName || 'Untitled',
          type: data.category || 'General',
          
          // Derive plannedStart from cron for Timeline view
          plannedStart: extractTimeFromCron(data.cron_schedule) || '00:00',
          
          // Default status to 'pending' as we don't store execution state in this table anymore
          status: 'pending', 
          cronExpression: data.cron_schedule || ''
        };
      });

      // Sort by derived time
      tasks.sort((a, b) => {
        const tA = a.plannedStart || '';
        const tB = b.plannedStart || '';
        return tA.localeCompare(tB);
      });

      callback(tasks);
    }, (error) => {
      console.error("Subscription error:", error);
      callback([]);
    });
  } catch (error) {
    console.error("Error subscribing to tasks:", error);
    return () => {};
  }
};

export const updateTask = async (taskId, updates) => {
  try {
    // Filter updates to ONLY allow the 7 specific fields
    // This prevents 'status', 'actualStart' etc from polluting the definition table
    const allowedFields = ['taskId', 'taskName', 'AddedByProcess', 'AddedByUser', 'category', 'createdAt', 'cron_schedule'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length > 0) {
      const taskRef = doc(db, TASKS_PATH, taskId);
      await updateDoc(taskRef, filteredUpdates);
    } else {
      console.warn("Update skipped: No valid fields for tasks table");
    }
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const generateFullSchedule = async () => {
  try {
    const batch = writeBatch(db);
    const tasksRef = collection(db, TASKS_PATH);
    
    demoTasksData.forEach((t, i) => {
        const taskId = `demo_task_${i}`;
        const docRef = doc(tasksRef, taskId);
        
        // Strict Schema for Demo Data
        batch.set(docRef, {
            taskId: taskId,
            taskName: t.title,
            AddedByProcess: 'System_Demo',
            AddedByUser: 'Demo_User',
            category: t.type,
            createdAt: new Date().toISOString(),
            cron_schedule: t.cronExpression || '0 0 * * *'
        });
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error generating schedule:", error);
    throw error;
  }
};

export const deleteAllTasks = async () => {
  try {
    const tasksRef = collection(db, TASKS_PATH);
    const snapshot = await getDocs(tasksRef);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error deleting all tasks:", error);
    throw error;
  }
};

export const deleteDemoTasks = async () => {
  try {
    const tasksRef = collection(db, TASKS_PATH);
    const snapshot = await getDocs(tasksRef);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.AddedByProcess === 'System_Demo') {
        batch.delete(doc.ref);
      }
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error deleting demo tasks:", error);
    throw error;
  }
};

export const saveTasksBatch = async (tasks) => {
  try {
    const batch = writeBatch(db);
    const tasksRef = collection(db, 'tasks');
    
    tasks.forEach(task => {
      const docRef = doc(tasksRef, task.taskId);
      
      // STRICT SCHEMA ENFORCEMENT
      // Only saving the 7 requested fields
      batch.set(docRef, {
        taskId: task.taskId,
        taskName: task.taskName,
        AddedByProcess: task.AddedByProcess,
        AddedByUser: task.AddedByUser,
        category: task.category,
        createdAt: task.createdAt,
        cron_schedule: task.cron_schedule
      });
    });
    
    await batch.commit();
    console.log(`Successfully saved ${tasks.length} tasks to Firebase.`);
    return true;
  } catch (error) {
    console.error("Error saving batch tasks:", error);
    throw error;
  }
};