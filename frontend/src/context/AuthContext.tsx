import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../api/client';
import type { User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = api.loadUserFromStorage();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const loggedIn = await api.login(email, password);
    setUser(loggedIn);
  };

  const register = async (name: string, email: string, password: string) => {
    const created = await api.register(name, email, password);
    setUser(created);
  };

  const logout = () => {
    api.setUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
