import api from './api';

interface AuthPayload {
  username?: string;
  email: string;
  password: string;
}

export const register = async (data: AuthPayload) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const login = async (data: AuthPayload) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const refreshToken = async () => {
  const res = await api.get('/auth/refresh-token');
  return res.data;
};
