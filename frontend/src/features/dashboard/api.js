import api from '../../lib/axios';

export const fetchDashboardData = async (dateRange = 30) => {
    // API expects 'days' param
    if (dateRange === '7d') dateRange = 7;
    if (dateRange === '30d') dateRange = 30;

    const response = await api.get('/dashboard/', { params: { days: dateRange } });
    return response.data;
};
