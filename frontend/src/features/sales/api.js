import api from '../../lib/axios';

const SALES_URL = '/sales/';

export const createSale = async (data) => {
    const response = await api.post(SALES_URL, data);
    return response.data;
};

export const getSales = async (params) => {
    const response = await api.get(SALES_URL, { params });
    return response.data;
};

export const getSaleById = async (id) => {
    const response = await api.get(`${SALES_URL}${id}/`);
    return response.data;
};
