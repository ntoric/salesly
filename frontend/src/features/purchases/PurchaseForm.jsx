import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import useCurrencies from '../../hooks/useCurrencies';

const PurchaseForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const { user } = useAuth();
    const isStatsUser = user?.is_staff || user?.role === 'SUPER_ADMIN';
    const basePath = isStatsUser ? '/admin' : '/app';

    const { currencies } = useCurrencies();

    const [loading, setLoading] = useState(false);

    // Trading Fields
    const [formData, setFormData] = useState({
        vendor_name: '',
        volume: '',
        currency: 'USD',
        purchase_currency: 'USD',
        rate: '',
        actual_rate: ''
    });

    useEffect(() => {
        if (isEdit) {
            const fetchPurchase = async () => {
                try {
                    const response = await api.get(`/purchases/${id}/`);
                    setFormData(response.data);
                } catch (err) {
                    console.error("Error fetching purchase", err);
                    toast.error("Failed to load purchase details");
                }
            };
            fetchPurchase();
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
                await api.patch(`/purchases/${id}/`, formData);
                toast.success('Purchase updated successfully');
            } else {
                await api.post('/purchases/', formData);
                toast.success('Purchase created successfully');
            }
            navigate(`${basePath}/purchases`);
        } catch (err) {
            console.error("Error saving purchase", err);
            const msg = err.response?.data?.detail || "Failed to save purchase";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer
            title={isEdit ? "Edit Purchase" : "New Purchase"}
            action={
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                    <ArrowLeft size={18} /> Cancel
                </button>
            }
        >
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Seller (Counterparty) */}
                        <div className="space-y-2 col-span-1 md:col-span-2">
                            <label className="text-sm font-medium">Vendor Name</label>
                            <input
                                name="vendor_name"
                                value={formData.vendor_name}
                                onChange={handleChange}
                                placeholder="Enter vendor name"
                                className="w-full px-4 py-2 border rounded-lg"
                                required
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

                        {/* Purchase Currency */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Purchase Currency</label>
                            <select
                                name="purchase_currency"
                                value={formData.purchase_currency}
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

                        {/* Actual Rate (Review) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Actual Rate (Confirmation)</label>
                            <input type="number" step="0.0001" name="actual_rate" value={formData.actual_rate} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading} className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-2.5 bg-[hsl(var(--primary))] text-white rounded-xl shadow-lg hover:bg-[hsl(var(--primary-light))] transition-all font-medium text-sm sm:text-base">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Purchase
                    </button>
                </div>
            </form>
        </PageContainer>
    );
};

export default PurchaseForm;
