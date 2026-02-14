import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import { ArrowLeft, Printer, ShoppingBag, MapPin, Phone } from 'lucide-react';
import api from '../../lib/axios';

const SalesDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSale = async () => {
            try {
                const response = await api.get(`/sales/${id}/`);
                setSale(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSale();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!sale) return <div>Sale not found</div>;

    return (
        <PageContainer
            title={`Sale #${sale.id}`}
            action={
                <div className="flex gap-2">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                        <ArrowLeft size={18} /> Back
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Printer size={18} /> Print Invoice
                    </button>
                </div>
            }
        >
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Transaction Details" icon={ShoppingBag}>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="text-gray-500">Date</div>
                                <div className="font-medium">{new Date(sale.created_at).toLocaleDateString()}</div>
                                <div className="text-gray-500">Customer</div>
                                <div className="font-medium text-lg text-blue-600">{sale.customer_name}</div>
                                <div className="text-gray-500">Volume</div>
                                <div className="font-mono font-medium">{parseFloat(sale.volume).toFixed(2)}</div>
                                <div className="text-gray-500">Rate</div>
                                <div className="font-mono font-medium">{parseFloat(sale.rate).toFixed(4)}</div>
                                <div className="text-gray-500">Currency Pair</div>
                                <div className="font-mono bg-gray-100 px-2 py-0.5 rounded w-fit">{sale.currency}/{sale.sale_currency}</div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Address" icon={MapPin}>
                        <div className="space-y-2 text-sm">
                            <div className="font-medium">{sale.address_line_1}</div>
                            {sale.address_line_2 && <div>{sale.address_line_2}</div>}
                            <div>{sale.city}, {sale.district}</div>
                            <div>{sale.state}, {sale.country} - {sale.pincode}</div>
                            <div className="flex items-center gap-2 mt-4 text-gray-600">
                                <Phone size={14} />
                                <span>{sale.phone_number}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
};

export default SalesDetail;
