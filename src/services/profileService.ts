import { User } from '@supabase/supabase-js';
import { supabase, supabaseConfigError } from './supabaseClient';
import { UserRole } from '../types';

export type ProfileRow = {
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

export type ProfileFallbackData = {
  fullName?: string;
  role?: UserRole;
  city?: string;
};

function requireSupabase() {
  if (!supabase) throw new Error(supabaseConfigError);
  return supabase;
}

function defaultFullName(user: User) {
  const metadataName = user.user_metadata?.full_name;
  if (typeof metadataName === 'string' && metadataName.trim()) return metadataName.trim();
  return user.email?.split('@')[0] || 'KomekHub volunteer';
}

export async function ensureUserProfile(user: User, fallbackData: ProfileFallbackData = {}): Promise<ProfileRow | null> {
  const client = requireSupabase();
  const {
    data: { session },
  } = await client.auth.getSession();

  // With email confirmation enabled, signUp returns a user but no authenticated
  // session. The database trigger in schema.sql creates that profile securely.
  if (!session || session.user.id !== user.id) {
    if (import.meta.env.DEV) {
      console.info('[KomekHub auth] Profile creation delegated to database trigger because no authenticated session is available.', {
        userId: user.id,
      });
    }
    return null;
  }

  const { data: existingProfile, error: readError } = await client.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (readError) throw new Error(`Profile lookup failed: ${readError.message}`);
  if (existingProfile) return existingProfile as ProfileRow;

  const payload = {
    user_id: user.id,
    full_name: fallbackData.fullName?.trim() || defaultFullName(user),
    role: fallbackData.role ?? 'volunteer',
    city: fallbackData.city?.trim() || 'Astana',
  };

  if (import.meta.env.DEV) {
    console.info('[KomekHub auth] Creating missing profile', { userId: user.id, payload });
  }

  const { data, error } = await client.from('profiles').upsert(payload, { onConflict: 'user_id' }).select('*').single();

  if (import.meta.env.DEV) {
    console.info('[KomekHub auth] Profile upsert result', { userId: user.id, error });
  }

  if (error) throw new Error(`Profile creation failed: ${error.message}`);
  return data as ProfileRow;
}
