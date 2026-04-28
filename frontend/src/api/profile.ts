import api from './axios';
export const getProfile = () => api.get('/api/profile');
export const updateProfile = (data: object) => api.put('/api/profile', data);
export const changePassword = (data: object) => api.put('/api/profile/password', data);
