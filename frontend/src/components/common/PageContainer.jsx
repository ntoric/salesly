import { useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const PageContainer = ({ children, title, action, className }) => {
    useEffect(() => {
        if (title) {
            document.title = `${title} | Salesly`;
        } else {
            document.title = 'Salesly';
        }

        return () => {
            document.title = 'Salesly';
        };
    }, [title]);

    return (
        <div className={clsx("space-y-6", className)}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {title && (
                    <h1 className="text-2xl font-bold text-[hsl(var(--text-main))] tracking-tight">
                        {title}
                    </h1>
                )}
                {action && (
                    <div className="flex-shrink-0">
                        {action}
                    </div>
                )}
            </div>
            <div>
                {children}
            </div>
        </div>
    );
};

PageContainer.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string,
    action: PropTypes.node,
    className: PropTypes.string,
};

export default PageContainer;
