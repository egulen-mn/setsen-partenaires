'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { auth, ApiError } from './api-client';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Partner {
  id: string;
  companyName: string;
  referralCode: string;
  category: string;
  status: string;
  approved: boolean;
  tier: string;
  maxPartnerships: number;
}

interface Partnership {
  id: string;
  restaurantId: string;
  commissionRateBps: number;
  restaurant?: { id: string; name: string } | null;
}

interface AuthState {
  user: User | null;
  partner: Partner | null;
  partnerships: Partnership[];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null, partner: null, partnerships: [], loading: true,
  login: async () => {}, logout: async () => {}, refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await auth.me();
      if (data.authenticated) {
        setUser(data.user);
        setPartner(data.partner);
        setPartnerships(data.partnerships || []);
      } else {
        setUser(null);
        setPartner(null);
        setPartnerships([]);
      }
    } catch {
      setUser(null);
      setPartner(null);
      setPartnerships([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email: string, password: string) => {
    await auth.login(email, password);
    await refresh();
  };

  const logout = async () => {
    try { await auth.logout(); } catch {}
    setUser(null);
    setPartner(null);
    setPartnerships([]);
  };

  return (
    <AuthContext.Provider value={{ user, partner, partnerships, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
