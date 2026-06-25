import { FormEvent, ReactNode, useEffect, useState } from 'react';
import {
  Award,
  Building2,
  CalendarDays,
  Check,
  Download,
  Edit3,
  GraduationCap,
  Languages,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { labelFor } from '../i18n/labels';
import { useI18n } from '../i18n/useI18n';
import { updateUserProfile } from '../services/profileService';
import { downloadCertificatePdf } from '../services/certificateService';
import { Application, Certificate, Language, Opportunity } from '../types';
import { OpportunityCard } from '../components/OpportunityCard';
import { EmptyState, Pill, SectionHeader } from '../components/ui';
import { formatDate } from '../utils/certificates';

type ProfileFormState = {
  fullName: string;
  city: string;
  birthDate: string;
  university: string;
  languages: string;
  skills: string;
  interests: string;
};

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
  onNotify,
  onVolunteerResponse,
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
  onNotify: (message: string) => void;
  onVolunteerResponse: (applicationId: string, response: 'accepted' | 'declined') => Promise<void>;
}) {
  const { t, localize } = useI18n(language);
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ProfileFormState>(() => profileToForm(profile));

  useEffect(() => {
    if (!isEditing) setForm(profileToForm(profile));
  }, [isEditing, profile]);

  const completedApplications = applications.filter((application) => application.status === 'completed');
  const totalHours = profile?.volunteerHours ?? 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setError('');
    setIsSaving(true);
    try {
      await updateUserProfile(user.id, {
        fullName: form.fullName,
        city: form.city,
        birthDate: form.birthDate,
        university: form.university,
        languages: parseList(form.languages),
        skills: parseList(form.skills),
        interests: parseList(form.interests),
      });
      await refreshProfile();
      setIsEditing(false);
      onNotify(t('profileUpdated'));
    } catch (profileError) {
      const message = profileError instanceof Error ? profileError.message : t('profileUpdateFailed');
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (!profile) return null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="h-28 bg-gradient-to-r from-[#e8f7f1] via-[#edf6ff] to-[#f7faf9] sm:h-36" />
        <div className="grid gap-7 p-5 sm:p-8 lg:grid-cols-[300px_1fr]">
          <aside className="-mt-20">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white bg-skysoft text-ocean shadow-lift">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName} className="h-full w-full object-cover" />
              ) : (
                <UserRound size={52} strokeWidth={1.8} />
              )}
            </div>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight">{profile.fullName || user?.email}</h1>
            <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-500">
              <span className="flex items-center gap-2">
                <MapPin size={17} />
                {profile.city || t('cityNotSet')}
              </span>
              <span className="flex items-center gap-2">
                <GraduationCap size={17} />
                {profile.university || t('universityNotSet')}
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck size={17} />
                {t(profile.role === 'organization' ? 'roleOrganization' : 'roleVolunteer')}
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <PortfolioStat value={totalHours} label={t('hoursLogged')} />
              <PortfolioStat value={completedApplications.length} label={t('completedActivities')} />
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-wide text-leaf">{t('profileTitle')}</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight">{t('volunteerPortfolio')}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsEditing((current) => !current);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-extrabold text-slate-700 transition-colors hover:border-ocean hover:text-ocean"
              >
                {isEditing ? <X size={17} /> : <Edit3 size={17} />}
                {t(isEditing ? 'cancel' : 'editProfile')}
              </button>
            </div>

            {isEditing ? (
              <ProfileEditor form={form} setForm={setForm} onSubmit={handleSubmit} isSaving={isSaving} error={error} language={language} />
            ) : (
              <div className="mt-6 grid gap-6">
                {profile.role === 'volunteer' && !profile.birthDate && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                    {t('birthDateReminder')}
                  </div>
                )}
                <ProfileChips icon={<Languages size={18} />} title={t('languages')} items={profile.languages} language={language} emptyText={t('notAddedYet')} />
                <ProfileChips icon={<Sparkles size={18} />} title={t('interests')} items={profile.interests} language={language} emptyText={t('notAddedYet')} />
                <ProfileChips icon={<Check size={18} />} title={t('skills')} items={profile.skills} language={language} emptyText={t('notAddedYet')} />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader eyebrow={t('applications')} title={t('applicationHistory')} />
        {applications.length === 0 ? (
          <EmptyState title={t('applicationHistory')} text={t('noApplicationsYet')} />
        ) : (
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
            {applications.map((application) => {
              const opportunity = opportunities.find((item) => item.id === application.opportunityId);
              return (
                <button
                  key={application.id}
                  onClick={() => opportunity && onOpenOpportunity(opportunity.id)}
                  className="grid w-full gap-3 border-b border-slate-100 px-5 py-5 text-left transition-colors last:border-b-0 hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <span>
                    <span className="block text-base font-extrabold">{opportunity?.title[language] || t('opportunityUnavailable')}</span>
                    <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-slate-500">
                      <span className="flex items-center gap-1.5"><Building2 size={15} />{application.organizationName}</span>
                      <span className="flex items-center gap-1.5"><CalendarDays size={15} />{formatDate(application.appliedAt, language)}</span>
                      {application.status === 'completed' && <span>{application.volunteerHours} {t('volunteerHours')}</span>}
                    </span>
                  </span>
                  <StatusPill status={application.status} label={t(application.status)} />
                  {application.status === 'accepted' && application.volunteerResponse === 'pending' && (
                    <div className="mt-3 rounded-2xl bg-skysoft p-4">
                      <p className="text-sm font-bold text-ocean">{t('acceptedConfirmPrompt').replace('[Opportunity title]', opportunity ? localize(opportunity.title) : '')}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={(event) => { event.stopPropagation(); onVolunteerResponse(application.id, 'accepted'); }} className="rounded-xl bg-leaf px-4 py-2 text-sm font-extrabold text-white">{t('confirmParticipation')}</button>
                        <button onClick={(event) => { event.stopPropagation(); onVolunteerResponse(application.id, 'declined'); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700">{t('declineParticipation')}</button>
                      </div>
                    </div>
                  )}
                  {application.status === 'accepted' && application.volunteerResponse !== 'pending' && (
                    <p className="mt-3 text-sm font-bold text-slate-500">{t('volunteerResponse')}: {t(application.volunteerResponse)}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8">
        <SectionHeader eyebrow={t('volunteerPortfolio')} title={t('certificates')} />
        <div className="grid gap-4">
          {certificates.length === 0 && <EmptyState title={t('certificates')} text={t('noCertificatesYet')} />}
          {certificates.map((certificate) => (
              <div key={certificate.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-leaf">
                      <Award size={18} />
                      {t('certificateIssued')}
                    </div>
                    <h3 className="text-xl font-extrabold">{certificate.opportunityTitle[language]}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{certificate.organizationName}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <Pill label={`${certificate.volunteerHours} ${t('volunteerHours')}`} strong />
                      <Pill label={`${t('certificateNumber')}: ${certificate.certificateNumber}`} strong />
                      <Pill label={`${t('issuedDate')}: ${formatDate(certificate.issuedAt, language)}`} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button onClick={() => downloadCertificatePdf(certificate, language)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-extrabold text-white">
                      <Download size={17} />
                      {t('downloadPdf')}
                    </button>
                    <button onClick={() => onVerifyCertificate(certificate.certificateNumber)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-extrabold text-slate-700 transition-colors hover:border-ocean hover:text-ocean">
                      <ShieldCheck size={17} />
                      {t('verify')}
                    </button>
                  </div>
                </div>
              </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader eyebrow={t('saved')} title={t('savedVolunteering')} />
        {savedOpportunities.length === 0 ? (
          <EmptyState title={t('savedVolunteering')} text={t('noSavedOpportunitiesYet')} />
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
                application={applications.find((application) => application.opportunityId === item.id)}
                onToggleSave={() => onSave(item.id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ProfileEditor({
  form,
  setForm,
  onSubmit,
  isSaving,
  error,
  language,
}: {
  form: ProfileFormState;
  setForm: (value: ProfileFormState) => void;
  onSubmit: (event: FormEvent) => void;
  isSaving: boolean;
  error: string;
  language: Language;
}) {
  const { t } = useI18n(language);
  const setField = (field: keyof ProfileFormState, value: string) => setForm({ ...form, [field]: value });
  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <ProfileInput label={t('fullName')} value={form.fullName} onChange={(value) => setField('fullName', value)} required />
        <ProfileInput label={t('city')} value={form.city} onChange={(value) => setField('city', value)} required />
        <ProfileInput label={t('birthDate')} value={form.birthDate} onChange={(value) => setField('birthDate', value)} type="date" />
        <ProfileInput label={t('university')} value={form.university} onChange={(value) => setField('university', value)} />
        <ProfileInput label={t('languages')} value={form.languages} onChange={(value) => setField('languages', value)} placeholder={t('commaSeparatedPlaceholder')} />
        <ProfileInput label={t('skills')} value={form.skills} onChange={(value) => setField('skills', value)} placeholder={t('commaSeparatedPlaceholder')} />
        <ProfileInput label={t('interests')} value={form.interests} onChange={(value) => setField('interests', value)} placeholder={t('commaSeparatedPlaceholder')} />
      </div>
      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}
      <button disabled={isSaving} className="inline-flex w-fit items-center gap-2 rounded-2xl bg-leaf px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-emerald-700 disabled:bg-slate-400">
        <Save size={17} />
        {isSaving ? t('saving') : t('saveChanges')}
      </button>
    </form>
  );
}

function ProfileInput({ label, value, onChange, placeholder, required, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean; type?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-slate-700">{label}</span>
      <input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-ink shadow-sm focus:border-ocean focus:outline-none focus:ring-4 focus:ring-ocean/15" />
    </label>
  );
}

function PortfolioStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-mist p-4">
      <div className="text-3xl font-extrabold text-leaf">{value}</div>
      <div className="mt-1 text-xs font-bold leading-5 text-slate-500">{label}</div>
    </div>
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
  return <span className={`${tone} w-fit rounded-full px-3 py-1 text-xs font-extrabold`}>{label}</span>;
}

function ProfileChips({ icon, title, items, language, emptyText }: { icon: ReactNode; title: string; items: string[]; language: Language; emptyText: string }) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-base font-extrabold text-slate-800">{icon}{title}</h3>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => <Pill key={item} label={labelFor(item, language)} />)}
        </div>
      ) : (
        <p className="text-sm font-semibold text-slate-400">{emptyText}</p>
      )}
    </div>
  );
}

function profileToForm(profile: ReturnType<typeof useAuth>['profile']): ProfileFormState {
  return {
    fullName: profile?.fullName ?? '',
    city: profile?.city ?? '',
    birthDate: profile?.birthDate ?? '',
    university: profile?.university ?? '',
    languages: profile?.languages.join(', ') ?? '',
    skills: profile?.skills.join(', ') ?? '',
    interests: profile?.interests.join(', ') ?? '',
  };
}

function parseList(value: string) {
  return [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];
}
