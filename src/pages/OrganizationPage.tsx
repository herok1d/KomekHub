import { useState } from 'react';
import { Award, BriefcaseBusiness, Check, Star, X } from 'lucide-react';
import { labelFor } from '../i18n/labels';
import { useI18n } from '../i18n/useI18n';
import { Application, ApplicationStatus, Certificate, Language, Opportunity, Organization, Page } from '../types';
import { OpportunityCard } from '../components/OpportunityCard';
import { EmptyState, SectionHeader } from '../components/ui';

export function OrganizationPage({
  language,
  opportunities,
  organizations,
  savedIds,
  appliedIds,
  applications,
  certificates,
  onUpdateApplicationStatus,
  onNavigate,
  onOpenOpportunity,
  onApply,
  onSave,
}: {
  language: Language;
  opportunities: Opportunity[];
  organizations: Organization[];
  savedIds: string[];
  appliedIds: string[];
  applications: Application[];
  certificates: Certificate[];
  onUpdateApplicationStatus: (applicationId: string, status: ApplicationStatus, volunteerHours?: number) => void;
  onNavigate: (page: Page) => void;
  onOpenOpportunity: (id: string) => void;
  onApply: (id: string) => void;
  onSave: (id: string) => void;
}) {
  const { t, localize } = useI18n(language);
  const featured = organizations[0];
  const published = featured ? opportunities.filter((item) => item.organizationId === featured.id || item.organization === featured.name) : [];
  const dashboardApplications = applications.filter((application) => published.some((item) => item.id === application.opportunityId));
  const emptyOrganizationsText = language === 'ru' ? 'Supabase пока не вернул организации.' : 'No organizations were returned from Supabase yet.';
  const emptyPublishedText = language === 'ru' ? 'У этой организации пока нет опубликованных возможностей в Supabase.' : 'This organization has no published Supabase opportunities yet.';
  const emptyApplicationsText = language === 'ru' ? 'По возможностям этой организации пока нет откликов.' : "No applications for this organization's opportunities yet.";

  if (!featured) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState title={t('organizationsTitle')} text={emptyOrganizationsText} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <img src={featured.logo} alt={featured.name} className="h-28 w-28 rounded-3xl object-cover shadow-soft" />
          <h1 className="mt-5 text-3xl font-extrabold">{featured.name}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{localize(featured.description)}</p>
          {featured.reviews > 0 && (
            <div className="mt-5 flex items-center gap-2 text-sm font-bold text-amber-600">
              <Star size={18} fill="currentColor" />
              {featured.rating} - {featured.reviews} {t('reviews')}
            </div>
          )}
          <button
            onClick={() => onNavigate('post')}
            className="pressable mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3.5 text-base font-extrabold text-white transition hover:bg-slate-800"
          >
            <BriefcaseBusiness size={18} />
            {t('postOpportunity')}
          </button>
        </aside>

        <section>
          <SectionHeader eyebrow={t('navOrganizations')} title={t('organizationsTitle')} />
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            {organizations.map((org) => (
              <div key={org.id ?? org.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex items-center gap-4">
                  <img src={org.logo} alt={org.name} className="h-14 w-14 rounded-2xl object-cover" />
                  <div>
                    <h3 className="font-extrabold">{org.name}</h3>
                    <p className="text-sm font-semibold text-slate-500">{labelFor(org.city, language)}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{localize(org.description)}</p>
              </div>
            ))}
          </div>

          <SectionHeader eyebrow={featured.name} title={t('publishedByOrg')} />
          {published.length === 0 ? (
            <EmptyState title={t('noResultsTitle')} text={emptyPublishedText} />
          ) : (
            <div className="grid gap-5">
              {published.map((item) => (
                <OpportunityCard
                  key={item.id}
                  opportunity={item}
                  language={language}
                  onOpen={() => onOpenOpportunity(item.id)}
                  onApply={() => onApply(item.id)}
                  isSaved={savedIds.includes(item.id)}
                  isApplied={appliedIds.includes(item.id)}
                  onSave={() => onSave(item.id)}
                />
              ))}
            </div>
          )}

          <section className="mt-8">
            <SectionHeader eyebrow={t('organizationDashboard')} title={t('applications')} />
            <div className="grid gap-4">
              {dashboardApplications.length === 0 && <EmptyState title={t('applications')} text={emptyApplicationsText} />}
              {dashboardApplications.map((application) => {
                const opportunity = opportunities.find((item) => item.id === application.opportunityId);
                const certificate = certificates.find((item) => item.applicationId === application.id);
                return (
                  <ApplicationRow
                    key={application.id}
                    application={application}
                    opportunityTitle={opportunity?.title[language] ?? application.organizationName}
                    certificateIssued={Boolean(certificate)}
                    labels={{
                      applicant: t('applicant'),
                      status: t('status'),
                      accepted: t('accepted'),
                      pending: t('pending'),
                      rejected: t('rejected'),
                      completed: t('completed'),
                      cancelled: t('cancelled'),
                      accept: t('accept'),
                      reject: t('reject'),
                      markCompleted: t('markCompleted'),
                      hoursRequired: t('hoursRequired'),
                      certificateIssued: t('certificateIssued'),
                    }}
                    onUpdate={onUpdateApplicationStatus}
                  />
                );
              })}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

function ApplicationRow({
  application,
  opportunityTitle,
  certificateIssued,
  labels,
  onUpdate,
}: {
  application: Application;
  opportunityTitle: string;
  certificateIssued: boolean;
  labels: Record<string, string>;
  onUpdate: (applicationId: string, status: ApplicationStatus, volunteerHours?: number) => void;
}) {
  const defaultHours = application.volunteerHours || 8;
  const [hours, setHours] = useState(String(defaultHours));
  const statusLabel = labels[application.status] ?? application.status;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="grid gap-4 xl:grid-cols-[1fr_220px_280px] xl:items-center">
        <div>
          <p className="text-sm font-bold text-slate-500">{labels.applicant}</p>
          <h3 className="mt-1 text-lg font-extrabold">{application.volunteerName}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">{opportunityTitle}</p>
          {certificateIssued && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1 text-sm font-extrabold text-leaf">
              <Award size={16} />
              {labels.certificateIssued}
            </p>
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-500">{labels.status}</p>
          <p className="mt-1 rounded-full bg-slate-100 px-3 py-1 text-center text-sm font-extrabold text-slate-700">{statusLabel}</p>
        </div>
        <div className="grid gap-2">
          <div className="flex gap-2">
            <button onClick={() => onUpdate(application.id, 'accepted')} className="pressable flex-1 rounded-2xl bg-skysoft px-3 py-2 text-sm font-extrabold text-ocean">
              <Check size={16} className="inline" /> {labels.accept}
            </button>
            <button onClick={() => onUpdate(application.id, 'rejected')} className="pressable flex-1 rounded-2xl bg-rose-50 px-3 py-2 text-sm font-extrabold text-rose-700">
              <X size={16} className="inline" /> {labels.reject}
            </button>
          </div>
          <div className="flex gap-2">
            <input
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              type="number"
              min="1"
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold focus:border-ocean focus:outline-none focus:ring-4 focus:ring-ocean/15"
              placeholder={labels.hoursRequired}
            />
            <button
              onClick={() => {
                const parsed = Number(hours);
                if (parsed > 0) onUpdate(application.id, 'completed', parsed);
              }}
              className="pressable rounded-2xl bg-leaf px-3 py-2 text-sm font-extrabold text-white"
            >
              {labels.markCompleted}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
