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

/** Set the partenaires_session presence flag on this origin. Fire-and-forget — never throws. */
async function setSessionFlag() {
  try { await fetch('/api/auth/session', { method: 'POST' }); } catch {}
}

/** Clear the partenaires_session presence flag on this origin. Fire-and-forget — never throws. */
async function clearSessionFlag() {
  try { await fetch('/api/auth/session', { method: 'DELETE' }); } catch {}
}

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
        // Security improvement: re-affirm the flag cookie on every successful
        // session check so it stays alive as long as the API session is valid.
        await setSessionFlag();
      } else {
        setUser(null);
        setPartner(null);
        setPartnerships([]);
        // Security improvement: proactively clear the flag if the API says the
        // session is gone (e.g. token expired, revoked) so the middleware
        // immediately blocks /dashboard on the next navigation.
        await clearSessionFlag();
      }
    } catch {
      setUser(null);
      setPartner(null);
      setPartnerships([]);
      // On network error we leave the flag intact — the API will reject
      // data requests anyway, and we avoid a spurious logout on flaky networks.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email: string, password: string) => {
    await auth.login(email, password);
    // Set the presence flag on the B2B origin before refreshing state so
    // any immediate navigation to /dashboard passes the middleware check.
    await setSessionFlag();
    await refresh();
  };

  const logout = async () => {
    try { await auth.logout(); } catch {}
    // Clear the presence flag so the middleware blocks /dashboard immediately.
    await clearSessionFlag();
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
