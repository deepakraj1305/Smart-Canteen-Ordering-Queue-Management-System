import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import supabase from '../lib/supabase';

export const ADMIN_EMAILS = ['admin@college.edu'];

export type Role = 'admin' | 'student' | null;

interface AuthValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: Role;
  displayName: string;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  session: null,
  loading: true,
  role: null,
  displayName: '',
  signOut: async () => {}
});

function roleFor(user: User | null): Role {
  if (!user) return null;
  return ADMIN_EMAILS.includes(user.email ?? '') ? 'admin' : 'student';
}

function nameFor(user: User | null): string {
  if (!user) return '';
  const meta = user.user_metadata as { full_name?: string; name?: string } | null;
  if (meta?.full_name) return meta.full_name;
  if (meta?.name) return meta.name;
  return (user.email || 'Student').split('@')[0];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, role: roleFor(user), displayName: nameFor(user), signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
