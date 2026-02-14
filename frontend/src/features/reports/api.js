import api from '../../lib/axios';

const REPORTS_URL = '/reports/';

export const getSalesReports = async (params) => {
    // Expected params: { start_date, end_date, ... }
    const response = await api.get(`${REPORTS_URL}sales/`, { params });
    return response.data;
};

export const getPurchaseReports = async (params) => {
    const response = await api.get(`${REPORTS_URL}purchases/`, { params });
    return response.data;
};

export const downloadCSV = async (type, params) => {
    const response = await api.get(`${REPORTS_URL}${type}/export/csv/`, {
        params,
        responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const downloadExcel = async (type, params) => {
    const response = await api.get(`${REPORTS_URL}${type}/export/excel/`, {
        params,
        responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const printAddressLabel = async (saleId) => {
    const response = await api.get(`${REPORTS_URL}sales/${saleId}/label/`, {
        responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    window.open(url, '_blank');
};
