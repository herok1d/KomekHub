import { Award, Download, MapPin, ShieldCheck } from 'lucide-react';
import { labelFor } from '../i18n/labels';
import { useI18n } from '../i18n/useI18n';
import { Application, Certificate, Language, Opportunity } from '../types';
import { OpportunityCard } from '../components/OpportunityCard';
import { EmptyState, Pill, SectionHeader } from '../components/ui';
import { downloadCertificatePdf, formatDate } from '../utils/certificates';

export function ProfilePage({
  language,
  opportunities,
  savedOpportunities,
  applications,
  certificates,
  appliedIds,
  onOpenOpportunity,
  onVerifyCertificate,
  onApply,
  onSave,
}: {
  language: Language;
  opportunities: Opportunity[];
  savedOpportunities: Opportunity[];
  applications: Application[];
  certificates: Certificate[];
  appliedIds: string[];
  onOpenOpportunity: (id: string) => void;
  onVerifyCertificate: (certificateNumber: string) => void;
  onApply: (id: string) => void;
  onSave: (id: string) => void;
}) {
  const { t } = useI18n(language);
  const completedApplications = applications.filter((application) => application.status === 'completed');
  const totalCompletedHours = completedApplications.reduce((sum, application) => sum + application.volunteerHours, 0);
  const history = applications.slice(0, 5);

  const emptyApplicationsText =
    language === 'ru'
      ? 'Отклики появятся здесь после подачи заявки на реальные возможности из Supabase.'
      : 'Applications will appear here after you apply to Supabase opportunities.';
  const emptyCertificatesText =
    language === 'ru'
      ? 'Завершённые активности и сертификаты появятся здесь после подтверждения организации.'
      : 'Completed volunteering activities and certificates will appear here after organization approval.';
  const emptySavedText =
    language === 'ru'
      ? 'Сохранённые возможности из Supabase появятся здесь.'
      : 'Saved Supabase opportunities will appear here.';

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="h-36 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[300px_1fr]">
          <div className="-mt-20">
            <img
              src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=240&q=80"
              alt="AITU student volunteer"
              className="h-32 w-32 rounded-[2rem] border-4 border-white object-cover shadow-lift"
            />
            <h1 className="mt-5 text-3xl font-extrabold">Aigerim Sapar</h1>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <MapPin size={17} />
              {t('profileCity')} - AITU
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600">{t('profileSummary')}</p>
            <div className="mt-5 rounded-3xl bg-mist p-5">
              <div className="text-4xl font-extrabold text-leaf">{totalCompletedHours}</div>
              <div className="text-sm font-semibold text-slate-600">{t('hoursLogged')}</div>
            </div>
          </div>

          <div className="grid gap-6">
            <ProfileChips title={t('languages')} items={['Kazakh', 'Russian', 'English']} language={language} />
            <ProfileChips
              title={t('interests')}
              items={language === 'ru' ? ['Образование', 'IT и цифровые проекты', 'Молодёжь', 'Инклюзивное образование', 'Сообщество'] : ['Education', 'IT & Digital', 'Youth', 'Inclusive education', 'Community']}
              language={language}
            />
            <ProfileChips
              title={t('skills')}
              items={language === 'ru' ? ['Наставничество', 'Основы React', 'Публичные выступления', 'SMM', 'Исследования'] : ['Mentoring', 'React basics', 'Public speaking', 'SMM', 'Research']}
              language={language}
            />
            <div>
              <h2 className="mb-3 text-xl font-extrabold">{t('applicationHistory')}</h2>
              <div className="grid gap-3">
                {history.length === 0 && <EmptyState title={t('applicationHistory')} text={emptyApplicationsText} />}
                {history.map((application) => {
                  const item = opportunities.find((opportunity) => opportunity.id === application.opportunityId);
                  if (!item) return null;
                  return (
                    <button key={application.id} onClick={() => onOpenOpportunity(item.id)} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left hover:border-ocean/40">
                      <span>
                        <span className="block font-bold">{item.title[language]}</span>
                        <span className="text-sm text-slate-500">{item.organization}</span>
                      </span>
                      <StatusPill status={application.status} label={t(application.status)} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader eyebrow={t('completedActivities')} title={t('certificates')} />
        <div className="grid gap-4">
          {completedApplications.length === 0 && <EmptyState title={t('certificates')} text={emptyCertificatesText} />}
          {completedApplications.map((application) => {
            const opportunity = opportunities.find((item) => item.id === application.opportunityId);
            const certificate = certificates.find((item) => item.applicationId === application.id);
            if (!opportunity) return null;
            return (
              <div key={application.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-leaf">
                      <Award size={18} />
                      {certificate ? t('certificateIssued') : t('certificateNotReady')}
                    </div>
                    <h3 className="text-xl font-extrabold">{opportunity.title[language]}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{application.organizationName}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <Pill label={`${application.volunteerHours} ${t('volunteerHours')}`} strong />
                      {certificate && <Pill label={`${t('certificateNumber')}: ${certificate.certificateNumber}`} strong />}
                      {certificate && <Pill label={`${t('issuedDate')}: ${formatDate(certificate.issuedAt, language)}`} />}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      disabled={!certificate}
                      onClick={() => certificate && downloadCertificatePdf(certificate, language)}
                      className="pressable inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-extrabold text-white disabled:bg-slate-300"
                    >
                      <Download size={17} />
                      {t('downloadCertificate')}
                    </button>
                    <button
                      disabled={!certificate}
                      onClick={() => certificate && onVerifyCertificate(certificate.certificateNumber)}
                      className="pressable inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-extrabold text-slate-700 hover:border-ocean hover:text-ocean disabled:text-slate-300"
                    >
                      <ShieldCheck size={17} />
                      {t('verifyCertificate')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader eyebrow={t('saved')} title={t('savedVolunteering')} />
        {savedOpportunities.length === 0 ? (
          <EmptyState title={t('savedVolunteering')} text={emptySavedText} />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {savedOpportunities.map((item) => (
              <OpportunityCard
                key={item.id}
                opportunity={item}
                language={language}
                onOpen={() => onOpenOpportunity(item.id)}
                onApply={() => onApply(item.id)}
                isSaved
                isApplied={appliedIds.includes(item.id)}
                onToggleSave={() => onSave(item.id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatusPill({ status, label }: { status: Application['status']; label: string }) {
  const tone =
    status === 'completed'
      ? 'bg-mint text-leaf'
      : status === 'accepted'
        ? 'bg-skysoft text-ocean'
        : status === 'rejected' || status === 'cancelled'
          ? 'bg-rose-50 text-rose-700'
          : 'bg-slate-100 text-slate-600';
  return <span className={`${tone} rounded-full px-3 py-1 text-xs font-extrabold`}>{label}</span>;
}

function ProfileChips({ title, items, language }: { title: string; items: string[]; language: Language }) {
  return (
    <div>
      <h2 className="mb-3 text-xl font-extrabold">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Pill key={item} label={labelFor(item, language)} />
        ))}
      </div>
    </div>
  );
}
