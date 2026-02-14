import { useState, useEffect } from 'react';
import { Calendar, Filter, Download } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import ExportActions from './ExportActions';
import { getSalesReports, getPurchaseReports, downloadCSV, downloadExcel, printAddressLabel } from './api';

const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState('sales'); // 'sales' or 'purchases'
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    // Date Filters
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]); // 30 days ago
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]); // Today

    const loadData = async () => {
        setLoading(true);
        try {
            const params = { start_date: startDate, end_date: endDate };
            let result;
            if (activeTab === 'sales') {
                // Mock fallback if API not ready
                // result = await getSalesReports(params);
                result = [
                    { id: 101, date: '2023-10-25', reference: 'SALE-001', customer: 'John Doe', amount: 120.50, status: 'Completed' },
                    { id: 102, date: '2023-10-26', reference: 'SALE-002', customer: 'Jane Smith', amount: 450.00, status: 'Completed' },
                    { id: 103, date: '2023-10-27', reference: 'SALE-003', customer: 'Bob Inc', amount: 89.99, status: 'Pending' },
                ];
                // Simulate API call
                await new Promise(r => setTimeout(r, 600));

            } else {
                // result = await getPurchaseReports(params);
                result = [
                    { id: 201, date: '2023-10-20', reference: 'PUR-889', supplier: 'Acme Corp', amount: 1200.00, status: 'Received' },
                    { id: 202, date: '2023-10-22', reference: 'PUR-890', supplier: 'Global Supplies', amount: 540.50, status: 'Received' },
                ];
                await new Promise(r => setTimeout(r, 600));
            }
            setData(result);
        } catch (error) {
            console.error("Failed to load reports", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab, startDate, endDate]);

    const handleExportCSV = () => downloadCSV(activeTab, { start_date: startDate, end_date: endDate });
    const handleExportExcel = () => downloadExcel(activeTab, { start_date: startDate, end_date: endDate });

    return (
        <PageContainer title="Reports & Analytics">

            {/* Filters & Actions */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                    {/* Tabs */}
                    <div className="flex bg-[hsl(var(--bg-body))] p-1 rounded-lg border border-[hsl(var(--border-light))]">
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'sales' ? 'bg-[hsl(var(--bg-card))] text-[hsl(var(--primary))] shadow-sm' : 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-main))]'}`}
                        >
                            Sales
                        </button>
                        <button
                            onClick={() => setActiveTab('purchases')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'purchases' ? 'bg-[hsl(var(--bg-card))] text-[hsl(var(--primary))] shadow-sm' : 'text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-main))]'}`}
                        >
                            Purchases
                        </button>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-muted))]" size={16} />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="pl-10 pr-3 py-2 rounded-lg border border-[hsl(var(--border-light))] bg-[hsl(var(--bg-body))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
                            />
                        </div>
                        <span className="text-[hsl(var(--text-muted))]">-</span>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-muted))]" size={16} />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="pl-10 pr-3 py-2 rounded-lg border border-[hsl(var(--border-light))] bg-[hsl(var(--bg-body))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
                            />
                        </div>
                    </div>

                    {/* Export */}
                    <ExportActions
                        onExportCSV={handleExportCSV}
                        onExportExcel={handleExportExcel}
                        loading={loading}
                    />
                </div>
            </Card>

            {/* Data Table */}
            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[hsl(var(--bg-body))] text-xs font-semibold text-[hsl(var(--text-secondary))] uppercase border-b border-[hsl(var(--border-light))]">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Reference</th>
                                <th className="px-6 py-4">{activeTab === 'sales' ? 'Customer' : 'Supplier'}</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                {activeTab === 'sales' && <th className="px-6 py-4 text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border-light))]">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-[hsl(var(--text-muted))]">Loading data...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-[hsl(var(--text-muted))]">No records found for this period.</td></tr>
                            ) : (
                                data.map((row) => (
                                    <tr key={row.id} className="hover:bg-[hsl(var(--bg-body))] transition-colors">
                                        <td className="px-6 py-4 text-[hsl(var(--text-main))]">{row.date}</td>
                                        <td className="px-6 py-4 text-[hsl(var(--text-secondary))] font-mono text-sm">{row.reference}</td>
                                        <td className="px-6 py-4 text-[hsl(var(--text-main))] font-medium">{activeTab === 'sales' ? row.customer : row.supplier}</td>
                                        <td className="px-6 py-4 text-[hsl(var(--text-main))] text-right font-semibold">${row.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-[hsl(var(--success))/10] text-[hsl(var(--success))]">
                                                {row.status}
                                            </span>
                                        </td>
                                        {activeTab === 'sales' && (
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => printAddressLabel(row.id)}
                                                    className="text-[hsl(var(--primary))] hover:underline text-xs font-medium"
                                                >
                                                    Print Label
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </PageContainer>
    );
};

export default ReportsPage;
