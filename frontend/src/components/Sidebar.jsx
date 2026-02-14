import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Users, Package, LogOut, HelpCircle, FileText, Briefcase, Shield, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';
import PropTypes from 'prop-types';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout, user } = useAuth();

    // Determine the base path based on user role
    // If user is staff (admin) OR Super Admin, use /admin, otherwise use /app (seller)
    const isStatsUser = user?.is_staff || user?.role === 'SUPER_ADMIN';
    const basePath = isStatsUser ? '/admin' : '/app';

    const [expandedMenus, setExpandedMenus] = useState({ 'Sales': true, 'Purchases': true, 'Addresses': true, 'Users': true }); // Default expanded for visibility or keep closed

    const toggleMenu = (label) => {
        setExpandedMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: basePath },
        {
            icon: ShoppingBag,
            label: 'Sales',
            path: `${basePath}/sales`,
            children: [
                { label: 'Manage Sales', path: `${basePath}/sales` },
                { label: 'Create Sale', path: `${basePath}/sales/new` }
            ]
        },
        {
            icon: ShoppingCart,
            label: 'Purchases',
            path: `${basePath}/purchases`,
            children: [
                { label: 'Manage Purchases', path: `${basePath}/purchases` },
                { label: 'Create Purchase', path: `${basePath}/purchases/new` }
            ]
        },
        {
            icon: MapPin,
            label: 'Addresses',
            path: `${basePath}/addresses`,
            children: [
                { label: 'Manage Addresses', path: `${basePath}/addresses` },
                { label: 'Create Address', path: `${basePath}/addresses/new` }
            ]
        },
    ];

    // Add Admin-specific menus (Super Admin & Tenant Admin)
    if (isStatsUser || user?.role === 'TENANT_ADMIN') {
        const adminMenus = [];

        // Users Management
        if (user?.role === 'SUPER_ADMIN' || user?.role === 'TENANT_ADMIN') {
            adminMenus.push({
                icon: Users,
                label: 'Users',
                path: `${basePath}/users`,
                children: [
                    { label: 'Manage Users', path: `${basePath}/users` },
                    { label: 'Create User', path: `${basePath}/users/new` }
                ]
            });
        }

        if (user?.role === 'SUPER_ADMIN') {
            adminMenus.push({ icon: Shield, label: 'Permissions', path: `${basePath}/permissions` });
        }

        if (user?.is_staff) { // Super Admin features
            adminMenus.push(
                { icon: Briefcase, label: 'Sellers', path: `${basePath}/sellers` },
                { icon: FileText, label: 'Reports', path: `${basePath}/reports` }
            );
        }

        menuItems.push(...adminMenus);
    }

    const bottomItems = [
        { icon: HelpCircle, label: 'Support', path: `${basePath}/support` },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={clsx(
                    "fixed inset-0 bg-black/60 z-20 transition-opacity lg:hidden backdrop-blur-sm",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-30 w-72 bg-[hsl(var(--primary))] text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl lg:shadow-none flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo */}
                <div className="h-20 flex items-center px-8 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center">
                            <span className="font-bold text-lg">S</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">Salesly</span>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                    <div>
                        <p className="px-4 text-xs font-semibold text-blue-200/50 uppercase tracking-wider mb-2">Platform</p>
                        <ul className="space-y-1">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path || (item.path !== basePath && location.pathname.startsWith(item.path));

                                if (item.children) {
                                    const isChildActive = item.children.some(child => location.pathname === child.path) || isActive;
                                    const isExpanded = expandedMenus[item.label];

                                    return (
                                        <li key={item.label} className="space-y-1">
                                            <button
                                                onClick={() => toggleMenu(item.label)}
                                                className={clsx(
                                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden text-left",
                                                    isChildActive
                                                        ? "bg-[hsl(var(--accent))] text-white shadow-lg shadow-purple-500/20 font-medium"
                                                        : "text-blue-100/70 hover:bg-white/5 hover:text-white"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon size={20} className={clsx("transition-transform duration-200", isChildActive ? "scale-105" : "group-hover:scale-110")} />
                                                    <span className="relative z-10">{item.label}</span>
                                                </div>
                                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                {isChildActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 pointer-events-none" />}
                                            </button>

                                            <div className={clsx(
                                                "overflow-hidden transition-all duration-300 ease-in-out",
                                                isExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                                            )}>
                                                <ul className="pl-4 space-y-1 mt-1">
                                                    {item.children.map(child => {
                                                        const isChildItemActive = location.pathname === child.path;
                                                        return (
                                                            <li key={child.path}>
                                                                <Link
                                                                    to={child.path}
                                                                    onClick={() => window.innerWidth < 1024 && onClose()}
                                                                    className={clsx(
                                                                        "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm",
                                                                        isChildItemActive
                                                                            ? "text-white font-medium bg-white/10"
                                                                            : "text-blue-100/60 hover:text-white hover:bg-white/5"
                                                                    )}
                                                                >
                                                                    {child.label}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        </li>
                                    );
                                }

                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            onClick={() => window.innerWidth < 1024 && onClose()}
                                            className={clsx(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                                isActive
                                                    ? "bg-[hsl(var(--accent))] text-white shadow-lg shadow-purple-500/20 font-medium"
                                                    : "text-blue-100/70 hover:bg-white/5 hover:text-white"
                                            )}
                                        >
                                            <item.icon size={20} className={clsx("transition-transform duration-200", isActive ? "scale-105" : "group-hover:scale-110")} />
                                            <span className="relative z-10">{item.label}</span>
                                            {isActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 pointer-events-none" />}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-white/10 bg-black/10">
                    <ul className="space-y-1 mb-4">
                        {bottomItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-blue-100/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 px-2 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <p className="text-xs text-blue-200/50">System Operational</p>
                    </div>
                </div>
            </div>
        </>
    );
};

Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default Sidebar;
