import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';

const RoleRoute = ({ roles = [] }) => {
    const { user, token, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0) {
        // Check if user has any of the required roles
        // 'admin' role maps to is_staff=true OR role=SUPER_ADMIN
        // 'seller' role maps to is_staff=false (or just authenticated)

        const isStatsMatch = roles.includes('admin') && (user.is_staff || user.role === 'SUPER_ADMIN');
        const isSellerMatch = roles.includes('seller') && !user.is_staff && user.role !== 'SUPER_ADMIN';

        if (!isStatsMatch && !isSellerMatch) {
            // Redirect to the appropriate dashboard if role mismatch
            if (user.is_staff || user.role === 'SUPER_ADMIN') {
                return <Navigate to="/admin" replace />;
            } else {
                return <Navigate to="/app" replace />;
            }
        }
    }

    return <Outlet />;
};

RoleRoute.propTypes = {
    roles: PropTypes.arrayOf(PropTypes.string),
};

export default RoleRoute;
