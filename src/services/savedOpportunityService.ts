import { supabase, supabaseConfigError } from './supabaseClient';

function requireSupabase() {
  if (!supabase) throw new Error(supabaseConfigError);
  return supabase;
}

export async function getSavedOpportunityIds(userId: string): Promise<string[]> {
  const client = requireSupabase();
  const { data, error } = await client.from('saved_opportunities').select('opportunity_id').eq('user_id', userId);
  if (error) throw new Error(`Failed to load saved opportunities: ${error.message}`);
  return (data ?? []).map((row) => row.opportunity_id);
}

export async function saveOpportunity(userId: string, opportunityId: string) {
  const client = requireSupabase();
  const { error } = await client.from('saved_opportunities').insert({ user_id: userId, opportunity_id: opportunityId });
  if (error && error.code !== '23505') {
    if (import.meta.env.DEV) console.error('[KomekHub saved opportunities] Insert failed', { userId, opportunityId, error });
    throw new Error(error.message);
  }
}

export async function unsaveOpportunity(userId: string, opportunityId: string) {
  const client = requireSupabase();
  const { error } = await client.from('saved_opportunities').delete().eq('user_id', userId).eq('opportunity_id', opportunityId);
  if (error) {
    if (import.meta.env.DEV) console.error('[KomekHub saved opportunities] Delete failed', { userId, opportunityId, error });
    throw new Error(error.message);
  }
}

export async function toggleSavedOpportunity(userId: string, opportunityId: string, isSaved?: boolean): Promise<boolean> {
  const currentlySaved = isSaved ?? (await getSavedOpportunityIds(userId)).includes(opportunityId);
  if (currentlySaved) {
    await unsaveOpportunity(userId, opportunityId);
    return false;
  }
  await saveOpportunity(userId, opportunityId);
  return true;
}
