import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const AddressForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const { user } = useAuth();
    const isStatsUser = user?.is_staff || user?.role === 'SUPER_ADMIN';
    const basePath = isStatsUser ? '/admin' : '/app';

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: '',
        mobile_number: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        country: '',
        postal_code: ''
    });

    useEffect(() => {
        if (isEdit) {
            const fetchAddress = async () => {
                try {
                    const response = await api.get(`/customers/addresses/${id}/`);
                    setFormData(response.data);
                } catch (error) {
                    console.error("Failed to fetch address", error);
                    toast.error("Failed to load address details");
                }
            };
            fetchAddress();
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await api.patch(`/customers/addresses/${id}/`, formData);
                toast.success("Address updated successfully");
            } else {
                await api.post('/customers/addresses/', formData);
                toast.success("Address created successfully");
            }
            navigate(`${basePath}/addresses`);
        } catch (error) {
            console.error("Failed to save address", error);
            const msg = error.response?.data?.detail || "Failed to save address";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer
            title={isEdit ? "Edit Address" : "New Address"}
            action={
                <button onClick={() => navigate(`${basePath}/addresses`)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                    <ArrowLeft size={18} /> Cancel
                </button>
            }
        >
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <Card className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Customer Name</label>
                            <input type="text" name="customer_name" value={formData.customer_name || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mobile Number</label>
                            <input type="text" name="mobile_number" value={formData.mobile_number || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. +1 555-0123" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Address Line 1</label>
                        <input type="text" name="address_line_1" value={formData.address_line_1 || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Address Line 2 (Optional)</label>
                        <input type="text" name="address_line_2" value={formData.address_line_2 || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">State/Province</label>
                            <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Postal Code</label>
                            <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Country</label>
                            <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end border-t">
                        <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-[hsl(var(--primary))] text-white rounded-lg hover:bg-[hsl(var(--primary-light))] transition-colors shadow-lg">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Save Address
                        </button>
                    </div>
                </Card>
            </form>
        </PageContainer>
    );
};

export default AddressForm;
