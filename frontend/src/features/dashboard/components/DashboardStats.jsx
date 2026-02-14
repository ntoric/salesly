import PropTypes from 'prop-types';
import Card from '../../../components/common/Card';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

const StatCard = ({ title, value, growth, icon: Icon, colorClass, iconBgClass }) => (
    <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-[hsl(var(--border-light))] bg-white/50 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
            <div className={clsx("p-3 rounded-xl", iconBgClass)}>
                <Icon size={22} className={clsx(colorClass)} />
            </div>
            {growth !== 0 && (
                <div className={clsx(
                    "flex items-center text-xs font-semibold px-2 py-1 rounded-full",
                    growth > 0
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-rose-700 bg-rose-50"
                )}>
                    {growth > 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                    {Math.abs(growth)}%
                </div>
            )}
        </div>

        <div>
            <p className="text-[hsl(var(--text-muted))] text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-[hsl(var(--text-main))] tracking-tight">{value}</h3>
        </div>
    </Card>
);

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    growth: PropTypes.number.isRequired,
    icon: PropTypes.elementType.isRequired,
    colorClass: PropTypes.string.isRequired,
    iconBgClass: PropTypes.string.isRequired,
};

const DashboardStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Total Sales"
                value={`$${stats.totalSales.toLocaleString()}`}
                growth={stats.salesGrowth}
                icon={DollarSign}
                colorClass="text-blue-600"
                iconBgClass="bg-blue-50"
            />
            <StatCard
                title="Total Purchases"
                value={`$${stats.totalPurchases.toLocaleString()}`}
                growth={stats.purchasesGrowth}
                icon={ShoppingBag}
                colorClass="text-purple-600"
                iconBgClass="bg-purple-50"
            />


        </div>
    );
};

DashboardStats.propTypes = {
    stats: PropTypes.shape({
        totalSales: PropTypes.number,
        salesGrowth: PropTypes.number,
        totalPurchases: PropTypes.number,
        purchasesGrowth: PropTypes.number,
        totalCustomers: PropTypes.number,
        customersGrowth: PropTypes.number,
        activeProducts: PropTypes.number,
        productsGrowth: PropTypes.number,
    }).isRequired,
};

export default DashboardStats;
