import { FormEvent, ReactNode, useState } from 'react';
import { Building2, CalendarDays, LockKeyhole, Mail, MapPin, UserRound } from 'lucide-react';
import { formCities } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/useI18n';
import { Language, Page, UserRole } from '../types';

export function SignInPage({ language, onNavigate, onSuccess }: { language: Language; onNavigate: (page: Page) => void; onSuccess: () => void }) {
  const { t } = useI18n(language);
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
      onSuccess();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : t('authGenericError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell eyebrow={t('signInEyebrow')} title={t('signInTitle')} subtitle={t('signInSubtitle')}>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <AuthInput icon={<Mail size={18} />} label={t('email')} value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
        <AuthInput icon={<LockKeyhole size={18} />} label={t('password')} value={password} onChange={setPassword} type="password" placeholder="••••••••" />
        {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}
        <button disabled={submitting} className="pressable rounded-2xl bg-ink px-5 py-3.5 text-base font-extrabold text-white transition hover:bg-slate-800 disabled:bg-slate-400">
          {submitting ? t('authSubmitting') : t('signIn')}
        </button>
      </form>
      <AuthSwitch text={t('noAccount')} action={t('signUp')} onClick={() => onNavigate('sign-up')} />
    </AuthShell>
  );
}

export function SignUpPage({ language, onNavigate, onSuccess }: { language: Language; onNavigate: (page: Page) => void; onSuccess: () => void }) {
  const { t } = useI18n(language);
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('volunteer');
  const [city, setCity] = useState('Astana');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signUp({ fullName, email, password, role, city, birthDate: role === 'volunteer' ? birthDate : undefined });
      onSuccess();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : t('authGenericError'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell eyebrow={t('signUpEyebrow')} title={t('signUpTitle')} subtitle={t('signUpSubtitle')}>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <AuthInput icon={<UserRound size={18} />} label={t('fullName')} value={fullName} onChange={setFullName} placeholder="Aigerim Sapar" />
        <AuthInput icon={<Mail size={18} />} label={t('email')} value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
        <AuthInput icon={<LockKeyhole size={18} />} label={t('password')} value={password} onChange={setPassword} type="password" placeholder="••••••••" />
        {role === 'volunteer' && <AuthInput icon={<CalendarDays size={18} />} label={t('birthDate')} value={birthDate} onChange={setBirthDate} type="date" placeholder="2004-01-15" />}
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-slate-700">{t('role')}</span>
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            {(['volunteer', 'organization'] as UserRole[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRole(item)}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-extrabold transition ${
                  role === item ? 'bg-ink text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item === 'organization' && <Building2 size={16} />}
                {t(item === 'organization' ? 'roleOrganization' : 'roleVolunteer')}
              </button>
            ))}
          </div>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-slate-700">{t('city')}</span>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-base font-bold text-ink shadow-sm focus:border-ocean focus:outline-none focus:ring-4 focus:ring-ocean/15"
            >
              {formCities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </label>
        {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p>}
        <button disabled={submitting} className="pressable rounded-2xl bg-leaf px-5 py-3.5 text-base font-extrabold text-white transition hover:bg-emerald-700 disabled:bg-slate-400">
          {submitting ? t('authSubmitting') : t('signUp')}
        </button>
      </form>
      <AuthSwitch text={t('alreadyHaveAccount')} action={t('signIn')} onClick={() => onNavigate('sign-in')} />
    </AuthShell>
  );
}

function AuthShell({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <section className="flex min-h-[560px] flex-col justify-end rounded-[2rem] bg-[url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center p-8 text-white shadow-soft">
        <p className="text-sm font-extrabold uppercase tracking-wide text-white/80">{eyebrow}</p>
        <h1 className="mt-3 max-w-xl text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-white/86">{subtitle}</p>
      </section>
      <section className="flex items-center">
        <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">{children}</div>
      </section>
    </main>
  );
}

function AuthInput({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-slate-700">{label}</span>
      <span className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input
          required
          value={value}
          type={type}
          minLength={type === 'password' ? 6 : undefined}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-base font-bold text-ink shadow-sm focus:border-ocean focus:outline-none focus:ring-4 focus:ring-ocean/15"
        />
      </span>
    </label>
  );
}

function AuthSwitch({ text, action, onClick }: { text: string; action: string; onClick: () => void }) {
  return (
    <p className="mt-5 text-center text-sm font-semibold text-slate-500">
      {text}{' '}
      <button onClick={onClick} className="font-extrabold text-ocean hover:text-blue-700">
        {action}
      </button>
    </p>
  );
}
