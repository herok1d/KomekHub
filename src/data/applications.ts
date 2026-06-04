import { Application, Certificate, Opportunity, Organization } from '../types';

export const currentUserId = 'user-aitu-aigerim';
export const currentVolunteerName = 'Aigerim Sapar';

export const initialApplications: Application[] = [];

export const initialCertificates: Certificate[] = [];

export function createCertificateFromApplication(application: Application, sequence: number, opportunities: Opportunity[], organizations: Organization[]): Certificate {
  const opportunity = opportunities.find((item) => item.id === application.opportunityId);
  const organization = organizations.find((item) => item.id === opportunity?.organizationId || item.name === application.organizationName);
  const issuedAt = application.completedAt ?? new Date().toISOString();

  return {
    id: `cert-${application.id}`,
    applicationId: application.id,
    userId: application.userId,
    opportunityId: application.opportunityId,
    organizationId: organization?.id ?? opportunity?.organizationId ?? application.organizationName.toLowerCase().replace(/\s+/g, '-'),
    certificateNumber: `KH-2026-${String(sequence).padStart(4, '0')}`,
    volunteerName: application.volunteerName,
    organizationName: organization?.name ?? application.organizationName,
    opportunityTitle: opportunity?.title ?? { en: 'Volunteering activity', ru: 'Волонтёрская активность' },
    city: opportunity?.city ?? organization?.city ?? 'Kazakhstan',
    volunteerHours: application.volunteerHours || opportunity?.volunteerHours || 0,
    issuedAt,
  };
}
