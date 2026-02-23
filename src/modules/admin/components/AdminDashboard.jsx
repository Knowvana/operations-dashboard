// src/modules/admin/components/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Building2, Users, ShieldCheck, Activity, TrendingUp } from 'lucide-react';
import { listTenants, listAllTenantUsers, listApplicationAdmins } from '@shared';

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
    totalAdmins: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const [tenants, users, admins] = await Promise.all([
        listTenants(),
        listAllTenantUsers(),
        listApplicationAdmins()
      ]);

      setStats({
        totalTenants: tenants.length,
        activeTenants: tenants.filter(t => t.status === 'active').length,
        totalUsers: users.length,
        totalAdmins: admins.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${bgColor} rounded-xl`}>
          <Icon size={24} className={color} />
        </div>
        <TrendingUp size={20} className="text-green-500" />
      </div>
      <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-extrabold text-slate-800">{isLoading ? '...' : value}</p>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Admin Dashboard</h2>
        <p className="text-slate-600">Welcome to Knowvana Platform Administration</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Building2}
          label="Total Tenants"
          value={stats.totalTenants}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <StatCard
          icon={Activity}
          label="Active Tenants"
          value={stats.activeTenants}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={ShieldCheck}
          label="Application Admins"
          value={stats.totalAdmins}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <ShieldCheck size={32} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Application Administrator</h3>
            <p className="text-slate-600 mb-4">
              You have full access to manage all tenants, users, and platform configuration. 
              Use the navigation tabs above to manage different aspects of the Knowvana platform.
            </p>
            <div className="flex gap-3">
              <div className="px-4 py-2 bg-white rounded-lg border border-purple-200">
                <p className="text-xs text-slate-500">Logged in as</p>
                <p className="font-bold text-slate-800">{user?.email}</p>
              </div>
              <div className="px-4 py-2 bg-white rounded-lg border border-purple-200">
                <p className="text-xs text-slate-500">Role</p>
                <p className="font-bold text-purple-600">Application Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-extrabold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left rounded-xl border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
            <Building2 size={20} className="text-indigo-600 mb-2" />
            <p className="font-bold text-slate-800">Create New Tenant</p>
            <p className="text-xs text-slate-500 mt-1">Add a new customer organization</p>
          </button>
          <button className="p-4 text-left rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
            <Users size={20} className="text-blue-600 mb-2" />
            <p className="font-bold text-slate-800">Manage Users</p>
            <p className="text-xs text-slate-500 mt-1">Add or edit tenant users</p>
          </button>
          <button className="p-4 text-left rounded-xl border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all">
            <ShieldCheck size={20} className="text-purple-600 mb-2" />
            <p className="font-bold text-slate-800">Admin Settings</p>
            <p className="text-xs text-slate-500 mt-1">Configure platform settings</p>
          </button>
        </div>
      </div>
    </div>
  );
}
