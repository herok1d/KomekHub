import { FormEvent, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Filter,
  Heart,
  HeartHandshake,
  MapPin,
  Menu,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserRound,
  X,
} from 'lucide-react';
import { categories, Opportunity, opportunities, organizations } from './data';

type Page = 'home' | 'list' | 'detail' | 'profile' | 'organization' | 'post';
type Filters = {
  query: string;
  city: string;
  category: string;
  format: string;
  employment: string;
  sort: 'newest' | 'relevant' | 'nearest';
};

const initialFilters: Filters = {
  query: '',
  city: 'All cities',
  category: 'All categories',
  format: 'All formats',
  employment: 'Any schedule',
  sort: 'relevant',
};

const cities = ['All cities', 'New York', 'Remote', 'Austin', 'Chicago', 'Boston'];
const formats = ['All formats', 'Offline', 'Online', 'Hybrid'];
const employments = ['Any schedule', 'Few hours', 'Part-time', 'Weekend', 'Project'];
const categoryOptions = ['All categories', ...categories.map((category) => category.name)];

function classNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(' ');
}

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [selectedId, setSelectedId] = useState(1);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [savedIds, setSavedIds] = useState<number[]>([1, 5]);
  const [toast, setToast] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const selectedOpportunity = opportunities.find((item) => item.id === selectedId) ?? opportunities[0];

  const filteredOpportunities = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase();
    const list = opportunities.filter((item) => {
      const text = `${item.title} ${item.organization} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
      return (
        (!normalizedQuery || text.includes(normalizedQuery)) &&
        (filters.city === 'All cities' || item.city === filters.city) &&
        (filters.category === 'All categories' || item.category === filters.category) &&
        (filters.format === 'All formats' || item.format === filters.format) &&
        (filters.employment === 'Any schedule' || item.employment === filters.employment)
      );
    });

    return [...list].sort((a, b) => {
      if (filters.sort === 'newest') return a.postedDaysAgo - b.postedDaysAgo;
      if (filters.sort === 'nearest') return a.distanceKm - b.distanceKm;
      return b.badges.length + b.tags.length - (a.badges.length + a.tags.length);
    });
  }, [filters]);

  const savedOpportunities = opportunities.filter((item) => savedIds.includes(item.id));

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openOpportunity(id: number) {
    setSelectedId(id);
    navigate('detail');
  }

  function toggleSaved(id: number) {
    setSavedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function showApplicationToast() {
    setToast('Application sent successfully');
    window.setTimeout(() => setToast(''), 2600);
  }

  return (
    <div className="min-h-screen bg-mist text-ink">
      <Navbar activePage={page} onNavigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      {page === 'home' && (
        <HomePage
          filters={filters}
          setFilters={setFilters}
          onNavigate={navigate}
          onOpenOpportunity={openOpportunity}
          onApply={showApplicationToast}
          savedIds={savedIds}
          onSave={toggleSaved}
        />
      )}
      {page === 'list' && (
        <ListPage
          filters={filters}
          setFilters={setFilters}
          opportunities={filteredOpportunities}
          onOpenOpportunity={openOpportunity}
          onApply={showApplicationToast}
          savedIds={savedIds}
          onSave={toggleSaved}
        />
      )}
      {page === 'detail' && (
        <DetailPage
          opportunity={selectedOpportunity}
          onApply={showApplicationToast}
          onOpenOpportunity={openOpportunity}
          isSaved={savedIds.includes(selectedOpportunity.id)}
          onSave={() => toggleSaved(selectedOpportunity.id)}
        />
      )}
      {page === 'profile' && (
        <ProfilePage savedOpportunities={savedOpportunities} onOpenOpportunity={openOpportunity} onApply={showApplicationToast} />
      )}
      {page === 'organization' && <OrganizationPage onNavigate={navigate} onOpenOpportunity={openOpportunity} />}
      {page === 'post' && <PostOpportunityPage onPublished={() => setToast('Opportunity published successfully')} />}
      <Footer onNavigate={navigate} />
      {toast && <Toast message={toast} />}
    </div>
  );
}

function Navbar({
  activePage,
  onNavigate,
  mobileOpen,
  setMobileOpen,
}: {
  activePage: Page;
  onNavigate: (page: Page) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}) {
  const links: Array<{ page: Page; label: string }> = [
    { page: 'home', label: 'Home' },
    { page: 'list', label: 'Opportunities' },
    { page: 'organization', label: 'Organizations' },
    { page: 'profile', label: 'Profile' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-white shadow-soft">
            <HeartHandshake size={22} />
          </span>
          <span className="text-xl font-extrabold tracking-tight">KindWorks</span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <button
              key={link.page}
              onClick={() => onNavigate(link.page)}
              className={classNames(
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                activePage === link.page ? 'bg-slate-100 text-ink' : 'text-slate-600 hover:bg-slate-50 hover:text-ink',
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-ocean hover:text-ocean">
            <Bell size={18} />
          </button>
          <button
            onClick={() => onNavigate('post')}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            Post opportunity
          </button>
        </div>

        <button className="rounded-xl border border-slate-200 p-2 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <div className="grid gap-2">
            {links.map((link) => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </button>
            ))}
            <button onClick={() => onNavigate('post')} className="rounded-xl bg-ink px-4 py-3 text-left text-sm font-bold text-white">
              Post opportunity
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function HomePage({
  filters,
  setFilters,
  onNavigate,
  onOpenOpportunity,
  onApply,
  savedIds,
  onSave,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  onNavigate: (page: Page) => void;
  onOpenOpportunity: (id: number) => void;
  onApply: () => void;
  savedIds: number[];
  onSave: (id: number) => void;
}) {
  return (
    <main>
      <section className="hero-photo">
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-end px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 pb-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="max-w-3xl text-white">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-sm font-semibold ring-1 ring-white/20">
                <Sparkles size={16} />
                180+ verified social impact roles
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
                Find volunteering opportunities that matter
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/88">
                Discover meaningful volunteering by interests, city, format, and the free time you actually have.
              </p>
            </div>
            <div className="glass-panel rounded-[2rem] p-4 shadow-lift sm:p-5">
              <SearchPanel filters={filters} setFilters={setFilters} onSearch={() => onNavigate('list')} compact={false} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Explore by interest" title="Popular categories" action="Browse all" onAction={() => onNavigate('list')} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.name}
                onClick={() => {
                  setFilters({ ...filters, category: category.name });
                  onNavigate('list');
                }}
                className="group rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-soft transition hover:-translate-y-1 hover:border-ocean/30 hover:shadow-lift"
              >
                <span className={classNames('mb-5 flex h-12 w-12 items-center justify-center rounded-2xl', category.tone)}>
                  <Icon size={24} />
                </span>
                <div className="text-lg font-bold">{category.name}</div>
                <div className="mt-1 text-sm text-slate-500">{category.count} open opportunities</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Curated picks" title="Featured opportunities" action="See more" onAction={() => onNavigate('list')} />
          <div className="grid gap-5 lg:grid-cols-3">
            {opportunities.slice(0, 3).map((item) => (
              <OpportunityCard
                key={item.id}
                opportunity={item}
                onOpen={() => onOpenOpportunity(item.id)}
                onApply={onApply}
                isSaved={savedIds.includes(item.id)}
                onSave={() => onSave(item.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <Benefits />
    </main>
  );
}

function SearchPanel({
  filters,
  setFilters,
  onSearch,
  compact,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  onSearch: () => void;
  compact: boolean;
}) {
  return (
    <div className={classNames('grid gap-3', compact ? '' : 'rounded-3xl')}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          value={filters.query}
          onChange={(event) => setFilters({ ...filters, query: event.target.value })}
          placeholder="Search by role, skill, organization, or cause"
          className="focus-ring h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-medium text-ink shadow-sm"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select label="City" value={filters.city} options={cities} onChange={(value) => setFilters({ ...filters, city: value })} />
        <Select
          label="Category"
          value={filters.category}
          options={categoryOptions}
          onChange={(value) => setFilters({ ...filters, category: value })}
        />
        <Select label="Format" value={filters.format} options={formats} onChange={(value) => setFilters({ ...filters, format: value })} />
        <Select
          label="Schedule"
          value={filters.employment}
          options={employments}
          onChange={(value) => setFilters({ ...filters, employment: value })}
        />
      </div>
      <button
        onClick={onSearch}
        className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-ocean px-6 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-blue-600"
      >
        Search opportunities
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-ink shadow-sm"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute bottom-3.5 right-3 text-slate-400" size={17} />
    </label>
  );
}

function ListPage({
  filters,
  setFilters,
  opportunities,
  onOpenOpportunity,
  onApply,
  savedIds,
  onSave,
}: {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  opportunities: Opportunity[];
  onOpenOpportunity: (id: number) => void;
  onApply: () => void;
  savedIds: number[];
  onSave: (id: number) => void;
}) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-leaf">Opportunity marketplace</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Find your next volunteer role</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Filter by city, cause, format, and availability. Apply in one click.</p>
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <SlidersHorizontal size={18} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-600">Sort by</span>
          <select
            value={filters.sort}
            onChange={(event) => setFilters({ ...filters, sort: event.target.value as Filters['sort'] })}
            className="bg-transparent text-sm font-bold focus:outline-none"
          >
            <option value="relevant">Most relevant</option>
            <option value="newest">Newest</option>
            <option value="nearest">Nearest</option>
          </select>
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2 text-lg font-extrabold">
            <Filter size={20} />
            Filters
          </div>
          <SearchPanel filters={filters} setFilters={setFilters} onSearch={() => undefined} compact />
          <button
            onClick={() => setFilters(initialFilters)}
            className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Reset filters
          </button>
        </aside>

        <section>
          <div className="mb-4 text-sm font-semibold text-slate-500">{opportunities.length} opportunities found</div>
          {opportunities.length === 0 ? (
            <EmptyState onReset={() => setFilters(initialFilters)} />
          ) : (
            <div className="grid gap-4">
              {opportunities.map((item) => (
                <OpportunityCard
                  key={item.id}
                  opportunity={item}
                  horizontal
                  onOpen={() => onOpenOpportunity(item.id)}
                  onApply={onApply}
                  isSaved={savedIds.includes(item.id)}
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

function OpportunityCard({
  opportunity,
  onOpen,
  onApply,
  isSaved,
  onSave,
  horizontal = false,
}: {
  opportunity: Opportunity;
  onOpen: () => void;
  onApply: () => void;
  isSaved: boolean;
  onSave: () => void;
  horizontal?: boolean;
}) {
  return (
    <article
      className={classNames(
        'group rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-ocean/30 hover:shadow-lift',
        horizontal && 'lg:p-6',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {opportunity.badges.map((badge) => (
              <Badge key={badge} label={badge} />
            ))}
          </div>
          <button onClick={onOpen} className="text-left text-xl font-extrabold tracking-tight transition group-hover:text-ocean">
            {opportunity.title}
          </button>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Building2 size={16} />
              {opportunity.organization}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={16} />
              {opportunity.city}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={16} />
              {opportunity.duration}
            </span>
          </div>
        </div>
        <button
          onClick={onSave}
          className={classNames(
            'rounded-2xl border p-2.5 transition',
            isSaved ? 'border-leaf bg-mint text-leaf' : 'border-slate-200 text-slate-500 hover:border-ocean hover:text-ocean',
          )}
          aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
        >
          {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </button>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{opportunity.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Pill label={opportunity.format} strong={opportunity.format === 'Online'} />
        <Pill label={opportunity.employment} />
        {opportunity.tags.map((tag) => (
          <Pill key={tag} label={tag} />
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onApply}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-leaf px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"
        >
          <Send size={17} />
          Apply
        </button>
        <button
          onClick={onOpen}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-ink transition hover:border-ocean hover:text-ocean"
        >
          View details
          <ArrowRight size={17} />
        </button>
      </div>
    </article>
  );
}

function DetailPage({
  opportunity,
  onApply,
  onOpenOpportunity,
  isSaved,
  onSave,
}: {
  opportunity: Opportunity;
  onApply: () => void;
  onOpenOpportunity: (id: number) => void;
  isSaved: boolean;
  onSave: () => void;
}) {
  const related = opportunities.filter((item) => item.category === opportunity.category && item.id !== opportunity.id).slice(0, 2);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {opportunity.badges.map((badge) => (
                  <Badge key={badge} label={badge} />
                ))}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">{opportunity.title}</h1>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Building2 size={17} />
                  {opportunity.organization}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={17} />
                  {opportunity.city}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={17} />
                  {opportunity.duration}
                </span>
              </div>
            </div>
            <button
              onClick={onSave}
              className={classNames(
                'inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-extrabold transition',
                isSaved ? 'border-leaf bg-mint text-leaf' : 'border-slate-200 text-slate-600 hover:border-ocean hover:text-ocean',
              )}
            >
              {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>

          <p className="mt-8 text-lg leading-8 text-slate-650">{opportunity.longDescription}</p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <DetailList title="Requirements" items={opportunity.requirements} />
            <DetailList title="Responsibilities" items={opportunity.responsibilities} />
            <DetailList title="What you get" items={opportunity.benefits} />
          </div>
        </section>

        <aside className="grid h-fit gap-5">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <button
              onClick={onApply}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ocean px-5 py-4 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-blue-600"
            >
              Apply now
              <ArrowRight size={18} />
            </button>
            <div className="mt-5 grid gap-3 text-sm text-slate-600">
              <InfoRow icon={<Clock size={18} />} label="Schedule" value={opportunity.employment} />
              <InfoRow icon={<MapPin size={18} />} label="Format" value={opportunity.format} />
              <InfoRow icon={<BriefcaseBusiness size={18} />} label="Category" value={opportunity.category} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-extrabold">About organization</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {organizations.find((org) => org.name === opportunity.organization)?.description ??
                'A verified partner organization with a track record of supporting volunteers.'}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-amber-600">
              <Star size={17} fill="currentColor" />
              4.8 average volunteer rating
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-8">
        <SectionHeader eyebrow="Keep exploring" title="Similar volunteering" />
        <div className="grid gap-5 md:grid-cols-2">
          {(related.length ? related : opportunities.slice(0, 2)).map((item) => (
            <OpportunityCard
              key={item.id}
              opportunity={item}
              onOpen={() => onOpenOpportunity(item.id)}
              onApply={onApply}
              isSaved={false}
              onSave={() => undefined}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function ProfilePage({
  savedOpportunities,
  onOpenOpportunity,
  onApply,
}: {
  savedOpportunities: Opportunity[];
  onOpenOpportunity: (id: number) => void;
  onApply: () => void;
}) {
  const history = opportunities.slice(0, 3);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="h-36 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[280px_1fr]">
          <div className="-mt-20">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80"
              alt="Volunteer avatar"
              className="h-32 w-32 rounded-[2rem] border-4 border-white object-cover shadow-lift"
            />
            <h1 className="mt-5 text-3xl font-extrabold">Maya Johnson</h1>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <MapPin size={17} />
              New York
            </p>
            <div className="mt-5 rounded-3xl bg-mist p-5">
              <div className="text-4xl font-extrabold text-leaf">126</div>
              <div className="text-sm font-semibold text-slate-600">volunteer hours logged</div>
            </div>
          </div>

          <div className="grid gap-6">
            <ProfileChips title="Interests" items={['Education', 'Mental health', 'Community events', 'Accessibility']} />
            <ProfileChips title="Skills" items={['Mentoring', 'Public speaking', 'Research', 'Photography', 'Writing']} />
            <div>
              <h2 className="mb-3 text-xl font-extrabold">Application history</h2>
              <div className="grid gap-3">
                {history.map((item) => (
                  <MiniRow key={item.id} item={item} status={item.id === 2 ? 'Under review' : 'Accepted'} onOpen={() => onOpenOpportunity(item.id)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader eyebrow="Saved roles" title="Saved volunteering" />
        <div className="grid gap-5 md:grid-cols-2">
          {savedOpportunities.map((item) => (
            <OpportunityCard
              key={item.id}
              opportunity={item}
              onOpen={() => onOpenOpportunity(item.id)}
              onApply={onApply}
              isSaved
              onSave={() => undefined}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function OrganizationPage({
  onNavigate,
  onOpenOpportunity,
}: {
  onNavigate: (page: Page) => void;
  onOpenOpportunity: (id: number) => void;
}) {
  const org = organizations[0];
  const published = opportunities.filter((item) => item.organization === org.name);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <img src={org.logo} alt={org.name} className="h-28 w-28 rounded-3xl object-cover shadow-soft" />
          <h1 className="mt-5 text-3xl font-extrabold">{org.name}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{org.description}</p>
          <div className="mt-5 flex items-center gap-2 text-sm font-bold text-amber-600">
            <Star size={18} fill="currentColor" />
            {org.rating} rating
            <span className="text-slate-400">({org.reviews} reviews)</span>
          </div>
          <button
            onClick={() => onNavigate('post')}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3.5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <BriefcaseBusiness size={18} />
            Post opportunity
          </button>
        </aside>

        <section>
          <SectionHeader eyebrow="Published by this organization" title="Open volunteering" />
          <div className="grid gap-5">
            {published.concat(opportunities.slice(1, 3)).map((item) => (
              <OpportunityCard
                key={item.id}
                opportunity={item}
                horizontal
                onOpen={() => onOpenOpportunity(item.id)}
                onApply={() => undefined}
                isSaved={false}
                onSave={() => undefined}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function PostOpportunityPage({ onPublished }: { onPublished: () => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onPublished();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-wide text-leaf">For organizations</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Post a volunteering opportunity</h1>
        <p className="mt-2 text-slate-600">Publish a clear, welcoming role for students and community volunteers.</p>
      </div>

      <form onSubmit={submit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Title" placeholder="Youth mentor, event helper, garden crew..." />
          <Field label="City" placeholder="New York or Remote" />
          <SelectField label="Format" options={['Offline', 'Online', 'Hybrid']} />
          <SelectField label="Category" options={categories.map((category) => category.name)} />
          <Field label="Duration" placeholder="3 months, weekend, one-day event" />
          <Field label="Contacts" placeholder="volunteer@organization.org" />
          <TextArea label="Description" placeholder="Describe the mission, role, and who this opportunity is for." />
          <TextArea label="Requirements" placeholder="List skills, availability, onboarding, or training requirements." />
        </div>
        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf px-5 py-4 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-emerald-700">
          Publish opportunity
          <Send size={18} />
        </button>
      </form>
    </main>
  );
}

function HowItWorks() {
  const steps = [
    ['Search with context', 'Filter by cause, city, format, schedule, and role type.'],
    ['Review verified roles', 'Compare clear descriptions, badges, requirements, and benefits.'],
    ['Apply and track', 'Send a simple application and keep saved roles in your profile.'],
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Simple flow" title="How it works" />
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

function Benefits() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <BenefitCard
          icon={<UserRound size={24} />}
          title="For volunteers"
          points={['Find flexible roles matched to your interests', 'Build verified hours and practical experience', 'Save favorite opportunities and track applications']}
        />
        <BenefitCard
          icon={<Building2 size={24} />}
          title="For organizations"
          points={['Reach motivated students and local volunteers', 'Publish clear opportunities with badges and requirements', 'Build trust with ratings and transparent profiles']}
        />
      </div>
    </section>
  );
}

function BenefitCard({ icon, title, points }: { icon: React.ReactNode; title: string; points: string[] }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-mist p-7 shadow-soft">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-leaf shadow-sm">{icon}</div>
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <div className="mt-5 grid gap-3">
        {points.map((point) => (
          <div key={point} className="flex gap-3 text-sm font-semibold text-slate-650">
            <CheckCircle2 className="mt-0.5 shrink-0 text-leaf" size={18} />
            {point}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl bg-mist p-5">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
            <BadgeCheck className="mt-0.5 shrink-0 text-leaf" size={18} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-mist px-4 py-3">
      <span className="flex items-center gap-2 font-semibold text-slate-500">
        {icon}
        {label}
      </span>
      <span className="font-extrabold text-ink">{value}</span>
    </div>
  );
}

function ProfileChips({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="mb-3 text-xl font-extrabold">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Pill key={item} label={item} />
        ))}
      </div>
    </div>
  );
}

function MiniRow({ item, status, onOpen }: { item: Opportunity; status: string; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left hover:border-ocean/40">
      <span>
        <span className="block font-bold">{item.title}</span>
        <span className="text-sm text-slate-500">{item.organization}</span>
      </span>
      <span className="rounded-full bg-skysoft px-3 py-1 text-xs font-extrabold text-ocean">{status}</span>
    </button>
  );
}

function SectionHeader({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-leaf">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {action && (
        <button onClick={onAction} className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-ocean hover:text-ocean sm:flex">
          {action}
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

function Badge({ label }: { label: string }) {
  const online = label === 'Online';
  const urgent = label === 'Urgent';
  return (
    <span
      className={classNames(
        'rounded-full px-3 py-1 text-xs font-extrabold',
        urgent && 'bg-rose-50 text-rose-700',
        online && 'bg-skysoft text-ocean',
        !urgent && !online && 'bg-mint text-leaf',
      )}
    >
      {label}
    </span>
  );
}

function Pill({ label, strong }: { label: string; strong?: boolean }) {
  return <span className={classNames('rounded-full px-3 py-1 text-xs font-bold', strong ? 'bg-skysoft text-ocean' : 'bg-slate-100 text-slate-600')}>{label}</span>;
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-soft">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-mint text-leaf">
        <Search size={28} />
      </div>
      <h2 className="mt-5 text-2xl font-extrabold">No opportunities match these filters</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">Try removing a filter, broadening the city, or searching for a related cause.</p>
      <button onClick={onReset} className="mt-6 rounded-2xl bg-ink px-5 py-3 text-sm font-extrabold text-white">
        Reset filters
      </button>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">{label}</span>
      <input required placeholder={placeholder} className="focus-ring h-13 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold" />
    </label>
  );
}

function TextArea({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">{label}</span>
      <textarea required rows={5} placeholder={placeholder} className="focus-ring w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold" />
    </label>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="relative block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">{label}</span>
      <select className="focus-ring h-[50px] w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute bottom-3.5 right-3 text-slate-400" size={17} />
    </label>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-ink px-5 py-4 text-sm font-extrabold text-white shadow-lift">
      <ShieldCheck className="text-emerald-300" size={20} />
      {message}
    </div>
  );
}

function Footer({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_2fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3 text-xl font-extrabold">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-white">
              <HeartHandshake size={21} />
            </span>
            KindWorks
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">A friendly volunteer marketplace for people, students, and organizations creating measurable social impact.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['Product', 'Opportunities', 'Profile'],
            ['Organizations', 'Post opportunity', 'Reviews'],
            ['Support', 'Help center', 'Contact'],
          ].map((group) => (
            <div key={group[0]}>
              <h3 className="font-extrabold">{group[0]}</h3>
              <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-500">
                {group.slice(1).map((label) => (
                  <button key={label} onClick={() => onNavigate(label === 'Post opportunity' ? 'post' : label === 'Profile' ? 'profile' : 'list')} className="w-fit hover:text-ocean">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
