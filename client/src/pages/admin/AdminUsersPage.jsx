import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, RotateCw } from 'lucide-react';
import { userService } from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Modular user components
import UsersKpiCards from '../../components/admin/users/UsersKpiCards';
import UserFiltersStrip from '../../components/admin/users/UserFiltersStrip';
import UsersTable from '../../components/admin/users/UsersTable';
import CreateUserModal from '../../components/admin/users/CreateUserModal';
import EditUserModal from '../../components/admin/users/EditUserModal';
import SuspendConfirmModal from '../../components/admin/users/SuspendConfirmModal';
import DeleteConfirmModal from '../../components/admin/users/DeleteConfirmModal';
import DEMO from '../../demo/data.json';

export function AdminUsersPage() {
  const { user: currentAdmin, isGuest } = useAuth();
  const toast = useToast();

  const isSuperAdmin = currentAdmin?.role === 'superadmin';
  const permissions = currentAdmin?.permissions || [];
  const canCreate =
    isSuperAdmin || permissions.includes('*') || permissions.includes('users:create');
  const canUpdate =
    isSuperAdmin || permissions.includes('*') || permissions.includes('users:update');
  const canSuspend =
    isSuperAdmin || permissions.includes('*') || permissions.includes('users:suspend');
  const canDelete =
    isSuperAdmin || permissions.includes('*') || permissions.includes('users:delete');

  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, suspended: 0, verified: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToSuspend, setUserToSuspend] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    if (isGuest) {
      let filtered = [...(DEMO.admin?.users || [])];
      if (statusFilter === 'active') filtered = filtered.filter((u) => !u.isSuspended);
      if (statusFilter === 'suspended') filtered = filtered.filter((u) => u.isSuspended);
      if (statusFilter === 'verified') filtered = filtered.filter((u) => u.isVerified);
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        filtered = filtered.filter(
          (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        );
      }
      setUsers(filtered);
      const allDemo = DEMO.admin?.users || [];
      setCounts({
        total: allDemo.length,
        active: allDemo.filter((u) => !u.isSuspended).length,
        suspended: allDemo.filter((u) => u.isSuspended).length,
        verified: allDemo.filter((u) => u.isVerified).length,
      });
      setPagination({ page: 1, limit: 10, totalPages: 1, total: filtered.length });
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await userService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        status: statusFilter,
      });

      const data = res?.data || res;
      if (data && Array.isArray(data.users)) {
        setUsers(data.users);
        if (data.counts) setCounts(data.counts);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isGuest, pagination.page, pagination.limit, debouncedSearch, statusFilter, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    toast.info('User directory synchronized');
  };

  const handleCreateUser = async (formData) => {
    if (isGuest) {
      toast.info('Demo Mode', 'User creation simulated in live demo mode.');
      setIsCreateOpen(false);
      return;
    }
    try {
      await userService.createUser(formData);
      toast.success('User registered successfully');
      setIsCreateOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (id, formData) => {
    if (isGuest) {
      toast.info('Demo Mode', 'User profile update simulated in live demo mode.');
      setUserToEdit(null);
      return;
    }
    try {
      await userService.updateUser(id, formData);
      toast.success('User profile updated successfully');
      setUserToEdit(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    }
  };

  const handleConfirmSuspend = async (reason) => {
    if (!userToSuspend) return;
    if (isGuest) {
      toast.info('Demo Mode', 'User suspension toggle simulated in live demo mode.');
      setUserToSuspend(null);
      return;
    }
    const isSuspended = userToSuspend.isSuspended;
    try {
      if (isSuspended) {
        await userService.reactivateUser(userToSuspend.id || userToSuspend._id);
        toast.success(`User account for ${userToSuspend.name} reactivated`);
      } else {
        await userService.suspendUser(userToSuspend.id || userToSuspend._id, reason);
        toast.warning(`User account for ${userToSuspend.name} has been suspended`);
      }
      setUserToSuspend(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    if (isGuest) {
      toast.info('Demo Mode', 'User deletion simulated in live demo mode.');
      setUserToDelete(null);
      return;
    }
    try {
      await userService.deleteUser(userToDelete.id || userToDelete._id);
      toast.success(`Account for ${userToDelete.name} permanently deleted`);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Deletion failed');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                User Management Directory
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit registered users, manage account standing, and configure permissions
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
            title="Refresh Directory"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-accent-main hover:bg-accent-hover shadow-accent-main transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register User</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <UsersKpiCards counts={counts} />

      {/* Table & Filters Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
        <UserFiltersStrip
          statusFilter={statusFilter}
          onStatusChange={(status) => {
            setStatusFilter(status);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          search={search}
          onSearchChange={setSearch}
          counts={counts}
        />

        <UsersTable
          users={users}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
          canUpdate={canUpdate}
          canSuspend={canSuspend}
          canDelete={canDelete}
          onEditUser={setUserToEdit}
          onSuspendUser={setUserToSuspend}
          onDeleteUser={setUserToDelete}
        />
      </div>

      {/* Modals */}
      {isCreateOpen && (
        <CreateUserModal onClose={() => setIsCreateOpen(false)} onSubmit={handleCreateUser} />
      )}

      {userToEdit && (
        <EditUserModal
          user={userToEdit}
          onClose={() => setUserToEdit(null)}
          onSubmit={(data) => handleUpdateUser(userToEdit.id || userToEdit._id, data)}
        />
      )}

      {userToSuspend && (
        <SuspendConfirmModal
          user={userToSuspend}
          onClose={() => setUserToSuspend(null)}
          onConfirm={handleConfirmSuspend}
        />
      )}

      {userToDelete && (
        <DeleteConfirmModal
          user={userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

export default AdminUsersPage;
