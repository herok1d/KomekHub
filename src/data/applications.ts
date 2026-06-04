import { Application, Certificate } from '../types';
import { opportunities, organizations } from './mockData';

export const currentUserId = 'user-aitu-aigerim';
export const currentVolunteerName = 'Aigerim Sapar';

export const initialApplications: Application[] = [
  {
    id: 'app-001',
    userId: currentUserId,
    volunteerName: currentVolunteerName,
    opportunityId: 1,
    organizationName: 'Qoldau Foundation',
    status: 'completed',
    appliedAt: '2026-03-10T09:30:00.000Z',
    completedAt: '2026-05-04T15:00:00.000Z',
    volunteerHours: 36,
  },
  {
    id: 'app-002',
    userId: currentUserId,
    volunteerName: currentVolunteerName,
    opportunityId: 5,
    organizationName: 'Bilim Bridge',
    status: 'accepted',
    appliedAt: '2026-05-22T11:10:00.000Z',
    volunteerHours: 0,
  },
  {
    id: 'app-003',
    userId: currentUserId,
    volunteerName: currentVolunteerName,
    opportunityId: 10,
    organizationName: 'AITU Volunteer Club',
    status: 'pending',
    appliedAt: '2026-06-01T13:25:00.000Z',
    volunteerHours: 0,
  },
];

export const initialCertificates: Certificate[] = [
  createCertificateFromApplication(initialApplications[0], 1),
];

export function createCertificateFromApplication(application: Application, sequence: number): Certificate {
  const opportunity = opportunities.find((item) => item.id === application.opportunityId) ?? opportunities[0];
  const organization = organizations.find((item) => item.name === application.organizationName) ?? organizations[0];
  const issuedAt = application.completedAt ?? new Date().toISOString();

  return {
    id: `cert-${application.id}`,
    applicationId: application.id,
    userId: application.userId,
    opportunityId: opportunity.id,
    organizationId: organization.name.toLowerCase().replace(/\s+/g, '-'),
    certificateNumber: `KH-2026-${String(sequence).padStart(4, '0')}`,
    volunteerName: application.volunteerName,
    organizationName: organization.name,
    opportunityTitle: opportunity.title,
    city: opportunity.city,
    volunteerHours: application.volunteerHours || opportunity.volunteerHours,
    issuedAt,
  };
}
