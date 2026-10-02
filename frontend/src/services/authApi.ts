import { request } from './api';
import { AuthResponse, User } from '../types/user';

export const authApi = {
  register: (name: string, email: string, password: string): Promise<AuthResponse> =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string): Promise<AuthResponse> =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: (): Promise<{ user: User }> =>
    request('/auth/me', {
      method: 'GET',
    }),
};
