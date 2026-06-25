import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  Edit3,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { categories, formCities, formFormats, formSchedules } from '../data/mockData';
import { labelFor } from '../i18n/labels';
import { useI18n } from '../i18n/useI18n';
import { createOrganization, getOrganizationByOwnerId, updateOrganization } from '../services/organizationService';
import { createOpportunity, deleteOpportunity, getOrganizationOpportunities, updateOpportunity, updateOpportunityStatus } from '../services/opportunityService';
import { getOrganizationApplications, updateOrganizationApplicationDetails, updateOrganizationApplicationStatus } from '../services/applicationService';
import { createCertificateForCompletedApplication } from '../services/certificateService';
import { createNotification } from '../services/notificationService';
import { ApplicationStatus, Language, Opportunity, OpportunityInput, OpportunityStatus, Organization, OrganizationApplication, OrganizationInput } from '../types';
import { EmptyState } from '../components/ui';
import { formatDate } from '../utils/certificates';

type EditorState = { mode: 'create' | 'edit'; opportunity?: Opportunity } | null;

export function OrganizationDashboardPage({
  language,
  onNotify,
  onMarketplaceChanged,
}: {
  language: Language;
  onNotify: (message: string) => void;
  onMarketplaceChanged: () => Promise<void>;
}) {
  const { t, localize } = useI18n(language);
  const { user, profile } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<OrganizationApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState<EditorState>(null);
  const [editingOrganization, setEditingOrganization] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState('');
  const userId = user?.id;

  const loadDashboard = useCallback(async () => {
    if (!userId || profile?.role !== 'organization') return;
    setLoading(true);
    setError('');
    try {
      const ownedOrganization = await getOrganizationByOwnerId(userId);
      setOrganization(ownedOrganization);
      if (!ownedOrganization?.id) {
        setOpportunities([]);
        setApplications([]);
        return;
      }
      const [ownedOpportunities, ownedApplications] = await Promise.all([
        getOrganizationOpportunities(ownedOrganization.id),
        getOrganizationApplications(ownedOrganization.id),
      ]);
      setOpportunities(ownedOpportunities);
      setApplications(ownedApplications);
      setSelectedOpportunityId((current) => current || ownedOpportunities[0]?.id || '');
    } catch (dashboardError) {
      setError(dashboardError instanceof Error ? dashboardError.message : language === 'ru' ? 'Не удалось загрузить панель организации' : 'Failed to load organization dashboard');
    } finally {
      setLoading(false);
    }
  }, [language, profile?.role, userId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const applicationCounts = useMemo(() => {
    const counts = new Map<string, { total: number; accepted: number; completed: number }>();
    applications.forEach((application) => {
      const current = counts.get(application.opportunityId) ?? { total: 0, accepted: 0, completed: 0 };
      current.total += 1;
      if (application.status === 'accepted') current.accepted += 1;
      if (application.status === 'completed') current.completed += 1;
      counts.set(application.opportunityId, current);
    });
    return counts;
  }, [applications]);
  const selectedOpportunity = opportunities.find((opportunity) => opportunity.id === selectedOpportunityId) ?? opportunities[0];
  const selectedApplications = selectedOpportunity ? applications.filter((application) => application.opportunityId === selectedOpportunity.id) : [];

  if (!user) return null;
  if (profile?.role !== 'organization') {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState title={t('dashboard')} text={t('organizationOnlyPage')} />
      </main>
    );
  }
  if (loading) return <DashboardState title={t('loadingDashboard')} />;
  if (error) return <DashboardState title={t('dashboardLoadFailed')} text={error} />;
  if (!organization || editingOrganization) {
    return (
      <OrganizationSetupForm
        language={language}
        organization={organization}
        userId={user.id}
        onCancel={organization ? () => setEditingOrganization(false) : undefined}
        onSaved={async (savedOrganization) => {
          setOrganization(savedOrganization);
          setEditingOrganization(false);
          await loadDashboard();
          await onMarketplaceChanged();
          onNotify(t('organizationProfileSaved'));
        }}
      />
    );
  }

  async function handleDelete(opportunityId: string) {
    if (!window.confirm(t('deleteOpportunityConfirm'))) return;
    try {
      await deleteOpportunity(opportunityId);
      await Promise.all([loadDashboard(), onMarketplaceChanged()]);
      onNotify(t('opportunityDeleted'));
    } catch (deleteError) {
      onNotify(deleteError instanceof Error ? deleteError.message : t('opportunityDeleteFailed'));
    }
  }

  async function handleStatus(applicationId: string, status: ApplicationStatus, volunteerHours?: number) {
    if (status === 'completed' && (!volunteerHours || volunteerHours < 1)) {
      onNotify(t('hoursRequired'));
      return;
    }
    try {
      const previous = applications.find((application) => application.id === applicationId);
      if (previous?.certificateNumber && (status !== previous.status || volunteerHours !== undefined)) {
        onNotify(t('certificateLockedMessage'));
        return;
      }
      await updateOrganizationApplicationStatus(applicationId, status, volunteerHours);
      let issuedCertificateNumber = '';
      if (status === 'completed' && previous?.certificateAvailable) {
        const certificate = await createCertificateForCompletedApplication(applicationId);
        issuedCertificateNumber = certificate.certificateNumber;
      }
      if (previous) {
        await createNotification({
          userId: previous.userId,
          type: issuedCertificateNumber ? 'certificate_issued' : `application_${status}`,
          title: issuedCertificateNumber ? t('certificateIssued') : t(status === 'accepted' ? 'acceptedNotificationTitle' : status === 'rejected' ? 'rejectedNotificationTitle' : status === 'completed' ? 'completedNotificationTitle' : 'applicationStatusUpdated'),
          message: issuedCertificateNumber
            ? t('certificateIssuedNotificationMessage').replace('[Certificate number]', issuedCertificateNumber)
            : status === 'accepted'
              ? t('acceptedNotificationMessage').replace('[Opportunity title]', previous.opportunityTitle)
              : status === 'rejected'
                ? t('rejectedNotificationMessage')
                : status === 'completed'
                  ? t('completedNotificationMessage').replace('[Hours]', String(volunteerHours ?? previous.volunteerHours ?? 0))
                  : t('applicationStatusUpdated'),
          relatedApplicationId: applicationId,
          relatedOpportunityId: previous.opportunityId,
        });
      }
      await loadDashboard();
      onNotify(t(status === 'completed' && previous?.certificateAvailable ? 'certificateIssued' : previous?.status === 'completed' || status === 'completed' ? 'hoursUpdated' : 'applicationStatusUpdated'));
    } catch (statusError) {
      const message = statusError instanceof Error ? statusError.message : '';
      onNotify(message.toLowerCase().includes('certificate') ? t('certificateLockedMessage') : message || t('applicationUpdateFailed'));
    }
  }

  async function handleOpportunityStatus(opportunityId: string, status: OpportunityStatus) {
    try {
      await updateOpportunityStatus(opportunityId, status);
      await Promise.all([loadDashboard(), onMarketplaceChanged()]);
      onNotify(t('opportunityUpdated'));
    } catch (statusError) {
      onNotify(statusError instanceof Error ? statusError.message : t('opportunitySaveFailed'));
    }
  }

  async function handleApplicationDetails(applicationId: string, assignedRole?: string, organizationNote?: string) {
    try {
      await updateOrganizationApplicationDetails(applicationId, { assignedRole, organizationNote });
      await loadDashboard();
      onNotify(t('applicationStatusUpdated'));
    } catch (detailsError) {
      onNotify(detailsError instanceof Error ? detailsError.message : t('applicationUpdateFailed'));
    }
  }

  async function handleIssueCertificate(applicationId: string) {
    try {
      await createCertificateForCompletedApplication(applicationId);
      await loadDashboard();
      onNotify(t('certificateIssued'));
    } catch (issueError) {
      onNotify(issueError instanceof Error ? issueError.message : t('certificateIssueFailed'));
    }
  }

  if (editor) {
    return (
      <OpportunityEditor
        language={language}
        organizationId={organization.id!}
        opportunity={editor.opportunity}
        onCancel={() => setEditor(null)}
        onSaved={async () => {
          setEditor(null);
          await Promise.all([loadDashboard(), onMarketplaceChanged()]);
          onNotify(t(editor.mode === 'edit' ? 'opportunityUpdated' : 'opportunityPublished'));
        }}
      />
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-skysoft text-ocean">
              {organization.logoUrl ? <img src={organization.logoUrl} alt={organization.name} className="h-full w-full object-cover" /> : <Building2 size={30} />}
            </div>
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide text-leaf">{t('organizationProfile')}</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{organization.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{localize(organization.description)}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-slate-500">
                <span className="flex items-center gap-1.5"><MapPin size={16} />{labelFor(organization.city, language)}</span>
                {organization.contactEmail && <span className="flex items-center gap-1.5"><Mail size={16} />{organization.contactEmail}</span>}
                {organization.phone && <span className="flex items-center gap-1.5"><Phone size={16} />{organization.phone}</span>}
                {organization.website && <a href={organization.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-ocean"><ExternalLink size={16} />{t('website')}</a>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setEditingOrganization(true)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-extrabold text-slate-700 transition-colors hover:border-ocean hover:text-ocean">
              <Edit3 size={17} />{t('editOrganizationProfile')}
            </button>
            <button onClick={() => setEditor({ mode: 'create' })} className="inline-flex items-center gap-2 rounded-2xl bg-leaf px-4 py-3 text-sm font-extrabold text-white transition-colors hover:bg-emerald-700">
              <Plus size={17} />{t('createOpportunity')}
            </button>
          </div>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <DashboardMetric icon={<BriefcaseBusiness size={20} />} value={opportunities.length} label={t('myOpportunities')} />
          <DashboardMetric icon={<Users size={20} />} value={applications.length} label={t('applications')} />
          <DashboardMetric icon={<Check size={20} />} value={applications.filter((item) => item.status === 'completed').length} label={t('completed')} />
        </div>
      </section>

      <section className="mt-8">
        <DashboardHeader title={t('myOpportunities')} action={t('createOpportunity')} onAction={() => setEditor({ mode: 'create' })} />
        {opportunities.length === 0 ? (
          <EmptyState title={t('myOpportunities')} text={t('noOrganizationOpportunities')} action={t('createOpportunity')} onAction={() => setEditor({ mode: 'create' })} />
        ) : (
          <div className="grid gap-4">
            {opportunities.map((opportunity) => (
              <div key={opportunity.id} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex flex-wrap gap-2 text-xs font-extrabold text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">{labelFor(opportunity.category, language)}</span>
                    <span className="rounded-full bg-skysoft px-3 py-1 text-ocean">{labelFor(opportunity.format, language)}</span>
                    {opportunity.minAge && <span className="rounded-full bg-slate-100 px-3 py-1">{opportunity.minAge}+</span>}
                    {opportunity.certificate && <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{t('certificateAvailable')}</span>}
                  </div>
                  <h3 className="mt-3 text-xl font-extrabold">{localize(opportunity.title)}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{localize(opportunity.description)}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold text-slate-500">
                    <span className="flex items-center gap-2"><Users size={16} />{applicationCounts.get(opportunity.id)?.total ?? 0} {t('applications')}</span>
                    <span>{applicationCounts.get(opportunity.id)?.accepted ?? 0} {t('acceptedVolunteers')}</span>
                    <span>{applicationCounts.get(opportunity.id)?.completed ?? 0} {t('completedVolunteers')}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedOpportunityId(opportunity.id)} className="rounded-2xl bg-ink px-4 py-3 text-sm font-extrabold text-white">{t('manageApplications')}</button>
                  <select value={opportunity.status} onChange={(event) => handleOpportunityStatus(opportunity.id, event.target.value as OpportunityStatus)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold">
                    {(['recruiting', 'closed', 'in_progress', 'completed'] as OpportunityStatus[]).map((status) => <option key={status} value={status}>{t(status)}</option>)}
                  </select>
                  <button onClick={() => setEditor({ mode: 'edit', opportunity })} className="rounded-2xl border border-slate-200 p-3 text-slate-600 transition-colors hover:border-ocean hover:text-ocean" title={t('editOpportunity')}><Edit3 size={18} /></button>
                  <button onClick={() => handleDelete(opportunity.id)} className="rounded-2xl border border-slate-200 p-3 text-slate-600 transition-colors hover:border-rose-300 hover:text-rose-700" title={t('deleteOpportunity')}><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <DashboardHeader title={selectedOpportunity ? `${t('applications')}: ${localize(selectedOpportunity.title)}` : t('applications')} />
        {selectedApplications.length === 0 ? (
          <EmptyState title={t('applications')} text={t('noOrganizationApplications')} />
        ) : (
          <div className="grid gap-4">
            {selectedApplications.map((application) => (
              <ApplicationManager key={application.id} application={application} language={language} onUpdate={handleStatus} onIssueCertificate={handleIssueCertificate} onSaveDetails={handleApplicationDetails} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ApplicationManager({
  application,
  language,
  onUpdate,
  onIssueCertificate,
  onSaveDetails,
}: {
  application: OrganizationApplication;
  language: Language;
  onUpdate: (id: string, status: ApplicationStatus, hours?: number) => void;
  onIssueCertificate: (id: string) => void;
  onSaveDetails: (id: string, assignedRole?: string, organizationNote?: string) => void;
}) {
  const { t } = useI18n(language);
  const [hours, setHours] = useState(String(application.volunteerHours || ''));
  const [assignedRole, setAssignedRole] = useState(application.assignedRole ?? '');
  const [organizationNote, setOrganizationNote] = useState(application.organizationNote ?? '');
  const lockedByCertificate = Boolean(application.certificateNumber);
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="grid gap-5 xl:grid-cols-[1fr_190px_360px] xl:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold">{application.volunteerName}</h3>
            <StatusBadge status={application.status} label={t(application.status)} />
          </div>
          <p className="mt-1 font-bold text-ocean">{application.opportunityTitle}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-slate-500">
            {application.volunteerCity && <span className="flex items-center gap-1.5"><MapPin size={15} />{application.volunteerCity}</span>}
            <span className="flex items-center gap-1.5"><CalendarDays size={15} />{formatDate(application.appliedAt, language)}</span>
            <span>{t('volunteerResponse')}: {t(application.volunteerResponse)}</span>
          </div>
          {application.message && <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{application.message}</p>}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Input label={t('assignedRole')} value={assignedRole} onChange={setAssignedRole} placeholder="Event registration assistant" />
            <Input label={t('organizationNote')} value={organizationNote} onChange={setOrganizationNote} placeholder={t('organizationNote')} />
            <button onClick={() => onSaveDetails(application.id, assignedRole, organizationNote)} className="w-fit rounded-2xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-slate-700 hover:border-ocean hover:text-ocean">{t('saveChanges')}</button>
          </div>
          {application.status === 'completed' && application.certificateAvailable && application.certificateNumber && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-mint px-3 py-1.5 text-xs font-extrabold text-leaf"><Award size={15} />{t('certificateIssued')}: {application.certificateNumber}</p>
          )}
          {application.status === 'completed' && application.certificateAvailable && !application.certificateNumber && (
            <button onClick={() => onIssueCertificate(application.id)} className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-700"><Award size={15} />{t('issueCertificate')}</button>
          )}
          {application.status === 'completed' && !application.certificateAvailable && (
            <p className="mt-3 text-xs font-bold text-slate-400">{t('certificateNotAvailableForOpportunity')}</p>
          )}
        </div>
        <select disabled={lockedByCertificate} value={application.status} onChange={(event) => onUpdate(application.id, event.target.value as ApplicationStatus)} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold focus:border-ocean focus:outline-none disabled:bg-slate-100 disabled:text-slate-400">
          {(['pending', 'accepted', 'rejected', 'completed', 'cancelled'] as ApplicationStatus[]).map((status) => <option key={status} value={status} disabled={status === 'completed'}>{t(status)}</option>)}
        </select>
        <div className="flex gap-2">
          <input disabled={lockedByCertificate} value={hours} onChange={(event) => setHours(event.target.value)} type="number" min="1" placeholder={t('volunteerHours')} className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-bold focus:border-ocean focus:outline-none disabled:bg-slate-100 disabled:text-slate-400" />
          <button disabled={lockedByCertificate} onClick={() => onUpdate(application.id, 'completed', Number(hours))} className="inline-flex items-center gap-2 rounded-2xl bg-leaf px-4 py-2 text-sm font-extrabold text-white disabled:bg-slate-400"><Check size={16} />{t('markCompleted')}</button>
        </div>
      </div>
    </article>
  );
}

function OpportunityEditor({ language, organizationId, opportunity, onCancel, onSaved }: { language: Language; organizationId: string; opportunity?: Opportunity; onCancel: () => void; onSaved: () => Promise<void> }) {
  const { t, localize } = useI18n(language);
  const [form, setForm] = useState<OpportunityInput>(() => opportunityToInput(opportunity, localize));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const update = <K extends keyof OpportunityInput>(key: K, value: OpportunityInput[K]) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (opportunity) await updateOpportunity(opportunity.id, organizationId, form);
      else await createOpportunity(organizationId, form);
      await onSaved();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('opportunitySaveFailed'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader title={t(opportunity ? 'editOpportunity' : 'createOpportunity')} action={t('cancel')} onAction={onCancel} />
      <form onSubmit={submit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <Input label={t('title')} value={form.title} onChange={(value) => update('title', value)} required />
          <Input label={t('city')} value={form.city} onChange={(value) => update('city', value)} required list="dashboard-cities" />
          <Select label={t('category')} value={form.category} values={categories.map((item) => item.name)} language={language} onChange={(value) => update('category', value)} />
          <Select label={t('format')} value={form.format} values={formFormats} language={language} onChange={(value) => update('format', value)} />
          <Select label={t('schedule')} value={form.schedule} values={formSchedules} language={language} onChange={(value) => update('schedule', value)} />
          <Select label={t('ageRequirement')} value={form.minAge ? `${form.minAge}+` : 'No restriction'} values={['No restriction', '14+', '16+', '18+', '21+']} language={language} onChange={(value) => update('minAge', value === 'No restriction' ? null : Number(value.replace('+', '')))} />
          <Select label={t('status')} value={form.status} values={['recruiting', 'closed', 'in_progress', 'completed']} language={language} onChange={(value) => update('status', value as OpportunityStatus)} />
          <Input label={t('volunteerHours')} value={String(form.volunteerHours)} onChange={(value) => update('volunteerHours', Number(value))} type="number" required />
          <Input label={t('languages')} value={form.languages.join(', ')} onChange={(value) => update('languages', parseList(value))} placeholder={t('commaSeparatedPlaceholder')} />
          <Input label={t('badge')} value={form.badges.join(', ')} onChange={(value) => update('badges', parseList(value))} placeholder={t('commaSeparatedPlaceholder')} />
          <TextArea label={t('description')} value={form.description} onChange={(value) => update('description', value)} required />
          <TextArea label={t('requirements')} value={form.requirements} onChange={(value) => update('requirements', value)} />
          <TextArea label={t('benefits')} value={form.benefits} onChange={(value) => update('benefits', value)} />
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-extrabold text-slate-700">
            <input type="checkbox" checked={form.certificateAvailable} onChange={(event) => update('certificateAvailable', event.target.checked)} className="h-5 w-5 accent-emerald-600" />
            {t('certificateAvailable')}
          </label>
        </div>
        <datalist id="dashboard-cities">{formCities.map((city) => <option key={city} value={city} />)}</datalist>
        {error && <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}
        <button disabled={saving} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-leaf px-5 py-3 text-sm font-extrabold text-white disabled:bg-slate-400"><Save size={17} />{saving ? t('saving') : t('saveChanges')}</button>
      </form>
    </main>
  );
}

function OrganizationSetupForm({ language, organization, userId, onCancel, onSaved }: { language: Language; organization: Organization | null; userId: string; onCancel?: () => void; onSaved: (organization: Organization) => Promise<void> }) {
  const { t, localize } = useI18n(language);
  const [form, setForm] = useState<OrganizationInput>(() => ({
    name: organization?.name ?? '',
    description: organization ? localize(organization.description) : '',
    city: organization?.city ?? 'Astana',
    contactEmail: organization?.contactEmail ?? '',
    phone: organization?.phone ?? '',
    website: organization?.website ?? '',
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const update = (key: keyof OrganizationInput, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const saved = organization?.id ? await updateOrganization(organization.id, form) : await createOrganization(userId, form);
      await onSaved(saved);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('organizationProfileSaveFailed'));
    } finally {
      setSaving(false);
    }
  }
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-sm font-extrabold uppercase tracking-wide text-leaf">{t('dashboard')}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{t(organization ? 'editOrganizationProfile' : 'setupOrganizationProfile')}</h1>
        <p className="mt-2 text-slate-600">{t('setupOrganizationProfileText')}</p>
      </div>
      <form onSubmit={submit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <Input label={t('organizationName')} value={form.name} onChange={(value) => update('name', value)} required />
          <Input label={t('city')} value={form.city} onChange={(value) => update('city', value)} required />
          <Input label={t('contactEmail')} value={form.contactEmail} onChange={(value) => update('contactEmail', value)} type="email" required />
          <Input label={t('phone')} value={form.phone} onChange={(value) => update('phone', value)} />
          <Input label={t('website')} value={form.website} onChange={(value) => update('website', value)} />
          <TextArea label={t('description')} value={form.description} onChange={(value) => update('description', value)} required />
        </div>
        {error && <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}
        <div className="mt-6 flex gap-2">
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-leaf px-5 py-3 text-sm font-extrabold text-white disabled:bg-slate-400"><Save size={17} />{saving ? t('saving') : t('saveChanges')}</button>
          {onCancel && <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700">{t('cancel')}</button>}
        </div>
      </form>
    </main>
  );
}

function DashboardHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>{action && <button onClick={onAction} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-extrabold text-slate-700 transition-colors hover:border-ocean hover:text-ocean"><Plus size={16} />{action}</button>}</div>;
}

function DashboardMetric({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return <div className="flex items-center gap-3 rounded-2xl bg-mist p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-leaf">{icon}</div><div><div className="text-2xl font-extrabold">{value}</div><div className="text-xs font-bold text-slate-500">{label}</div></div></div>;
}

function DashboardState({ title, text }: { title: string; text?: string }) {
  return <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8"><EmptyState title={title} text={text ?? title} /></main>;
}

function StatusBadge({ status, label }: { status: ApplicationStatus; label: string }) {
  const tone = status === 'completed' ? 'bg-mint text-leaf' : status === 'accepted' ? 'bg-skysoft text-ocean' : status === 'rejected' || status === 'cancelled' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600';
  return <span className={`${tone} rounded-full px-3 py-1 text-xs font-extrabold`}>{label}</span>;
}

function Input({ label, value, onChange, required, type = 'text', placeholder, list }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; placeholder?: string; list?: string }) {
  return <label className="grid gap-2"><span className="text-sm font-extrabold text-slate-700">{label}</span><input required={required} type={type} min={type === 'number' ? 0 : undefined} list={list} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-12 rounded-2xl border border-slate-200 px-4 text-sm font-semibold focus:border-ocean focus:outline-none focus:ring-4 focus:ring-ocean/15" /></label>;
}

function TextArea({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <label className="grid gap-2 md:col-span-2"><span className="text-sm font-extrabold text-slate-700">{label}</span><textarea required={required} rows={4} value={value} onChange={(event) => onChange(event.target.value)} className="resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold focus:border-ocean focus:outline-none focus:ring-4 focus:ring-ocean/15" /></label>;
}

function Select({ label, value, values, language, onChange }: { label: string; value: string; values: string[]; language: Language; onChange: (value: string) => void }) {
  return <label className="grid gap-2"><span className="text-sm font-extrabold text-slate-700">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold focus:border-ocean focus:outline-none">{values.map((item) => <option key={item} value={item}>{labelFor(item, language)}</option>)}</select></label>;
}

function opportunityToInput(opportunity: Opportunity | undefined, localize: (value: Opportunity['title']) => string): OpportunityInput {
  return {
    title: opportunity ? localize(opportunity.title) : '',
    description: opportunity ? localize(opportunity.description) : '',
    city: opportunity?.city ?? 'Astana',
    category: opportunity?.category ?? 'Education',
    format: opportunity?.format ?? 'Offline',
    schedule: opportunity?.schedule ?? 'Flexible',
    languages: opportunity?.languages ?? [],
    badges: opportunity?.badges.filter((badge) => badge !== 'Certificate') ?? [],
    requirements: opportunity?.requirements[0] ? localize(opportunity.requirements[0]) : '',
    benefits: opportunity?.benefits[0] ? localize(opportunity.benefits[0]) : '',
    volunteerHours: opportunity?.volunteerHours ?? 0,
    minAge: opportunity?.minAge ?? null,
    certificateAvailable: opportunity?.certificate ?? false,
    status: opportunity?.status ?? 'recruiting',
  };
}

function parseList(value: string) {
  return [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];
}
