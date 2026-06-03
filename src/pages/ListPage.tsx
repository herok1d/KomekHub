import { SlidersHorizontal } from 'lucide-react';
import { initialFilters } from '../data/mockData';
import { useI18n } from '../i18n/useI18n';
import { Filters, Language, Opportunity } from '../types';
import { SearchPanel } from '../components/SearchPanel';
import { EmptyState } from '../components/ui';
import { OpportunityCard } from '../components/OpportunityCard';
import { SelectCombobox } from '../components/ui/SelectCombobox';

export function ListPage({
  language,
  filters,
  setFilters,
  opportunities,
  onOpenOpportunity,
  onApply,
  savedIds,
  appliedIds,
  onSave,
}: {
  language: Language;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  opportunities: Opportunity[];
  onOpenOpportunity: (id: number) => void;
  onApply: (id: number) => void;
  savedIds: number[];
  appliedIds: number[];
  onSave: (id: number) => void;
}) {
  const { t } = useI18n(language);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-leaf">{t('marketplace')}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{t('listTitle')}</h1>
          <p className="mt-2 max-w-2xl text-slate-600">{t('listSubtitle')}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4 text-lg font-extrabold">{t('filters')}</div>
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
          />
          <button
            onClick={() => setFilters(initialFilters)}
            className="pressable mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {t('resetFilters')}
          </button>
        </aside>

        <section className="min-w-0">
          <div className="relative z-20 mb-4 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft sm:flex-row sm:items-end sm:justify-between">
            <div className="text-base font-extrabold text-slate-700">
              {opportunities.length} {t('found')}
            </div>
            <div className="w-full sm:w-[280px]">
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
            <EmptyState title={t('noResultsTitle')} text={t('noResultsText')} action={t('resetFilters')} onAction={() => setFilters(initialFilters)} />
          ) : (
            <div className="grid gap-4">
              {opportunities.map((item) => (
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
        </section>
      </div>
    </main>
  );
}
