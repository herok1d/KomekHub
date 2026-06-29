import { ArrowRight, BookOpen, Building2, CheckCircle2, HeartHandshake, Leaf, Palette, Sparkles, Stethoscope, Users } from 'lucide-react';
import { categories } from '../data/mockData';
import { labelFor } from '../i18n/labels';
import { useI18n } from '../i18n/useI18n';
import { Application, Filters, Language, Opportunity, Page } from '../types';
import { OpportunityCard } from '../components/OpportunityCard';
import { EmptyState, SearchInput, SectionHeader } from '../components/ui';

const icons = [BookOpen, Stethoscope, Leaf, HeartHandshake, Users, Sparkles, Palette, Building2];

export function HomePage({
  language,
  filters,
  setFilters,
  opportunities,
  featuredOpportunities,
  onNavigate,
  onOpenOpportunity,
  onOpenOrganization,
  onApply,
  savedIds,
  appliedIds,
  onSave,
  applicationByOpportunity,
  onWithdraw,
}: {
  language: Language;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  opportunities: Opportunity[];
  featuredOpportunities: Opportunity[];
  onNavigate: (page: Page) => void;
  onOpenOpportunity: (id: string) => void;
  onOpenOrganization: (id?: string) => void;
  onApply: (id: string) => void;
  savedIds: string[];
  appliedIds: string[];
  onSave: (id: string) => void;
  applicationByOpportunity: Map<string, Application>;
  onWithdraw: (id: string) => void;
}) {
  const { t } = useI18n(language);
  const categoryCounts = new Map<string, number>();
  opportunities.forEach((opportunity) => categoryCounts.set(opportunity.category, (categoryCounts.get(opportunity.category) ?? 0) + 1));

  return (
    <main>
      <section className="hero-photo">
        <div className="mx-auto grid min-h-[520px] max-w-7xl items-end px-4 py-8 sm:min-h-[620px] sm:px-6 sm:py-10 lg:min-h-[640px] lg:px-8">
          <div className="grid w-full gap-6 pb-2 sm:gap-8 sm:pb-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="max-w-3xl text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-2 text-xs font-semibold ring-1 ring-white/20 sm:mb-5 sm:px-4 sm:text-sm">
                <Sparkles size={16} />
                {t('heroBadge')}
              </div>
              <h1 className="text-3xl font-extrabold leading-[1.12] tracking-tight min-[410px]:text-4xl sm:text-5xl lg:text-6xl">{t('heroTitle')}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/88 sm:mt-5 sm:text-lg sm:leading-8">{t('heroSubtitle')}</p>
            </div>
            <div className="glass-panel rounded-3xl p-3 shadow-lift sm:rounded-[2rem] sm:p-5">
              <div className="grid gap-3">
                <SearchInput value={filters.query} placeholder={t('searchPlaceholder')} onChange={(query) => setFilters({ ...filters, query })} />
                <button
                  onClick={() => onNavigate('list')}
                  className="pressable flex h-14 items-center justify-center gap-2 rounded-2xl bg-ocean px-6 text-base font-extrabold text-white shadow-soft transition hover:bg-blue-600"
                >
                  {t('searchButton')}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <SectionHeader eyebrow={t('exploreByInterest')} title={t('popularCategories')} action={t('browseAll')} onAction={() => onNavigate('list')} />
        {opportunities.length === 0 ? (
          <EmptyState title={t('noOpportunitiesYet')} text={t('noOpportunitiesYetText')} />
        ) : (
          <div className="grid gap-3 min-[380px]:grid-cols-2 sm:gap-4 lg:grid-cols-5">
            {categories.map((category, index) => {
              const Icon = icons[index % icons.length];
              const count = categoryCounts.get(category.name) ?? 0;
              return (
                <button
                  key={category.name}
                  onClick={() => {
                    setFilters({ ...filters, category: category.name });
                    onNavigate('list');
                  }}
                  className="group min-h-40 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-soft transition-shadow duration-200 hover:border-ocean/30 hover:shadow-lift sm:min-h-0 sm:p-5"
                >
                  <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl sm:mb-5 sm:h-12 sm:w-12 ${category.tone}`}>
                    <Icon size={24} />
                  </span>
                  <div className="break-words text-base font-bold sm:text-lg">{labelFor(category.name, language)}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {count} {t('openOpportunities')}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <SectionHeader eyebrow={t('curatedPicks')} title={t('featuredOpportunities')} action={t('seeMore')} onAction={() => onNavigate('list')} />
          {featuredOpportunities.length === 0 ? (
            <EmptyState title={t('noOpportunitiesYet')} text={t('noOpportunitiesYetText')} />
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {featuredOpportunities.map((item) => (
                <OpportunityCard
                  key={item.id}
                  opportunity={item}
                  language={language}
                  onOpen={() => onOpenOpportunity(item.id)}
                  onOpenOrganization={() => onOpenOrganization(item.organizationId)}
                  onApply={() => onApply(item.id)}
                  isSaved={savedIds.includes(item.id)}
                  application={applicationByOpportunity.get(item.id)}
                  onToggleSave={() => onSave(item.id)}
                  onWithdraw={() => onWithdraw(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <HowItWorks language={language} />
      <Benefits language={language} />
    </main>
  );
}

function HowItWorks({ language }: { language: Language }) {
  const { t } = useI18n(language);
  const steps = [
    [t('stepOneTitle'), t('stepOneText')],
    [t('stepTwoTitle'), t('stepTwoText')],
    [t('stepThreeTitle'), t('stepThreeText')],
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <SectionHeader eyebrow={t('simpleFlow')} title={t('howItWorks')} />
      <div className="grid gap-5 md:grid-cols-3">
        {steps.map(([title, text], index) => (
          <div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-lg font-extrabold text-white">{index + 1}</div>
            <h3 className="text-xl font-extrabold">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Benefits({ language }: { language: Language }) {
  const { t } = useI18n(language);
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:px-8">
        <BenefitCard title={t('forVolunteers')} points={[t('volunteerBenefitOne'), t('volunteerBenefitTwo'), t('volunteerBenefitThree')]} />
        <BenefitCard title={t('forOrganizations')} points={[t('orgBenefitOne'), t('orgBenefitTwo'), t('orgBenefitThree')]} />
      </div>
    </section>
  );
}

function BenefitCard({ title, points }: { title: string; points: string[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-mist p-5 shadow-soft sm:rounded-[2rem] sm:p-7">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-leaf shadow-sm">
        <CheckCircle2 size={24} />
      </div>
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <div className="mt-5 grid gap-3">
        {points.map((point) => (
          <div key={point} className="flex gap-3 text-sm font-semibold text-slate-600">
            <CheckCircle2 className="mt-0.5 shrink-0 text-leaf" size={18} />
            {point}
          </div>
        ))}
      </div>
    </div>
  );
}
