// src/shared/services/demoDataService.js
import { writeBatch, collection, doc } from 'firebase/firestore';
import { getDb } from './firebaseService';
import opsMonitorDemo from '../data/opsMonitorDemo.json';
import rosterDemo from '../data/rosterDemo.json';

const TASKS_PATH = 'tasks';

/**
 * Universal Demo Data Loader Service
 * Handles loading and saving demo data for all modules
 */

/**
 * Load Ops Monitor demo data to Firebase
 * @returns {Promise<Object>} Result with success status and task count
 */
export const loadOpsMonitorDemo = async () => {
  try {
    const db = getDb();
    const batch = writeBatch(db);
    const tasksRef = collection(db, TASKS_PATH);
    
    opsMonitorDemo.tasks.forEach((task, index) => {
      const taskId = `demo_ops_${Date.now()}_${index}`;
      const docRef = doc(tasksRef, taskId);
      
      batch.set(docRef, {
        taskId: taskId,
        taskName: task.taskName,
        category: task.category,
        cron_schedule: task.cron_schedule,
        AddedByProcess: 'System_Demo',
        AddedByUser: 'Demo_User',
        createdAt: new Date().toISOString()
      });
    });
    
    await batch.commit();
    
    return {
      success: true,
      count: opsMonitorDemo.tasks.length,
      message: `Successfully loaded ${opsMonitorDemo.tasks.length} demo tasks`
    };
  } catch (error) {
    console.error("Error loading Ops Monitor demo data:", error);
    throw error;
  }
};

/**
 * Load Roster demo data (returns data for local state, no Firebase)
 * @returns {Object} Demo shifts and employees
 */
export const loadRosterDemo = () => {
  try {
    return {
      success: true,
      shifts: rosterDemo.shifts,
      employees: rosterDemo.employees,
      count: rosterDemo.employees.length,
      message: `Successfully loaded ${rosterDemo.employees.length} demo employees and ${rosterDemo.shifts.length} shifts`
    };
  } catch (error) {
    console.error("Error loading Roster demo data:", error);
    throw error;
  }
};

/**
 * Get demo data for a specific module without loading to database
 * @param {string} module - Module name ('ops_monitor' or 'roster_planner')
 * @returns {Object} Demo data for the module
 */
export const getDemoData = (module) => {
  switch (module) {
    case 'ops_monitor':
      return opsMonitorDemo;
    case 'roster_planner':
      return rosterDemo;
    default:
      return null;
  }
};

/**
 * Get demo data statistics
 * @param {string} module - Module name
 * @returns {Object} Statistics about demo data
 */
export const getDemoDataStats = (module) => {
  switch (module) {
    case 'ops_monitor':
      return {
        taskCount: opsMonitorDemo.tasks.length,
        categories: [...new Set(opsMonitorDemo.tasks.map(t => t.category))]
      };
    case 'roster_planner':
      return {
        employeeCount: rosterDemo.employees.length,
        shiftCount: rosterDemo.shifts.length
      };
    default:
      return null;
  }
};
