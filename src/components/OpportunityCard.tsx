import { ArrowRight, Bookmark, BookmarkCheck, Building2, CalendarDays, Clock, Languages, MapPin, Send } from 'lucide-react';
import { Language, Opportunity } from '../types';
import { useI18n } from '../i18n/useI18n';
import { Badge, Pill } from './ui';
import { classNames } from '../utils/classNames';

export function OpportunityCard({
  opportunity,
  language,
  onOpen,
  onApply,
  isSaved,
  isApplied,
  onSave,
}: {
  opportunity: Opportunity;
  language: Language;
  onOpen: () => void;
  onApply: () => void;
  isSaved: boolean;
  isApplied: boolean;
  onSave: () => void;
}) {
  const { t, localize } = useI18n(language);

  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-ocean/30 hover:shadow-lift sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {opportunity.badges.map((badge) => (
              <Badge key={badge} label={badge} />
            ))}
            {opportunity.certificate && <Badge label="Certificate" />}
          </div>
          <button onClick={onOpen} className="text-left text-xl font-extrabold tracking-tight transition group-hover:text-ocean">
            {localize(opportunity.title)}
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
              {localize(opportunity.duration)}
            </span>
          </div>
        </div>
        <button
          onClick={onSave}
          className={classNames(
            'rounded-2xl border p-2.5 transition',
            isSaved ? 'border-leaf bg-mint text-leaf' : 'border-slate-200 text-slate-500 hover:border-ocean hover:text-ocean',
          )}
          aria-label={isSaved ? t('removeSaved') : t('save')}
        >
          {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </button>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{localize(opportunity.description)}</p>
      <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-500 sm:grid-cols-2">
        <span className="flex items-center gap-2">
          <Languages size={17} />
          {opportunity.languages.join(', ')}
        </span>
        <span className="flex items-center gap-2">
          <CalendarDays size={17} />
          {opportunity.volunteerHours} {t('volunteerHours')}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Pill label={opportunity.format} strong={opportunity.format === 'Online'} />
        <Pill label={opportunity.schedule} />
        {opportunity.tags.slice(0, 4).map((tag) => (
          <Pill key={tag} label={tag} />
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onApply}
          disabled={isApplied}
          className={classNames(
            'flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-extrabold text-white transition',
            isApplied ? 'bg-slate-400' : 'bg-leaf hover:-translate-y-0.5 hover:bg-emerald-700',
          )}
        >
          <Send size={17} />
          {isApplied ? t('applied') : t('apply')}
        </button>
        <button onClick={onOpen} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-ink transition hover:border-ocean hover:text-ocean">
          {t('viewDetails')}
          <ArrowRight size={17} />
        </button>
      </div>
    </article>
  );
}
