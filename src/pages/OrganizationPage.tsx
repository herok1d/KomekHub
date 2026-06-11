import { BriefcaseBusiness, Star } from 'lucide-react';
import { labelFor } from '../i18n/labels';
import { useI18n } from '../i18n/useI18n';
import { Language, Opportunity, Organization, Page } from '../types';
import { OpportunityCard } from '../components/OpportunityCard';
import { EmptyState, SectionHeader } from '../components/ui';

export function OrganizationPage({
  language,
  opportunities,
  organizations,
  savedIds,
  appliedIds,
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
  onNavigate: (page: Page) => void;
  onOpenOpportunity: (id: string) => void;
  onApply: (id: string) => void;
  onSave: (id: string) => void;
}) {
  const { t, localize } = useI18n(language);
  const featured = organizations[0];
  const published = featured ? opportunities.filter((item) => item.organizationId === featured.id || item.organization === featured.name) : [];

  if (!featured) {
    return <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8"><EmptyState title={t('organizationsTitle')} text={t('noOrganizationsYet')} /></main>;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <img src={featured.logo} alt={featured.name} className="h-28 w-28 rounded-3xl object-cover shadow-soft" />
          <h1 className="mt-5 text-3xl font-extrabold">{featured.name}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{localize(featured.description)}</p>
          {featured.reviews > 0 && <div className="mt-5 flex items-center gap-2 text-sm font-bold text-amber-600"><Star size={18} fill="currentColor" />{featured.rating} - {featured.reviews} {t('reviews')}</div>}
          <button onClick={() => onNavigate('post')} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3.5 text-base font-extrabold text-white transition-colors hover:bg-slate-800">
            <BriefcaseBusiness size={18} />{t('postOpportunity')}
          </button>
        </aside>

        <section>
          <SectionHeader eyebrow={t('navOrganizations')} title={t('organizationsTitle')} />
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            {organizations.map((organization) => (
              <div key={organization.id ?? organization.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex items-center gap-4">
                  <img src={organization.logo} alt={organization.name} className="h-14 w-14 rounded-2xl object-cover" />
                  <div><h3 className="font-extrabold">{organization.name}</h3><p className="text-sm font-semibold text-slate-500">{labelFor(organization.city, language)}</p></div>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{localize(organization.description)}</p>
              </div>
            ))}
          </div>

          <SectionHeader eyebrow={featured.name} title={t('publishedByOrg')} />
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
                  onApply={() => onApply(opportunity.id)}
                  isSaved={savedIds.includes(opportunity.id)}
                  isApplied={appliedIds.includes(opportunity.id)}
                  onToggleSave={() => onSave(opportunity.id)}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
