// src/shared/contexts/TenantContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTenantUser } from '../services/tenantUserService';

const TenantContext = createContext();

export const useTenant = () => useContext(TenantContext);

export const TenantProvider = ({ user, children }) => {
  const [activeTenantId, setActiveTenantId] = useState(null);
  const [activeTenantRole, setActiveTenantRole] = useState(null);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [isTenantLoading, setIsTenantLoading] = useState(true);

  useEffect(() => {
    const fetchUserTenants = async () => {
      // If no user is logged in, reset everything
      if (!user) {
        setActiveTenantId(null);
        setActiveTenantRole(null);
        setAvailableTenants([]);
        setIsTenantLoading(false);
        return;
      }

      setIsTenantLoading(true);
      try {
        // Fetch the user's multi-tenant access from the DB
        const tenantUser = await getTenantUser(user.uid);
        
        if (tenantUser && tenantUser.tenants) {
          // Convert the tenants object into an array for the UI
          const tenantsList = Object.entries(tenantUser.tenants).map(([id, data]) => ({
            id,
            ...data
          }));
          
          setAvailableTenants(tenantsList);
          
          // Auto-select the first available active tenant for their workspace
          if (tenantsList.length > 0) {
            const firstActive = tenantsList.find(t => t.status === 'active') || tenantsList[0];
            setActiveTenantId(firstActive.id);
            setActiveTenantRole(firstActive.role);
          }
        } else {
          // User has no assigned tenants yet
          setAvailableTenants([]);
          setActiveTenantId(null);
        }
      } catch (error) {
        console.error("Failed to fetch tenant data:", error);
      } finally {
        setIsTenantLoading(false);
      }
    };

    fetchUserTenants();
  }, [user]);

  // Function to allow users to switch between businesses
  const switchTenant = (tenantId) => {
    const tenant = availableTenants.find(t => t.id === tenantId);
    if (tenant) {
      setActiveTenantId(tenant.id);
      setActiveTenantRole(tenant.role);
    }
  };

  const value = {
    activeTenantId,
    activeTenantRole,
    availableTenants,
    isTenantLoading,
    switchTenant
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};