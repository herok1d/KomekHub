import { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Footer, Navbar } from './components/Layout';
import { Toast } from './components/ui';
import { initialFilters, opportunities } from './data/mockData';
import { useI18n } from './i18n/useI18n';
import { DetailPage } from './pages/DetailPage';
import { HomePage } from './pages/HomePage';
import { ListPage } from './pages/ListPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { PostOpportunityPage } from './pages/PostOpportunityPage';
import { ProfilePage } from './pages/ProfilePage';
import { Filters, Language, Page } from './types';
import { useLocalStorageState } from './utils/storage';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [selectedId, setSelectedId] = useState(1);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [language, setLanguage] = useLocalStorageState<Language>('komekhub-language', 'en');
  const [savedIds, setSavedIds] = useLocalStorageState<number[]>('komekhub-saved-opportunities', [1, 5, 10]);
  const [appliedIds, setAppliedIds] = useLocalStorageState<number[]>('komekhub-applied-opportunities', []);
  const { t, localize } = useI18n(language);

  const selectedOpportunity = opportunities.find((item) => item.id === selectedId) ?? opportunities[0];
  const savedOpportunities = opportunities.filter((item) => savedIds.includes(item.id));

  const filteredOpportunities = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase();
    const list = opportunities.filter((item) => {
      const searchable = [
        localize(item.title),
        item.organization,
        item.city,
        item.category,
        localize(item.description),
        localize(item.longDescription),
        item.format,
        item.schedule,
        ...item.tags,
        ...item.badges,
        ...item.languages,
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (filters.city === 'All Kazakhstan' || item.city === filters.city || (filters.city === 'Online' && item.format === 'Online')) &&
        (filters.category === 'All categories' || item.category === filters.category) &&
        (filters.format === 'All formats' || item.format === filters.format) &&
        (filters.schedule === 'Any schedule' || item.schedule === filters.schedule) &&
        (filters.language === 'Any language' || item.languages.includes(filters.language as never)) &&
        (filters.badge === 'Any badge' || item.badges.includes(filters.badge) || (filters.badge === 'Certificate' && item.certificate))
      );
    });

    return [...list].sort((a, b) => {
      if (filters.sort === 'newest') return a.postedDaysAgo - b.postedDaysAgo;
      if (filters.sort === 'nearest') return a.distanceKm - b.distanceKm;
      if (filters.sort === 'popular') return b.popularity - a.popularity;
      return b.badges.length + b.popularity + b.volunteerHours / 10 - (a.badges.length + a.popularity + a.volunteerHours / 10);
    });
  }, [filters, localize]);

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

  function apply(id: number) {
    setAppliedIds((current) => (current.includes(id) ? current : [...current, id]));
    showToast(t('applicationSent'));
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  return (
    <div className="min-h-screen bg-mist text-ink">
      <Navbar
        activePage={page}
        language={language}
        mobileOpen={mobileOpen}
        onNavigate={navigate}
        onLanguageChange={setLanguage}
        setMobileOpen={setMobileOpen}
      />

      {page === 'home' && (
        <HomePage
          language={language}
          filters={filters}
          setFilters={setFilters}
          onNavigate={navigate}
          onOpenOpportunity={openOpportunity}
          onApply={apply}
          savedIds={savedIds}
          appliedIds={appliedIds}
          onSave={toggleSaved}
        />
      )}
      {page === 'list' && (
        <ListPage
          language={language}
          filters={filters}
          setFilters={setFilters}
          opportunities={filteredOpportunities}
          onOpenOpportunity={openOpportunity}
          onApply={apply}
          savedIds={savedIds}
          appliedIds={appliedIds}
          onSave={toggleSaved}
        />
      )}
      {page === 'detail' && (
        <DetailPage
          language={language}
          opportunity={selectedOpportunity}
          savedIds={savedIds}
          appliedIds={appliedIds}
          onApply={apply}
          onSave={toggleSaved}
          onOpenOpportunity={openOpportunity}
        />
      )}
      {page === 'profile' && (
        <ProfilePage
          language={language}
          savedOpportunities={savedOpportunities}
          appliedIds={appliedIds}
          onOpenOpportunity={openOpportunity}
          onApply={apply}
          onSave={toggleSaved}
        />
      )}
      {page === 'organization' && (
        <OrganizationPage
          language={language}
          savedIds={savedIds}
          appliedIds={appliedIds}
          onNavigate={navigate}
          onOpenOpportunity={openOpportunity}
          onApply={apply}
          onSave={toggleSaved}
        />
      )}
      {page === 'post' && <PostOpportunityPage language={language} onPublished={() => showToast(t('opportunityPublished'))} />}

      <Footer language={language} onNavigate={navigate} />
      {toast && <Toast message={toast} icon={<ShieldCheck className="text-emerald-300" size={20} />} />}
    </div>
  );
}
