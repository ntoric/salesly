import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPurchases } from './api';
import PageContainer from '../../components/common/PageContainer';
import Table from '../../components/common/Table';
import { Plus, Eye, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import Modal from '../../components/common/Modal';

import { toast } from 'react-hot-toast';

const PurchaseList = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [purchaseToDelete, setPurchaseToDelete] = useState(null);
    const [selectedPurchases, setSelectedPurchases] = useState([]);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const isStatsUser = user?.is_staff || user?.role === 'SUPER_ADMIN';
    const basePath = isStatsUser ? '/admin' : '/app';

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getPurchases();
            setPurchases(data.results || data);
            setLoading(false);
            setSelectedPurchases([]);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load purchases');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const confirmDelete = async () => {
        if (!purchaseToDelete) return;

        try {
            await api.delete(`/purchases/${purchaseToDelete.id}/`);
            toast.success('Purchase deleted successfully');
            fetchData();
            setDeleteModalOpen(false);
            setPurchaseToDelete(null);
        } catch (e) {
            console.error(e);
            toast.error('Failed to delete purchase');
        }
    };

    const confirmBulkDelete = async () => {
        if (selectedPurchases.length === 0) return;

        try {
            setBulkDeleteLoading(true);
            await api.post('/purchases/bulk-delete/', { ids: selectedPurchases });
            toast.success(`${selectedPurchases.length} purchases deleted successfully`);
            setSelectedPurchases([]);
            setBulkDeleteModalOpen(false);
            fetchData();
        } catch (e) {
            console.error(e);
            toast.error('Failed to delete selected purchases');
        } finally {
            setBulkDeleteLoading(false);
        }
    };

    const handleDeleteClick = (purchase) => {
        setPurchaseToDelete(purchase);
        setDeleteModalOpen(true);
    };

    const columns = [
        {
            header: 'ID',
            accessor: 'id',
            render: (p) => <span className="font-mono text-gray-500">#{p.id}</span>
        },
        {
            header: 'Date',
            render: (p) => new Date(p.date || p.created_at).toLocaleDateString()
        },
        {
            header: 'Vendor',
            render: (p) => <span className="font-medium text-gray-700">{p.vendor_name || 'Anonymous'}</span>
        },
        {
            header: 'Volume',
            render: (p) => <span className="font-mono">{parseFloat(p.volume).toFixed(2)}</span>
        },
        {
            header: 'Currency',
            accessor: 'currency'
        },
        {
            header: 'Rate',
            render: (p) => <span className="font-mono">{parseFloat(p.rate).toFixed(4)}</span>
        },
        {
            header: 'Purchase Currency',
            accessor: 'purchase_currency'
        },
        {
            header: 'Amount',
            render: (p) => <span className="font-semibold">{parseFloat(p.purchase_amount).toFixed(2)}</span>
        },
    ];

    const actionColumn = (p) => (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => navigate(`${basePath}/purchases/${p.id}`)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
            >
                <Eye size={18} />
            </button>
            <button
                onClick={() => handleDeleteClick(p)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );

    return (
        <PageContainer
            title="Purchases"
            action={
                <div className="flex items-center gap-3">
                    {selectedPurchases.length > 0 && (
                        <button
                            onClick={() => setBulkDeleteModalOpen(true)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium border border-red-200"
                        >
                            <Trash2 size={18} />
                            <span>Delete ({selectedPurchases.length})</span>
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`${basePath}/purchases/new`)}
                        className="bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all"
                    >
                        <Plus size={18} />
                        <span>New Purchase</span>
                    </button>
                </div>
            }
        >
            <Table
                columns={columns}
                data={purchases}
                loading={loading}
                actionColumn={actionColumn}
                emptyMessage="No purchases found."
                selectable
                selectedIds={selectedPurchases}
                onSelectionChange={setSelectedPurchases}
            />

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Purchase"
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
                        Are you sure you want to delete this purchase? This action cannot be undone.
                    </p>
                    {purchaseToDelete && (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 border border-gray-100">
                            <p className="font-medium text-gray-900">{purchaseToDelete.vendor_name}</p>
                            <p>Volume: {parseFloat(purchaseToDelete.volume).toFixed(2)} {purchaseToDelete.currency}</p>
                            <p>Amount: {parseFloat(purchaseToDelete.purchase_amount).toFixed(2)} {purchaseToDelete.purchase_currency}</p>
                            <p>Date: {new Date(purchaseToDelete.date || purchaseToDelete.created_at).toLocaleDateString()}</p>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={bulkDeleteModalOpen}
                onClose={() => setBulkDeleteModalOpen(false)}
                title={`Delete ${selectedPurchases.length} Purchases`}
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
                        Are you sure you want to delete <strong>{selectedPurchases.length}</strong> selected purchases? This action cannot be undone.
                    </p>
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                        Warning: This will permanently remove the selected purchase records.
                    </div>
                </div>
            </Modal>
        </PageContainer>
    );
};

export default PurchaseList;
