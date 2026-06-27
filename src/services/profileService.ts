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
  birth_date: string | null;
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
  birthDate?: string;
};

export type ProfileUpdateInput = {
  fullName: string;
  city: string;
  birthDate: string;
  university: string;
  languages: string[];
  skills: string[];
  interests: string[];
};

export class MissingBirthDateColumnError extends Error {
  constructor() {
    super('The profiles.birth_date database column is missing.');
    this.name = 'MissingBirthDateColumnError';
  }
}

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
    birth_date: fallbackData.birthDate || null,
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

export async function updateUserProfile(userId: string, input: ProfileUpdateInput): Promise<ProfileRow> {
  const client = requireSupabase();
  const payload = {
    full_name: input.fullName.trim(),
    city: input.city.trim(),
    birth_date: input.birthDate || null,
    university: input.university.trim() || null,
    languages: input.languages,
    skills: input.skills,
    interests: input.interests,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client.from('profiles').update(payload).eq('user_id', userId).select('*').single();
  if (error) {
    if (import.meta.env.DEV) console.error('[KomekHub profile] Update failed', { userId, payload, error });
    if (error.message.includes("'birth_date' column") || (error.message.includes('birth_date') && error.message.includes('schema cache'))) {
      throw new MissingBirthDateColumnError();
    }
    throw new Error(`Profile update failed: ${error.message}`);
  }
  return data as ProfileRow;
}
