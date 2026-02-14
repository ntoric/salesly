import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import { ArrowLeft, Printer, Edit, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const AddressView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const isStatsUser = user?.is_staff || user?.role === 'SUPER_ADMIN';
    const basePath = isStatsUser ? '/admin' : '/app';

    useEffect(() => {
        const fetchAddress = async () => {
            try {
                const response = await api.get(`/customers/addresses/${id}/`);
                setAddress(response.data);
            } catch (error) {
                console.error("Failed to fetch address", error);
                toast.error("Failed to load address details");
            } finally {
                setLoading(false);
            }
        };
        fetchAddress();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
    );

    if (!address) return (
        <div className="text-center py-12 text-gray-500">
            Address not found
        </div>
    );

    return (
        <PageContainer
            title="Address Details"
            action={
                <div className="flex gap-2 print:hidden">
                    <button
                        onClick={() => navigate(`${basePath}/addresses`)}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <button
                        onClick={() => navigate(`${basePath}/addresses/${id}/edit`)}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-blue-600"
                    >
                        <Edit size={18} /> Edit
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg hover:bg-[hsl(var(--primary-light))]"
                    >
                        <Printer size={18} /> Print
                    </button>
                </div>
            }
        >
            <div className="max-w-3xl mx-auto print:w-full print:max-w-none">
                <Card className="print:shadow-none print:border-none">
                    <div className="space-y-6">
                        {/* Header for Print */}
                        <div className="hidden print:block text-center border-b pb-4 mb-6">
                            <h1 className="text-2xl font-bold">Address Details</h1>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-500">Customer Name</label>
                                <p className="text-lg font-medium">{address.customer_name || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                                <p className="text-lg font-medium">{address.mobile_number || '-'}</p>
                            </div>
                        </div>

                        <hr className="my-6" />

                        {/* Address Info */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-500">Address Line 1</label>
                                <p className="text-lg">{address.address_line_1}</p>
                            </div>
                            {address.address_line_2 && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-500">Address Line 2</label>
                                    <p className="text-lg">{address.address_line_2}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-500">City</label>
                                    <p className="text-lg">{address.city}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-500">State/Province</label>
                                    <p className="text-lg">{address.state}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-500">Postal Code</label>
                                    <p className="text-lg">{address.postal_code}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-500">Country</label>
                                    <p className="text-lg">{address.country}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </PageContainer>
    );
};

export default AddressView;
