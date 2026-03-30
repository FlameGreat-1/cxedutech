import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { IUser, RegisterDTO, LoginDTO } from '@/types/auth.types';
import * as authApi from '@/api/auth.api';
import * as userApi from '@/api/user.api';
import { getToken, setToken, removeToken } from '@/utils/storage';

export interface AuthContextValue {
  user: IUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (data: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const userData = await userApi.getMe();
      setUser(userData);
    } catch {
      removeToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (data: LoginDTO) => {
    const result = await authApi.login(data);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(async (data: RegisterDTO) => {
    const result = await authApi.register(data);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
