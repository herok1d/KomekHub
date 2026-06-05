import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseConfigError } from '../services/supabaseClient';
import { Profile, UserRole } from '../types';

type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  city: string;
};

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

type ProfileRow = {
  id: string;
  user_id: string;
  full_name: string | null;
  role: UserRole;
  city: string | null;
  avatar_url: string | null;
  university: string | null;
  languages: string[] | null;
  skills: string[] | null;
  interests: string[] | null;
  volunteer_hours: number | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name || '',
    role: row.role,
    city: row.city || '',
    avatarUrl: row.avatar_url || undefined,
    university: row.university || undefined,
    languages: row.languages ?? [],
    skills: row.skills ?? [],
    interests: row.interests ?? [],
    volunteerHours: row.volunteer_hours ?? 0,
  };
}

function requireSupabase() {
  if (!supabase) throw new Error(supabaseConfigError);
  return supabase;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const client = requireSupabase();
    const { data, error } = await client.from('profiles').select('*').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    setProfile(data ? mapProfile(data as ProfileRow) : null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    await fetchProfile(session.user.id);
  }, [fetchProfile, session?.user]);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      if (!supabase) {
        if (isMounted) setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (error) {
        setLoading(false);
        return;
      }

      setSession(data.session);
      if (data.session?.user) {
        try {
          await fetchProfile(data.session.user.id);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } =
      supabase?.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
        if (nextSession?.user) {
          fetchProfile(nextSession.user.id).catch(() => setProfile(null));
        } else {
          setProfile(null);
        }
        setLoading(false);
      }) ?? { data: { subscription: null } };

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async ({ fullName, email, password, role, city }: SignUpInput) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          city,
        },
      },
    });
    if (error) throw error;
    if (!data.user) throw new Error('Sign up succeeded, but Supabase did not return a user.');

    const { error: profileError } = await client.from('profiles').upsert(
      {
        user_id: data.user.id,
        full_name: fullName,
        role,
        city,
      },
      { onConflict: 'user_id' },
    );
    if (profileError) throw profileError;
    await fetchProfile(data.user.id);
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    const client = requireSupabase();
    const { error } = await client.auth.signOut();
    if (error) throw error;
    setSession(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [loading, profile, refreshProfile, session?.user, signIn, signOut, signUp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
