import { create } from 'zustand';
import { User } from '../types/user';

const AUTH_USER_KEY = 'myboard_auth_user';
const AUTH_TOKEN_KEY = 'myboard_auth_token';

interface AuthStoreState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => {
  const savedUser = localStorage.getItem(AUTH_USER_KEY);
  const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);

  let initialUser: User | null = null;
  if (savedUser) {
    try {
      initialUser = JSON.parse(savedUser);
    } catch {
      // ignore
    }
  }

  // Pre-login default demo user for frictionless local and offline experience
  if (!initialUser) {
    initialUser = {
      id: 'user-demo',
      name: 'Nagarjun',
      email: 'nagarjun@youtube.creator',
      createdAt: new Date().toISOString(),
    };
  }

  return {
    user: initialUser,
    token: savedToken || 'demo-token-12345',
    isAuthenticated: true,

    login: (user, token) => {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      set({ user, token, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      set({ user: null, token: null, isAuthenticated: false });
    },

    updateUser: (user) => {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      set({ user });
    },
  };
});
