import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseConfigError } from '../services/supabaseClient';
import { Profile, UserRole } from '../types';
import { ensureUserProfile, ProfileFallbackData, ProfileRow } from '../services/profileService';

type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  city: string;
  birthDate?: string;
};

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<{ requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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
    birthDate: row.birth_date || undefined,
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

  const ensureAndSetProfile = useCallback(async (user: User, fallbackData?: ProfileFallbackData) => {
    const row = await ensureUserProfile(user, fallbackData);
    if (row) setProfile(mapProfile(row));
    return row;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    await ensureAndSetProfile(session.user);
  }, [ensureAndSetProfile, session?.user]);

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
          await ensureAndSetProfile(data.session.user);
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
          ensureAndSetProfile(nextSession.user).catch((error) => {
            if (import.meta.env.DEV) console.error('[KomekHub auth] Failed to ensure profile after auth state change', error);
            setProfile(null);
          });
        } else {
          setProfile(null);
        }
        setLoading(false);
      }) ?? { data: { subscription: null } };

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [ensureAndSetProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Sign in succeeded, but Supabase did not return a user.');
    await ensureAndSetProfile(data.user);
  }, [ensureAndSetProfile]);

  const signUp = useCallback(async ({ fullName, email, password, role, city, birthDate }: SignUpInput) => {
    const client = requireSupabase();
    const signUpResult = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          city,
          birth_date: birthDate || null,
        },
      },
    });
    const { data, error } = signUpResult;

    if (import.meta.env.DEV) {
      console.info('[KomekHub auth] signUp result', {
        user: data.user,
        sessionCreated: Boolean(data.session),
        error,
      });
    }

    if (error) throw error;
    if (!data.user) throw new Error('Sign up succeeded, but Supabase did not return a user.');

    const userId = data.user.id;
    const profilePayload = {
      user_id: userId,
      full_name: fullName,
      role,
      city,
      birth_date: birthDate || null,
    };

    if (import.meta.env.DEV) {
      console.info('[KomekHub auth] signUp user id', userId);
      console.info('[KomekHub auth] profile upsert payload', profilePayload);
    }

    try {
      await ensureAndSetProfile(data.user, { fullName, role, city, birthDate });
      if (import.meta.env.DEV) console.info('[KomekHub auth] profile upsert error', null);
    } catch (profileError) {
      if (import.meta.env.DEV) console.error('[KomekHub auth] profile upsert error', profileError);
      throw profileError;
    }
    return { requiresEmailConfirmation: !data.session };
  }, [ensureAndSetProfile]);

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
