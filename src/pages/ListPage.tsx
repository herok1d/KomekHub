import { SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { initialFilters } from '../data/mockData';
import { useI18n } from '../i18n/useI18n';
import { Application, FilterOptions, Filters, Language, Opportunity } from '../types';
import { SearchPanel } from '../components/SearchPanel';
import { EmptyState } from '../components/ui';
import { OpportunityCard } from '../components/OpportunityCard';
import { SelectCombobox } from '../components/ui/SelectCombobox';

export function ListPage({
  language,
  filters,
  setFilters,
  opportunities,
  totalOpportunityCount,
  filterOptions,
  onOpenOpportunity,
  onOpenOrganization,
  onApply,
  savedIds,
  appliedIds,
  applicationByOpportunity,
  onSave,
  onWithdraw,
}: {
  language: Language;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  opportunities: Opportunity[];
  totalOpportunityCount: number;
  filterOptions: FilterOptions;
  onOpenOpportunity: (id: string) => void;
  onOpenOrganization: (id?: string) => void;
  onApply: (id: string) => void;
  savedIds: string[];
  appliedIds: string[];
  applicationByOpportunity: Map<string, Application>;
  onSave: (id: string) => void;
  onWithdraw: (id: string) => void;
}) {
  const { t } = useI18n(language);
  const [draftFilters, setDraftFilters] = useState(filters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileFiltersOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [mobileFiltersOpen]);

  const resetFilters = () => {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
  };

  const applyDraftFilters = () => {
    setFilters(draftFilters);
    setMobileFiltersOpen(false);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-5 sm:mb-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-leaf">{t('marketplace')}</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-4xl">{t('listTitle')}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{t('listSubtitle')}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <aside className="hidden h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-soft lg:block">
          <div className="mb-4 text-lg font-extrabold">{t('filters')}</div>
          <SearchPanel
            filters={draftFilters}
            setFilters={setDraftFilters}
            language={language}
            options={filterOptions}
            labels={{
              searchPlaceholder: t('searchPlaceholder'),
              city: t('city'),
              category: t('category'),
              format: t('format'),
              schedule: t('schedule'),
              age: t('ageRequirement'),
              language: t('language'),
              badge: t('badge'),
              searchButton: t('applyFilters'),
            }}
            onSearch={applyDraftFilters}
          />
          <button
            onClick={resetFilters}
            className="pressable mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {t('resetFilters')}
          </button>
        </aside>

        <section className="min-w-0">
          <div className="relative z-20 mb-4 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft sm:grid-cols-[1fr_280px] sm:items-end">
            <div className="flex min-h-12 items-center justify-between gap-3 sm:self-end">
              <div className="text-sm font-extrabold text-slate-700 sm:text-base">
                {opportunities.length} {t('found')}
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-700 lg:hidden"
              >
                <SlidersHorizontal size={17} />
                {t('filters')}
              </button>
            </div>
            <div className="w-full">
              <SelectCombobox
                label={t('sortBy')}
                value={filters.sort}
                onChange={(sort) => setFilters({ ...filters, sort: sort as Filters['sort'] })}
                icon={<SlidersHorizontal size={17} />}
                options={[
                  { value: 'relevant', label: t('mostRelevant') },
                  { value: 'newest', label: t('newest') },
                  { value: 'nearest', label: t('nearest') },
                  { value: 'popular', label: t('mostPopular') },
                ]}
              />
            </div>
          </div>
          {opportunities.length === 0 ? (
            totalOpportunityCount === 0 ? (
              <EmptyState title={t('noOpportunitiesYet')} text={t('noOpportunitiesYetText')} />
            ) : (
              <EmptyState title={t('noResultsTitle')} text={t('noResultsText')} action={t('resetFilters')} onAction={() => setFilters(initialFilters)} />
            )
          ) : (
            <div className="grid gap-4">
              {opportunities.map((item) => (
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
        </section>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-filters-title">
          <button type="button" className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" aria-label={t('closeFilters')} onClick={() => setMobileFiltersOpen(false)} />
          <section className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl">
            <div className="flex min-h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
              <h2 id="mobile-filters-title" className="text-lg font-extrabold text-ink">{t('filters')}</h2>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label={t('closeFilters')}>
                <X size={21} />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-4 py-4">
              <SearchPanel
                filters={draftFilters}
                setFilters={setDraftFilters}
                language={language}
                options={filterOptions}
                labels={{
                  searchPlaceholder: t('searchPlaceholder'),
                  city: t('city'),
                  category: t('category'),
                  format: t('format'),
                  schedule: t('schedule'),
                  age: t('ageRequirement'),
                  language: t('language'),
                  badge: t('badge'),
                  searchButton: t('applyFilters'),
                }}
              />
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-slate-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
              <button type="button" onClick={resetFilters} className="min-h-12 rounded-2xl border border-slate-200 px-3 text-sm font-extrabold text-slate-700">
                {t('resetFilters')}
              </button>
              <button type="button" onClick={applyDraftFilters} className="min-h-12 rounded-2xl bg-ocean px-3 text-sm font-extrabold text-white">
                {t('applyFilters')}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
