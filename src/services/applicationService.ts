import { Application, ApplicationStatus } from '../types';

export function updateApplicationStatusLocal(
  applications: Application[],
  applicationId: string,
  status: ApplicationStatus,
  volunteerHours?: number,
) {
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
