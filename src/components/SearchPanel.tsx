import { ArrowRight, X } from 'lucide-react';
import { labelFor } from '../i18n/labels';
import { FilterOptions, Filters, Language } from '../types';
import { SearchInput } from './ui';
import { SelectCombobox } from './ui/SelectCombobox';

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
        <SelectCombobox label={labels.city} value={filters.city} options={toOptions(options.cities)} onChange={(city) => setFilters({ ...filters, city })} />
        <SelectCombobox label={labels.category} value={filters.category} options={toOptions(options.categories)} onChange={(category) => setFilters({ ...filters, category })} />
        <SelectCombobox label={labels.format} value={filters.format} options={toOptions(options.formats)} onChange={(format) => setFilters({ ...filters, format })} />
        <SelectCombobox label={labels.schedule} value={filters.schedule} options={toOptions(options.schedules)} onChange={(schedule) => setFilters({ ...filters, schedule })} />
        <MultiSelect label={labels.language} values={multiOptions.languages} selected={filters.languages} language={language} onToggle={(value) => toggleListValue('languages', value)} />
        <MultiSelect label={labels.badge} values={multiOptions.badges} selected={filters.badges} language={language} onToggle={(value) => toggleListValue('badges', value)} />
        <SelectCombobox label={labels.age} value={filters.age} options={toOptions(options.ages)} onChange={(age) => setFilters({ ...filters, age })} />
      </div>
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

function MultiSelect({ label, values, selected, language, onToggle }: { label: string; values: string[]; selected: string[]; language: Language; onToggle: (value: string) => void }) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-extrabold text-slate-700">{label}</span>
      <div className="flex min-h-[96px] flex-col rounded-2xl border border-slate-200 bg-white p-3">
        <div className="flex min-h-8 flex-wrap content-start gap-1.5">
          {selected.length > 0 ? (
            selected.map((value) => (
              <button key={value} type="button" onClick={() => onToggle(value)} className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-xs font-extrabold text-leaf">
                {labelFor(value, language)}
                <X size={13} />
              </button>
            ))
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-400">-</span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
          {values.filter((value) => !selected.includes(value)).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-600 transition-colors hover:bg-slate-200"
            >
              {labelFor(value, language)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
