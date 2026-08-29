import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Student } from '../types';

// ---- Auth Store ----
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('access_token', token);
        set({ user, token, isAuthenticated: true });
      },
      clearAuth: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ---- Student Store ----
interface StudentState {
  student: Student | null;
  setStudent: (student: Student | null) => void;
  updateStudent: (data: Partial<Student>) => void;
}

export const useStudentStore = create<StudentState>((set) => ({
  student: null,
  setStudent: (student) => set({ student }),
  updateStudent: (data) =>
    set((state) => ({
      student: state.student ? { ...state.student, ...data } : null,
    })),
}));

// ---- Theme Store ----
type Theme = 'system' | 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        const root = document.documentElement;
        if (theme === 'dark') {
          root.setAttribute('data-theme', 'dark');
        } else if (theme === 'light') {
          root.setAttribute('data-theme', 'light');
        } else {
          root.removeAttribute('data-theme');
        }
        set({ theme });
      },
    }),
    { name: 'theme-storage' }
  )
);
