import { supabase, supabaseConfigError } from './supabaseClient';
import { mapOrganizationRowToOrganization } from './mappers';
import { OrganizationInput } from '../types';

function requireSupabase() {
  if (!supabase) throw new Error(supabaseConfigError);
  return supabase;
}

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

export async function getOrganizationByOwnerId(ownerId: string) {
  const client = requireSupabase();
  const { data, error } = await client.from('organizations').select('*').eq('owner_id', ownerId).limit(1).maybeSingle();
  if (error) throw new Error(`Failed to load organization profile: ${error.message}`);
  return data ? mapOrganizationRowToOrganization(data) : null;
}

export async function createOrganization(ownerId: string, input: OrganizationInput) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('organizations')
    .insert({
      owner_id: ownerId,
      name: input.name.trim(),
      description: input.description.trim(),
      city: input.city.trim(),
      contact_email: input.contactEmail.trim(),
      phone: input.phone.trim() || null,
      website: input.website.trim() || null,
    })
    .select('*')
    .single();
  if (error) throw new Error(`Failed to create organization profile: ${error.message}`);
  return mapOrganizationRowToOrganization(data);
}

export async function updateOrganization(organizationId: string, input: OrganizationInput) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('organizations')
    .update({
      name: input.name.trim(),
      description: input.description.trim(),
      city: input.city.trim(),
      contact_email: input.contactEmail.trim(),
      phone: input.phone.trim() || null,
      website: input.website.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', organizationId)
    .select('*')
    .single();
  if (error) throw new Error(`Failed to update organization profile: ${error.message}`);
  return mapOrganizationRowToOrganization(data);
}
