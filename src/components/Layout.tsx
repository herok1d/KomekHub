import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Award, Bell, ChevronDown, Globe2, Instagram, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, UserCircle, X } from 'lucide-react';
import { Language, Notification, Page, UserRole } from '../types';
import { useI18n } from '../i18n/useI18n';
import { classNames } from '../utils/classNames';

export function Navbar({
  activePage,
  language,
  mobileOpen,
  onNavigate,
  onLanguageChange,
  setMobileOpen,
  userLabel,
  userRole,
  onSignOut,
  notifications = [],
  onMarkNotificationsRead,
  onNotificationClick,
}: {
  activePage: Page;
  language: Language;
  mobileOpen: boolean;
  onNavigate: (page: Page) => void;
  onLanguageChange: (language: Language) => void;
  setMobileOpen: (open: boolean) => void;
  userLabel?: string;
  userRole?: UserRole;
  onSignOut: () => void;
  notifications?: Notification[];
  onMarkNotificationsRead?: () => void;
  onNotificationClick?: (notification: Notification) => void;
}) {
  const { t } = useI18n(language);
  const links: Array<{ page: Page; label: string }> = [
    { page: 'home', label: t('navHome') },
    { page: 'list', label: t('navOpportunities') },
    { page: 'organization', label: t('navOrganizations') },
  ];
  const isLoggedIn = Boolean(userLabel);

  return (
    <header className="sticky top-0 z-40 isolate border-b border-slate-200 bg-white/95 text-slate-900 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('home')}
          className="flex min-w-fit flex-shrink-0 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-ocean/20"
        >
          <img src="/logo-icon.png" alt={t('brand')} className="h-10 w-10 flex-shrink-0 object-contain" />
          <span className="whitespace-nowrap text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Komek<span className="text-ocean">Hub</span>
          </span>
        </button>

        <nav className="hidden min-w-0 items-center gap-0.5 lg:flex xl:gap-1">
          {links.map((link) => (
            <button
              key={link.page}
              onClick={() => onNavigate(link.page)}
              className={classNames(
                'whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors xl:px-4',
                activePage === link.page ? 'bg-slate-100 text-ink' : 'text-slate-600 hover:bg-slate-50 hover:text-ink',
              )}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden flex-shrink-0 items-center gap-1.5 lg:flex xl:gap-2">
          <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
          {isLoggedIn ? (
            <>
              <NotificationBell notifications={notifications} language={language} onMarkRead={onMarkNotificationsRead} onNotificationClick={onNotificationClick} />
              <AccountDropdown userLabel={userLabel} userRole={userRole} onNavigate={onNavigate} onSignOut={onSignOut} language={language} />
            </>
          ) : (
            <>
              <button onClick={() => onNavigate('sign-in')} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-ocean hover:text-ocean">
                {t('signIn')}
              </button>
              <button onClick={() => onNavigate('sign-up')} className="pressable rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-slate-800">
                {t('signUp')}
              </button>
            </>
          )}
        </div>

        <button className="flex-shrink-0 rounded-xl border border-slate-200 bg-white p-2 text-slate-700 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
          <div className="grid gap-2">
            <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
            {links.map((link) => (
              <button key={link.page} onClick={() => onNavigate(link.page)} className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {link.label}
              </button>
            ))}
            {isLoggedIn ? (
              <>
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-extrabold text-slate-700">{userLabel}</div>
                {notifications.length > 0 && (
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm font-extrabold text-slate-700">
                      {t('notifications')}
                      <span className="rounded-full bg-ocean px-2 py-0.5 text-xs text-white">{notifications.filter((item) => !item.read).length}</span>
                    </div>
                    <div className="grid gap-2">
                      {notifications.slice(0, 3).map((notification) => (
                        <p key={notification.id} className="text-xs font-semibold leading-5 text-slate-500">{notification.message}</p>
                      ))}
                    </div>
                  </div>
                )}
                {userRole === 'organization' && (
                  <>
                    <MobileAccountLink label={t('dashboard')} icon={<LayoutDashboard size={17} />} onClick={() => onNavigate('dashboard')} />
                    <MobileAccountLink label={t('organizationSettings')} icon={<Settings size={17} />} onClick={() => onNavigate('dashboard')} />
                  </>
                )}
                {userRole !== 'organization' && (
                  <>
                    <MobileAccountLink label={t('navProfile')} icon={<UserCircle size={17} />} onClick={() => onNavigate('profile')} />
                    <MobileAccountLink label={t('myCertificates')} icon={<Award size={17} />} onClick={() => onNavigate('profile')} />
                  </>
                )}
                <MobileAccountLink label={t('verifyCertificate')} icon={<ShieldCheck size={17} />} onClick={() => onNavigate('verify')} />
                <button onClick={onSignOut} className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50">
                  <LogOut size={17} />
                  {t('signOut')}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => onNavigate('sign-in')} className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  {t('signIn')}
                </button>
                <button onClick={() => onNavigate('sign-up')} className="rounded-xl bg-ink px-4 py-3 text-left text-sm font-bold text-white">
                  {t('signUp')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NotificationBell({ notifications, language, onMarkRead, onNotificationClick }: { notifications: Notification[]; language: Language; onMarkRead?: () => void; onNotificationClick?: (notification: Notification) => void }) {
  const { t } = useI18n(language);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={async () => {
          setOpen((current) => !current);
        }}
        className="relative rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
        aria-label={t('notifications')}
      >
        <Bell size={18} />
        {unread > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <div className="border-b border-slate-100 px-3 py-2 text-sm font-extrabold text-slate-800">{t('notifications')}</div>
          <div className="max-h-96 overflow-auto py-1">
            {notifications.length === 0 ? (
              <p className="px-3 py-4 text-sm font-semibold text-slate-500">{t('noNotifications')}</p>
            ) : (
              notifications.slice(0, 8).map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => {
                    setOpen(false);
                    onNotificationClick?.(notification);
                  }}
                  className="w-full rounded-xl px-3 py-2.5 text-left hover:bg-slate-50"
                >
                  <p className="text-sm font-extrabold text-slate-800">{notification.title}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{notification.message}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AccountDropdown({
  userLabel,
  userRole,
  language,
  onNavigate,
  onSignOut,
}: {
  userLabel?: string;
  userRole?: UserRole;
  language: Language;
  onNavigate: (page: Page) => void;
  onSignOut: () => void;
}) {
  const { t } = useI18n(language);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isOrganization = userRole === 'organization';

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  const navigate = (page: Page) => {
    setOpen(false);
    onNavigate(page);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex max-w-[190px] items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
      >
        <UserCircle size={18} className="flex-shrink-0 text-ocean" />
        <span className="min-w-0 truncate">{userLabel}</span>
        <ChevronDown size={15} className={classNames('flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="truncate text-sm font-extrabold text-slate-800">{userLabel}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{isOrganization ? t('organizationAccount') : t('roleVolunteer')}</p>
          </div>
          <div className="mt-1 grid gap-1">
            {isOrganization ? (
              <>
                <DropdownItem label={t('dashboard')} icon={<LayoutDashboard size={17} />} onClick={() => navigate('dashboard')} />
                <DropdownItem label={t('organizationSettings')} icon={<Settings size={17} />} onClick={() => navigate('dashboard')} />
              </>
            ) : (
              <>
                <DropdownItem label={t('navProfile')} icon={<UserCircle size={17} />} onClick={() => navigate('profile')} />
                <DropdownItem label={t('myCertificates')} icon={<Award size={17} />} onClick={() => navigate('profile')} />
              </>
            )}
            <DropdownItem label={t('verifyCertificate')} icon={<ShieldCheck size={17} />} onClick={() => navigate('verify')} />
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="inline-flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-sm font-bold text-rose-700 transition-colors hover:bg-rose-50"
            >
              <LogOut size={17} />
              {t('signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DropdownItem({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button role="menuitem" onClick={onClick} className="inline-flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-ink">
      <span className="text-slate-500">{icon}</span>
      {label}
    </button>
  );
}

function MobileAccountLink({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
      <span className="text-slate-500">{icon}</span>
      {label}
    </button>
  );
}

function LanguageToggle({ language, onLanguageChange }: { language: Language; onLanguageChange: (language: Language) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
      <Globe2 size={16} className="text-slate-500" />
      <div className="relative grid w-[92px] grid-cols-2 rounded-full bg-slate-100 p-1">
        <span
          className={classNames(
            'absolute bottom-1 top-1 w-[40px] rounded-full bg-ink shadow-sm transition-transform duration-300 ease-out',
            language === 'ru' ? 'translate-x-[44px]' : 'translate-x-0',
          )}
        />
        {(['en', 'ru'] as Language[]).map((item) => (
          <button
            key={item}
            onClick={() => onLanguageChange(item)}
            className={classNames('relative z-10 rounded-full px-2 py-1.5 text-xs font-extrabold transition-colors duration-300', language === item ? 'text-white' : 'text-slate-500 hover:text-ink')}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Footer({ language, onNavigate, userRole }: { language: Language; onNavigate: (page: Page) => void; userRole?: UserRole }) {
  const { t } = useI18n(language);

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_2fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3 text-xl font-extrabold">
            <img src="/logo-icon.png" alt={t('brand')} className="h-10 w-10 rounded-xl object-contain" />
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Komek<span className="text-ocean">Hub</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">{t('footerText')}</p>
          <div className="mt-5 flex items-center gap-2">
            <SocialLink href="https://instagram.com/komekhub" label="KomekHub Instagram" icon={<Instagram size={17} />} />
            <SocialLink href="https://t.me/komekhub" label="KomekHub Telegram" icon={<TelegramIcon />} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FooterGroup title={t('product')} items={[{ label: t('navHome'), page: 'home' }, { label: t('navOpportunities'), page: 'list' }]} onNavigate={onNavigate} />
          <FooterGroup title={t('navOrganizations')} items={[...(userRole === 'organization' ? [{ label: t('postOpportunity'), page: 'post' as Page }] : []), { label: t('reviews'), page: 'organization' }]} onNavigate={onNavigate} />
          <FooterGroup title={t('support')} items={[{ label: t('helpCenter'), page: 'home' }, { label: t('contact'), page: 'home' }, { label: t('verifyCertificate'), page: 'verify' }]} onNavigate={onNavigate} />
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-ocean/40 hover:bg-skysoft hover:text-ocean"
    >
      {icon}
    </a>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px]" fill="currentColor">
      <path d="M20.7 4.4c.4-.2.9.2.8.7l-2.7 14c-.1.6-.8.8-1.3.5l-4.3-3.2-2.1 2c-.4.4-1 .2-1-.4l.1-3.5 6.5-6.1c.3-.3-.1-.7-.4-.5l-8.1 5.2-3.5-1.1c-.6-.2-.6-1 0-1.3l15-6.3Z" />
    </svg>
  );
}

function FooterGroup({ title, items, onNavigate }: { title: string; items: Array<{ label: string; page: Page }>; onNavigate: (page: Page) => void }) {
  return (
    <div>
      <h3 className="font-extrabold">{title}</h3>
      <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-500">
        {items.map((item) => (
          <button key={item.label} onClick={() => onNavigate(item.page)} className="w-fit hover:text-ocean">
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
