import PropTypes from 'prop-types';
import clsx from 'clsx';

const Card = ({ children, className, title, action }) => {
    return (
        <div className={clsx(
            "bg-[hsl(var(--bg-card))] rounded-xl shadow-sm border border-[hsl(var(--border-light))] overflow-hidden",
            className
        )}>
            {(title || action) && (
                <div className="px-6 py-4 border-b border-[hsl(var(--border-light))] flex items-center justify-between">
                    {title && <h3 className="text-[hsl(var(--text-main))] font-semibold">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-4 sm:p-6">
                {children}
            </div>
        </div>
    );
};

Card.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    title: PropTypes.node,     // Can be string or component
    action: PropTypes.node,    // Button or icon
};

export default Card;
