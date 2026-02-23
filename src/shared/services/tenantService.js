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
import defaultTenantConfig from '../config/defaultTenantConfig.json';

const { root_collection, root_document, collections } = dbConfig;

export const checkTenantNameExists = async (tenantName) => {
  try {
    const db = getDb();
    const tenantsRef = collection(db, root_collection, root_document, collections.tenants);
    const q = query(tenantsRef, where('tenantName', '==', tenantName));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size > 0;
  } catch (error) {
    console.error('Error checking tenant name:', error);
    throw error;
  }
};

export const createTenant = async (tenantData) => {
  try {
    const db = getDb();
    
    // Check if tenant name already exists
    const nameExists = await checkTenantNameExists(tenantData.tenantName);
    if (nameExists) {
      throw new Error(`Tenant with name "${tenantData.tenantName}" already exists`);
    }

    const tenantId = tenantData.tenantId || `tenant_${Date.now()}`;
    const tenantRef = doc(
      db, 
      root_collection,
      root_document,
      collections.tenants,
      tenantId
    );

    await setDoc(tenantRef, {
      tenantId,
      tenantName: tenantData.tenantName,
      plan: tenantData.plan || 'free',
      createdAt: serverTimestamp(),
      createdBy: tenantData.createdBy || 'system',
      updatedAt: serverTimestamp()
    });

    console.log(`Tenant created: ${tenantId}`);
    return tenantId;
  } catch (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }
};

export const getTenant = async (tenantId) => {
  try {
    const db = getDb();
    const tenantRef = doc(
      db, 
      root_collection,
      root_document,
      collections.tenants,
      tenantId
    );
    const tenantSnap = await getDoc(tenantRef);
    
    if (tenantSnap.exists()) {
      return { tenantId, ...tenantSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting tenant:', error);
    return null;
  }
};

export const listTenants = async () => {
  try {
    const db = getDb();
    const tenantsRef = collection(db, root_collection, root_document, collections.tenants);
    const snapshot = await getDocs(tenantsRef);
    
    const tenants = snapshot.docs.map(doc => ({
      tenantId: doc.id,
      ...doc.data()
    }));
    
    return tenants;
  } catch (error) {
    console.error('Error listing tenants:', error);
    throw error;
  }
};

export const updateTenantMetadata = async (tenantId, updates) => {
  try {
    const db = getDb();
    const tenantRef = doc(
      db, 
      root_collection,
      root_document,
      collections.tenants,
      tenantId
    );
    
    await updateDoc(tenantRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Tenant updated: ${tenantId}`);
  } catch (error) {
    console.error('Error updating tenant:', error);
    throw error;
  }
};

export const deleteTenant = async (tenantId) => {
  try {
    const db = getDb();
    const tenantRef = doc(
      db, 
      root_collection,
      root_document,
      collections.tenants,
      tenantId
    );
    
    await deleteDoc(tenantRef);
    console.log(`Tenant deleted: ${tenantId}`);
  } catch (error) {
    console.error('Error deleting tenant:', error);
    throw error;
  }
};


export const getCurrentTenantId = () => {
  return 'tenant_default';
};
