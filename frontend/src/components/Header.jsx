import { Bell, Menu, Search, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';

const Header = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ addresses: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length >= 1) { // Search even on 1 char if digit, logic handled by backend
                setIsSearching(true);
                try {
                    const response = await api.get('/search/', { params: { q: searchQuery } });
                    setSearchResults(response.data);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults({ addresses: [] });
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResultClick = (url) => {
        navigate(url);
        setShowResults(false);
        setSearchQuery('');
    };

    const isStatsUser = user?.is_staff || user?.role === 'SUPER_ADMIN';
    const basePath = isStatsUser ? '/admin' : '/app';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-20 bg-[hsl(var(--bg-body))]/80 backdrop-blur-md border-b border-[hsl(var(--border-light))] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 transition-all">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-xl hover:bg-white text-[hsl(var(--text-secondary))] hover:shadow-sm transition-all"
                >
                    <Menu size={24} />
                </button>

                {/* Search Bar */}
                <div className="hidden md:block w-full max-w-md relative" ref={searchRef}>
                    <div className="flex items-center w-full bg-white border border-[hsl(var(--border-light))] rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-[hsl(var(--accent))/20] focus-within:border-[hsl(var(--accent))] transition-all shadow-sm">
                        <Search size={18} className="text-[hsl(var(--text-muted))]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowResults(true)}
                            placeholder="Search Addresses..."
                            className="bg-transparent border-none outline-none text-sm ml-3 w-full text-[hsl(var(--text-main))] placeholder:text-[hsl(var(--text-muted))]"
                        />
                        {isSearching && <div className="animate-spin h-4 w-4 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full ml-2"></div>}
                    </div>

                    {/* Search Results Dropdown */}
                    {showResults && searchQuery.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[hsl(var(--border-light))] max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2">
                            {Object.values(searchResults).every(arr => arr.length === 0) && !isSearching ? (
                                <div className="p-4 text-center text-sm text-[hsl(var(--text-muted))]">
                                    No results found.
                                </div>
                            ) : (
                                <>
                                    {/* Address Results */}
                                    {searchResults.addresses?.length > 0 && (
                                        <div className="py-2">
                                            <h3 className="px-4 py-1 text-xs font-semibold text-[hsl(var(--text-muted))] uppercase tracking-wider">Addresses</h3>
                                            {searchResults.addresses.map(result => (
                                                <button
                                                    key={result.id}
                                                    onClick={() => handleResultClick(result.url)}
                                                    className="w-full text-left px-4 py-2 hover:bg-[hsl(var(--bg-body))] transition-colors flex items-start justify-between group"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium text-[hsl(var(--text-main))]">{result.title}</p>
                                                        <p className="text-xs text-[hsl(var(--text-muted))]">{result.subtitle}</p>
                                                    </div>
                                                    <div className="bg-green-50 text-green-600 text-[10px] px-1.5 py-0.5 rounded font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                        View
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
                {/* Notifications */}
                <button className="relative p-2.5 rounded-xl hover:bg-white text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--primary))] transition-all hover:shadow-sm group">
                    <Bell size={22} className="group-hover:animate-swing" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-[hsl(var(--error))] rounded-full border border-2 border-[hsl(var(--bg-body))]"></span>
                </button>

                {/* Profile Dropdown Trigger */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-3 pl-6 border-l border-[hsl(var(--border-light))] cursor-pointer group hover:bg-transparent focus:outline-none"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-[hsl(var(--text-main))] group-hover:text-[hsl(var(--primary))] transition-colors">{user?.name || 'Admin User'}</p>
                            <p className="text-xs text-[hsl(var(--text-muted))]">{user?.email || 'admin@salesly.com'}</p>
                        </div>
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-light))] text-white flex items-center justify-center font-bold shadow-lg shadow-blue-900/20 ring-2 ring-white transition-transform group-hover:scale-105">
                                {user?.name ? user.name[0].toUpperCase() : 'A'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <ChevronDown size={10} className="text-[hsl(var(--text-muted))]" />
                            </div>
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[hsl(var(--border-light))] py-1 animate-in fade-in slide-in-from-top-2 z-50">
                            <Link
                                to={`${basePath}/profile`}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-[hsl(var(--text-main))] hover:bg-[hsl(var(--bg-body))] transition-colors"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <UserIcon size={16} />
                                Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-[hsl(var(--border-light))]"
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header >
    );
};

Header.propTypes = {
    onMenuClick: PropTypes.func.isRequired,
};

export default Header;
