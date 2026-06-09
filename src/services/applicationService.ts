import { Application, ApplicationStatus } from '../types';
import { supabase, supabaseConfigError } from './supabaseClient';

type ApplicationRow = {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: ApplicationStatus;
  created_at: string;
  completed_at: string | null;
  volunteer_hours: number | null;
  opportunities?: {
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
  opportunities (
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

export function updateApplicationStatusLocal(applications: Application[], applicationId: string, status: ApplicationStatus, volunteerHours?: number) {
  return applications.map((application) =>
    application.id === applicationId
      ? {
          ...application,
          status,
          volunteerHours: status === 'completed' ? (volunteerHours ?? application.volunteerHours) : application.volunteerHours,
          completedAt: status === 'completed' ? new Date().toISOString() : application.completedAt,
        }
      : application,
  );
}
