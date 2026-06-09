import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Footer, Navbar } from './components/Layout';
import { EmptyState, Toast } from './components/ui';
import { AuthProvider, useAuth } from './context/AuthContext';
import { createCertificateFromApplication, initialCertificates } from './data/applications';
import { categories, initialFilters } from './data/mockData';
import { labelFor } from './i18n/labels';
import { useI18n } from './i18n/useI18n';
import { SignInPage, SignUpPage } from './pages/AuthPages';
import { DetailPage } from './pages/DetailPage';
import { HomePage } from './pages/HomePage';
import { ListPage } from './pages/ListPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { PostOpportunityPage } from './pages/PostOpportunityPage';
import { ProfilePage } from './pages/ProfilePage';
import { VerifyCertificatePage } from './pages/VerifyCertificatePage';
import { getOrganizations } from './services/organizationService';
import { getOpportunities } from './services/opportunityService';
import { applyToOpportunity, getUserApplications } from './services/applicationService';
import { getSavedOpportunities, toggleSavedOpportunity } from './services/savedOpportunityService';
import { Application, ApplicationStatus, Certificate, FilterOptions, Filters, Language, Opportunity, Organization, Page } from './types';
import { useLocalStorageState } from './utils/storage';

export default function App() {
  return (
    <AuthProvider>
      <KomekHubApp />
    </AuthProvider>
  );
}

