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

interface AppProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'expert' | 'admin';
}

interface AuthContextValue {
  user: User | null;
  profile: AppProfile | null;
  jwt: string | null;
  loading: boolean;
  refreshJwt: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const exchangeToken = useCallback(async (firebaseUser: User) => {
    const idToken = await firebaseUser.getIdToken();

    // /api/auth/session is a POST behind the CSRF double-submit check, so
    // we need the CSRF cookie (credentials:'include') plus a matching
    // x-csrf-token header fetched from /api/csrf-token — without both of
    // these, login itself was rejected with 403.
    const csrfRes = await fetch(`${BASE_URL}/api/csrf-token`, {
      credentials: 'include',
    });
    if (!csrfRes.ok) throw new Error('Failed to fetch CSRF token');
    const { csrfToken } = await csrfRes.json();

    const res = await fetch(`${BASE_URL}/api/auth/session`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error('Token exchange failed');
    const { token, user: appProfile } = await res.json();
    setJwt(token);
    setProfile(appProfile ?? null);
  }, []);

  const refreshJwt = useCallback(async () => {
    if (user) await exchangeToken(user);
  }, [user, exchangeToken]);

  const logout = useCallback(async () => {
    await firebaseSignOut(auth);
    setJwt(null);
    setUser(null);
    setProfile(null);
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
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [exchangeToken]);

  return (
    <AuthContext.Provider value={{ user, profile, jwt, loading, refreshJwt, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
