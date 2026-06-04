import { supabase, supabaseConfigError } from './supabaseClient';
import { mapOrganizationRowToOrganization } from './mappers';

export async function getOrganizations() {
  if (!supabase) throw new Error(supabaseConfigError);
  const { data, error } = await supabase.from('organizations').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapOrganizationRowToOrganization);
}

export async function getOrganizationById(id: string) {
  if (!supabase) throw new Error(supabaseConfigError);
  const { data, error } = await supabase.from('organizations').select('*').eq('id', id).single();
  if (error) throw error;
  return mapOrganizationRowToOrganization(data);
}
