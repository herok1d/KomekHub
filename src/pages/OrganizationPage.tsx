import { BriefcaseBusiness, ExternalLink, Mail, MapPin, Phone, Star, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { labelFor } from '../i18n/labels';
import { useI18n } from '../i18n/useI18n';
import { Application, Language, Opportunity, Organization, Page, UserRole } from '../types';
import { OpportunityCard } from '../components/OpportunityCard';
import { EmptyState, SearchInput, SectionHeader } from '../components/ui';

export function OrganizationPage({
  language,
  opportunities,
  organizations,
  savedIds,
  selectedOrganizationId,
  userRole,
  currentUserId,
  onNavigate,
  onOpenOrganization,
  onOpenOpportunity,
  onApply,
  onSave,
  applicationByOpportunity,
  onWithdraw,
}: {
  language: Language;
  opportunities: Opportunity[];
  organizations: Organization[];
  savedIds: string[];
  selectedOrganizationId?: string;
  userRole?: UserRole;
  currentUserId?: string;
  onNavigate: (page: Page) => void;
  onOpenOrganization: (id?: string) => void;
  onOpenOpportunity: (id: string) => void;
  onApply: (id: string) => void;
  onSave: (id: string) => void;
  applicationByOpportunity: Map<string, Application>;
  onWithdraw: (id: string) => void;
}) {
  const { t, localize } = useI18n(language);
  const [search, setSearch] = useState('');
  const filteredOrganizations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return organizations;
    return organizations.filter((organization) => {
      const searchable = [
        organization.name,
        organization.city,
        labelFor(organization.city, language),
        localize(organization.description),
      ].join(' ').toLowerCase();
      return searchable.includes(query);
    });
  }, [language, localize, organizations, search]);
  const selected = filteredOrganizations.find((organization) => organization.id === selectedOrganizationId) ?? filteredOrganizations[0];
  const published = selected ? opportunities.filter((item) => item.organizationId === selected.id || item.organization === selected.name) : [];
  const openCount = published.filter((item) => item.status === 'recruiting').length;
  const applicationCount = published.reduce((sum, item) => sum + item.applicationCount, 0);
  const canPostForSelectedOrganization = userRole === 'organization' && Boolean(currentUserId) && selected?.ownerId === currentUserId;

  if (organizations.length === 0) {
    return <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8"><EmptyState title={t('organizationsTitle')} text={t('noOrganizationsYet')} /></main>;
  }

  if (!selected) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t('navOrganizations')} title={t('organizationsTitle')} />
        <div className="mb-5 max-w-2xl">
          <SearchInput value={search} onChange={setSearch} placeholder={t('organizationSearchPlaceholder')} />
        </div>
        <EmptyState title={t('noOrganizationsFound')} text={t('organizationSearchPlaceholder')} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SectionHeader eyebrow={t('navOrganizations')} title={t('organizationsTitle')} />
      <div className="mb-5 max-w-2xl">
        <SearchInput value={search} onChange={setSearch} placeholder={t('organizationSearchPlaceholder')} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft">
          <div className="grid gap-3">
            {filteredOrganizations.map((organization) => {
              const active = organization.id === selected.id;
              const count = opportunities.filter((item) => item.organizationId === organization.id || item.organization === organization.name).length;
              return (
                <button
                  key={organization.id ?? organization.name}
                  onClick={() => onOpenOrganization(organization.id)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${active ? 'border-ocean bg-skysoft' : 'border-slate-100 hover:border-ocean/30 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <img src={organization.logo} alt={organization.name} className="h-14 w-14 rounded-2xl object-cover" />
                    <div>
                      <h3 className="font-extrabold text-slate-900">{organization.name}</h3>
                      <p className="text-sm font-semibold text-slate-500">{labelFor(organization.city, language)}</p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{localize(organization.description)}</p>
                  <p className="mt-2 text-xs font-extrabold text-ocean">{count} {t('publishedByOrg').toLowerCase()}</p>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
              <div className="flex gap-4">
                <img src={selected.logo} alt={selected.name} className="h-20 w-20 rounded-3xl object-cover shadow-soft" />
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-wide text-leaf">{t('organizationProfile')}</p>
                  <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{selected.name}</h1>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5"><MapPin size={16} />{labelFor(selected.city, language)}</span>
                    {selected.contactEmail && <span className="flex items-center gap-1.5"><Mail size={16} />{selected.contactEmail}</span>}
                    {selected.phone && <span className="flex items-center gap-1.5"><Phone size={16} />{selected.phone}</span>}
                    {selected.website && <a href={selected.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-ocean"><ExternalLink size={16} />{t('website')}</a>}
                  </div>
                </div>
              </div>
              {canPostForSelectedOrganization && (
                <button onClick={() => onNavigate('post')} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-slate-800">
                  <BriefcaseBusiness size={18} />{t('postOpportunity')}
                </button>
              )}
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">{localize(selected.description)}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <OrgMetric icon={<BriefcaseBusiness size={18} />} value={published.length} label={t('publishedByOrg')} />
              <OrgMetric icon={<Star size={18} />} value={openCount} label={t('openOpportunitiesCount')} />
              <OrgMetric icon={<Users size={18} />} value={applicationCount} label={t('applications')} />
            </div>
          </div>

          <section className="mt-8">
            <SectionHeader eyebrow={selected.name} title={t('publishedByOrg')} />
            {published.length === 0 ? (
              <EmptyState title={t('publishedByOrg')} text={t('noOrganizationOpportunities')} />
            ) : (
              <div className="grid gap-5">
                {published.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    language={language}
                    onOpen={() => onOpenOpportunity(opportunity.id)}
                    onOpenOrganization={() => onOpenOrganization(opportunity.organizationId)}
                    onApply={() => onApply(opportunity.id)}
                    isSaved={savedIds.includes(opportunity.id)}
                    application={applicationByOpportunity.get(opportunity.id)}
                    onToggleSave={() => onSave(opportunity.id)}
                    onWithdraw={() => onWithdraw(opportunity.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function OrgMetric({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-mist p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ocean">{icon}</div>
      <div>
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="text-xs font-bold text-slate-500">{label}</div>
      </div>
    </div>
  );
}
