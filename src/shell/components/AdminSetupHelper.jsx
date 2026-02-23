// src/shell/components/AdminSetupHelper.jsx
import React, { useState } from 'react';
import { ShieldCheck, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { createApplicationAdmin, isApplicationAdmin } from '@shared';

export default function AdminSetupHelper({ user, onAdminGranted }) {
  const [isChecking, setIsChecking] = useState(false);
  const [isGranting, setIsGranting] = useState(false);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = async () => {
    if (!user) {
      setMessage('No user logged in');
      return;
    }

    setIsChecking(true);
    setMessage('');
    
    try {
      const adminStatus = await isApplicationAdmin(user.uid);
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        setMessage('✅ You are already a system admin!');
      } else {
        setMessage('❌ You are not a system admin yet.');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const grantAdminAccess = async () => {
    if (!user) {
      setMessage('No user logged in');
      return;
    }

    if (isAdmin) {
      setMessage('You are already an admin!');
      return;
    }

    setIsGranting(true);
    setMessage('Creating admin user in Firebase...');
    
    try {
      console.log('Creating admin for user:', user.uid, user.email);
      
      await createApplicationAdmin(user.uid, {
        email: user.email,
        displayName: user.displayName || user.email,
        role: 'admin',
        permissions: []
      });
      
      console.log('Admin user created successfully');
      setIsAdmin(true);
      setMessage('✅ Admin access granted successfully! Refreshing...');
      
      // Notify parent and refresh
      setTimeout(() => {
        if (onAdminGranted) onAdminGranted();
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error creating admin:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsGranting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] bg-white rounded-2xl shadow-2xl border-2 border-purple-200 p-6 max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-xl">
          <ShieldCheck size={24} className="text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-slate-800">Admin Setup Helper</h3>
          <p className="text-xs text-slate-500">Grant yourself admin access</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="p-3 bg-slate-50 rounded-xl">
          <p className="text-xs text-slate-600 mb-1">Current User</p>
          <p className="text-sm font-bold text-slate-800">{user.email}</p>
          <p className="text-xs text-slate-500 font-mono mt-1">ID: {user.uid}</p>
        </div>

        {message && (
          <div className={`p-3 rounded-xl flex items-start gap-2 ${
            message.includes('✅') ? 'bg-green-50 border border-green-200' :
            message.includes('❌') ? 'bg-yellow-50 border border-yellow-200' :
            'bg-rose-50 border border-rose-200'
          }`}>
            {message.includes('✅') ? <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" /> :
             message.includes('❌') ? <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" /> :
             <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />}
            <p className="text-sm font-medium text-slate-700">{message}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={checkAdminStatus}
          disabled={isChecking}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isChecking ? (
            <>
              <Loader size={14} className="animate-spin" />
              Checking...
            </>
          ) : (
            'Check Status'
          )}
        </button>
        
        <button
          onClick={grantAdminAccess}
          disabled={isGranting || isAdmin}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGranting ? (
            <>
              <Loader size={14} className="animate-spin" />
              Granting...
            </>
          ) : isAdmin ? (
            <>
              <CheckCircle size={14} />
              Already Admin
            </>
          ) : (
            <>
              <ShieldCheck size={14} />
              Grant Admin
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-400 mt-3 text-center">
        This helper will be removed in production
      </p>
    </div>
  );
}
