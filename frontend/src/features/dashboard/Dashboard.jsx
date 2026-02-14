import { useState, useEffect } from 'react';
import PageContainer from '../../components/common/PageContainer';
import DashboardStats from './components/DashboardStats';
import DashboardCharts from './components/DashboardCharts';
import RecentActivity from './components/RecentActivity';
import { fetchDashboardData } from './api';
import { Calendar } from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7d');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const result = await fetchDashboardData(dateRange);
                setData(result);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [dateRange]);

    const DateFilter = () => (
        <div className="flex flex-wrap items-center gap-2 bg-[hsl(var(--bg-card))] border border-[hsl(var(--border-light))] rounded-lg p-1 shadow-sm">
            <button
                onClick={() => setDateRange('7d')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${dateRange === '7d' ? 'bg-[hsl(var(--primary))] text-white shadow-sm' : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-body))]'}`}
            >
                7 Days
            </button>
            <button
                onClick={() => setDateRange('30d')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${dateRange === '30d' ? 'bg-[hsl(var(--primary))] text-white shadow-sm' : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-body))]'}`}
            >
                30 Days
            </button>
            <div className="w-px h-6 bg-[hsl(var(--border-light))] mx-1"></div>
            <button className="px-2 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-main))]">
                <Calendar size={18} />
            </button>
        </div>
    );

    if (loading) {
        return (
            <PageContainer title="Dashboard" action={<DateFilter />}>
                <div className="animate-pulse space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[hsl(var(--bg-card))] rounded-xl border border-[hsl(var(--border-light))]"></div>)}
                    </div>
                    <div className="h-96 bg-[hsl(var(--bg-card))] rounded-xl border border-[hsl(var(--border-light))]"></div>
                </div>
            </PageContainer>
        )
    }

    return (
        <PageContainer title="Dashboard" action={<DateFilter />}>
            <div className="space-y-6">
                {/* Stats Row */}
                {data?.stats && <DashboardStats stats={data.stats} />}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart */}
                    <div className="lg:col-span-2">
                        {data?.chartData && <DashboardCharts data={data.chartData} />}
                    </div>

                    {/* Recent Activity / Side Widgets */}
                    <div className="lg:col-span-1">
                        {data?.recentActivity && <RecentActivity activities={data.recentActivity} />}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default Dashboard;
