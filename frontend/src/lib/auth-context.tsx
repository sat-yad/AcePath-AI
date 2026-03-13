'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  tier: 'free' | 'premium';
  is_onboarded: boolean;
  avatar_url?: string;
  interviews_taken?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('acepath_token');
      if (token) {
        await refreshUser();
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      
      if (res.data?.data?.user) {
        setUser(res.data.data.user);
      } else {
        // Token was invalid or expired, clean up quietly without throwing
        localStorage.removeItem('acepath_token');
        localStorage.removeItem('acepath_refresh_token');
        setUser(null);
      }
    } catch (err) {
      // Hard network error (like backend offline)
      localStorage.removeItem('acepath_token');
      localStorage.removeItem('acepath_refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = res.data.data;
    localStorage.setItem('acepath_token', accessToken);
    localStorage.setItem('acepath_refresh_token', refreshToken);
    setUser(user);
    router.push(user.is_onboarded ? '/dashboard' : '/onboarding');
  };

  const register = async (email: string, password: string, full_name: string) => {
    const res = await api.post('/auth/register', { email, password, full_name });
    const { user, accessToken, refreshToken } = res.data.data;
    localStorage.setItem('acepath_token', accessToken);
    localStorage.setItem('acepath_refresh_token', refreshToken);
    setUser(user);
    router.push('/onboarding');
  };

  const logout = () => {
    localStorage.removeItem('acepath_token');
    localStorage.removeItem('acepath_refresh_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
