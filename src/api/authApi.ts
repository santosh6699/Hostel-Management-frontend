import { api } from './axiosInstance';

export type Role = 'ADMIN' | 'WARDEN' | 'STUDENT' | 'MESS_STAFF';
export interface User { id: number; email: string; fullName: string; role: Role }

export const authApi = {
  async csrf(): Promise<void> { await api.get('/auth/csrf'); },
  async me(): Promise<User> { return (await api.get<User>('/auth/me')).data; },
  async login(email: string, password: string): Promise<User> { await api.get('/auth/csrf'); const user=(await api.post<User>('/auth/login', { email, password })).data; await api.get('/auth/csrf'); return user; },
  async logout(): Promise<void> { await api.get('/auth/csrf'); await api.post('/auth/logout'); },
};
