import { supabase, supabaseConfigError } from './supabaseClient';
import { mapOpportunityRowToOpportunity } from './mappers';
import { Opportunity } from '../types';

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

export async function getSavedOpportunities(userId: string): Promise<Opportunity[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('saved_opportunities')
    .select(`
      created_at,
      opportunities (
        *,
        organizations (
          id,
          name,
          city,
          logo_url,
          description,
          contact_email,
          website
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to load saved opportunities: ${error.message}`);
  return (data ?? [])
    .map((row) => {
      const relation = row.opportunities;
      const opportunity = Array.isArray(relation) ? relation[0] : relation;
      return opportunity ? mapOpportunityRowToOpportunity(opportunity) : null;
    })
    .filter((opportunity): opportunity is Opportunity => Boolean(opportunity));
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
