import { Globe2, LogOut, Menu, UserCircle, X } from 'lucide-react';
import { Language, Page, UserRole } from '../types';
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
}) {
  const { t } = useI18n(language);
  const links: Array<{ page: Page; label: string }> = [
    { page: 'home', label: t('navHome') },
    { page: 'list', label: t('navOpportunities') },
    { page: 'organization', label: t('navOrganizations') },
    { page: 'verify', label: t('navVerify') },
  ];
  const isLoggedIn = Boolean(userLabel);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-3">
          <img src="/logo-icon.png" alt={t('brand')} className="h-10 w-10 rounded-xl object-contain" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Komek<span className="text-ocean">Hub</span>
          </span>
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
          <LanguageToggle language={language} onLanguageChange={onLanguageChange} />
          {isLoggedIn ? (
            <>
              <span className="max-w-[180px] truncate rounded-full bg-slate-100 px-3 py-2 text-sm font-extrabold text-slate-700">{userLabel}</span>
              <button onClick={() => onNavigate('profile')} className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-ocean hover:text-ocean">
                <UserCircle size={17} />
                {t('navProfile')}
              </button>
              <button onClick={onSignOut} className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-rose-300 hover:text-rose-700">
                <LogOut size={17} />
                {t('signOut')}
              </button>
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
          {userRole === 'organization' && (
            <button
              onClick={() => onNavigate('post')}
              className="pressable rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white shadow-soft transition hover:bg-slate-800"
            >
              {t('postOpportunity')}
            </button>
          )}
        </div>

        <button className="rounded-xl border border-slate-200 p-2 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
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
                <button onClick={() => onNavigate('profile')} className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  {t('navProfile')}
                </button>
                {userRole === 'organization' && (
                  <button onClick={() => onNavigate('post')} className="rounded-xl bg-ink px-4 py-3 text-left text-sm font-bold text-white">
                    {t('postOpportunity')}
                  </button>
                )}
                <button onClick={onSignOut} className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50">
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

export function Footer({ language, onNavigate }: { language: Language; onNavigate: (page: Page) => void }) {
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
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FooterGroup title={t('product')} items={[t('navOpportunities'), t('navProfile')]} onClick={() => onNavigate('list')} />
          <FooterGroup title={t('navOrganizations')} items={[t('postOpportunity'), t('reviews')]} onClick={() => onNavigate('organization')} />
          <FooterGroup title={t('support')} items={[t('helpCenter'), t('contact')]} onClick={() => onNavigate('home')} />
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, items, onClick }: { title: string; items: string[]; onClick: () => void }) {
  return (
    <div>
      <h3 className="font-extrabold">{title}</h3>
      <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-500">
        {items.map((item) => (
          <button key={item} onClick={onClick} className="w-fit hover:text-ocean">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
