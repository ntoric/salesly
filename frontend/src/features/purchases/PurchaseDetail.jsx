import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import { ArrowLeft, Printer, ShoppingCart } from 'lucide-react';
import api from '../../lib/axios';

const PurchaseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [purchase, setPurchase] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPurchase = async () => {
            try {
                const response = await api.get(`/purchases/${id}/`);
                setPurchase(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchPurchase();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!purchase) return <div>Purchase not found</div>;

    return (
        <PageContainer
            title={`Purchase #${purchase.id}`}
            action={
                <div className="flex gap-2">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                        <ArrowLeft size={18} /> Back
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Printer size={18} /> Print Order
                    </button>
                </div>
            }
        >
            <div className="max-w-3xl mx-auto">
                <Card title="Purchase Order Details" icon={ShoppingCart}>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div className="space-y-4">
                            <div>
                                <div className="text-gray-500 mb-1">Date</div>
                                <div className="font-medium text-lg">{new Date(purchase.date || purchase.created_at).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 mb-1">Volume</div>
                                <div className="font-mono text-xl">{parseFloat(purchase.volume).toFixed(2)}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 mb-1">Buying Rate</div>
                                <div className="font-mono text-xl">{parseFloat(purchase.rate).toFixed(4)}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 mb-1">Currency Pair</div>
                                <div className="font-mono bg-gray-100 px-2 py-1 rounded w-fit">{purchase.currency}/{purchase.purchase_currency}</div>
                            </div>
                        </div>

                        <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
                            <div>
                                <div className="text-gray-500 mb-1">Total Amount</div>
                                <div className="font-bold text-2xl text-emerald-600">
                                    {parseFloat(purchase.purchase_amount).toFixed(2)} <span className="text-sm text-gray-400">{purchase.purchase_currency}</span>
                                </div>
                            </div>
                            {purchase.actual_rate && (
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="text-gray-500 mb-1">Actual Rate</div>
                                    <div className="font-mono font-medium">{parseFloat(purchase.actual_rate).toFixed(4)}</div>
                                    <div className="text-gray-500 mb-1 mt-2">Actual Amount</div>
                                    <div className="font-mono font-medium">{parseFloat(purchase.actual_purchase_amount).toFixed(2)}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </PageContainer>
    );
};

export default PurchaseDetail;
