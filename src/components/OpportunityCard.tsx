import { ArrowRight, Bookmark, BookmarkCheck, Building2, CalendarDays, Clock, Languages, MapPin, Send, Users } from 'lucide-react';
import { labelFor } from '../i18n/labels';
import { Application, Language, Opportunity } from '../types';
import { useI18n } from '../i18n/useI18n';
import { Badge, Pill } from './ui';
import { classNames } from '../utils/classNames';
import { detailTags, sortedUniqueBadges } from '../utils/badges';

export function OpportunityCard({
  opportunity,
  language,
  onOpen,
  onApply,
  onWithdraw,
  onOpenOrganization,
  isSaved,
  application,
  onToggleSave,
}: {
  opportunity: Opportunity;
  language: Language;
  onOpen: () => void;
  onApply: () => void;
  onWithdraw?: () => void;
  onOpenOrganization?: () => void;
  isSaved: boolean;
  application?: Application;
  onToggleSave: () => void;
}) {
  const { t, localize } = useI18n(language);
  const badges = sortedUniqueBadges([...opportunity.badges, ...(opportunity.certificate ? ['Certificate'] : [])]).slice(0, 3);
  const tags = detailTags([opportunity.format, opportunity.schedule, ...opportunity.tags], badges).slice(0, 5);
  const canApply = opportunity.status === 'recruiting';
  const activeApplication = application && application.status !== 'cancelled' ? application : undefined;
  const canWithdraw = activeApplication?.status === 'pending';
  const applyDisabled = Boolean(activeApplication && !canWithdraw) || (!canWithdraw && !canApply);

  return (
    <article className="group flex min-h-[360px] flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition-shadow duration-200 hover:border-ocean/30 hover:shadow-lift sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge key={badge} label={badge} language={language} />
            ))}
            <span className={classNames('rounded-full px-3 py-1 text-xs font-extrabold', canApply ? 'bg-mint text-leaf' : 'bg-slate-100 text-slate-600')}>
              {t(opportunity.status)}
            </span>
          </div>
          <button onClick={onOpen} className="text-left text-xl font-extrabold tracking-tight transition group-hover:text-ocean">
            {localize(opportunity.title)}
          </button>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-slate-500">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenOrganization?.();
              }}
              className="flex items-center gap-1.5 transition hover:text-ocean"
            >
              <Building2 size={16} />
              {opportunity.organization}
            </button>
            <span className="flex items-center gap-1.5">
              <MapPin size={16} />
              {labelFor(opportunity.city, language)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={16} />
              {localize(opportunity.duration)}
            </span>
          </div>
        </div>
        <button
          onClick={onToggleSave}
          className={classNames(
            'rounded-2xl border p-2.5 transition',
            isSaved ? 'border-leaf bg-mint text-leaf' : 'border-slate-200 text-slate-500 hover:border-ocean hover:text-ocean',
          )}
          aria-label={isSaved ? t('removeSaved') : t('save')}
        >
          {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </button>
      </div>

      <p className="mt-4 text-[15px] leading-7 text-slate-600">{localize(opportunity.description)}</p>
      <div className="mt-4 grid gap-2 text-[15px] font-semibold text-slate-500 sm:grid-cols-2">
        <span className="flex items-center gap-2">
          <Languages size={17} />
          {opportunity.languages.map((item) => labelFor(item, language)).join(', ')}
        </span>
        <span className="flex items-center gap-2">
          <CalendarDays size={17} />
          {opportunity.volunteerHours} {t('volunteerHours')}
        </span>
        <span className="flex items-center gap-2">
          <Users size={17} />
          {opportunity.applicationCount} {t('appliedCount')}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Pill key={tag} label={tag} strong={tag === 'Online'} language={language} />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row">
        <button
          onClick={canWithdraw ? onWithdraw : onApply}
          disabled={applyDisabled}
          className={classNames(
            'pressable flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-extrabold text-white transition',
            applyDisabled ? 'bg-slate-400' : 'bg-leaf hover:bg-emerald-700',
          )}
        >
          <Send size={17} />
          {canWithdraw ? t('withdrawApplication') : activeApplication ? t(activeApplication.status) : canApply ? t('apply') : t(opportunity.status)}
        </button>
        <button onClick={onOpen} className="pressable flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-base font-extrabold text-ink transition hover:border-ocean hover:text-ocean">
          {t('viewDetails')}
          <ArrowRight size={17} />
        </button>
      </div>
    </article>
  );
}
