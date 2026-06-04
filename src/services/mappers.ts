import { Opportunity, Organization } from '../types';

type OrganizationRow = {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  logo_url: string | null;
  contact_email: string | null;
  website: string | null;
};

type OpportunityRow = {
  id: string;
  organization_id: string | null;
  title: string;
  description: string;
  city: string;
  category: string;
  format: string;
  schedule: string | null;
  languages: string[] | null;
  badges: string[] | null;
  requirements: string | null;
  benefits: string | null;
  volunteer_hours: number | null;
  certificate_available: boolean | null;
  created_at: string | null;
  organizations?: OrganizationRow | OrganizationRow[] | null;
};

function text(value: string | null | undefined) {
  return { en: value || '', ru: value || '' };
}

export function mapOrganizationRowToOrganization(row: OrganizationRow): Organization {
  return {
    id: row.id,
    name: row.name,
    logo: row.logo_url || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=240&q=80',
    logoUrl: row.logo_url || undefined,
    rating: 4.8,
    reviews: 0,
    city: row.city || 'Online',
    contactEmail: row.contact_email || undefined,
    description: text(row.description),
  };
}

export function mapOpportunityRowToOpportunity(row: OpportunityRow): Opportunity {
  const organization = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
  const badges = row.badges ?? [];
  const certificate = Boolean(row.certificate_available);
  return {
    id: row.id,
    organizationId: row.organization_id || undefined,
    title: text(row.title),
    organization: organization?.name || 'KomekHub organization',
    organizationLogo: organization?.logo_url || undefined,
    city: row.city,
    format: row.format as Opportunity['format'],
    duration: text(row.schedule || 'Flexible'),
    category: row.category,
    schedule: (row.schedule || 'Flexible') as Opportunity['schedule'],
    description: text(row.description),
    longDescription: text(row.description),
    requirements: row.requirements ? [text(row.requirements)] : [],
    responsibilities: [],
    benefits: row.benefits ? [text(row.benefits)] : [],
    tags: [...new Set([...(row.languages ?? []).map((item) => `${item} language`), ...badges])],
    badges: certificate ? [...new Set([...badges, 'Certificate'])] : badges,
    languages: (row.languages ?? []) as Opportunity['languages'],
    volunteerHours: row.volunteer_hours ?? 0,
    certificate,
    postedDaysAgo: row.created_at ? Math.max(0, Math.round((Date.now() - new Date(row.created_at).getTime()) / 86400000)) : 0,
    distanceKm: row.format === 'Online' ? 0 : 10,
    popularity: row.certificate_available ? 90 : 70,
    createdAt: row.created_at || undefined,
  };
}
