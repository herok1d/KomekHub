import { BadgeCheck, BriefcaseBusiness, CalendarDays, Languages, MapPin, Star } from 'lucide-react';
import { organizations, opportunities } from '../data/mockData';
import { useI18n } from '../i18n/useI18n';
import { Language, Opportunity } from '../types';
import { Badge, Pill, SectionHeader } from '../components/ui';
import { OpportunityCard } from '../components/OpportunityCard';

export function DetailPage({
  language,
  opportunity,
  savedIds,
  appliedIds,
  onApply,
  onSave,
  onOpenOpportunity,
}: {
  language: Language;
  opportunity: Opportunity;
  savedIds: number[];
  appliedIds: number[];
  onApply: (id: number) => void;
  onSave: (id: number) => void;
  onOpenOpportunity: (id: number) => void;
}) {
  const { t, localize } = useI18n(language);
  const organization = organizations.find((item) => item.name === opportunity.organization) ?? organizations[0];
  const related = opportunities.filter((item) => item.category === opportunity.category && item.id !== opportunity.id).slice(0, 2);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="mb-4 flex flex-wrap gap-2">
            {opportunity.badges.map((badge) => (
              <Badge key={badge} label={badge} />
            ))}
            {opportunity.certificate && <Badge label="Certificate" />}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">{localize(opportunity.title)}</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <BriefcaseBusiness size={17} />
              {opportunity.organization}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={17} />
              {opportunity.city}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={17} />
              {localize(opportunity.duration)}
            </span>
            <span className="flex items-center gap-1.5">
              <Languages size={17} />
              {opportunity.languages.join(', ')}
            </span>
          </div>
          <p className="mt-8 text-lg leading-8 text-slate-700">{localize(opportunity.longDescription)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Pill label={`${opportunity.volunteerHours} ${t('volunteerHours')}`} strong />
            {opportunity.certificate && <Pill label={t('certificateAvailable')} strong />}
            {opportunity.tags.map((tag) => (
              <Pill key={tag} label={tag} />
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <DetailList title={t('requirements')} items={opportunity.requirements.map(localize)} />
            <DetailList title={t('responsibilities')} items={opportunity.responsibilities.map(localize)} />
            <DetailList title={t('whatYouGet')} items={opportunity.benefits.map(localize)} />
          </div>
        </section>

        <aside className="grid h-fit gap-5">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <button
              onClick={() => onApply(opportunity.id)}
              disabled={appliedIds.includes(opportunity.id)}
              className="flex w-full items-center justify-center rounded-2xl bg-ocean px-5 py-4 text-sm font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-blue-600 disabled:bg-slate-400"
            >
              {appliedIds.includes(opportunity.id) ? t('applied') : t('applyNow')}
            </button>
            <button
              onClick={() => onSave(opportunity.id)}
              className="mt-3 flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 hover:border-leaf hover:text-leaf"
            >
              {savedIds.includes(opportunity.id) ? t('saved') : t('save')}
            </button>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-extrabold">{t('aboutOrganization')}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{localize(organization.description)}</p>
            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-amber-600">
              <Star size={17} fill="currentColor" />
              {organization.rating} {t('averageRating')}
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-8">
        <SectionHeader eyebrow={t('keepExploring')} title={t('similarVolunteering')} />
        <div className="grid gap-5 md:grid-cols-2">
          {(related.length ? related : opportunities.slice(0, 2)).map((item) => (
            <OpportunityCard
              key={item.id}
              opportunity={item}
              language={language}
              onOpen={() => onOpenOpportunity(item.id)}
              onApply={() => onApply(item.id)}
              isSaved={savedIds.includes(item.id)}
              isApplied={appliedIds.includes(item.id)}
              onSave={() => onSave(item.id)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl bg-mist p-5">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
            <BadgeCheck className="mt-0.5 shrink-0 text-leaf" size={18} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
