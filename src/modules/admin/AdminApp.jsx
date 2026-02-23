// src/modules/admin/AdminApp.jsx
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Building2, Users, Plus, Edit2, UserPlus } from 'lucide-react';
import { 
  ModuleLayout, 
  EmptyState, 
  ConfirmationModal,
  LoadingSpinner,
  listApplicationAdmins, 
  createApplicationAdmin 
} from '@shared';

// Admin Components
import AdminDashboard from './components/AdminDashboard';
import TenantManagement from './components/TenantManagement';
import UserManagement from './components/UserManagement';

export default function AdminApp({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false);
  const [isCheckingDatabase, setIsCheckingDatabase] = useState(true);
  
  // Modal State
  const [confirmAction, setConfirmAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processSuccess, setProcessSuccess] = useState(false);

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      const admins = await listApplicationAdmins();
      setIsDatabaseEmpty(admins.length === 0);
    } catch (error) {
      console.error('Error checking database status:', error);
      setIsDatabaseEmpty(true);
    } finally {
      setIsCheckingDatabase(false);
    }
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;
    setIsProcessing(true);
    try {
      if (confirmAction.type === 'initialize_db') {
        if (!user) throw new Error('No user logged in');
        
        await createApplicationAdmin(user.uid, {
          email: user.email,
          displayName: user.displayName || user.email,
          role: 'super_admin',
          permissions: ['all']
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProcessSuccess(true);
    } catch (error) {
      console.error('Error executing action:', error);
      alert('Action failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetConfirmationState = () => {
    setConfirmAction(null);
    setIsProcessing(false);
    setProcessSuccess(false);
  };

  const handleSuccessClose = async () => {
    resetConfirmationState();
    // Re-check database status to show admin dashboard
    setIsCheckingDatabase(true);
    await checkDatabaseStatus();
  };

  if (isCheckingDatabase) {
    return (
      <LoadingSpinner 
        title="Loading...." 
        subtitle="Checking database..." 
        isOpen={true}
      />
    );
  }

  // If database is empty, show EmptyState but render ConfirmationModal on top if active
  if (isDatabaseEmpty) {
    return (
      <div className="relative h-full">
        <EmptyState 
          module="admin" 
          onPrimaryAction={() => setConfirmAction({
            type: 'initialize_db',
            title: 'Initialize Database',
            desc: 'This will create the necessary database structure and set you up as the first Super Admin. Continue?'
          })}
        />
        
        <ConfirmationModal
          action={confirmAction} 
          isProcessing={isProcessing} 
          isSuccess={processSuccess}
          onConfirm={executeConfirmedAction} 
          onCancel={resetConfirmationState}
          onSuccessClose={handleSuccessClose}
          onViewTasks={handleSuccessClose}
        />
      </div>
    );
  }

  const ADMIN_NAV_ITEMS = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: ShieldCheck },
    
    // Tenant Management Group
    { 
      id: 'tenants', 
      label: 'Tenant Management', 
      icon: Building2, 
      type: 'group',
      children: [
        { id: 'tenants_create', label: 'Create Tenant', icon: Plus },
        { id: 'tenants_manage', label: 'Manage Tenant', icon: Edit2 },
      ]
    },
    
    // Separator
    { type: 'separator' },
    
    // User Management Group
    { 
      id: 'users', 
      label: 'User Management', 
      icon: Users, 
      type: 'group',
      children: [
        { id: 'users_create', label: 'Create User', icon: UserPlus },
        { id: 'users_manage', label: 'Manage User', icon: Edit2 },
      ]
    }
  ];

  // Helper to determine which view to show in TenantManagement
  const getTenantView = () => {
    if (activeTab === 'tenants_create') return 'create';
    if (activeTab === 'tenants_manage') return 'manage';
    return 'create';
  };

  // Helper to determine which view to show in UserManagement
  const getUserView = () => {
    if (activeTab === 'users_create') return 'create';
    if (activeTab === 'users_manage') return 'manage';
    return 'create';
  };

  return (
    <ModuleLayout
      title="Application Admin"
      subtitle="Knowvana Platform Management"
      navItems={ADMIN_NAV_ITEMS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'dashboard' && <AdminDashboard user={user} />}
      {activeTab.startsWith('tenants_') && <TenantManagement user={user} view={getTenantView()} onTenantCreated={() => setActiveTab('tenants_manage')} />}
      {activeTab.startsWith('users_') && <UserManagement user={user} view={getUserView()} />}
    </ModuleLayout>
  );
}