function KomekHubApp() {
  const [page, setPage] = useState<Page>(() => pageFromPath(window.location.pathname));
  const [selectedId, setSelectedId] = useState('');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState('');
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [certificateToVerify, setCertificateToVerify] = useState('');
  const [language, setLanguage] = useLocalStorageState<Language>('komekhub-language', 'en');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingUserActions, setIsLoadingUserActions] = useState(false);
  const [certificates, setCertificates] = useLocalStorageState<Certificate[]>('komekhub-certificates', initialCertificates);
  const { t, localize } = useI18n(language);
  const { user, profile, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function loadSupabaseData() {
      setIsLoadingData(true);
      setDataError('');
      try {
        const [opportunityRows, organizationRows] = await Promise.all([getOpportunities(), getOrganizations()]);
        if (!isMounted) return;
        setOpportunities(opportunityRows);
        setOrganizations(organizationRows);
        setSelectedId((current) => current || opportunityRows[0]?.id || '');
      } catch (error) {
        if (!isMounted) return;
        setDataError(error instanceof Error ? error.message : 'Failed to load Supabase data.');
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }

    loadSupabaseData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadUserActions() {
      if (!user) {
        setSavedIds([]);
        setSavedOpportunities([]);
        setApplications([]);
        return;
      }

      setIsLoadingUserActions(true);
      try {
        const [savedOpportunityRows, userApplications] = await Promise.all([getSavedOpportunities(user.id), getUserApplications(user.id)]);
        if (!isMounted) return;
        setSavedOpportunities(savedOpportunityRows);
        setSavedIds(savedOpportunityRows.map((opportunity) => opportunity.id));
        setApplications(userApplications);
      } catch (error) {
        if (import.meta.env.DEV) console.error('[KomekHub actions] Failed to load user actions', { userId: user.id, error });
        if (isMounted) showToast(error instanceof Error ? error.message : t('failedToLoadUserActions'));
      } finally {
        if (isMounted) setIsLoadingUserActions(false);
      }
    }

    loadUserActions();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    function handlePopState() {
      setPage(pageFromPath(window.location.pathname));
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const selectedOpportunity = opportunities.find((item) => item.id === selectedId) ?? opportunities[0];
  const appliedIds = applications.map((application) => application.opportunityId);
  const userLabel = profile?.fullName || user?.email || '';
  const filterOptions = useMemo<FilterOptions>(() => {
    const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
    return {
      cities: ['All cities', ...unique(opportunities.map((item) => item.city))],
      categories: ['All categories', ...categories.map((category) => category.name)],
      formats: ['All formats', ...unique(opportunities.map((item) => item.format))],
      schedules: ['Any schedule', ...unique(opportunities.map((item) => item.schedule))],
      languages: ['Any language', ...unique(opportunities.flatMap((item) => item.languages))],
      badges: [
        'Any badge',
        ...unique(opportunities.flatMap((item) => [...item.badges, ...(item.certificate ? ['Certificate'] : [])])),
      ],
    };
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase();
    const list = opportunities.filter((item) => {
      const searchable = [
        localize(item.title),
        item.organization,
        item.city,
        labelFor(item.city, language),
        item.category,
        labelFor(item.category, language),
        localize(item.description),
        localize(item.longDescription),
        item.format,
        labelFor(item.format, language),
        item.schedule,
        labelFor(item.schedule, language),
        ...item.tags,
        ...item.tags.map((tag) => labelFor(tag, language)),
        ...item.badges,
        ...item.badges.map((badge) => labelFor(badge, language)),
        ...item.languages,
        ...item.languages.map((itemLanguage) => labelFor(itemLanguage, language)),
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (filters.city === 'All cities' || item.city === filters.city || (filters.city === 'Online' && item.format === 'Online')) &&
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
  }, [filters, language, localize, opportunities]);

  function setPageAndPath(nextPage: Page) {
    setPage(nextPage);
    window.history.pushState({}, '', pathForPage(nextPage));
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigate(nextPage: Page) {
    if (nextPage === 'profile' && !user) {
      showToast(t('signInRequired'));
      setPageAndPath('sign-in');
      return;
    }

    if (nextPage === 'post') {
      if (!user) {
        showToast(t('signInRequired'));
        setPageAndPath('sign-in');
        return;
      }
      if (profile?.role !== 'organization') {
        showToast(t('organizationRoleRequired'));
        setMobileOpen(false);
        return;
      }
    }

    setPageAndPath(nextPage);
  }

  function openOpportunity(id: string) {
    setSelectedId(id);
    navigate('detail');
  }

  async function toggleSaved(id: string) {
    if (!user) {
      showToast(t('signInToSave'));
      navigate('sign-in');
      return;
    }

    const wasSaved = savedIds.includes(id);
    try {
      const isSaved = await toggleSavedOpportunity(user.id, id, wasSaved);
      setSavedIds((current) => (isSaved ? [...new Set([...current, id])] : current.filter((item) => item !== id)));
      setSavedOpportunities((current) => (isSaved ? [...current, ...opportunities.filter((item) => item.id === id && !current.some((saved) => saved.id === id))] : current.filter((item) => item.id !== id)));
      showToast(t(isSaved ? 'saved' : 'unsaved'));
    } catch (error) {
      if (import.meta.env.DEV) console.error('[KomekHub actions] Save failed', { userId: user.id, opportunityId: id, error });
      showToast(error instanceof Error ? `${t('failedToSaveOpportunity')}: ${error.message}` : t('failedToSaveOpportunity'));
    }
  }

  async function apply(id: string) {
    if (!user) {
      showToast(t('signInToApply'));
      navigate('sign-in');
      return;
    }

    if (appliedIds.includes(id)) return;

    try {
      const application = await applyToOpportunity(user.id, id);
      if (application) {
        application.volunteerName = profile?.fullName || user.email || application.volunteerName;
        setApplications((current) => [application, ...current]);
      }
      showToast(t('applicationSent'));
    } catch (error) {
      if (import.meta.env.DEV) console.error('[KomekHub actions] Apply failed', { userId: user.id, opportunityId: id, error });
      showToast(error instanceof Error ? `${t('failedToApply')}: ${error.message}` : t('failedToApply'));
    }
  }

  function updateApplicationStatus(applicationId: string, status: ApplicationStatus, volunteerHours?: number) {
    let completedApplication: Application | undefined;
    setApplications((current) =>
      current.map((application) => {
        if (application.id !== applicationId) return application;
        const next: Application = {
          ...application,
          status,
          volunteerHours: status === 'completed' ? (volunteerHours ?? application.volunteerHours) : application.volunteerHours,
          completedAt: status === 'completed' ? new Date().toISOString() : application.completedAt,
        };
        completedApplication = next;
        return next;
      }),
    );

    if (status === 'completed' && completedApplication) {
      const certificateApplication = completedApplication;
      setCertificates((current) => {
        if (current.some((certificate) => certificate.applicationId === applicationId)) return current;
        return [...current, createCertificateFromApplication(certificateApplication, current.length + 1, opportunities, organizations)];
      });
      showToast(t('certificateIssued'));
    }
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }

  function verifyCertificate(certificateNumber: string) {
    setCertificateToVerify(certificateNumber);
    navigate('verify');
  }

  async function handleSignOut() {
    await signOut();
    showToast(t('signedOut'));
    setPageAndPath('home');
  }

  function handleAuthSuccess() {
    showToast(t('authSuccess'));
    setPageAndPath('home');
  }

  return (
    <div className={`min-h-screen bg-mist text-ink ${language === 'ru' ? 'ru-copy' : ''}`}>
      <Navbar
        activePage={page}
        language={language}
        mobileOpen={mobileOpen}
        onNavigate={navigate}
        onLanguageChange={setLanguage}
        setMobileOpen={setMobileOpen}
        userLabel={userLabel}
        userRole={profile?.role}
        onSignOut={handleSignOut}
      />

      {(isLoadingData || authLoading || isLoadingUserActions) && (
        <DataState
          title={language === 'ru' ? 'Загрузка данных Supabase' : 'Loading Supabase data'}
          text={language === 'ru' ? 'Загружаем возможности и организации из базы KomekHub.' : 'Fetching opportunities and organizations from your KomekHub database.'}
        />
      )}
      {!isLoadingData && !authLoading && !isLoadingUserActions && dataError && (
        <DataState title={language === 'ru' ? 'Не удалось загрузить данные Supabase' : 'Supabase data could not be loaded'} text={dataError} />
      )}
      {!isLoadingData && !authLoading && !isLoadingUserActions && !dataError && page === 'home' && (
        <HomePage
          language={language}
          filters={filters}
          setFilters={setFilters}
          opportunities={opportunities}
          filterOptions={filterOptions}
          featuredOpportunities={opportunities.slice(0, 3)}
          onNavigate={navigate}
          onOpenOpportunity={openOpportunity}
          onApply={apply}
          savedIds={savedIds}
          appliedIds={appliedIds}
          onSave={toggleSaved}
        />
      )}
      {!isLoadingData && !authLoading && !isLoadingUserActions && !dataError && page === 'list' && (
        <ListPage
          language={language}
          filters={filters}
          setFilters={setFilters}
          opportunities={filteredOpportunities}
          totalOpportunityCount={opportunities.length}
          filterOptions={filterOptions}
          onOpenOpportunity={openOpportunity}
          onApply={apply}
          savedIds={savedIds}
          appliedIds={appliedIds}
          onSave={toggleSaved}
        />
      )}
      {!isLoadingData && !authLoading && !isLoadingUserActions && !dataError && page === 'detail' && selectedOpportunity && (
        <DetailPage
          language={language}
          opportunity={selectedOpportunity}
          opportunities={opportunities}
          organizations={organizations}
          savedIds={savedIds}
          appliedIds={appliedIds}
          onApply={apply}
          onSave={toggleSaved}
          onOpenOpportunity={openOpportunity}
        />
      )}
      {!isLoadingData && !authLoading && !isLoadingUserActions && !dataError && page === 'profile' && user && (
        <ProfilePage
          language={language}
          opportunities={opportunities}
          savedOpportunities={savedOpportunities}
          applications={applications}
          certificates={certificates}
          appliedIds={appliedIds}
          onOpenOpportunity={openOpportunity}
          onVerifyCertificate={verifyCertificate}
          onApply={apply}
          onSave={toggleSaved}
          onNotify={showToast}
        />
      )}
      {!isLoadingData && !authLoading && !isLoadingUserActions && !dataError && page === 'organization' && (
        <OrganizationPage
          language={language}
          opportunities={opportunities}
          organizations={organizations}
          savedIds={savedIds}
          appliedIds={appliedIds}
          applications={applications}
          certificates={certificates}
          onUpdateApplicationStatus={updateApplicationStatus}
          onNavigate={navigate}
          onOpenOpportunity={openOpportunity}
          onApply={apply}
          onSave={toggleSaved}
        />
      )}
      {!isLoadingData && !authLoading && !isLoadingUserActions && !dataError && page === 'post' && user && profile?.role === 'organization' && (
        <PostOpportunityPage language={language} onPublished={() => showToast(t('opportunityPublished'))} />
      )}
      {!isLoadingData && !authLoading && !isLoadingUserActions && !dataError && page === 'verify' && <VerifyCertificatePage language={language} certificates={certificates} initialNumber={certificateToVerify} />}
      {!isLoadingData && !authLoading && !isLoadingUserActions && !dataError && page === 'sign-in' && <SignInPage language={language} onNavigate={navigate} onSuccess={handleAuthSuccess} />}
      {!isLoadingData && !authLoading && !isLoadingUserActions && !dataError && page === 'sign-up' && <SignUpPage language={language} onNavigate={navigate} onSuccess={handleAuthSuccess} />}

      <Footer language={language} onNavigate={navigate} />
      {toast && <Toast message={toast} icon={<ShieldCheck className="text-emerald-300" size={20} />} />}
    </div>
  );
}

function DataState({ title, text }: { title: string; text: string }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState title={title} text={text} />
    </main>
  );
}

function pageFromPath(pathname: string): Page {
  if (pathname === '/sign-in') return 'sign-in';
  if (pathname === '/sign-up') return 'sign-up';
  if (pathname === '/opportunities') return 'list';
  if (pathname === '/organizations') return 'organization';
  if (pathname === '/profile') return 'profile';
  if (pathname === '/post-opportunity') return 'post';
  if (pathname === '/verify-certificate') return 'verify';
  return 'home';
}

function pathForPage(page: Page) {
  const paths: Record<Page, string> = {
    home: '/',
    list: '/opportunities',
    detail: '/opportunities/detail',
    profile: '/profile',
    organization: '/organizations',
    post: '/post-opportunity',
    verify: '/verify-certificate',
    'sign-in': '/sign-in',
    'sign-up': '/sign-up',
  };
  return paths[page];
}
