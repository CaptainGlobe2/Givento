'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthResult {
  error?: string;
  needsEmailVerification?: boolean;
}

interface SignUpPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  displayName: string;
  customerPhone: string;
  customerEmail: string;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (payload: SignUpPayload) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    let active = true;

    client.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setUser(data.session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const meta = (user?.user_metadata || {}) as Record<string, unknown>;
    const rawName = typeof meta.full_name === 'string' ? meta.full_name.trim() : '';
    const rawEmail = user?.email || '';
    const displayName = rawName || (rawEmail ? rawEmail.split('@')[0] : 'Guest');
    const customerPhone = typeof meta.phone === 'string' ? meta.phone.trim() : '';

    return {
      user,
      loading,
      isConfigured: isSupabaseConfigured,
      displayName,
      customerPhone,
      customerEmail: rawEmail,
      async signIn(email: string, password: string): Promise<AuthResult> {
        if (!supabase) {
          return { error: 'Customer login service is not configured yet.' };
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          return { error: error.message };
        }
        return {};
      },
      async signUp(payload: SignUpPayload): Promise<AuthResult> {
        if (!supabase) {
          return { error: 'Customer registration service is not configured yet.' };
        }
        const { data, error } = await supabase.auth.signUp({
          email: payload.email.trim(),
          password: payload.password,
          options: {
            data: {
              full_name: payload.fullName.trim(),
              phone: payload.phone.trim(),
              role: 'customer',
            },
          },
        });
        if (error) {
          return { error: error.message };
        }
        if (data.user && !data.session) {
          return { needsEmailVerification: true };
        }
        return {};
      },
      async signOut(): Promise<void> {
        if (supabase) {
          await supabase.auth.signOut();
        }
        setUser(null);
      },
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
