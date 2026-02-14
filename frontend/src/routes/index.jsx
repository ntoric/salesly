import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../features/auth/Login';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../features/dashboard/Dashboard';
import PurchaseForm from '../features/purchases/PurchaseForm';
import SalesForm from '../features/sales/SalesForm';
import ReportsPage from '../features/reports/ReportsPage';
import RoleRoute from './RoleRoute';
import SellerList from '../features/sellers/SellerList';
import SellerForm from '../features/sellers/SellerForm';
import SalesList from '../features/sales/SalesList';
import SalesDetail from '../features/sales/SalesDetail';
import PurchaseList from '../features/purchases/PurchaseList';
import PurchaseDetail from '../features/purchases/PurchaseDetail';
import AddressList from '../features/addresses/AddressList';
import AddressForm from '../features/addresses/AddressForm';
import AddressView from '../features/addresses/AddressView';
import UserList from '../features/users/UserList';
import UserForm from '../features/users/UserForm';
import PermissionList from '../features/permissions/PermissionList';
import PermissionForm from '../features/permissions/PermissionForm';
import UserPermissions from '../features/permissions/UserPermissions';

const PublicRoute = () => {
    const { token, user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (token && user) {
        if (user.is_staff) {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/app" replace />;
    }
    return <Outlet />;
};

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<RoleRoute roles={['admin']} />}>
                <Route element={<MainLayout />}>
                    <Route index element={<Dashboard />} />

                    <Route path="reports" element={<ReportsPage />} />

                    {/* Seller Management */}
                    <Route path="sellers" element={<SellerList />} />
                    <Route path="sellers/new" element={<SellerForm />} />

                    {/* Sales & Purchases (Admin View) */}
                    {/* Sales & Purchases (Admin View) */}
                    <Route path="sales" element={<SalesList />} />
                    <Route path="sales/new" element={<SalesForm />} />
                    <Route path="sales/:id" element={<SalesDetail />} />
                    <Route path="purchases" element={<PurchaseList />} />
                    <Route path="purchases/new" element={<PurchaseForm />} />
                    <Route path="purchases/:id" element={<PurchaseDetail />} />

                    {/* Address Management */}
                    <Route path="addresses" element={<AddressList />} />
                    <Route path="addresses/new" element={<AddressForm />} />
                    <Route path="addresses/:id" element={<AddressView />} />
                    <Route path="addresses/:id/edit" element={<AddressForm />} />

                    {/* User Management */}
                    <Route path="users" element={<UserList />} />
                    <Route path="users/new" element={<UserForm />} />
                    <Route path="users/:id/edit" element={<UserForm />} />
                    <Route path="users/:id/permissions" element={<UserPermissions />} />

                    {/* Permission Management */}
                    <Route path="permissions" element={<PermissionList />} />
                    <Route path="permissions/new" element={<PermissionForm />} />

                    {/* Profile */}
                    <Route path="profile" element={<UserForm />} />
                </Route>
            </Route>

            {/* Seller Routes */}
            <Route path="/app" element={<RoleRoute roles={['seller']} />}>
                <Route element={<MainLayout />}>
                    <Route index element={<Dashboard />} />

                    <Route path="purchases/new" element={<PurchaseForm />} />
                    <Route path="purchases" element={<PurchaseList />} />
                    <Route path="purchases/:id" element={<PurchaseDetail />} />

                    <Route path="sales/new" element={<SalesForm />} />
                    <Route path="sales" element={<SalesList />} />
                    <Route path="sales" element={<SalesList />} />
                    <Route path="sales/:id" element={<SalesDetail />} />
                    <Route path="profile" element={<UserForm />} />

                    {/* Address Management */}
                    <Route path="addresses" element={<AddressList />} />
                    <Route path="addresses/new" element={<AddressForm />} />
                    <Route path="addresses/:id" element={<AddressView />} />
                    <Route path="addresses/:id/edit" element={<AddressForm />} />
                </Route>
            </Route>

            {/* Redirect root based on role */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch all - 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
