import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, type User } from '../api/authApi';

interface AuthContextValue { user: User | null; loading: boolean; signIn: (email: string, password: string) => Promise<void>; signOut: () => Promise<void> }
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { authApi.csrf().then(() => authApi.me()).then(setUser).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  const value = useMemo<AuthContextValue>(() => ({
    user, loading,
    signIn: async (email, password) => setUser(await authApi.login(email, password)),
    signOut: async () => { try { await authApi.logout(); } finally { setUser(null); } },
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used within AuthProvider'); return context; }
