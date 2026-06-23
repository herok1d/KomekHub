import { Application, ApplicationStatus, OrganizationApplication, VolunteerResponseStatus } from '../types';
import { supabase, supabaseConfigError } from './supabaseClient';

type ApplicationRow = {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: ApplicationStatus;
  created_at: string;
  completed_at: string | null;
  volunteer_hours: number | null;
  volunteer_response?: VolunteerResponseStatus | null;
  assigned_role?: string | null;
  organization_note?: string | null;
  opportunities?: {
    title?: string;
    organizations?: { name: string } | { name: string }[] | null;
  } | null;
};

function requireSupabase() {
  if (!supabase) throw new Error(supabaseConfigError);
  return supabase;
}

function mapApplication(row: ApplicationRow): Application {
  const organizationRelation = row.opportunities?.organizations;
  const organization = Array.isArray(organizationRelation) ? organizationRelation[0] : organizationRelation;
  return {
    id: row.id,
    userId: row.user_id,
    volunteerName: 'KomekHub volunteer',
    opportunityId: row.opportunity_id,
    organizationName: organization?.name || 'KomekHub organization',
    status: row.status,
    appliedAt: row.created_at,
    completedAt: row.completed_at || undefined,
    volunteerHours: row.volunteer_hours ?? 0,
    volunteerResponse: row.volunteer_response ?? 'pending',
    assignedRole: row.assigned_role || undefined,
    organizationNote: row.organization_note || undefined,
  };
}

const applicationSelect = `
  id,
  user_id,
  opportunity_id,
  status,
  created_at,
  completed_at,
  volunteer_hours,
  volunteer_response,
  assigned_role,
  organization_note,
  opportunities (
    title,
    organizations (name)
  )
`;

export async function getUserApplications(userId: string): Promise<Application[]> {
  const client = requireSupabase();
  const { data, error } = await client.from('applications').select(applicationSelect).eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to load applications: ${error.message}`);
  return (data ?? []).map((row) => mapApplication(row as unknown as ApplicationRow));
}

export async function getAppliedOpportunityIds(userId: string): Promise<string[]> {
  const applications = await getUserApplications(userId);
  return applications.map((application) => application.opportunityId);
}

export async function applyToOpportunity(userId: string, opportunityId: string, message?: string): Promise<Application | null> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('applications')
    .insert({
      user_id: userId,
      opportunity_id: opportunityId,
      status: 'pending',
      message: message?.trim() || null,
    })
    .select(applicationSelect)
    .single();

  if (error?.code === '23505') return null;
  if (error) {
    if (import.meta.env.DEV) console.error('[KomekHub applications] Insert failed', { userId, opportunityId, error });
    throw new Error(error.message);
  }
  return mapApplication(data as unknown as ApplicationRow);
}

type OrganizationApplicationRow = {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: ApplicationStatus;
  message: string | null;
  created_at: string;
  completed_at: string | null;
  volunteer_hours: number | null;
  volunteer_response?: VolunteerResponseStatus | null;
  assigned_role?: string | null;
  organization_note?: string | null;
  opportunities?: {
    title: string;
    certificate_available: boolean;
  } | { title: string; certificate_available: boolean }[] | null;
  certificates?: { certificate_number: string } | { certificate_number: string }[] | null;
};

export async function getOrganizationApplications(organizationId: string): Promise<OrganizationApplication[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('applications')
    .select(`
      id,
      user_id,
      opportunity_id,
      status,
      message,
      created_at,
      completed_at,
      volunteer_hours,
      volunteer_response,
      assigned_role,
      organization_note,
      certificates (certificate_number),
      opportunities!inner (
        title,
        certificate_available,
        organization_id
      )
    `)
    .eq('opportunities.organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to load organization applications: ${error.message}`);

  const rows = (data ?? []) as unknown as OrganizationApplicationRow[];
  const userIds = [...new Set(rows.map((row) => row.user_id))];
  const { data: profiles, error: profileError } = userIds.length
    ? await client.from('profiles').select('user_id, full_name, city').in('user_id', userIds)
    : { data: [], error: null };
  if (profileError) throw new Error(`Failed to load applicant profiles: ${profileError.message}`);
  const profileByUser = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]));

  return rows.map((row) => {
    const opportunityRelation = row.opportunities;
    const opportunity = Array.isArray(opportunityRelation) ? opportunityRelation[0] : opportunityRelation;
    const volunteer = profileByUser.get(row.user_id);
    const certificateRelation = row.certificates;
    const certificate = Array.isArray(certificateRelation) ? certificateRelation[0] : certificateRelation;
    return {
      id: row.id,
      userId: row.user_id,
      volunteerName: volunteer?.full_name || 'KomekHub volunteer',
      volunteerCity: volunteer?.city || '',
      opportunityId: row.opportunity_id,
      opportunityTitle: opportunity?.title || '',
      organizationName: '',
      status: row.status,
      message: row.message || undefined,
      appliedAt: row.created_at,
      completedAt: row.completed_at || undefined,
      volunteerHours: row.volunteer_hours ?? 0,
      volunteerResponse: row.volunteer_response ?? 'pending',
      assignedRole: row.assigned_role || undefined,
      organizationNote: row.organization_note || undefined,
      certificateAvailable: Boolean(opportunity?.certificate_available),
      certificateNumber: certificate?.certificate_number,
    };
  });
}

export async function updateOrganizationApplicationStatus(applicationId: string, status: ApplicationStatus, volunteerHours?: number) {
  const client = requireSupabase();
  const { error } = await client.rpc('update_application_status_with_hours', {
    p_application_id: applicationId,
    p_new_status: status,
    p_new_hours: status === 'completed' ? volunteerHours ?? 0 : 0,
  });
  if (error) throw new Error(`Failed to update application: ${error.message}`);
}

export async function updateOrganizationApplicationDetails(applicationId: string, values: { assignedRole?: string; organizationNote?: string }) {
  const client = requireSupabase();
  const { error } = await client
    .from('applications')
    .update({
      assigned_role: values.assignedRole?.trim() || null,
      organization_note: values.organizationNote?.trim() || null,
    })
    .eq('id', applicationId);
  if (error) throw new Error(`Failed to update application details: ${error.message}`);
}

export async function updateVolunteerResponse(applicationId: string, response: Exclude<VolunteerResponseStatus, 'pending'>) {
  const client = requireSupabase();
  const { error } = await client.from('applications').update({ volunteer_response: response }).eq('id', applicationId);
  if (error) throw new Error(`Failed to update volunteer response: ${error.message}`);
}
