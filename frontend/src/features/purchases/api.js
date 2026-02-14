import api from '../../lib/axios';

const PURCHASES_URL = '/purchases/';

export const getPurchases = async (params) => {
    const response = await api.get(PURCHASES_URL, { params });
    return response.data;
};

export const getPurchaseById = async (id) => {
    const response = await api.get(`${PURCHASES_URL}${id}/`);
    return response.data;
};

export const createPurchase = async (data) => {
    const response = await api.post(PURCHASES_URL, data);
    return response.data;
};
