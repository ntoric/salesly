import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import Table from '../../components/common/Table';
import { Plus, Edit, Trash2, Shield, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import clsx from 'clsx';
import Modal from '../../components/common/Modal';

import { toast } from 'react-hot-toast';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, user: null });
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const isStatsUser = currentUser?.is_staff || currentUser?.role === 'SUPER_ADMIN';
    const basePath = isStatsUser ? '/admin' : '/app';

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users/');
            setUsers(response.data.results || response.data);
            setLoading(false);
            setSelectedUsers([]);
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const confirmBulkDelete = async () => {
        if (selectedUsers.length === 0) return;

        try {
            setBulkDeleteLoading(true);
            await api.post('/users/bulk-delete/', { ids: selectedUsers });
            toast.success(`${selectedUsers.length} users deleted successfully`);
            setSelectedUsers([]);
            setBulkDeleteModalOpen(false);
            fetchUsers();
        } catch (e) {
            console.error(e);
            toast.error(e.response?.data?.detail || 'Failed to delete selected users');
        } finally {
            setBulkDeleteLoading(false);
        }
    };

    const handleActionClick = (user, type) => {
        setModalConfig({ isOpen: true, type, user });
    };

    const confirmAction = async () => {
        const { type, user } = modalConfig;
        if (!user) return;

        try {
            if (type === 'delete') {
                await api.delete(`/users/${user.id}/`);
                toast.success("User deleted successfully");
            } else if (type === 'block' || type === 'unblock') {
                const action = type;
                await api.post(`/users/${user.id}/${action}/`);
                toast.success(`User ${action}ed successfully`);
            }
            fetchUsers();
            setModalConfig({ isOpen: false, type: null, user: null });
        } catch (error) {
            console.error(`Failed to ${type} user`, error);
            toast.error(`Failed to ${type} user`);
        }
    };

    const columns = [
        {
            header: 'User',
            render: (user) => (
                <div>
                    <div className="font-medium text-[hsl(var(--text-main))]">{user.first_name} {user.last_name}</div>
                    <div className="text-xs text-[hsl(var(--text-muted))]">{user.username || user.email}</div>
                </div>
            )
        },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
        {
            header: 'Role',
            render: (user) => (
                <span className={clsx(
                    "px-2 py-0.5 rounded-full text-xs font-medium uppercase border",
                    user.role === 'SUPER_ADMIN' ? "bg-purple-50 text-purple-700 border-purple-200" :
                        user.role === 'TENANT_ADMIN' ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-gray-50 text-gray-700 border-gray-200"
                )}>
                    {user.role?.replace('_', ' ')}
                </span>
            )
        },
        {
            header: 'Status',
            render: (user) => (
                <span className={clsx(
                    "flex items-center gap-1.5 text-sm",
                    user.is_active ? "text-emerald-600" : "text-red-600"
                )}>
                    {user.is_active ? <CheckCircle size={14} /> : <Ban size={14} />}
                    {user.is_active ? 'Active' : 'Blocked'}
                </span>
            )
        },
        {
            header: 'Joined',
            render: (user) => new Date(user.date_joined).toLocaleDateString()
        }
    ];

    // Hide Role column if not Super Admin? 
    // Requirement says "Role (Super Admin Only Access)". 
    // Actually, Tenant Admin can create Merchants, so they probably need to know they are merchants.
    // But maybe they shouldn't see "Super Admin" label if it ever appears.
    // For now I'll keep it visible but maybe filter the data in backend to only show lower roles.

    const actionColumn = (user) => (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => navigate(`${basePath}/users/${user.id}/edit`)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
            >
                <Edit size={16} />
            </button>
            {/* Permission Button - only for Super Admin? Or Tenant Admin can give permissions? Req says "Manage User Permissions ... Super Admin Only Access for Add/Edit Permission" but "Assign Permissions"?
               "Manage User Permissions... Add Permission (Super Admin Only Access)... Assign Permissions to Users"
               Assuming Super Admin only for assignment too. */}
            {(currentUser?.role === 'SUPER_ADMIN') && (
                <button
                    onClick={() => navigate(`${basePath}/users/${user.id}/permissions`)}
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Permissions"
                >
                    <Shield size={16} />
                </button>
            )}
            <button
                onClick={() => handleActionClick(user, user.is_active ? 'block' : 'unblock')}
                className={clsx(
                    "p-1.5 rounded-lg transition-colors",
                    user.is_active ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
                )}
                title={user.is_active ? "Block" : "Unblock"}
            >
                {user.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
            </button>
            <button
                onClick={() => handleActionClick(user, 'delete')}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );

    return (
        <PageContainer
            title="User Management"
            action={
                <div className="flex items-center gap-3">
                    {selectedUsers.length > 0 && (
                        <button
                            onClick={() => setBulkDeleteModalOpen(true)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-medium border border-red-200"
                        >
                            <Trash2 size={18} />
                            <span>({selectedUsers.length})</span>
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`${basePath}/users/new`)}
                        className="flex items-center gap-2 bg-[hsl(var(--accent))] text-white px-4 py-2 rounded-lg hover:bg-[hsl(var(--accent-hover))] transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        <span>Add User</span>
                    </button>
                </div>
            }
        >
            <Table
                columns={columns}
                data={users}
                loading={loading}
                actionColumn={actionColumn}
                emptyMessage="No users found."
                selectable
                selectedIds={selectedUsers}
                onSelectionChange={setSelectedUsers}
            />

            <Modal
                isOpen={bulkDeleteModalOpen}
                onClose={() => setBulkDeleteModalOpen(false)}
                title={`Delete ${selectedUsers.length} Users`}
                footer={
                    <>
                        <button
                            onClick={() => setBulkDeleteModalOpen(false)}
                            disabled={bulkDeleteLoading}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmBulkDelete}
                            disabled={bulkDeleteLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            {bulkDeleteLoading && <Loader2 size={16} className="animate-spin" />}
                            Delete All
                        </button>
                    </>
                }
            >
                <div className="space-y-3">
                    <p className="text-gray-600">
                        Are you sure you want to delete <strong>{selectedUsers.length}</strong> selected users? This action cannot be undone.
                    </p>
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                        Warning: This will permanently remove the selected user accounts.
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={
                    modalConfig.type === 'delete' ? 'Delete User' :
                        modalConfig.type === 'block' ? 'Block User' : 'Unblock User'
                }
                footer={
                    <>
                        <button
                            onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmAction}
                            className={clsx(
                                "px-4 py-2 text-white rounded-lg transition-colors",
                                modalConfig.type === 'delete' ? "bg-red-600 hover:bg-red-700" :
                                    modalConfig.type === 'block' ? "bg-amber-600 hover:bg-amber-700" :
                                        "bg-emerald-600 hover:bg-emerald-700"
                            )}
                        >
                            {modalConfig.type === 'delete' ? 'Delete' :
                                modalConfig.type === 'block' ? 'Block' : 'Unblock'}
                        </button>
                    </>
                }
            >
                <div className="space-y-3">
                    <p className="text-gray-600">
                        {modalConfig.type === 'delete'
                            ? "Are you sure you want to delete this user? This action cannot be undone."
                            : `Are you sure you want to ${modalConfig.type} this user?`
                        }
                    </p>
                    {modalConfig.user && (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 border border-gray-100">
                            <p className="font-medium text-gray-900">{modalConfig.user.first_name} {modalConfig.user.last_name}</p>
                            <p>{modalConfig.user.email}</p>
                            <p className="text-xs uppercase mt-1">{modalConfig.user.role?.replace('_', ' ')}</p>
                        </div>
                    )}
                </div>
            </Modal>
        </PageContainer>
    );
};

export default UserList;
