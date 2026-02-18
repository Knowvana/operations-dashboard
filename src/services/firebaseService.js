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
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      tasks.sort((a, b) => a.plannedStart.localeCompare(b.plannedStart));
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
    const taskRef = doc(db, TASKS_PATH, taskId);
    await updateDoc(taskRef, updates);
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
        const docRef = doc(tasksRef, `demo_task_${i}`);
        
        let updatedAt = null;
        let updatedBy = null;
        let actualStart = "";
        let actualEnd = "";

        if (t.status === 'completed') {
            updatedAt = new Date().toISOString();
            updatedBy = "System Admin";
            actualStart = t.start;
            // Removed automatic actualEnd setting from demo data as per request
        } else if (t.status === 'in_progress') {
            updatedAt = new Date().toISOString();
            updatedBy = "System Admin";
            actualStart = t.start;
        }

        batch.set(docRef, {
            title: t.title,
            plannedStart: t.start,
            plannedEnd: "", // Explicitly empty
            status: t.status,
            actualStart: actualStart,
            actualEnd: actualEnd,
            type: t.type,
            frequency: t.frequency || "",
            cronExpression: t.cronExpression || "",
            manualDate: t.manualDate || "",
            
            comments: t.status === 'completed' ? "Executed successfully via automation." : "",
            updatedAt: updatedAt,
            updatedBy: updatedBy,
            createdAt: new Date().toISOString(), 
            isDemo: true 
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
    const q = query(tasksRef, where("isDemo", "==", true));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error deleting demo tasks:", error);
    throw error;
  }
};