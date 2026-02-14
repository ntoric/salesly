import { useState, useEffect } from 'react';

const useCurrencies = () => {
    const [currencies, setCurrencies] = useState(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD']); // Default fallback
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                // Check local storage first to avoid rate limits/redundant calls
                const cached = localStorage.getItem('currency_list');
                const cachedTime = localStorage.getItem('currency_list_time');
                const now = new Date().getTime();

                // Cache for 24 hours
                if (cached && cachedTime && (now - cachedTime < 24 * 60 * 60 * 1000)) {
                    let parsed = JSON.parse(cached);
                    // Critical Fix: Filter to ensure ONLY strings are allowed. Discard objects.
                    if (Array.isArray(parsed)) {
                        parsed = parsed.filter(item => typeof item === 'string');
                        if (parsed.length > 0) {
                            setCurrencies(parsed);
                            setLoading(false);
                            return;
                        }
                    }
                }

                const response = await fetch('https://open.er-api.com/v6/latest/USD');
                const data = await response.json();

                if (data && data.rates) {
                    const currencyList = Object.keys(data.rates).sort();
                    // Ensure major currencies are at the top if needed, or just sorted alphabetically
                    // For now, simple alphabetical sort is standard
                    setCurrencies(currencyList);

                    localStorage.setItem('currency_list', JSON.stringify(currencyList));
                    localStorage.setItem('currency_list_time', now.toString());
                }
            } catch (error) {
                console.error("Failed to fetch currencies:", error);
                // Fallback is already set
            } finally {
                setLoading(false);
            }
        };

        fetchCurrencies();
    }, []);

    return { currencies, loading };
};

export default useCurrencies;
