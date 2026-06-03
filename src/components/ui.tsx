import { ReactNode } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { labelFor } from '../i18n/labels';
import { Language } from '../types';
import { classNames } from '../utils/classNames';

export function SearchInput({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-base font-medium text-ink shadow-sm transition focus:border-ocean focus:outline-none focus:ring-4 focus:ring-ocean/15"
      />
    </div>
  );
}

export function SectionHeader({
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
        <button
          onClick={onAction}
          className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-ocean hover:text-ocean sm:flex"
        >
          {action}
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

export function Badge({ label, language = 'en' }: { label: string; language?: Language }) {
  const tone =
    label === 'Urgent'
      ? 'bg-rose-50 text-rose-700'
      : label === 'Online'
        ? 'bg-skysoft text-ocean'
        : label === 'Certificate'
          ? 'bg-amber-50 text-amber-700'
          : 'bg-mint text-leaf';

  return <span className={classNames('rounded-full px-3.5 py-1.5 text-[13px] font-extrabold leading-none', tone)}>{labelFor(label, language)}</span>;
}

export function Pill({ label, strong, language = 'en' }: { label: string; strong?: boolean; language?: Language }) {
  return <span className={classNames('rounded-full px-3 py-1.5 text-[13px] font-bold leading-none', strong ? 'bg-skysoft text-ocean' : 'bg-slate-100 text-slate-600')}>{labelFor(label, language)}</span>;
}

export function EmptyState({ title, text, action, onAction }: { title: string; text: string; action: string; onAction: () => void }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-soft">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-mint text-leaf">
        <Search size={28} />
      </div>
      <h2 className="mt-5 text-2xl font-extrabold">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">{text}</p>
      <button onClick={onAction} className="mt-6 rounded-2xl bg-ink px-5 py-3 text-sm font-extrabold text-white">
        {action}
      </button>
    </div>
  );
}

export function Toast({ message, icon }: { message: string; icon?: ReactNode }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-ink px-5 py-4 text-sm font-extrabold text-white shadow-lift">
      {icon}
      {message}
    </div>
  );
}
