import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import useCurrencies from '../../hooks/useCurrencies';

const SalesForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const { user } = useAuth();
    const isStatsUser = user?.is_staff || user?.role === 'SUPER_ADMIN';
    const basePath = isStatsUser ? '/admin' : '/app';

    const { currencies } = useCurrencies();

    const [loading, setLoading] = useState(false);

    // Trading Fields + Address
    const [formData, setFormData] = useState({
        customer_name: '',
        volume: '',
        currency: 'USD',
        sale_currency: 'USD',
        rate: '',

        // Address fields
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'USA'
    });

    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        if (isEdit) {
            const fetchSale = async () => {
                try {
                    const response = await api.get(`/sales/${id}/`);
                    setFormData(response.data);
                } catch (err) {
                    console.error("Error fetching sale", err);
                    toast.error("Failed to load sale details");
                }
            };
            fetchSale();
        }
    }, [id, isEdit]);

    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddressChange = async (e) => {
        const value = e.target.value;
        setFormData({ ...formData, address_line_1: value });

        if (value.length > 2) {
            try {
                // Correct endpoint for address search
                const response = await api.get(`/customers/addresses/?search=${value}`);
                // Limit to 5 suggestions
                setAddressSuggestions(response.data.results ? response.data.results.slice(0, 5) : response.data.slice(0, 5));
                setShowSuggestions(true);
            } catch (err) {
                console.error("Failed to fetch address suggestions", err);
            }
        } else {
            setAddressSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleAddressSelect = (addr) => {
        setFormData({
            ...formData,
            address_line_1: addr.address_line_1,
            address_line_2: addr.address_line_2 || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.postal_code || '',
            country: addr.country || 'USA',
            // Also optionally populate phone if available and empty
            phone_number: formData.phone_number || addr.mobile_number || ''
        });
        setShowSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                customer_name: formData.customer_name
            };
            if (isEdit) {
                await api.patch(`/sales/${id}/`, payload);
                toast.success('Sale updated successfully');
            } else {
                await api.post('/sales/', payload);
                toast.success('Sale created successfully');
            }
            navigate(`${basePath}/sales`);
        } catch (err) {
            console.error("Error saving sale", err);
            const msg = err.response?.data?.detail || "Failed to save sale";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer
            title={isEdit ? "Edit Sale" : "New Sale"}
            action={
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                    <ArrowLeft size={18} /> Cancel
                </button>
            }
        >
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                <Card title="Order Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Customer Name</label>
                            <input
                                type="text"
                                name="customer_name"
                                value={formData.customer_name || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                                placeholder="Enter customer name"
                            />
                        </div>

                        {/* Volume */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Volume</label>
                            <input type="number" step="0.01" name="volume" value={formData.volume} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                        </div>

                        {/* Currency */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Currency</label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg bg-white"
                                required
                            >
                                {currencies.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sale Currency */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sale Currency</label>
                            <select
                                name="sale_currency"
                                value={formData.sale_currency}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg bg-white"
                                required
                            >
                                {currencies.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Rate */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rate</label>
                            <input type="number" step="0.0001" name="rate" value={formData.rate} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
                        </div>
                    </div>
                </Card>

                <Card title="Shipping / Contact Address">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2 space-y-2 relative">
                            <label className="text-sm font-medium">Address Line 1</label>
                            <input
                                type="text"
                                name="address_line_1"
                                value={formData.address_line_1}
                                onChange={handleAddressChange}
                                className="w-full px-4 py-2 border rounded-lg"
                                autoComplete="off"
                            />
                            {showSuggestions && addressSuggestions.length > 0 && (
                                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                                    {addressSuggestions.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                                            onClick={() => handleAddressSelect(addr)}
                                        >
                                            <div className="font-medium">{addr.address_line_1}</div>
                                            <div className="text-gray-500 text-xs">
                                                {addr.city}, {addr.state}, {addr.country}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium">Address Line 2</label>
                            <input type="text" name="address_line_2" value={formData.address_line_2} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">District</label>
                            <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">State</label>
                            <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Country</label>
                            <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Pincode</label>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number</label>
                            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-[hsl(var(--primary))] text-white rounded-xl shadow-lg hover:bg-[hsl(var(--primary-light))] transition-all">
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Save Sale
                    </button>
                </div>
            </form>
        </PageContainer>
    );
};

export default SalesForm;
