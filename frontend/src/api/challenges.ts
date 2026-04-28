import api from './axios';
export const getChallenges = () => api.get('/api/challenges');
export const createChallenge = (data: object) => api.post('/api/challenges', data);
export const updateChallenge = (id: string, data: object) => api.put(`/api/challenges/${id}`, data);
export const deleteChallenge = (id: string) => api.delete(`/api/challenges/${id}`);
