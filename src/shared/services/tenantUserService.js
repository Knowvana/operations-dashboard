// src/shared/services/tenantUserService.js
import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc, 
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { getDb } from './firebaseService';
import dbConfig from '../config/firebasedatabaseconfig.json';

/**
 * Tenant User Service
 * Manages users under knowvana/TenantUsers with multi-tenant support
 */

const { root_collection, root_document, collections } = dbConfig;

/**
 * Get tenant user
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export const getTenantUser = async (userId) => {
  try {
    const db = getDb();
    const userRef = doc(db, root_collection, root_document, collections.tenant_users, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { userId: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting tenant user:', error);
    return null;
  }
};

/**
 * List all tenant users
 * @returns {Promise<Array>}
 */
export const listAllTenantUsers = async () => {
  try {
    const db = getDb();
    const usersRef = collection(db, root_collection, root_document, collections.tenant_users);
    const snapshot = await getDocs(usersRef);
    
    return snapshot.docs.map(doc => ({
      userId: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error listing tenant users:', error);
    throw error;
  }
};

/**
 * Helper to check if a user is part of a specific tenant
 * @param {Object} user 
 * @param {string} tenantId 
 * @returns {boolean}
 */
export const isUserInTenant = (user, tenantId) => {
  return user && user.tenants && user.tenants[tenantId];
};

/**
 * List users for specific tenant
 * @param {string} tenantId
 * @returns {Promise<Array>}
 */
export const listTenantUsers = async (tenantId) => {
  try {
    const allUsers = await listAllTenantUsers();
    
    // Filter users who have access to this tenant
    return allUsers.filter(user => 
      isUserInTenant(user, tenantId)
    ).map(user => ({
      userId: user.userId,
      email: user.email,
      displayName: user.displayName,
      ...user.tenants[tenantId], // role, status, permissions
      createdAt: user.createdAt
    }));
  } catch (error) {
    console.error('Error listing tenant users:', error);
    throw error;
  }
};

/**
 * Create tenant user
 * @param {string} userId
 * @param {Object} userData
 * @returns {Promise<void>}
 */
export const createTenantUser = async (userId, userData) => {
  try {
    const db = getDb();
    const userRef = doc(db, root_collection, root_document, collections.tenant_users, userId);
    
    await setDoc(userRef, {
      email: userData.email,
      displayName: userData.displayName,
      tenants: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log(`Tenant user created: ${userId}`);
  } catch (error) {
    console.error('Error creating tenant user:', error);
    throw error;
  }
};

/**
 * Add user to tenant
 * @param {string} userId
 * @param {string} tenantId
 * @param {Object} tenantAccess
 * @returns {Promise<void>}
 */
export const addUserToTenant = async (userId, tenantId, tenantAccess) => {
  try {
    const db = getDb();
    const userRef = doc(db, root_collection, collections.tenant_users, userId);
    
    // Get existing user or create new
    const userSnap = await getDoc(userRef);
    const existingTenants = userSnap.exists() ? userSnap.data().tenants || {} : {};
    
    await setDoc(userRef, {
      email: tenantAccess.email,
      displayName: tenantAccess.displayName,
      tenants: {
        ...existingTenants,
        [tenantId]: {
          role: tenantAccess.role || 'user',
          status: tenantAccess.status || 'active',
          permissions: tenantAccess.permissions || [],
          joinedAt: serverTimestamp()
        }
      },
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log(`User ${userId} added to tenant: ${tenantId}`);
  } catch (error) {
    console.error('Error adding user to tenant:', error);
    throw error;
  }
};

/**
 * Update user's tenant access
 * @param {string} userId
 * @param {string} tenantId
 * @param {Object} updates
 * @returns {Promise<void>}
 */
export const updateUserTenantAccess = async (userId, tenantId, updates) => {
  try {
    const db = getDb();
    const userRef = doc(db, root_collection, root_document, collections.tenant_users, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userSnap.data();
    const existingTenants = userData.tenants || {};
    
    await updateDoc(userRef, {
      [`tenants.${tenantId}`]: {
        ...existingTenants[tenantId],
        ...updates
      },
      updatedAt: serverTimestamp()
    });
    
    console.log(`User ${userId} access updated for tenant: ${tenantId}`);
  } catch (error) {
    console.error('Error updating user tenant access:', error);
    throw error;
  }
};

/**
 * Remove user from tenant
 * @param {string} userId
 * @param {string} tenantId
 * @returns {Promise<void>}
 */
export const removeUserFromTenant = async (userId, tenantId) => {
  try {
    const db = getDb();
    const userRef = doc(db, root_collection, collections.tenant_users, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userSnap.data();
    const tenants = { ...userData.tenants };
    delete tenants[tenantId];
    
    await updateDoc(userRef, {
      tenants,
      updatedAt: serverTimestamp()
    });
    
    console.log(`User ${userId} removed from tenant: ${tenantId}`);
  } catch (error) {
    console.error('Error removing user from tenant:', error);
    throw error;
  }
};

/**
 * Delete tenant user completely
 * @param {string} userId
 * @returns {Promise<void>}
 */
export const deleteTenantUser = async (userId) => {
  try {
    const db = getDb();
    const userRef = doc(db, root_collection, root_document, collections.tenant_users, userId);
    
    await deleteDoc(userRef);
    
    console.log(`Tenant user deleted: ${userId}`);
  } catch (error) {
    console.error('Error deleting tenant user:', error);
    throw error;
  }
};

/**
 * Check if user has access to tenant
 * @param {string} userId
 * @param {string} tenantId
 * @returns {Promise<boolean>}
 */
export const hasUserTenantAccess = async (userId, tenantId) => {
  try {
    const user = await getTenantUser(userId);
    return user && user.tenants && user.tenants[tenantId] && 
           user.tenants[tenantId].status === 'active';
  } catch (error) {
    console.error('Error checking user tenant access:', error);
    return false;
  }
};
