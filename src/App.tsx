import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Footer, Navbar } from './components/Layout';
import { EmptyState, Toast } from './components/ui';
import { AuthProvider, useAuth } from './context/AuthContext';
import { categories, initialFilters } from './data/mockData';
import { labelFor } from './i18n/labels';
import { useI18n } from './i18n/useI18n';
import { SignInPage, SignUpPage } from './pages/AuthPages';
import { DetailPage } from './pages/DetailPage';
import { HomePage } from './pages/HomePage';
import { ListPage } from './pages/ListPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { OrganizationDashboardPage } from './pages/OrganizationDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { VerifyCertificatePage } from './pages/VerifyCertificatePage';
import { getOrganizations } from './services/organizationService';
import { getOpportunities } from './services/opportunityService';
import { applyToOpportunity, getUserApplications, updateVolunteerResponse, withdrawApplication } from './services/applicationService';
import { getSavedOpportunities, toggleSavedOpportunity } from './services/savedOpportunityService';
import { getUserCertificates } from './services/certificateService';
import { Application, Certificate, FilterOptions, Filters, Language, Notification, Opportunity, Organization, Page } from './types';
import { useLocalStorageState } from './utils/storage';
import { createNotification, getUserNotifications, markAllNotificationsRead, markNotificationRead } from './services/notificationService';

