import { Category, Filters } from '../types';

export const categories: Category[] = [
  { name: 'Education', tone: 'bg-skysoft text-ocean' },
  { name: 'Health', tone: 'bg-mint text-leaf' },
  { name: 'Environment', tone: 'bg-emerald-50 text-emerald-700' },
  { name: 'Animals', tone: 'bg-amber-50 text-amber-700' },
  { name: 'Community', tone: 'bg-indigo-50 text-indigo-700' },
  { name: 'Events', tone: 'bg-violet-50 text-violet-700' },
  { name: 'Media', tone: 'bg-rose-50 text-rose-700' },
  { name: 'IT & Digital', tone: 'bg-cyan-50 text-cyan-700' },
  { name: 'Charity', tone: 'bg-orange-50 text-orange-700' },
  { name: 'Youth', tone: 'bg-lime-50 text-lime-700' },
];

// Creation-form suggestions only. Search filters are derived from Supabase rows.
export const formCities = ['Astana', 'Almaty', 'Shymkent', 'Karaganda', 'Aktobe', 'Atyrau', 'Pavlodar', 'Semey', 'Kostanay', 'Kyzylorda', 'Online'];
export const formFormats = ['Offline', 'Online', 'Hybrid'];
export const formSchedules = ['Few hours', 'Weekend', 'Part-time', 'Project', 'Flexible'];

export const initialFilters: Filters = {
  query: '',
  city: 'All cities',
  category: 'All categories',
  format: 'All formats',
  schedule: 'Any schedule',
  language: 'Any language',
  languages: [],
  badge: 'Any badge',
  badges: [],
  sort: 'relevant',
};
