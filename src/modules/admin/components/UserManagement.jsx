// src/modules/admin/components/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Loader, AlertCircle, Shield, Save } from 'lucide-react';
import { getCurrentTenantId, listTenantUsers, addUserToTenant, updateUserTenantAccess, removeUserFromTenant } from '@shared';

export default function UserManagement({ view = 'create' }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentTenant, setCurrentTenant] = useState('');
  
  const activeView = view;
  
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    displayName: '',
    role: 'user',
    status: 'active',
    permissions: []
  });

  useEffect(() => {
    const tenantId = getCurrentTenantId();
    setCurrentTenant(tenantId);
    loadUsers(tenantId);
  }, []);

  useEffect(() => {
    if (view === 'create') {
      resetForm();
    }
  }, [view]);

  const loadUsers = async (tenantId) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listTenantUsers(tenantId);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.email || !formData.displayName) {
      setError('Please provide email and display name');
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      const userId = formData.userId || `user_${Date.now()}`;
      await addUserToTenant(userId, currentTenant, {
        email: formData.email,
        displayName: formData.displayName,
        role: formData.role,
        status: formData.status,
        permissions: formData.permissions
      });
      
      await loadUsers(currentTenant);
      resetForm();
      alert('User created successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    setIsSaving(true);
    setError(null);
    
    try {
      await updateUserTenantAccess(selectedUser.userId, currentTenant, {
        role: formData.role,
        status: formData.status,
        permissions: formData.permissions
      });
      
      await loadUsers(currentTenant);
      alert('User updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    if (!confirm(`Are you sure you want to remove user "${selectedUser.displayName}" from this tenant? This action cannot be undone.`)) {
      return;
    }

    setError(null);
    try {
      await removeUserFromTenant(selectedUser.userId, currentTenant);
      await loadUsers(currentTenant);
      resetForm();
      alert('User removed successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setFormData({
      userId: user.userId,
      email: user.email || '',
      displayName: user.displayName || '',
      role: user.role || 'user',
      status: user.status || 'active',
      permissions: user.permissions || []
    });
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      email: '',
      displayName: '',
      role: 'user',
      status: 'active',
      permissions: []
    });
    setSelectedUser(null);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {activeView === 'create' && 'Create New User'}
            {activeView === 'manage' && 'Manage User'}
          </h3>
          <p className="text-slate-500 mt-2 font-medium">
            {activeView === 'create' && `Add a new user to tenant: ${currentTenant}`}
            {activeView === 'manage' && `Editing: ${selectedUser?.displayName || 'Select a user'}`}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-800">Error</p>
              <p className="text-sm text-rose-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {activeView === 'create' && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus size={16} />
              Create New User
            </h4>
            
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    placeholder="user@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Display Name *</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCreate}
              disabled={isSaving}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create User
                </>
              )}
            </button>
          </div>
        )}

        {activeView === 'manage' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Users size={16} />
                  Select User ({users.length})
                </h4>
              </div>
              
              {isLoading ? (
                <div className="p-8 flex items-center justify-center gap-3 text-slate-500">
                  <Loader size={20} className="animate-spin" />
                  Loading users...
                </div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p>No users found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Display Name</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {users.map((user) => (
                        <tr 
                          key={user.userId} 
                          className={`hover:bg-slate-50 transition-colors ${selectedUser?.userId === user.userId ? 'bg-indigo-50' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-slate-800">{user.email}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-slate-700">{user.displayName || '-'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                              user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {user.role === 'admin' && <Shield size={12} />}
                              {user.role || 'user'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              user.status === 'active' ? 'bg-green-100 text-green-700' :
                              user.status === 'suspended' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {user.status || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => selectUser(user)}
                              className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-bold text-sm"
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {selectedUser ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Edit2 size={16} />
                  Edit User
                </h4>
                
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email (Read-Only)</label>
                    <input
                      type="text"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Display Name (Read-Only)</label>
                    <input
                      type="text"
                      value={formData.displayName}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 outline-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdate}
                    disabled={isSaving}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No User Selected</h3>
                <p className="mt-2">Please select a user from the table above to edit.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
