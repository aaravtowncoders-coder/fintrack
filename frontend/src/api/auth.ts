import api from './axios';

export const login = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password });

export const register = (username: string, email: string, password: string) =>
  api.post('/api/auth/register', { username, email, password });
