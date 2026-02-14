import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import api from '../../lib/axios';

const AddressAutocomplete = ({ onSelect, label = "Customer Address" }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    // Search addresses directly via API
                    const response = await api.get('/customers/addresses/', { params: { search: query } });
                    setResults(response.data.results || response.data);
                    setIsOpen(true);
                } catch (error) {
                    console.error("Address search failed", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (address) => {
        setQuery(address.address); // Display address
        setIsOpen(false);
        onSelect(address);
    };

    const handleCreateNew = () => {
        onSelect({ isNew: true, address: query });
        setIsOpen(false);
    };

    return (
        <div className="relative space-y-2" ref={wrapperRef}>
            <label className="text-sm font-medium text-[hsl(var(--text-main))]">{label}</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-muted))]" size={18} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value.length === 0) onSelect(null);
                    }}
                    placeholder="Search address..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-[hsl(var(--border-light))] focus:ring-2 focus:ring-[hsl(var(--accent))] outline-none bg-[hsl(var(--bg-body))]"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--text-muted))]">
                        <Loader2 className="animate-spin" size={16} />
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && query.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-[hsl(var(--bg-card))] border border-[hsl(var(--border-light))] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {results.length > 0 ? (
                        <ul className="py-1">
                            {results.map((item) => (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(item)}
                                        className="w-full text-left px-4 py-2 hover:bg-[hsl(var(--bg-body))] transition-colors"
                                    >
                                        <div className="font-medium text-[hsl(var(--text-main))]">{item.name}</div>
                                        <div className="text-xs text-[hsl(var(--text-secondary))]">{item.address}</div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-2">
                            <button
                                type="button"
                                onClick={handleCreateNew}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))/10] rounded-md transition-colors text-sm font-medium"
                            >
                                <Plus size={16} />
                                Add "{query}" as new customer
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

AddressAutocomplete.propTypes = {
    onSelect: PropTypes.func.isRequired,
    label: PropTypes.string,
};

export default AddressAutocomplete;
