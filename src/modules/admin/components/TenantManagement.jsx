// src/modules/admin/components/TenantManagement.jsx
import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Loader, AlertCircle, Save } from 'lucide-react';
import { listTenants, createTenant, updateTenantMetadata, deleteTenant, ConfirmationModal } from '@shared';

export default function TenantManagement({ view = 'create', onTenantCreated }) {
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  
  // Modal State
  const [confirmAction, setConfirmAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processSuccess, setProcessSuccess] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  
  // Search and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const activeView = view;
  
  const [formData, setFormData] = useState({
    tenantName: '',
    plan: 'free'
  });

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (view === 'create') {
      resetForm();
    }
  }, [view]);

  const loadTenants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listTenants();
      setTenants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTenantId = (tenantName) => {
    const timestamp = Date.now();
    const cleanName = tenantName.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20);
    return `${cleanName}-${timestamp}`;
  };

  const handleCreate = () => {
    if (!formData.tenantName) {
      setError('Please provide tenant name');
      return;
    }

    setConfirmAction({
      type: 'create_tenant',
      title: 'Create Tenant',
      desc: `Create a new tenant "${formData.tenantName}"?`
    });
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (confirmAction.type === 'create_tenant') {
        const tenantId = generateTenantId(formData.tenantName);
        
        await createTenant({
          tenantId,
          tenantName: formData.tenantName,
          plan: formData.plan,
          createdBy: 'admin'
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set custom success message
        setConfirmAction(prev => ({
          ...prev,
          successTitle: 'Action Complete',
          successDesc: `Tenant - ${formData.tenantName} created successfully.`
        }));
        
        setProcessSuccess(true);
      } else if (confirmAction.type === 'edit_tenant') {
        if (!editingTenant) throw new Error('No tenant selected for editing');
        
        await updateTenantMetadata(editingTenant.tenantId, {
          tenantName: formData.tenantName,
          plan: formData.plan
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadTenants();
        
        // Set custom success message
        setConfirmAction(prev => ({
          ...prev,
          successTitle: 'Action Complete',
          successDesc: `Tenant - ${formData.tenantName} updated successfully.`
        }));
        
        setProcessSuccess(true);
      } else if (confirmAction.type === 'delete_tenant') {
        if (!selectedTenant) throw new Error('No tenant selected');
        
        await deleteTenant(selectedTenant.tenantId);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadTenants();
        
        // Set custom success message
        setConfirmAction(prev => ({
          ...prev,
          successTitle: 'Action Complete',
          successDesc: `Tenant - ${selectedTenant.tenantName} deleted successfully.`
        }));
        
        setProcessSuccess(true);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      setError(error.message);
      setIsProcessing(false);
    }
  };

  const openEditModal = (tenant) => {
    setEditingTenant(tenant);
    setFormData({
      tenantName: tenant.tenantName,
      plan: tenant.plan || 'free'
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    if (!formData.tenantName) {
      setError('Please provide tenant name');
      return;
    }
    
    setConfirmAction({
      type: 'edit_tenant',
      title: 'Update Tenant',
      desc: `Update tenant "${editingTenant.tenantName}" with new information?`
    });
    setIsEditModalOpen(false);
  };

  const resetConfirmationState = () => {
    setConfirmAction(null);
    setIsProcessing(false);
    setProcessSuccess(false);
  };

  const handleSuccessClose = async () => {
    resetConfirmationState();
    await loadTenants();
    resetForm();
    setSelectedTenant(null);
    setEditingTenant(null);
    // Switch to manage view after successful creation
    if (onTenantCreated) {
      onTenantCreated();
    }
  };

  const handleUpdate = async () => {
    if (!selectedTenant) return;

    setIsSaving(true);
    setError(null);
    
    try {
      await updateTenantMetadata(selectedTenant.tenantId, {
        tenantName: formData.tenantName,
        plan: formData.plan
      });
      
      await loadTenants();
      alert('Tenant updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTenant) return;
    
    if (!confirm(`Are you sure you want to delete tenant "${selectedTenant.tenantName}"? This action cannot be undone.`)) {
      return;
    }

    setError(null);
    try {
      await deleteTenant(selectedTenant.tenantId);
      await loadTenants();
      resetForm();
      alert('Tenant deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const selectTenant = (tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      tenantName: tenant.tenantName || '',
      plan: tenant.plan || 'free'
    });
  };

  const resetForm = () => {
    setFormData({
      tenantName: '',
      plan: 'free'
    });
    setSelectedTenant(null);
  };

  // Search and filter tenants
  const filteredTenants = tenants.filter(tenant =>
    tenant.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.tenantId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTenants = filteredTenants.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="space-y-6 overflow-y-auto flex-1">
        <div>
          <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {activeView === 'create' && 'Create New Tenant'}
            {activeView === 'manage' && 'Manage Tenant'}
          </h3>
          <p className="text-slate-500 mt-2 font-medium">
            {activeView === 'create' && 'Add a new tenant to your platform'}
            {activeView === 'manage' && `Editing: ${selectedTenant?.tenantName || 'Select a tenant'}`}
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
              Create New Tenant
            </h4>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tenant Name *</label>
                <input
                  type="text"
                  value={formData.tenantName}
                  onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="Company Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Plan</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
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
                  Create Tenant
                </>
              )}
            </button>
          </div>
        )}

        {activeView === 'manage' && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 rounded-3xl p-8 border border-teal-100/50 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 size={24} className="text-teal-600" />
                    <h3 className="text-2xl font-bold text-slate-800">Tenant Directory</h3>
                  </div>
                  <p className="text-slate-600 ml-9">Manage and monitor all your organization's tenants</p>
                </div>
                <div className="text-sm font-semibold text-teal-700 bg-white/60 px-4 py-2 rounded-full">
                  {filteredTenants.length} of {tenants.length} Tenant{tenants.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <input
                type="text"
                placeholder="Search by tenant name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-teal-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-slate-800 font-medium"
              />
            </div>

            {/* Tenants Table */}
            {isLoading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-slate-500">
                <Loader size={24} className="animate-spin text-teal-500" />
                <span className="text-lg">Loading tenants...</span>
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-16">
                <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg">No tenants found. Create your first tenant to get started.</p>
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="text-center py-16">
                <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg">No tenants match your search.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Tenant Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Tenant ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Plan</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Created By</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {paginatedTenants.map((tenant) => (
                        <tr 
                          key={tenant.tenantId}
                          className={`hover:bg-teal-50 transition-colors ${selectedTenant?.tenantId === tenant.tenantId ? 'bg-teal-50' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-slate-800">{tenant.tenantName}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-xs text-slate-600">{tenant.tenantId}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              tenant.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                              tenant.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {tenant.plan || 'free'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-600">
                              {tenant.createdAt ? new Date(tenant.createdAt.toDate?.() || tenant.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-600 capitalize">{tenant.createdBy || 'system'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
                            <button
                              onClick={() => openEditModal(tenant)}
                              className="px-3 py-2 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors font-bold text-sm flex items-center gap-1"
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setConfirmAction({
                                  type: 'delete_tenant',
                                  title: 'Delete Tenant',
                                  desc: `Are you sure you want to delete tenant "${tenant.tenantName}"? This action cannot be undone.`
                                });
                              }}
                              className="px-3 py-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors font-bold text-sm flex items-center gap-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                    <span className="text-sm text-slate-600 font-medium">
                      Page {currentPage} of {totalPages} • Showing {paginatedTenants.length} of {filteredTenants.length} results
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && editingTenant && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                  {/* Modal Header */}
                  <div className="mb-6 pb-4 border-b border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <Edit2 size={20} className="text-teal-600" />
                      Edit Tenant
                    </h3>
                  </div>

                  {/* Tenant Info Display */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                    <div>
                      <p className="text-xs text-slate-600 font-medium mb-1">Tenant ID</p>
                      <p className="font-mono text-sm text-slate-800 font-semibold">{editingTenant.tenantId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-medium mb-1">Created</p>
                      <p className="text-sm text-slate-800 font-semibold">
                        {editingTenant.createdAt ? new Date(editingTenant.createdAt.toDate?.() || editingTenant.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Edit Form */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Tenant Name</label>
                      <input
                        type="text"
                        value={formData.tenantName}
                        onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-teal-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-slate-800 font-medium"
                        placeholder="Enter tenant name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Plan</label>
                      <select
                        value={formData.plan}
                        onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-teal-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all text-slate-800 font-medium"
                      >
                        <option value="free">Free Plan</option>
                        <option value="pro">Pro Plan</option>
                        <option value="enterprise">Enterprise Plan</option>
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleEditSubmit}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-bold hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={16} />
                      Update
                    </button>
                    
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        action={confirmAction}
        isProcessing={isProcessing}
        isSuccess={processSuccess}
        onConfirm={executeConfirmedAction}
        onCancel={resetConfirmationState}
        onSuccessClose={handleSuccessClose}
      />
    </div>
  );
}
