import React, { useState, useEffect, useCallback } from 'react';
import { FolderKanban, RotateCw, Plus } from 'lucide-react';
import { userService, groupService } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DEMO from '../../demo/data.json';
import GroupsKpiCards from '../../components/admin/groups/GroupsKpiCards';
import GroupFiltersStrip from '../../components/admin/groups/GroupFiltersStrip';
import GroupsGrid from '../../components/admin/groups/GroupsGrid';
import { CreateGroupModal } from '../../components/admin/groups/CreateGroupModal';
import { EditGroupModal } from '../../components/admin/groups/EditGroupModal';
import { DeleteGroupModal } from '../../components/admin/groups/DeleteGroupModal';
import { UserConnectedGroupsModal } from '../../components/admin/groups/UserConnectedGroupsModal';

export function AdminGroupsPage() {
  const { user: currentAdmin, isGuest } = useAuth();
  const toast = useToast();

  const isSuperAdmin = currentAdmin?.role === 'superadmin';
  const permissions = currentAdmin?.permissions || [];
  const canCreate =
    isSuperAdmin || permissions.includes('*') || permissions.includes('groups:create');
  const canUpdate =
    isSuperAdmin || permissions.includes('*') || permissions.includes('groups:update');
  const canDelete =
    isSuperAdmin || permissions.includes('*') || permissions.includes('groups:delete');

  const [groups, setGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [inspectedUser, setInspectedUser] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadUsersForFilter = useCallback(async () => {
    if (isGuest) {
      setAllUsers(DEMO.admin.users || []);
      return;
    }
    try {
      const res = await userService.getUsers({ limit: 100 });
      const data = res?.data || res;
      if (data && Array.isArray(data.users)) {
        setAllUsers(data.users);
      } else {
        setAllUsers(DEMO.admin.users || []);
      }
    } catch {
      setAllUsers(DEMO.admin.users || []);
    }
  }, [isGuest]);

  useEffect(() => {
    loadUsersForFilter();
  }, [loadUsersForFilter]);

  const fetchGroups = useCallback(async () => {
    if (isGuest) {
      let demoGroups = DEMO.groups || DEMO.dashboard.groups || [];
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        demoGroups = demoGroups.filter(
          (g) =>
            g.name?.toLowerCase().includes(q) ||
            g.title?.toLowerCase().includes(q) ||
            g.description?.toLowerCase().includes(q)
        );
      }
      setGroups(demoGroups);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await groupService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        userId: selectedUserFilter,
      });

      const data = res?.data || res;
      if (data && Array.isArray(data.groups)) {
        setGroups(data.groups);
        if (data.pagination) setPagination(data.pagination);
      } else {
        setGroups(DEMO.groups || DEMO.dashboard.groups || []);
      }
    } catch (err) {
      setGroups(DEMO.groups || DEMO.dashboard.groups || []);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, selectedUserFilter, isGuest]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchGroups(), loadUsersForFilter()]);
    toast.info('Group circles synchronized');
  };

  const handleCreateGroup = async (groupData) => {
    if (isGuest) {
      toast.warning('Group creation is disabled in guest preview mode.');
      setIsCreateOpen(false);
      return;
    }
    try {
      await groupService.create(groupData);
      toast.success('Group created and members assigned successfully');
      setIsCreateOpen(false);
      await fetchGroups();
    } catch (err) {
      toast.error(err.message || 'Failed to create group');
    }
  };

  const handleUpdateGroup = async (id, groupData) => {
    if (isGuest) {
      toast.warning('Group modifications are disabled in guest preview mode.');
      setGroupToEdit(null);
      return;
    }
    try {
      await groupService.update(id, groupData);
      toast.success('Group information and members updated');
      setGroupToEdit(null);
      await fetchGroups();
    } catch (err) {
      toast.error(err.message || 'Failed to update group');
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    if (isGuest) {
      toast.warning('Group deletion is disabled in guest preview mode.');
      setGroupToDelete(null);
      return;
    }
    try {
      await groupService.delete(groupToDelete.id);
      toast.success(`Group ${groupToDelete.name} deleted successfully`);
      setGroupToDelete(null);
      await fetchGroups();
    } catch (err) {
      toast.error(err.message || 'Failed to delete group');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Group Circles Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All platform circles, member assignments, transaction aggregates, and user
                connectivity
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            title="Refresh Group List"
            className="p-2 rounded-xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            disabled={!canCreate}
            title={canCreate ? 'Create New Group' : 'Missing groups:create privilege'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm shadow-primary/20 hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <GroupsKpiCards groups={groups} totalCount={pagination.total} />

      {/* Main Groups Panel */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
        <GroupFiltersStrip
          search={search}
          onSearchChange={setSearch}
          selectedUserFilter={selectedUserFilter}
          onUserFilterChange={(val) => {
            setSelectedUserFilter(val);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          allUsers={allUsers}
          currentCount={groups.length}
          totalCount={pagination.total}
        />

        <GroupsGrid
          groups={groups}
          isLoading={isLoading}
          canUpdate={canUpdate}
          canDelete={canDelete}
          selectedUserFilter={selectedUserFilter}
          pagination={pagination}
          onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
          onEditGroup={(group) => setGroupToEdit(group)}
          onDeleteGroup={(group) => setGroupToDelete(group)}
          onInspectUser={(user) => setInspectedUser(user)}
        />
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <CreateGroupModal
          allUsers={allUsers}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateGroup}
        />
      )}

      {/* Edit Modal */}
      {groupToEdit && (
        <EditGroupModal
          group={groupToEdit}
          allUsers={allUsers}
          onClose={() => setGroupToEdit(null)}
          onSubmit={(data) => handleUpdateGroup(groupToEdit.id, data)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {groupToDelete && (
        <DeleteGroupModal
          group={groupToDelete}
          onClose={() => setGroupToDelete(null)}
          onConfirm={handleDeleteGroup}
        />
      )}

      {/* Inspected User Connected Circles Modal */}
      {inspectedUser && (
        <UserConnectedGroupsModal user={inspectedUser} onClose={() => setInspectedUser(null)} />
      )}
    </div>
  );
}

export default AdminGroupsPage;
