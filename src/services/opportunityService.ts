import { supabase, supabaseConfigError } from './supabaseClient';
import { mapOpportunityRowToOpportunity } from './mappers';
import { OpportunityInput } from '../types';

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
  ),
  applications (
    count
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

function opportunityPayload(organizationId: string, input: OpportunityInput) {
  return {
    organization_id: organizationId,
    title: input.title.trim(),
    description: input.description.trim(),
    city: input.city.trim(),
    category: input.category,
    format: input.format,
    schedule: input.schedule,
    languages: input.languages,
    badges: input.badges,
    requirements: input.requirements.trim() || null,
    benefits: input.benefits.trim() || null,
    volunteer_hours: input.volunteerHours,
    min_age: input.minAge ?? null,
    certificate_available: input.certificateAvailable,
    status: input.status,
    updated_at: new Date().toISOString(),
  };
}

export async function getOrganizationOpportunities(organizationId: string) {
  if (!supabase) throw new Error(supabaseConfigError);
  const { data, error } = await supabase.from('opportunities').select(selectOpportunity).eq('organization_id', organizationId).order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to load organization opportunities: ${error.message}`);
  return (data ?? []).map(mapOpportunityRowToOpportunity);
}

export async function createOpportunity(organizationId: string, input: OpportunityInput) {
  if (!supabase) throw new Error(supabaseConfigError);
  const { data, error } = await supabase.from('opportunities').insert(opportunityPayload(organizationId, input)).select(selectOpportunity).single();
  if (error) throw new Error(`Failed to create opportunity: ${error.message}`);
  return mapOpportunityRowToOpportunity(data);
}

export async function updateOpportunity(opportunityId: string, organizationId: string, input: OpportunityInput) {
  if (!supabase) throw new Error(supabaseConfigError);
  const { data, error } = await supabase.from('opportunities').update(opportunityPayload(organizationId, input)).eq('id', opportunityId).select(selectOpportunity).single();
  if (error) throw new Error(`Failed to update opportunity: ${error.message}`);
  return mapOpportunityRowToOpportunity(data);
}

export async function deleteOpportunity(opportunityId: string) {
  if (!supabase) throw new Error(supabaseConfigError);
  const { error } = await supabase.from('opportunities').delete().eq('id', opportunityId);
  if (error) throw new Error(`Failed to delete opportunity: ${error.message}`);
}

export async function updateOpportunityStatus(opportunityId: string, status: string) {
  if (!supabase) throw new Error(supabaseConfigError);
  const { data, error } = await supabase
    .from('opportunities')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', opportunityId)
    .select(selectOpportunity)
    .single();
  if (error) throw new Error(`Failed to update opportunity status: ${error.message}`);
  return mapOpportunityRowToOpportunity(data);
}
