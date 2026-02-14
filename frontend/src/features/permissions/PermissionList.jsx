import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import Table from '../../components/common/Table';
import { Plus, Trash2, Shield } from 'lucide-react';
import api from '../../lib/axios';
import Modal from '../../components/common/Modal';

const PermissionList = () => {
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [permissionToDelete, setPermissionToDelete] = useState(null);
    const navigate = useNavigate();

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/permissions/');
            setPermissions(response.data.results || response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch permissions", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const confirmDelete = async () => {
        if (!permissionToDelete) return;

        try {
            await api.delete(`/permissions/${permissionToDelete.id}/`);
            fetchPermissions();
            setDeleteModalOpen(false);
            setPermissionToDelete(null);
        } catch (error) {
            console.error("Failed to delete permission", error);
            alert("Failed to delete permission");
        }
    };

    const handleDeleteClick = (perm) => {
        setPermissionToDelete(perm);
        setDeleteModalOpen(true);
    };

    const columns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Codename', render: (perm) => <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{perm.codename}</code> },
        { header: 'Content Type', accessor: 'content_type' }, // Ideally fetch content type name
    ];

    const actionColumn = (perm) => (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => handleDeleteClick(perm)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );

    return (
        <PageContainer
            title="Permissions"
            action={
                <button
                    onClick={() => navigate('/admin/permissions/new')}
                    className="flex items-center gap-2 bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-lg hover:bg-[hsl(var(--primary-light))] transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    <span>Add Permission</span>
                </button>
            }
        >
            <Table
                columns={columns}
                data={permissions}
                loading={loading}
                actionColumn={actionColumn}
                emptyMessage="No permissions found."
            />

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Permission"
                footer={
                    <>
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                    </>
                }
            >
                <div className="space-y-3">
                    <p className="text-gray-600">
                        Are you sure you want to delete this permission? This action cannot be undone.
                    </p>
                    {permissionToDelete && (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 border border-gray-100">
                            <p className="font-medium text-gray-900">{permissionToDelete.name}</p>
                            <p>Code: {permissionToDelete.codename}</p>
                        </div>
                    )}
                </div>
            </Modal>
        </PageContainer>
    );
};

export default PermissionList;
