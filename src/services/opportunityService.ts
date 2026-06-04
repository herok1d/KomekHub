import { supabase, supabaseConfigError } from './supabaseClient';
import { mapOpportunityRowToOpportunity } from './mappers';

const selectOpportunity = `
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
`;

export async function getOpportunities() {
  if (!supabase) throw new Error(supabaseConfigError);
  const { data, error } = await supabase.from('opportunities').select(selectOpportunity).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapOpportunityRowToOpportunity);
}

export async function getOpportunityById(id: string) {
  if (!supabase) throw new Error(supabaseConfigError);
  const { data, error } = await supabase.from('opportunities').select(selectOpportunity).eq('id', id).single();
  if (error) throw error;
  return mapOpportunityRowToOpportunity(data);
}

export async function getFeaturedOpportunities() {
  const rows = await getOpportunities();
  return rows.slice(0, 3);
}