const ALLOWED_BADGES = ['Certificate', 'Flexible schedule', 'No experience needed', 'Online', 'Student-friendly', 'Urgent', 'Weekend'];
const AGE_OPTIONS = ['Any age', '14+', '16+', '18+', '21+'];
const NON_CITY_LOCATION_VALUES = new Set(['Online', 'Kazakhstan']);

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
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
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
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

  async function refreshMarketplaceData() {
    const [opportunityRows, organizationRows] = await Promise.all([getOpportunities(), getOrganizations()]);
    setOpportunities(opportunityRows);
    setOrganizations(organizationRows);
    setSelectedId((current) => current || opportunityRows[0]?.id || '');
  }

  useEffect(() => {
    let isMounted = true;

    async function loadUserActions() {
      if (!user) {
        setSavedIds([]);
        setSavedOpportunities([]);
        setApplications([]);
        setCertificates([]);
        setNotifications([]);
        return;
      }

      setIsLoadingUserActions(true);
      try {
        const [savedOpportunityRows, userApplications, userCertificates, userNotifications] = await Promise.all([
          getSavedOpportunities(user.id),
          getUserApplications(user.id),
          getUserCertificates(user.id),
          getUserNotifications(user.id),
        ]);
        if (!isMounted) return;
        setSavedOpportunities(savedOpportunityRows);
        setSavedIds(savedOpportunityRows.map((opportunity) => opportunity.id));
        setApplications(userApplications);
        setCertificates(userCertificates);
        setNotifications(userNotifications);
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

  useEffect(() => {
    if (!authLoading && page === 'dashboard' && !user) {
      setPage('sign-in');
      window.history.replaceState({}, '', '/sign-in');
    }
  }, [authLoading, page, user?.id]);

  const selectedOpportunity = opportunities.find((item) => item.id === selectedId) ?? opportunities[0];
  const applicationByOpportunity = useMemo(() => {
    const pairs = applications.map((application) => [application.opportunityId, application] as const);
    return new Map(pairs);
  }, [applications]);
  const appliedIds = applications.filter((application) => application.status !== 'cancelled').map((application) => application.opportunityId);
  const ownedOrganization = organizations.find((organization) => organization.ownerId === user?.id);
  const userLabel = profile?.role === 'organization'
    ? ownedOrganization?.name || t('organizationAccount')
    : profile?.fullName || user?.email || '';
  const filterOptions = useMemo<FilterOptions>(() => {
    const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const cityValues = opportunities.map((item) => item.city).filter((city) => !NON_CITY_LOCATION_VALUES.has(city));
    return {
      cities: ['All cities', ...unique(cityValues)],
      categories: ['All categories', ...categories.map((category) => category.name)],
      formats: ['All formats', ...unique(opportunities.map((item) => item.format))],
      schedules: ['Any schedule', ...unique(opportunities.map((item) => item.schedule))],
      ages: AGE_OPTIONS,
      languages: ['Any language', 'English', 'Kazakh', 'Russian'],
      badges: ['Any badge', ...ALLOWED_BADGES],
    };
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase();
    const selectedAge = filters.age === 'Any age' ? null : Number(filters.age.replace('+', ''));
    const list = opportunities.filter((item) => {
      const locationLabel = item.format === 'Online' ? labelFor('Online', language) : labelFor(item.city, language);
      const searchable = [
        localize(item.title),
        item.organization,
        item.city,
        locationLabel,
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
        item.minAge ? `${item.minAge}+` : '',
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (filters.city === 'All cities' || item.city === filters.city) &&
        (filters.category === 'All categories' || item.category === filters.category) &&
        (filters.format === 'All formats' || item.format === filters.format) &&
        (filters.schedule === 'Any schedule' || item.schedule === filters.schedule) &&
        (!selectedAge || !item.minAge || item.minAge <= selectedAge) &&
        (filters.languages.length === 0 || filters.languages.every((languageFilter) => item.languages.includes(languageFilter as never))) &&
        (filters.badges.length === 0 || filters.badges.every((badgeFilter) => item.badges.includes(badgeFilter) || (badgeFilter === 'Certificate' && item.certificate) || (badgeFilter === 'Online' && item.format === 'Online') || (badgeFilter === 'Weekend' && item.schedule === 'Weekend')))
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
    if ((nextPage === 'profile' || nextPage === 'dashboard') && !user) {
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
      setPageAndPath('dashboard');
      return;
    }

    setPageAndPath(nextPage);
  }

  function openOpportunity(id: string) {
    setSelectedId(id);
    navigate('detail');
  }

  function openOrganization(id?: string) {
    setSelectedOrganizationId(id || '');
    navigate('organization');
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

    const existingApplication = applicationByOpportunity.get(id);
    if (existingApplication && existingApplication.status !== 'cancelled') return;
    const opportunity = opportunities.find((item) => item.id === id);
    if (opportunity && opportunity.status !== 'recruiting') {
      showToast(t(opportunity.status));
      return;
    }
    if (opportunity?.minAge) {
      if (!profile?.birthDate) {
        showToast(t('addBirthDateBeforeApplying'));
        navigate('profile');
        return;
      }
      if (calculateAge(profile.birthDate) < opportunity.minAge) {
        showToast(t('ageRestrictedOpportunity').replace('[Age]', String(opportunity.minAge)));
        return;
      }
    }

    try {
      const application = await applyToOpportunity(user.id, id);
      if (application) {
        application.volunteerName = profile?.fullName || user.email || application.volunteerName;
        setApplications((current) => [application, ...current.filter((item) => item.id !== application.id)]);
      }
      showToast(t('applicationSent'));
    } catch (error) {
      if (import.meta.env.DEV) console.error('[KomekHub actions] Apply failed', { userId: user.id, opportunityId: id, error });
      showToast(error instanceof Error ? `${t('failedToApply')}: ${error.message}` : t('failedToApply'));
    }
  }

  async function withdraw(id: string) {
    const application = applicationByOpportunity.get(id);
    if (!application || application.status !== 'pending') return;
    try {
      await withdrawApplication(application.id);
      setApplications((current) => current.map((item) => (item.id === application.id ? { ...item, status: 'cancelled' } : item)));
      showToast(t('applicationWithdrawn'));
    } catch (error) {
      showToast(error instanceof Error ? `${t('failedToWithdrawApplication')}: ${error.message}` : t('failedToWithdrawApplication'));
    }
  }

  async function markNotificationsRead() {
    if (!user) return;
    await markAllNotificationsRead(user.id);
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.read) {
      await markNotificationRead(notification.id);
      setNotifications((current) => current.map((item) => (item.id === notification.id ? { ...item, read: true } : item)));
    }
    if (notification.relatedOpportunityId) setSelectedId(notification.relatedOpportunityId);
    if (profile?.role === 'organization' || notification.type.startsWith('volunteer_') || notification.type === 'application_received') {
      navigate('dashboard');
      return;
    }
    if (notification.type === 'certificate_issued') {
      navigate('profile');
      return;
    }
    navigate('profile');
  }

  async function respondToApplication(applicationId: string, response: 'accepted' | 'declined') {
    await updateVolunteerResponse(applicationId, response);
    const application = applications.find((item) => item.id === applicationId);
    const opportunity = opportunities.find((item) => item.id === application?.opportunityId);
    const organizationOwner = organizations.find((item) => item.id === opportunity?.organizationId)?.ownerId;
    if (organizationOwner && application && opportunity) {
      await createNotification({
        userId: organizationOwner,
        type: `volunteer_${response}`,
        title: t(response === 'accepted' ? 'participationConfirmed' : 'participationDeclined'),
        message: `${application.volunteerName} ${response === 'accepted' ? t('participationConfirmed') : t('participationDeclined')}: ${localize(opportunity.title)}`,
        relatedApplicationId: application.id,
        relatedOpportunityId: opportunity.id,
      });
    }
    setApplications((current) => current.map((application) => (application.id === applicationId ? { ...application, volunteerResponse: response } : application)));
    showToast(t(response === 'accepted' ? 'participationConfirmed' : 'participationDeclined'));
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
        notifications={notifications}
        onMarkNotificationsRead={markNotificationsRead}
        onNotificationClick={handleNotificationClick}
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
          featuredOpportunities={opportunities.slice(0, 3)}
          onNavigate={navigate}
          onOpenOpportunity={openOpportunity}
          onOpenOrganization={openOrganization}
          onApply={apply}
          savedIds={savedIds}
          appliedIds={appliedIds}
          onSave={toggleSaved}
          applicationByOpportunity={applicationByOpportunity}
          onWithdraw={withdraw}
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
          onOpenOrganization={openOrganization}
          onApply={apply}
          savedIds={savedIds}
          appliedIds={appliedIds}
          applicationByOpportunity={applicationByOpportunity}
          onSave={toggleSaved}
          onWithdraw={withdraw}
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
          application={applicationByOpportunity.get(selectedOpportunity.id)}
          onWithdraw={() => withdraw(selectedOpportunity.id)}
          onOpenOpportunity={openOpportunity}
          onOpenOrganization={openOrganization}
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
          onVolunteerResponse={respondToApplication}
        />
      )}
      {!isLoadingData && !authLoading && !isLoadingUserActions && !dataError && page === 'organization' && (
        <OrganizationPage
          language={language}
          opportunities={opportunities}
          organizations={organizations}
          savedIds={savedIds}
          onNavigate={navigate}
          selectedOrganizationId={selectedOrganizationId}
          userRole={profile?.role}
          onOpenOrganization={openOrganization}
          onOpenOpportunity={openOpportunity}
          onApply={apply}
          onSave={toggleSaved}
          applicationByOpportunity={applicationByOpportunity}
          onWithdraw={withdraw}
        />
      )}
      {!isLoadingData && !authLoading && !isLoadingUserActions && !dataError && page === 'dashboard' && user && (
        <OrganizationDashboardPage
          language={language}
          onNotify={showToast}
          onMarketplaceChanged={refreshMarketplaceData}
        />
      )}
      {!isLoadingData && !authLoading && !isLoadingUserActions && !dataError && page === 'verify' && <VerifyCertificatePage language={language} initialNumber={certificateToVerify} />}
      {!isLoadingData && !authLoading && !isLoadingUserActions && !dataError && page === 'sign-in' && <SignInPage language={language} onNavigate={navigate} onSuccess={handleAuthSuccess} />}
      {!isLoadingData && !authLoading && !isLoadingUserActions && !dataError && page === 'sign-up' && <SignUpPage language={language} onNavigate={navigate} onSuccess={handleAuthSuccess} />}

      <Footer language={language} onNavigate={navigate} userRole={profile?.role} />
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

function calculateAge(birthDate: string) {
  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

function pageFromPath(pathname: string): Page {
  if (pathname === '/sign-in') return 'sign-in';
  if (pathname === '/sign-up') return 'sign-up';
  if (pathname === '/opportunities') return 'list';
  if (pathname === '/organizations') return 'organization';
  if (pathname === '/organization-dashboard') return 'dashboard';
  if (pathname === '/profile') return 'profile';
  if (pathname === '/post-opportunity') return 'dashboard';
  if (pathname === '/verify' || pathname === '/verify-certificate') return 'verify';
  return 'home';
}

function pathForPage(page: Page) {
  const paths: Record<Page, string> = {
    home: '/',
    list: '/opportunities',
    detail: '/opportunities/detail',
    profile: '/profile',
    organization: '/organizations',
    dashboard: '/organization-dashboard',
    post: '/organization-dashboard',
    verify: '/verify',
    'sign-in': '/sign-in',
    'sign-up': '/sign-up',
  };
  return paths[page];
}
