import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Employee, Admin } from '@/types';

interface AuthState {
  token: string | null;
  user: Employee | Admin | null;
  isAuthenticated: boolean;
  userType: 'employee' | 'admin' | null;
  
  // Actions
  login: (token: string, user: Employee | Admin, userType: 'employee' | 'admin') => void;
  logout: () => void;
  updateUser: (user: Employee | Admin) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      userType: null,

      login: (token, user, userType) => {
        set({
          token,
          user,
          isAuthenticated: true,
          userType,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          userType: null,
        });
      },

      updateUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        userType: state.userType,
      }),
    }
  )
);
