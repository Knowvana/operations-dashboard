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
  addDoc,
  query,
  where,
  serverTimestamp,
  getDocs,
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import { firebaseConfig, appId } from '../config/firebaseConfig';

let app, auth, db;

// Simplified collection path
const TASKS_PATH = 'tasks';

export const initializeFirebase = async () => {
  // Prevent re-initialization
  if (getApps().length === 0) {
    console.log('Initializing Firebase...');
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
    console.log('Firebase initialized successfully');
  } else {
    console.log('Firebase already initialized');
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app, auth, db };
};

export const signInUser = async (customToken = null) => {
  try {
    if (customToken) {
      console.log('Signing in with custom token...');
      await signInWithCustomToken(auth, customToken);
    } else {
      console.log('Signing in anonymously...');
      await signInAnonymously(auth);
    }
    console.log('User signed in successfully');
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const onUserStateChanged = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const fetchTasks = async () => {
  try {
    const tasksRef = collection(db, TASKS_PATH);
    const snapshot = await getDocs(tasksRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

export const subscribeToTasks = (callback) => {
  try {
    const tasksRef = collection(db, TASKS_PATH);
    const q = query(tasksRef);
    console.log('Setting up tasks subscription...');
    return onSnapshot(q, (snapshot) => {
      console.log('Snapshot received, docs:', snapshot.docs.length);
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      tasks.sort((a, b) => a.plannedStart.localeCompare(b.plannedStart));
      callback(tasks);
    }, (error) => {
      console.error("Subscription error:", error);
      // Call callback with empty array on error to prevent infinite loading
      callback([]);
    });
  } catch (error) {
    console.error("Error subscribing to tasks:", error);
    // Return a cleanup function
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
    
    const types = ['critical', 'routine', 'admin'];
    const titles = [
      "DB Health Check", "API Latency Review", "Security Audit", "Cache Purge",
      "Load Balancer Sync", "User Session Backup", "Error Log Analysis", "Service Restart",
      "Deploy Hotfix", "Shift Handover Note", "Resource Scaling"
    ];
    
    const sampleResources = ["Sarah Jenkins", "Mike Ross", "David Kim", "Priya Patel", "Emily Blunt"];
    const currentHour = new Date().getHours();

    for (let h = 0; h < 24; h++) {
      const hourStr = h.toString().padStart(2, '0');
      const numTasks = Math.floor(Math.random() * 2) + 3;

      for (let i = 0; i < numTasks; i++) {
        const startMin = i * 15;
        const endMin = startMin + 10;
        const startStr = `${hourStr}:${startMin.toString().padStart(2, '0')}`;
        const endStr = `${hourStr}:${endMin.toString().padStart(2, '0')}`;
        
        let status = 'pending';
        let actualStart = '';
        let actualEnd = '';
        let updatedAt = null;
        let updatedBy = null;
        
        if (h < currentHour) {
          const rand = Math.random();
          if (rand > 0.2) {
            status = 'completed';
            actualStart = startStr;
            actualEnd = endStr;
            updatedAt = new Date().toISOString();
            updatedBy = sampleResources[Math.floor(Math.random() * sampleResources.length)];
          } else if (rand > 0.1) {
            status = 'aborted';
            actualStart = startStr;
            actualEnd = endStr;
            updatedAt = new Date().toISOString();
            updatedBy = sampleResources[Math.floor(Math.random() * sampleResources.length)];
          }
        }

        const title = titles[Math.floor(Math.random() * titles.length)];
        const sanitizedTitle = title.replace(/\s+/g, '_');
        // e.g. DB_Health_Check_0800_0
        const docId = `${sanitizedTitle}_${hourStr}${startMin.toString().padStart(2, '0')}_${i}`;
        const docRef = doc(tasksRef, docId);
        
        batch.set(docRef, {
          title: title,
          plannedStart: startStr,
          plannedEnd: endStr,
          status: status,
          actualStart: actualStart,
          actualEnd: actualEnd,
          type: types[Math.floor(Math.random() * types.length)],
          comments: status === 'aborted' ? "Auto-aborted for demo" : "",
          updatedAt: updatedAt,
          updatedBy: updatedBy,
          createdAt: serverTimestamp()
        });
      }
    }
    
    await batch.commit();
  } catch (error) {
    console.error("Error generating schedule:", error);
    throw error;
  }
};

export const resetAllTasks = async () => {
  try {
    const tasksRef = collection(db, TASKS_PATH);
    const snapshot = await getDocs(tasksRef);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error resetting tasks:", error);
    throw error;
  }
};
