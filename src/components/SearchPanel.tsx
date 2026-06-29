import { ArrowRight, Check } from 'lucide-react';
import { labelFor } from '../i18n/labels';
import { FilterOptions, Filters, Language } from '../types';
import { SearchInput } from './ui';
import { SelectCombobox } from './ui/SelectCombobox';

const filterLabelClass = 'mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500';

export function SearchPanel({
  filters,
  setFilters,
  labels,
  onSearch,
  language,
  options,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  language: Language;
  labels: {
    searchPlaceholder: string;
    city: string;
    category: string;
    format: string;
    schedule: string;
    age: string;
    language: string;
    badge: string;
    searchButton: string;
  };
  onSearch?: () => void;
  options: FilterOptions;
}) {
  const toOptions = (values: string[]) => values.map((value) => ({ value, label: labelFor(value, language) }));
  const toggleListValue = (key: 'languages' | 'badges', value: string) => {
    const current = filters[key];
    setFilters({ ...filters, [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] });
  };
  const multiOptions = {
    languages: options.languages.filter((item) => item !== 'Any language'),
    badges: options.badges.filter((item) => item !== 'Any badge'),
  };

  return (
    <div className="grid gap-3">
      <SearchInput value={filters.query} placeholder={labels.searchPlaceholder} onChange={(query) => setFilters({ ...filters, query })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectCombobox label={labels.city} labelClassName={filterLabelClass} value={filters.city} options={toOptions(options.cities)} onChange={(city) => setFilters({ ...filters, city })} />
        <SelectCombobox label={labels.category} labelClassName={filterLabelClass} value={filters.category} options={toOptions(options.categories)} onChange={(category) => setFilters({ ...filters, category })} />
        <SelectCombobox label={labels.format} labelClassName={filterLabelClass} value={filters.format} options={toOptions(options.formats)} onChange={(format) => setFilters({ ...filters, format })} />
        <SelectCombobox label={labels.schedule} labelClassName={filterLabelClass} value={filters.schedule} options={toOptions(options.schedules)} onChange={(schedule) => setFilters({ ...filters, schedule })} />
      </div>
      <SelectCombobox label={labels.age} labelClassName={filterLabelClass} value={filters.age} options={toOptions(options.ages)} onChange={(age) => setFilters({ ...filters, age })} />
      <LanguageSelect label={labels.language} values={multiOptions.languages} selected={filters.languages} language={language} onToggle={(value) => toggleListValue('languages', value)} />
      <BadgeSelect label={labels.badge} values={multiOptions.badges} selected={filters.badges} language={language} onToggle={(value) => toggleListValue('badges', value)} />
      {onSearch && (
        <button
          onClick={onSearch}
          className="pressable flex h-14 items-center justify-center gap-2 rounded-2xl bg-ocean px-6 text-base font-extrabold text-white shadow-soft transition hover:bg-blue-600"
        >
          {labels.searchButton}
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}

function LanguageSelect({ label, values, selected, language, onToggle }: { label: string; values: string[]; selected: string[]; language: Language; onToggle: (value: string) => void }) {
  return (
    <div className="grid gap-2">
      <span className={filterLabelClass}>{label}</span>
      <div className="grid grid-cols-3 gap-2">
        {values.map((value) => {
          const active = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className={`flex h-11 min-w-0 items-center justify-center rounded-xl border px-1.5 text-center text-[11px] font-extrabold transition-colors min-[400px]:px-2 min-[400px]:text-xs ${
                active
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-800 shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="truncate">{labelFor(value, language)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BadgeSelect({ label, values, selected, language, onToggle }: { label: string; values: string[]; selected: string[]; language: Language; onToggle: (value: string) => void }) {
  return (
    <div className="grid gap-2">
      <span className={filterLabelClass}>{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => {
          const active = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-extrabold transition-colors ${
                active
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {active && <Check size={12} />}
              <span>{labelFor(value, language)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
