// src/shared/services/authService.js
import { getDb } from './firebaseService';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import dbConfig from '../config/firebasedatabaseconfig.json';

const { root_collection, root_document, collections } = dbConfig;

/**
 * Manual Authentication Service
 * Validates credentials against ApplicationAdmins collection
 */

/**
 * Authenticate user against ApplicationAdmins collection
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User object if authenticated
 */
export const authenticateUser = async (email, password) => {
  try {
    const db = getDb();
    const adminsRef = collection(db, root_collection, root_document, collections.application_admins);
    
    // Query for user by email
    const q = query(adminsRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Invalid email or password');
    }
    
    const adminDoc = snapshot.docs[0];
    const adminData = adminDoc.data();
    
    // Simple password validation (in production, use bcrypt or similar)
    if (adminData.password !== password) {
      throw new Error('Invalid email or password');
    }
    
    // Return user object with ID
    return {
      uid: adminDoc.id,
      email: adminData.email,
      displayName: adminData.displayName,
      role: adminData.role,
      permissions: adminData.permissions
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

/**
 * Create default admin user in ApplicationAdmins collection
 * @returns {Promise<void>}
 */
export const createDefaultAdmin = async () => {
  try {
    const db = getDb();
    const adminRef = doc(db, root_collection, root_document, collections.application_admins, 'admin-default');
    
    // Check if default admin already exists
    const existingAdmin = await getDocs(
      query(
        collection(db, root_collection, root_document, collections.application_admins),
        where('email', '==', 'admin@knowvana.com')
      )
    );
    
    if (!existingAdmin.empty) {
      console.log('Default admin already exists');
      return;
    }
    
    // Create default admin
    await setDoc(adminRef, {
      email: 'admin@knowvana.com',
      password: 'admin123',
      displayName: 'admin',
      role: 'super_admin',
      permissions: ['all'],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Default admin user created');
  } catch (error) {
    console.error('Error creating default admin:', error);
    throw error;
  }
};

/**
 * Get user by ID from ApplicationAdmins collection
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object or null
 */
export const getUserById = async (userId) => {
  try {
    const db = getDb();
    const adminsRef = collection(db, root_collection, root_document, collections.application_admins);
    
    const q = query(adminsRef, where('email', '==', userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const adminDoc = snapshot.docs[0];
    return {
      uid: adminDoc.id,
      email: adminDoc.data().email,
      displayName: adminDoc.data().displayName,
      role: adminDoc.data().role,
      permissions: adminDoc.data().permissions
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};
