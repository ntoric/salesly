import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSales } from './api';
import PageContainer from '../../components/common/PageContainer';
import Table from '../../components/common/Table';
import { Plus, Eye, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import Modal from '../../components/common/Modal';
import clsx from 'clsx';

import { toast } from 'react-hot-toast';

const SalesList = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState(null);
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [saleToComplete, setSaleToComplete] = useState(null);
    const [selectedSales, setSelectedSales] = useState([]);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const isStatsUser = user?.is_staff || user?.role === 'SUPER_ADMIN';
    const basePath = isStatsUser ? '/admin' : '/app';

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getSales();
            setSales(data.results || data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load sales');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const confirmDelete = async () => {
        if (!saleToDelete) return;

        try {
            await api.delete(`/sales/${saleToDelete.id}/`);
            toast.success('Sale deleted successfully');
            fetchData();
            setDeleteModalOpen(false);
            setSaleToDelete(null);
        } catch (e) {
            console.error(e);
            toast.error('Failed to delete sale');
        }
    };

    const confirmComplete = async () => {
        if (!saleToComplete) return;

        try {
            await api.patch(`/sales/${saleToComplete.id}/`, { status: 'COMPLETED' });
            toast.success('Sale marked as completed');
            fetchData();
            setCompleteModalOpen(false);
            setSaleToComplete(null);
        } catch (e) {
            console.error(e);
            toast.error('Failed to complete sale');
        }
    };

    const confirmBulkDelete = async () => {
        if (selectedSales.length === 0) return;

        try {
            setBulkDeleteLoading(true);
            await api.post('/sales/bulk-delete/', { ids: selectedSales });
            toast.success(`${selectedSales.length} sales deleted successfully`);
            setSelectedSales([]);
            setBulkDeleteModalOpen(false);
            fetchData();
        } catch (e) {
            console.error(e);
            toast.error('Failed to delete selected sales');
        } finally {
            setBulkDeleteLoading(false);
        }
    };

    const handleDeleteClick = (sale) => {
        setSaleToDelete(sale);
        setDeleteModalOpen(true);
    };

    const handleCompleteClick = (sale) => {
        setSaleToComplete(sale);
        setCompleteModalOpen(true);
    };

    const columns = [
        {
            header: 'ID',
            accessor: 'id',
            render: (sale) => <span className="font-mono text-gray-500">#{sale.id}</span>
        },
        {
            header: 'Status',
            render: (sale) => (
                <span className={clsx(
                    "px-2 py-1 rounded-full text-xs font-semibold",
                    sale.status === 'COMPLETED' ? "bg-green-100 text-green-700" :
                        sale.status === 'CANCELLED' ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                )}>
                    {sale.status || 'PENDING'}
                </span>
            )
        },
        {
            header: 'Date',
            render: (sale) => new Date(sale.created_at).toLocaleDateString()
        },
        {
            header: 'Customer',
            accessor: 'customer_name'
        },
        {
            header: 'Volume',
            render: (sale) => <span className="font-mono">{parseFloat(sale.volume).toFixed(2)}</span>
        },
        {
            header: 'Currency',
            accessor: 'currency'
        },
        {
            header: 'Rate',
            render: (sale) => <span className="font-mono">{parseFloat(sale.rate).toFixed(4)}</span>
        },
        {
            header: 'Sale Currency',
            accessor: 'sale_currency'
        }
    ];

    const actionColumn = (sale) => (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => navigate(`${basePath}/sales/${sale.id}`)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
            >
                <Eye size={18} />
            </button>
            {sale.status !== 'COMPLETED' && (
                <button
                    onClick={() => handleCompleteClick(sale)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Mark as Completed"
                >
                    <CheckCircle size={18} />
                </button>
            )}
            <button
                onClick={() => handleDeleteClick(sale)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );

    return (
        <PageContainer
            title="Sales"
            action={
                <div className="flex items-center gap-3">
                    {selectedSales.length > 0 && (
                        <button
                            onClick={() => setBulkDeleteModalOpen(true)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium border border-red-200"
                        >
                            <Trash2 size={18} />
                            <span>Delete ({selectedSales.length})</span>
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`${basePath}/sales/new`)}
                        className="bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-hover))] text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all"
                    >
                        <Plus size={18} />
                        <span>New Sale</span>
                    </button>
                </div>
            }
        >
            <Table
                columns={columns}
                data={sales}
                loading={loading}
                actionColumn={actionColumn}
                emptyMessage="No sales records found."
                selectable
                selectedIds={selectedSales}
                onSelectionChange={setSelectedSales}
            />

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Sale"
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
                        Are you sure you want to delete this sale? This action cannot be undone.
                    </p>
                    {saleToDelete && (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 border border-gray-100">
                            <p className="font-medium text-gray-900">{saleToDelete.customer_name}</p>
                            <p>Volume: {parseFloat(saleToDelete.volume).toFixed(2)} {saleToDelete.currency}</p>
                            <p>Date: {new Date(saleToDelete.created_at).toLocaleDateString()}</p>
                        </div>
                    )}
                </div>
            </Modal>
            <Modal
                isOpen={bulkDeleteModalOpen}
                onClose={() => setBulkDeleteModalOpen(false)}
                title={`Delete ${selectedSales.length} Sales`}
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
                        Are you sure you want to delete <strong>{selectedSales.length}</strong> selected sales? This action cannot be undone.
                    </p>
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                        Warning: This will permanently remove the selected sales records.
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={completeModalOpen}
                onClose={() => setCompleteModalOpen(false)}
                title="Complete Sale"
                footer={
                    <>
                        <button
                            onClick={() => setCompleteModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmComplete}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Complete
                        </button>
                    </>
                }
            >
                <div className="space-y-3">
                    <p className="text-gray-600">
                        Are you sure you want to mark this sale as completed?
                    </p>
                    {saleToComplete && (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 border border-gray-100">
                            <p className="font-medium text-gray-900">{saleToComplete.customer_name}</p>
                            <p>Volume: {parseFloat(saleToComplete.volume).toFixed(2)} {saleToComplete.currency}</p>
                        </div>
                    )}
                </div>
            </Modal>
        </PageContainer>
    );
};

export default SalesList;
