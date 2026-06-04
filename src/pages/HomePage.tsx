import { BookOpen, Building2, CheckCircle2, HeartHandshake, Leaf, Palette, Sparkles, Stethoscope, Users } from 'lucide-react';
import { categories } from '../data/mockData';
import { labelFor } from '../i18n/labels';
import { useI18n } from '../i18n/useI18n';
import { Filters, Language, Opportunity, Page } from '../types';
import { SearchPanel } from '../components/SearchPanel';
import { OpportunityCard } from '../components/OpportunityCard';
import { EmptyState, SectionHeader } from '../components/ui';

const icons = [BookOpen, Stethoscope, Leaf, HeartHandshake, Users, Sparkles, Palette, Building2];

export function HomePage({
  language,
  filters,
  setFilters,
  featuredOpportunities,
  onNavigate,
  onOpenOpportunity,
  onApply,
  savedIds,
  appliedIds,
  onSave,
}: {
  language: Language;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  featuredOpportunities: Opportunity[];
  onNavigate: (page: Page) => void;
  onOpenOpportunity: (id: string) => void;
  onApply: (id: string) => void;
  savedIds: string[];
  appliedIds: string[];
  onSave: (id: string) => void;
}) {
  const { t } = useI18n(language);

  return (
    <main>
      <section className="hero-photo">
        <div className="mx-auto grid min-h-[640px] max-w-7xl items-end px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 pb-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="max-w-3xl text-white">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-sm font-semibold ring-1 ring-white/20">
                <Sparkles size={16} />
                {t('heroBadge')}
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">{t('heroTitle')}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/88">{t('heroSubtitle')}</p>
            </div>
            <div className="glass-panel rounded-[2rem] p-4 shadow-lift sm:p-5">
              <SearchPanel
                filters={filters}
                setFilters={setFilters}
                language={language}
                labels={{
                  searchPlaceholder: t('searchPlaceholder'),
                  city: t('city'),
                  category: t('category'),
                  format: t('format'),
                  schedule: t('schedule'),
                  language: t('language'),
                  badge: t('badge'),
                  searchButton: t('searchButton'),
                }}
                onSearch={() => onNavigate('list')}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t('exploreByInterest')} title={t('popularCategories')} action={t('browseAll')} onAction={() => onNavigate('list')} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category, index) => {
            const Icon = icons[index % icons.length];
            return (
              <button
                key={category.name}
                onClick={() => {
                  setFilters({ ...filters, category: category.name });
                  onNavigate('list');
                }}
                className="group rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-soft transition-shadow duration-200 hover:border-ocean/30 hover:shadow-lift"
              >
                <span className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${category.tone}`}>
                  <Icon size={24} />
                </span>
                <div className="text-lg font-bold">{labelFor(category.name, language)}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {category.count} {t('openOpportunities')}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeader eyebrow={t('curatedPicks')} title={t('featuredOpportunities')} action={t('seeMore')} onAction={() => onNavigate('list')} />
          {featuredOpportunities.length === 0 ? (
            <EmptyState title={t('noResultsTitle')} text={t('noResultsText')} action={t('browseAll')} onAction={() => onNavigate('list')} />
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              {featuredOpportunities.map((item) => (
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
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader eyebrow={t('simpleFlow')} title={t('howItWorks')} />
      <div className="grid gap-5 md:grid-cols-3">
        {steps.map(([title, text], index) => (
          <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
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
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <BenefitCard title={t('forVolunteers')} points={[t('volunteerBenefitOne'), t('volunteerBenefitTwo'), t('volunteerBenefitThree')]} />
        <BenefitCard title={t('forOrganizations')} points={[t('orgBenefitOne'), t('orgBenefitTwo'), t('orgBenefitThree')]} />
      </div>
    </section>
  );
}

function BenefitCard({ title, points }: { title: string; points: string[] }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-mist p-7 shadow-soft">
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
