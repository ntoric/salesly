import api from '../../lib/axios';

const SELLER_URL = '/admin/sellers/';

const getSellers = async () => {
    const response = await api.get(SELLER_URL);
    return response.data;
};

const createSeller = async (sellerData) => {
    const response = await api.post(SELLER_URL, sellerData);
    return response.data;
};

const activateSeller = async (id) => {
    const response = await api.post(`${SELLER_URL}${id}/activate/`);
    return response.data;
};

const deactivateSeller = async (id) => {
    const response = await api.post(`${SELLER_URL}${id}/deactivate/`);
    return response.data;
};

const resetPassword = async (id, newPassword) => {
    const response = await api.post(`${SELLER_URL}${id}/reset_password/`, { new_password: newPassword });
    return response.data;
};

const sellerService = {
    getSellers,
    createSeller,
    activateSeller,
    deactivateSeller,
    resetPassword,
};

export default sellerService;
