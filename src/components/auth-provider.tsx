'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/db';
import { User } from '@/types';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, orgId?: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || 'TerraMind Inspector',
            org_id: session.user.user_metadata?.org_id || null,
            created_at: session.user.created_at,
          });
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || 'TerraMind Inspector',
            org_id: session.user.user_metadata?.org_id || null,
            created_at: session.user.created_at,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      const savedUser = localStorage.getItem('terramind-user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (isConfiguredForSupabase()) {
        const { error } = await supabase!.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // Mock Login: if email has 'inspector' or 'admin', assign to Ecology Commission (org-1)
        const isInspector = email.includes('inspector') || email.includes('admin') || email.includes('ngo');
        const mockUser: User = {
          id: `user-${email.split('@')[0]}`,
          email,
          full_name: isInspector ? 'Inspector Jenkins' : email.split('@')[0].toUpperCase(),
          org_id: isInspector ? 'org-1' : null,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('terramind-user', JSON.stringify(mockUser));
        setUser(mockUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string, orgId?: string | null) => {
    setLoading(true);
    try {
      if (isConfiguredForSupabase()) {
        const { error } = await supabase!.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              org_id: orgId || null
            },
          },
        });
        if (error) throw error;
      } else {
        // Mock Signup
        const mockUser: User = {
          id: `user-${Date.now()}`,
          email,
          full_name: fullName,
          org_id: orgId || null,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('terramind-user', JSON.stringify(mockUser));
        setUser(mockUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isConfiguredForSupabase()) {
        const { error } = await supabase!.auth.signOut();
        if (error) throw error;
      } else {
        localStorage.removeItem('terramind-user');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const isConfiguredForSupabase = () => {
    return isSupabaseConfigured() && supabase !== null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
