import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import Table from '../../components/common/Table';
import { Plus, Edit, Trash2, MapPin, Eye, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import Modal from '../../components/common/Modal';

import { toast } from 'react-hot-toast';

const AddressList = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAddresses, setSelectedAddresses] = useState([]);
    const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const isStatsUser = user?.is_staff || user?.role === 'SUPER_ADMIN';
    const basePath = isStatsUser ? '/admin' : '/app';

    const fetchAddresses = async (search = '') => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;

            const response = await api.get('/customers/addresses/', { params });
            setAddresses(response.data.results || response.data);
            setLoading(false);
            setSelectedAddresses([]);
        } catch (error) {
            console.error("Failed to fetch addresses", error);
            toast.error("Failed to load addresses");
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length >= 3 || searchQuery.length === 0) {
                fetchAddresses(searchQuery);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const confirmDelete = async () => {
        if (!addressToDelete) return;

        try {
            await api.delete(`/customers/addresses/${addressToDelete.id}/`);
            toast.success("Address deleted successfully");
            fetchAddresses();
            setDeleteModalOpen(false);
            setAddressToDelete(null);
        } catch (error) {
            console.error("Failed to delete address", error);
            toast.error("Failed to delete address");
        }
    };

    const confirmBulkDelete = async () => {
        if (selectedAddresses.length === 0) return;

        try {
            setBulkDeleteLoading(true);
            await api.post('/customers/addresses/bulk-delete/', { ids: selectedAddresses });
            toast.success(`${selectedAddresses.length} addresses deleted successfully`);
            setSelectedAddresses([]);
            setBulkDeleteModalOpen(false);
            fetchAddresses(searchQuery);
        } catch (e) {
            console.error(e);
            toast.error('Failed to delete selected addresses');
        } finally {
            setBulkDeleteLoading(false);
        }
    };

    const handleDeleteClick = (addr) => {
        setAddressToDelete(addr);
        setDeleteModalOpen(true);
    };

    const columns = [
        { header: 'Address Line 1', accessor: 'address_line_1' },
        { header: 'City', accessor: 'city' },
        { header: 'State', accessor: 'state' },
        { header: 'Country', accessor: 'country' },
        { header: 'Postal Code', accessor: 'postal_code' },
    ];

    const actionColumn = (addr) => (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => navigate(`${basePath}/addresses/${addr.id}`)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View"
            >
                <Eye size={16} />
            </button>
            <button
                onClick={() => navigate(`${basePath}/addresses/${addr.id}/edit`)}
                className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Edit"
            >
                <Edit size={16} />
            </button>
            <button
                onClick={() => handleDeleteClick(addr)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );

    return (
        <PageContainer
            title="Address Book"
            action={
                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search addresses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent outline-none w-64"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                    {selectedAddresses.length > 0 && (
                        <button
                            onClick={() => setBulkDeleteModalOpen(true)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-all font-medium border border-red-200"
                        >
                            <Trash2 size={18} />
                            <span>({selectedAddresses.length})</span>
                        </button>
                    )}
                    <button
                        onClick={() => navigate(`${basePath}/addresses/new`)}
                        className="flex items-center gap-2 bg-[hsl(var(--accent))] text-white px-4 py-2 rounded-lg hover:bg-[hsl(var(--accent-hover))] transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        <span>New Address</span>
                    </button>
                </div>
            }
        >
            <Table
                columns={columns}
                data={addresses}
                loading={loading}
                actionColumn={actionColumn}
                emptyMessage="No addresses found."
                selectable
                selectedIds={selectedAddresses}
                onSelectionChange={setSelectedAddresses}
            />

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Address"
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
                        Are you sure you want to delete this address? This action cannot be undone.
                    </p>
                    {addressToDelete && (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 border border-gray-100">
                            <p className="font-medium text-gray-900">{addressToDelete.address_line_1}</p>
                            {addressToDelete.address_line_2 && <p>{addressToDelete.address_line_2}</p>}
                            <p>{addressToDelete.city}, {addressToDelete.state} {addressToDelete.postal_code}</p>
                            <p>{addressToDelete.country}</p>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={bulkDeleteModalOpen}
                onClose={() => setBulkDeleteModalOpen(false)}
                title={`Delete ${selectedAddresses.length} Addresses`}
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
                        Are you sure you want to delete <strong>{selectedAddresses.length}</strong> selected addresses? This action cannot be undone.
                    </p>
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                        Warning: This will permanently remove the selected addresses.
                    </div>
                </div>
            </Modal>
        </PageContainer>
    );
};

export default AddressList;
