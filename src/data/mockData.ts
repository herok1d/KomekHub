import { Category, Filters } from '../types';

export const cities = ['All Kazakhstan', 'Astana', 'Almaty', 'Shymkent', 'Karaganda', 'Aktobe', 'Atyrau', 'Pavlodar', 'Semey', 'Kostanay', 'Kyzylorda', 'Online'];
export const formats = ['All formats', 'Offline', 'Online', 'Hybrid'];
export const schedules = ['Any schedule', 'Few hours', 'Weekend', 'Part-time', 'Project', 'Flexible'];
export const languages = ['Any language', 'Kazakh', 'Russian', 'English'];
export const badgeOptions = ['Any badge', 'Student-friendly', 'Certificate', 'Urgent', 'Online'];

export const categories: Category[] = [
  { name: 'Education', count: 54, tone: 'bg-skysoft text-ocean' },
  { name: 'Health', count: 31, tone: 'bg-mint text-leaf' },
  { name: 'Environment', count: 38, tone: 'bg-emerald-50 text-emerald-700' },
  { name: 'Animals', count: 17, tone: 'bg-amber-50 text-amber-700' },
  { name: 'Community', count: 63, tone: 'bg-indigo-50 text-indigo-700' },
  { name: 'Events', count: 29, tone: 'bg-violet-50 text-violet-700' },
  { name: 'Media', count: 22, tone: 'bg-rose-50 text-rose-700' },
  { name: 'IT & Digital', count: 18, tone: 'bg-cyan-50 text-cyan-700' },
  { name: 'Charity', count: 41, tone: 'bg-orange-50 text-orange-700' },
  { name: 'Youth', count: 36, tone: 'bg-lime-50 text-lime-700' },
];

export const initialFilters: Filters = {
  query: '',
  city: 'All Kazakhstan',
  category: 'All categories',
  format: 'All formats',
  schedule: 'Any schedule',
  language: 'Any language',
  badge: 'Any badge',
  sort: 'relevant',
};
