import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Plus, RotateCw } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StaffKpiCards from '../../components/admin/staff/StaffKpiCards';
import StaffTable from '../../components/admin/staff/StaffTable';
import { CreateStaffModal } from '../../components/admin/staff/CreateStaffModal';
import { StaffPermissionsModal } from '../../components/admin/staff/StaffPermissionsModal';
import DEMO from '../../demo/data.json';

export function AdminStaffPage() {
  const { user: currentAdmin, isGuest } = useAuth();
  const toast = useToast();
  const isSuperAdmin = currentAdmin?.role === 'superadmin';

  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [staffForPermissions, setStaffForPermissions] = useState(null);

  const fetchStaff = useCallback(async () => {
    if (isGuest) {
      setStaff(DEMO.admin?.staff || []);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await adminService.getStaff();
      const list = res?.data?.staff || res?.staff || [];
      setStaff(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err.message || 'Failed to load administrator accounts');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isGuest, toast]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStaff();
    toast.info('Staff directory synchronized');
  };

  const handleCreateStaff = async (formData) => {
    if (isGuest) {
      toast.info('Demo Mode', 'Staff creation simulated in live demo mode.');
      setIsCreateOpen(false);
      return;
    }
    try {
      await adminService.createStaff(formData);
      toast.success('Staff account created successfully');
      setIsCreateOpen(false);
      await fetchStaff();
    } catch (err) {
      toast.error(err.message || 'Failed to create staff account');
    }
  };

  const handleToggleStatus = async (staffMember) => {
    if (isGuest) {
      toast.info('Demo Mode', 'Staff status toggle simulated in live demo mode.');
      return;
    }
    if (!isSuperAdmin) {
      toast.warning('Only Root SuperAdmin can toggle staff activation');
      return;
    }
    const newStatus = !staffMember.isActive;
    try {
      await adminService.toggleStaffStatus(staffMember.id, newStatus);
      toast.success(`Staff account ${newStatus ? 'activated' : 'deactivated'}`);
      await fetchStaff();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleRoleChange = async (staffId, newRole) => {
    if (isGuest) {
      toast.warning('Staff role modification is disabled in guest preview mode.');
      return;
    }
    if (!isSuperAdmin) {
      toast.warning('Only Root SuperAdmin can reassign staff roles');
      return;
    }
    try {
      await adminService.updateStaffRole(staffId, newRole);
      toast.success(`Staff role updated to ${newRole}`);
      await fetchStaff();
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  const handleSavePermissions = async (staffId, perms) => {
    if (isGuest) {
      toast.warning('Staff permissions modification is disabled in guest preview mode.');
      setStaffForPermissions(null);
      return;
    }
    try {
      await adminService.updateStaffPermissions(staffId, perms);
      toast.success('Permissions updated successfully');
      setStaffForPermissions(null);
      await fetchStaff();
    } catch (err) {
      toast.error(err.message || 'Failed to update permissions');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Admin & Staff Directory
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Administrative roles, privilege scopes, account credentials, and audit delegation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            title="Refresh Staff List"
            className="p-2 rounded-xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm shadow-primary/20 hover:opacity-95 transition-opacity cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics */}
      <StaffKpiCards staff={staff} />

      {/* Staff Table Container */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Privileged Staff Accounts ({staff.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Administrators and moderators with dashboard portal access
            </p>
          </div>
        </div>

        <StaffTable
          staff={staff}
          isLoading={isLoading}
          currentAdminId={currentAdmin?.id}
          isSuperAdmin={isSuperAdmin}
          onRoleChange={handleRoleChange}
          onEditPermissions={(member) => setStaffForPermissions(member)}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      {/* Create Staff Modal */}
      {isCreateOpen && (
        <CreateStaffModal onClose={() => setIsCreateOpen(false)} onSubmit={handleCreateStaff} />
      )}

      {/* Permissions Delegation Modal */}
      {staffForPermissions && (
        <StaffPermissionsModal
          staff={staffForPermissions}
          onClose={() => setStaffForPermissions(null)}
          onSave={(perms) => handleSavePermissions(staffForPermissions.id, perms)}
        />
      )}
    </div>
  );
}

export default AdminStaffPage;
