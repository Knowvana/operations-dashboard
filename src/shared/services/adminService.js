// src/shared/services/adminService.js
import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getDb } from './firebaseService';
import dbConfig from '../config/firebasedatabaseconfig.json';

/**
 * Application Admin Service
 * Manages Knowvana-level application administrators
 */

const { root_collection, root_document, collections } = dbConfig;

/**
 * Check if user is application admin
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const isApplicationAdmin = async (userId) => {
  try {
    const db = getDb();
    const adminRef = doc(db, root_collection, root_document, collections.application_admins, userId);
    const adminSnap = await getDoc(adminRef);
    return adminSnap.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get application admin details
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>}
 */
export const getApplicationAdmin = async (userId) => {
  try {
    const db = getDb();
    const adminRef = doc(db, root_collection, root_document, collections.application_admins, userId);
    const adminSnap = await getDoc(adminRef);
    
    if (adminSnap.exists()) {
      return { adminId: adminSnap.id, ...adminSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting admin:', error);
    return null;
  }
};

/**
 * List all application admins
 * @returns {Promise<Array>}
 */
export const listApplicationAdmins = async () => {
  try {
    const db = getDb();
    const adminsRef = collection(db, root_collection, root_document, collections.application_admins);
    const snapshot = await getDocs(adminsRef);
    
    return snapshot.docs.map(doc => ({
      adminId: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error listing admins:', error);
    throw error;
  }
};

/**
 * Create application admin
 * @param {string} userId - User ID
 * @param {Object} adminData - Admin data
 * @returns {Promise<void>}
 */
export const createApplicationAdmin = async (userId, adminData) => {
  try {
    const db = getDb();
    const adminRef = doc(db, root_collection, root_document, collections.application_admins, userId);
    
    await setDoc(adminRef, {
      email: adminData.email,
      displayName: adminData.displayName,
      role: adminData.role || 'admin',
      permissions: adminData.permissions || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`Application admin created: ${userId}`);
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};

/**
 * Update application admin
 * @param {string} userId - User ID
 * @param {Object} updates - Updates
 * @returns {Promise<void>}
 */
export const updateApplicationAdmin = async (userId, updates) => {
  try {
    const db = getDb();
    const adminRef = doc(db, root_collection, root_document, collections.application_admins, userId);
    
    await updateDoc(adminRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Application admin updated: ${userId}`);
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
};

/**
 * Delete application admin
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const deleteApplicationAdmin = async (userId) => {
  try {
    const db = getDb();
    const adminRef = doc(db, root_collection, root_document, collections.application_admins, userId);
    
    await deleteDoc(adminRef);
    
    console.log(`Application admin deleted: ${userId}`);
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
};
