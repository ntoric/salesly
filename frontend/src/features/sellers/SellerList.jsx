import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sellerService from './sellerService';
import PageContainer from '../../components/common/PageContainer';
import Table from '../../components/common/Table';
import { Shield, ShieldOff, Key, Plus } from 'lucide-react';
import clsx from 'clsx';
import Modal from '../../components/common/Modal';

const SellerList = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
    const [sellerToDeactivate, setSellerToDeactivate] = useState(null);
    const navigate = useNavigate();

    const fetchSellers = async () => {
        try {
            setLoading(true);
            const data = await sellerService.getSellers();
            setSellers(data.results || data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch sellers');
            setLoading(false);
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    const handleActivate = async (id) => {
        try {
            await sellerService.activateSeller(id);
            fetchSellers();
        } catch (err) {
            console.error('Failed to activate seller', err);
        }
    };

    const confirmDeactivate = async () => {
        if (!sellerToDeactivate) return;

        try {
            await sellerService.deactivateSeller(sellerToDeactivate.id);
            fetchSellers();
            setDeactivateModalOpen(false);
            setSellerToDeactivate(null);
        } catch (err) {
            console.error('Failed to deactivate seller', err);
        }
    };

    const handleDeactivateClick = (seller) => {
        setSellerToDeactivate(seller);
        setDeactivateModalOpen(true);
    };

    const handleResetPassword = async (id) => {
        const newPassword = window.prompt('Enter new password for seller:');
        if (!newPassword) return;

        if (newPassword.length < 5) {
            alert('Password must be at least 5 characters');
            return;
        }

        try {
            await sellerService.resetPassword(id, newPassword);
            alert('Password reset successfully');
        } catch (err) {
            console.error('Failed to reset password', err);
            alert('Failed to reset password');
        }
    };

    const columns = [
        {
            header: 'Email / Name',
            render: (seller) => (
                <div>
                    <div className="font-medium text-[hsl(var(--text-main))]">{seller.email}</div>
                    <div className="text-xs text-[hsl(var(--text-muted))]">{seller.first_name} {seller.last_name}</div>
                </div>
            )
        },
        {
            header: 'Joined',
            render: (seller) => new Date(seller.date_joined).toLocaleDateString()
        },
        {
            header: 'Status',
            render: (seller) => (
                <span className={clsx(
                    "px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full",
                    seller.is_active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                )}>
                    {seller.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        }
    ];

    const actionColumn = (seller) => (
        <div className="flex items-center justify-end gap-2">
            {seller.is_active ? (
                <button
                    onClick={(e) => { e.stopPropagation(); handleDeactivateClick(seller); }}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Deactivate"
                >
                    <ShieldOff size={18} />
                </button>
            ) : (
                <button
                    onClick={(e) => { e.stopPropagation(); handleActivate(seller.id); }}
                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Activate"
                >
                    <Shield size={18} />
                </button>
            )}
            <button
                onClick={(e) => { e.stopPropagation(); handleResetPassword(seller.id); }}
                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                title="Reset Password"
            >
                <Key size={18} />
            </button>
        </div>
    );

    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <PageContainer
            title="Sellers"
            action={
                <button
                    onClick={() => navigate('/admin/sellers/new')}
                    className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-light))] text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    <span>Add Seller</span>
                </button>
            }
        >
            <Table
                columns={columns}
                data={sellers}
                loading={loading}
                actionColumn={actionColumn}
                emptyMessage="No sellers found."
            />

            <Modal
                isOpen={deactivateModalOpen}
                onClose={() => setDeactivateModalOpen(false)}
                title="Deactivate Seller"
                footer={
                    <>
                        <button
                            onClick={() => setDeactivateModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDeactivate}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Deactivate
                        </button>
                    </>
                }
            >
                <div className="space-y-3">
                    <p className="text-gray-600">
                        Are you sure you want to deactivate this seller? They will no longer be able to log in.
                    </p>
                    {sellerToDeactivate && (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-500 border border-gray-100">
                            <p className="font-medium text-gray-900">{sellerToDeactivate.email}</p>
                            <p>{sellerToDeactivate.first_name} {sellerToDeactivate.last_name}</p>
                        </div>
                    )}
                </div>
            </Modal>
        </PageContainer>
    );
};

export default SellerList;
