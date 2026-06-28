import { ReactNode } from 'react';
import { ArrowRight, LoaderCircle, Search, X } from 'lucide-react';
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

export function EmptyState({ title, text, action, onAction }: { title: string; text: string; action?: string; onAction?: () => void }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-soft">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-mint text-leaf">
        <Search size={28} />
      </div>
      <h2 className="mt-5 text-2xl font-extrabold">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">{text}</p>
      {action && (
        <button onClick={onAction} className="mt-6 rounded-2xl bg-ink px-5 py-3 text-sm font-extrabold text-white">
          {action}
        </button>
      )}
    </div>
  );
}

export function LoadingState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-14 text-center shadow-soft" role="status" aria-live="polite">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-skysoft text-ocean">
        <LoaderCircle size={28} className="animate-spin" />
      </div>
      <h2 className="mt-5 text-xl font-extrabold text-ink sm:text-2xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

export function Toast({ message, icon, action, onAction }: { message: string; icon?: ReactNode; action?: string; onAction?: () => void }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center gap-3 rounded-2xl bg-ink px-5 py-4 text-sm font-extrabold text-white shadow-lift">
      {icon}
      <span className="min-w-0 flex-1">{message}</span>
      {action && onAction && (
        <button type="button" onClick={onAction} className="shrink-0 rounded-xl bg-white/12 px-3 py-2 text-xs text-white transition-colors hover:bg-white/20">
          {action}
        </button>
      )}
    </div>
  );
}

export function ConfirmationModal({
  open,
  title,
  text,
  confirmLabel,
  cancelLabel,
  isConfirming = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  cancelLabel: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/45 px-4 backdrop-blur-[2px]" role="presentation" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-lift sm:p-7"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="confirmation-title" className="text-xl font-extrabold text-ink">{title}</h2>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{text}</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label={cancelLabel}>
            <X size={19} />
          </button>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={isConfirming} className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-extrabold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={isConfirming} className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-rose-700 disabled:bg-slate-400">
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
