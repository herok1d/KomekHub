import { ArrowRight } from 'lucide-react';
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
    language: string;
    badge: string;
    searchButton: string;
  };
  onSearch?: () => void;
  options: FilterOptions;
}) {
  const toOptions = (values: string[]) => values.map((value) => ({ value, label: labelFor(value, language) }));

  return (
    <div className="grid gap-3">
      <SearchInput value={filters.query} placeholder={labels.searchPlaceholder} onChange={(query) => setFilters({ ...filters, query })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectCombobox label={labels.city} value={filters.city} options={toOptions(options.cities)} onChange={(city) => setFilters({ ...filters, city })} />
        <SelectCombobox label={labels.category} value={filters.category} options={toOptions(options.categories)} onChange={(category) => setFilters({ ...filters, category })} />
        <SelectCombobox label={labels.format} value={filters.format} options={toOptions(options.formats)} onChange={(format) => setFilters({ ...filters, format })} />
        <SelectCombobox label={labels.schedule} value={filters.schedule} options={toOptions(options.schedules)} onChange={(schedule) => setFilters({ ...filters, schedule })} />
        <SelectCombobox label={labels.language} value={filters.language} options={toOptions(options.languages)} onChange={(nextLanguage) => setFilters({ ...filters, language: nextLanguage })} />
        <SelectCombobox label={labels.badge} value={filters.badge} options={toOptions(options.badges)} onChange={(badge) => setFilters({ ...filters, badge })} />
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
