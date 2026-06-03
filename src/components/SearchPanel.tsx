import { ArrowRight } from 'lucide-react';
import { badgeOptions, categories, cities, formats, languages, schedules } from '../data/mockData';
import { Filters } from '../types';
import { SearchInput, Select } from './ui';

export function SearchPanel({
  filters,
  setFilters,
  labels,
  onSearch,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
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
}) {
  const categoryOptions = ['All categories', ...categories.map((category) => category.name)];

  return (
    <div className="grid gap-3">
      <SearchInput value={filters.query} placeholder={labels.searchPlaceholder} onChange={(query) => setFilters({ ...filters, query })} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Select label={labels.city} value={filters.city} options={cities} onChange={(city) => setFilters({ ...filters, city })} />
        <Select label={labels.category} value={filters.category} options={categoryOptions} onChange={(category) => setFilters({ ...filters, category })} />
        <Select label={labels.format} value={filters.format} options={formats} onChange={(format) => setFilters({ ...filters, format })} />
        <Select label={labels.schedule} value={filters.schedule} options={schedules} onChange={(schedule) => setFilters({ ...filters, schedule })} />
        <Select label={labels.language} value={filters.language} options={languages} onChange={(language) => setFilters({ ...filters, language })} />
        <Select label={labels.badge} value={filters.badge} options={badgeOptions} onChange={(badge) => setFilters({ ...filters, badge })} />
      </div>
      {onSearch && (
        <button
          onClick={onSearch}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-ocean px-6 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-blue-600"
        >
          {labels.searchButton}
          <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}
