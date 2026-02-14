import PropTypes from 'prop-types';
import Card from '../../../components/common/Card';
import { ShoppingCart, ShoppingBag, User, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const RecentActivity = ({ activities }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'sale': return <ShoppingBag size={14} className="text-emerald-600" />;
            case 'purchase': return <ShoppingCart size={14} className="text-blue-600" />;
            case 'customer': return <User size={14} className="text-amber-600" />;
            default: return <User size={14} className="text-gray-600" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'sale': return 'bg-emerald-100 border-emerald-200';
            case 'purchase': return 'bg-blue-100 border-blue-200';
            case 'customer': return 'bg-amber-100 border-amber-200';
            default: return 'bg-gray-100 border-gray-200';
        }
    };

    return (
        <Card title="Recent Activity" className="h-full shadow-lg border border-[hsl(var(--border-light))] flex flex-col">
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                    <div className="relative space-y-0 pb-4">
                        {/* Vertical line background */}
                        <div className="absolute left-[19px] top-2 bottom-0 w-[2px] bg-[hsl(var(--border-light))]/50"></div>

                        {activities.map((item, index) => (
                            <div key={item.id} className="relative pl-12 py-3 hover:bg-[hsl(var(--bg-body))]/50 rounded-xl transition-colors group cursor-default">

                                {/* Icon */}
                                <div className={clsx(
                                    "absolute left-2 top-3.5 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 shadow-sm",
                                    getBgColor(item.type)
                                )}>
                                    {getIcon(item.type)}
                                </div>

                                {/* Content */}
                                <div className="flex justify-between items-start">
                                    <div className="pr-4">
                                        <p className="text-sm font-medium text-[hsl(var(--text-main))] group-hover:text-[hsl(var(--primary))] transition-colors">{item.title}</p>
                                        <p className="text-xs text-[hsl(var(--text-muted))] mt-1 flex items-center gap-1">
                                            {item.time}
                                        </p>
                                    </div>
                                    {(item.amount || item.user) && (
                                        <span className={clsx(
                                            "text-xs font-bold px-2 py-1 rounded-md",
                                            item.type === 'sale' ? 'text-emerald-700 bg-emerald-50' :
                                                item.type === 'purchase' ? 'text-blue-700 bg-blue-50' :
                                                    'text-amber-700 bg-amber-50'
                                        )}>
                                            {item.amount || item.user}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="w-full mt-auto py-3 text-xs font-medium text-[hsl(var(--text-muted))] hover:text-[hsl(var(--accent))] border-t border-[hsl(var(--border-light))] flex items-center justify-center gap-1 transition-colors bg-white/50 backdrop-blur-sm">
                    View All Activity <ArrowRight size={12} />
                </button>
            </div>
        </Card>
    );
};

RecentActivity.propTypes = {
    activities: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.oneOf(['sale', 'purchase', 'customer']).isRequired,
        title: PropTypes.string.isRequired,
        time: PropTypes.string.isRequired,
        amount: PropTypes.string,
        user: PropTypes.string,
    })).isRequired,
};

export default RecentActivity;
