import api from './axios';

export const getTransactions = () => api.get('/api/transactions');
export const createTransaction = (data: object) => api.post('/api/transactions', data);
export const updateTransaction = (id: string, data: object) => api.put(`/api/transactions/${id}`, data);
export const deleteTransaction = (id: string) => api.delete(`/api/transactions/${id}`);
export const exportCsv = () => api.get('/api/transactions/export/csv', { responseType: 'blob' });
