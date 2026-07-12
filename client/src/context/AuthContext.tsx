import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextValue {
  user: User | null;
  jwt: string | null;
  loading: boolean;
  refreshJwt: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const exchangeToken = useCallback(async (firebaseUser: User) => {
    const idToken = await firebaseUser.getIdToken();
    const res = await fetch(`${BASE_URL}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error('Token exchange failed');
    const { token } = await res.json();
    setJwt(token);
  }, []);

  const refreshJwt = useCallback(async () => {
    if (user) await exchangeToken(user);
  }, [user, exchangeToken]);

  const logout = useCallback(async () => {
    await firebaseSignOut(auth);
    setJwt(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          await exchangeToken(firebaseUser);
        } catch (e) {
          console.error('JWT exchange failed:', e);
        }
      } else {
        setJwt(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [exchangeToken]);

  return (
    <AuthContext.Provider value={{ user, jwt, loading, refreshJwt, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
