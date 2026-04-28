import api from './axios';
export const getMonthlyTrends = () => api.get('/api/analytics/monthly-trends');
export const getCategoryBreakdown = () => api.get('/api/analytics/category-breakdown');
export const getIncomeVsExpense = () => api.get('/api/analytics/income-vs-expense');
export const getAnalytics = () => api.get('/api/analytics/summary');
